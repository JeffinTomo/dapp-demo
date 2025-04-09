import axios from "axios";
import { payments, Psbt } from "bitcoinjs-lib";
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

export async function createDogePsbt(params) {
  try {
    const psbt = new Psbt({ network });

    for (const input of params.inputs) {
      const p2pkhOutput = payments.p2pkh({
        address: input.address,
        network
      }).output;

      psbt.addInput({
        hash: input.txid,
        index: input.vout,
        witnessUtxo: {
          script: Buffer.from(p2pkhOutput || '', 'hex'),
          value: Number(input.amount)
        }
      });
    }

    for (const output of params.outputs) {
      psbt.addOutput({
        address: output.address,
        value: Number(output.amount)
      });
    }

    return psbt.toHex();
  } catch (error) {
    console.error('Create PSBT failed:', error);
    throw error;
  }
}