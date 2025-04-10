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
  signerAddress,
  amount,
  fee
}) {
  const changeAddress = signerAddress;
  const psbt = new bitcoin.Psbt({ network });

  psbt.setMaximumFeeRate(100000000);
  const utxos = (
    await mydoge.get('/wallet/info', {
      params: { route: `utxo/${signerAddress}` },
    })
  ).data.sort((a, b) => {
    const aValue = Number(a.value);
    const bValue = Number(b.value);
    return bValue > aValue ? 1 : bValue < aValue ? -1 : a.height - b.height;
  });

  if (utxos.length < 2) {
    throw new Error('need at least 2 utxos for address 2');
  }

  if (sb.toBitcoin(Number(utxos[1].value)) < amount + fee) {
    throw new Error('not enough funds to cover amount and fee');
  }

  const index1 = utxos[0].vout;
  const index2 = utxos[1].vout;
  // const index3 = utxos[2].vout;
  const tx1 = await mydoge.get('/wallet/info', {
    params: { route: `tx/${utxos[0].txid}` },
  });
  const tx2 = await mydoge.get('/wallet/info', {
    params: { route: `tx/${utxos[1].txid}` },
  });
  // const tx3 = await mydoge.get('/wallet/info', {
  //   params: { route: `tx/${utxos[2].txid}` },
  // });
  const value1 = sb.toBitcoin(tx1.data.vout[index1].value);
  const value2 = sb.toBitcoin(tx2.data.vout[index2].value);
  // const value3 = sb.toBitcoin(tx3.data.vout[index3].value);

  const change = Math.trunc(
    sb.toSatoshi(value1 + value2 - amount - fee)
  );

  // Add Inputs
  psbt.addInput({
    hash: tx1.data.txid,
    index: index1,
    nonWitnessUtxo: Buffer.from(tx1.data.hex, 'hex'),
  });
  psbt.addInput({
    hash: tx2.data.txid,
    index: index2,
    nonWitnessUtxo: Buffer.from(tx2.data.hex, 'hex'),
  });
  // psbt.addInput({
  //   hash: tx3.data.txid,
  //   index: index3,
  //   nonWitnessUtxo: Buffer.from(tx3.data.hex, 'hex'),
  // });

  // Add outputs
  psbt.addOutput({
    address: signerAddress,
    value: sb.toSatoshi(amount),
  });
  psbt.addOutput({
    address: changeAddress,
    value: change,
  });

  // Return base64 encoded PSBT instead of hex
  console.log(psbt.toHex());
  console.log(psbt.toBase64());
  console.log(base64ToHex(psbt.toBase64()));
  // const psbtHex = psbt.toHex();
  // if (psbtHex.indexOf("70736274ff") !== 0) { 
  //   return "70736274ff" + psbtHex;
  // }
  return psbt.toHex();
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