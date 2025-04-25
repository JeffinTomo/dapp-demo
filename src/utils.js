import axios from "axios";
import { payments, Psbt } from "bitcoinjs-lib";
import * as bitcoin from 'bitcoinjs-lib';
import sb from "satoshi-bitcoin";

// interface CreatePsbtParams {
//   inputs: Array<{
//     txid: string;
//     vout: number;
//     amount: number;  // in satoshis
//     address: string;
//   }>;
//   outputs: Array<{
//     address: string;
//     amount: number;  // in satoshis
//   }>;
//   feeRate?: number;  // satoshis per byte
// }

const network = {
  messagePrefix: "\x19Dogecoin Signed Message:\n",
  bech32: "dc",
  bip44: 3,
  bip32: {
    public: 0x02facafd,
    private: 0x02fac398,
  },
  pubKeyHash: 0x1e,
  scriptHash: 0x16,
  wif: 0x9e,
};


const MYDOGE_BASE_URL = "https://api.mydoge.com";
const mydoge = axios.create({
  baseURL: MYDOGE_BASE_URL,
});

export async function getUtxos(address, cursor, result, filter, tx ) {
  const query = (
    await mydoge.get(`${MYDOGE_BASE_URL}/utxos/${address}?filter=${filter}${cursor ? `&cursor=${cursor}` : ""}`)
  ).data;

  let { utxos } = query;

  // console.log('found', query.utxos.length, filter, 'utxos in page', cursor);

  if (tx) {
    utxos = utxos.filter((utxo) => utxo.txid === tx.txid && utxo.vout === tx.vout);
  }

  result.push(
    ...utxos.map((i) => ({
      txid: i.txid,
      vout: i.vout,
      outputValue: i.satoshis,
      script: i.script_pubkey,
      ...(filter === "inscriptions" && { inscriptions: i.inscriptions }),
    })),
  );

  if (result.length && tx) {
    return;
  }

  result = result.sort((a, b) => sb.toBitcoin(b.outputValue) - sb.toBitcoin(a.outputValue));

  return result
  
  // if (query.next_cursor) {
  //   return getUtxos(address, query.next_cursor, result, filter, tx);
  // }
}

//https://bitcoinjs.github.io/bitcoinjs-lib/classes/Psbt.html
export async function createDogePsbt({
  senderAddress,
  amount,
  fee
}) {

  const utxos = (
    await mydoge.get('/wallet/info', {
      params: { route: `utxo/${senderAddress}` },
    })
  ).data.sort((a, b) => {
    const aValue = Number(a.value);
    const bValue = Number(b.value);
    return bValue > aValue ? 1 : bValue < aValue ? -1 : a.height - b.height;
  });

  if (utxos.length < 1) {
    throw new Error('need at least 1 utxos');
  }

  if (Number(utxos[1].value) < sb.toSatoshi(amount + fee)) {
    throw new Error('not enough funds to cover amount and fee');
  }

  const vout1 = utxos[0].vout;
  
  const tx1 = await mydoge.get('/wallet/info', {
    params: { route: `tx/${utxos[0].txid}` },
  });
  const value1 = tx1.data.vout[index1].value;

  const change = Math.trunc(
    value1 - sb.toSatoshi(amount + fee)
  );


  const params = {
    address: signerAddress,
    inputs: [
      {
        txId: tx1.data.txid,
        vOut: vout1,
        amount: value1,
        nonWitnessUtxo: Buffer.from(tx1.data.hex, 'hex'),
        address,
      },
    ],
    outputs: [
      {
        address,
        amount: sb.toSatoshi(amount),
      },
      {
        address,
        amount: change,
      },
    ],
  };
  const psbtBase64 = DogecoinUtils.buildPsbtToBase64(params);
  return psbtBase64;
}

const PSBT_MAGIC_BYTES = Buffer.from([0x70, 0x73, 0x62, 0x74, 0xff]);
export function base64ToHex(base64) {
  try {
    const buffer = Buffer.from(base64, "base64");
    // const bufferF =  Buffer.concat([PSBT_MAGIC_BYTES, buffer]);
    return buffer.toString("hex");
  } catch (error) {
    console.error("PSBT base64 to hex failed:", error);
    throw error;
  }
}

// Get public key from payment/address object
export function getPublicKeyFromAddress(address) {
  try {
    // Try P2PKH
    const p2pkh = payments.p2pkh({ 
      address: address,
      network: network 
    });
    if (p2pkh && p2pkh.hash) {
      return p2pkh.hash.toString('hex');
    }

    // Try P2SH
    const p2sh = payments.p2sh({
      address: address,
      network: network
    });
    if (p2sh && p2sh.hash) {
      return p2sh.hash.toString('hex');
    }

    return null;
  } catch (err) {
    console.error('Failed to get public key from address:', err);
    return null;
  }
}


export function formatSmallNumber(num, precision = 4) {
    if (num === 0) return "0";
    
    // Convert to string and remove scientific notation
    let str = num.toString();
    if (str.includes('e')) {
        str = num.toFixed(20);
    }
    
    // Remove trailing zeros after decimal
    str = str.replace(/\.?0+$/, '');
    
    // Find the position of first non-zero digit after decimal
    let firstNonZero = str.match(/[1-9]/);
    let zeroCount = firstNonZero ? firstNonZero.index - 1 : 0;
    
    // If there's only one zero after decimal, return as is
    if (zeroCount <= 1) return str;
    
    // Format with curly braces notation
    let beforeZeros = str.substring(0, 2); // "0."
  let afterZeros = str.substring(zeroCount + 1, zeroCount + 1 + precision);
    
    return `${beforeZeros}{${zeroCount - 1}}${afterZeros}`;
}
