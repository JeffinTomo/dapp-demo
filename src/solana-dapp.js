import React, { useState, useEffect } from "react";
import bs58 from "bs58";
import BN from "bn.js";
import {
  PublicKey,
  AddressLookupTableProgram,
  TransactionMessage,
  VersionedTransaction,
  SystemProgram,
  Connection,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

function getBnString(bn) {
  // const _bn = new BN(bn._bn.words, "le").maskn(bn._bn.length * 32);
  return convertBNToPublicKey(bn).toString();
}

function convertBNToPublicKey(bnObject) {
  try {
    if (!bnObject || !bnObject._bn || !bnObject._bn.words) {
      throw new Error('Invalid BN object');
    }

    // Convert words array to number array
    const words = bnObject._bn.words;
    const numbers = new Uint8Array(32);
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const offset = i * 4;
      numbers[offset] = word & 255;
      numbers[offset + 1] = (word >> 8) & 255;
      numbers[offset + 2] = (word >> 16) & 255;
      numbers[offset + 3] = (word >> 24) & 255;
    }

    return new PublicKey(numbers);
  } catch (error) {
    console.error('Error converting BN to PublicKey:', error);
    return null;
  }
}

export default function SolanaDApp() {
  const [address, setAddress] = useState("");
  const [signature, setSignature] = useState("");
  const [transaction, setTransaction] = useState("");
  const [signedTransaction, setSignedTransaction] = useState("");

  const connection = new Connection("https://api.devnet.solana.com/");

  const [provider, setProvider] = useState(window.mydoge?.solana);

  const [res, setRes] = useState({});

  useEffect(() => {
    setRes({});
    // Store user's public key once they connect
    provider.on("connect", (res) => {
      console.log('dapp.on.connect', res);
    });

    // Forget user's public key once they disconnect
    provider.on("disconnect", (res) => {
      console.log('dapp.on.disconnect', res);
    });
  }, [provider]);
  
  const connect = async () => {
    if (!provider) { 
      alert('provider err');
      return;
    }
    setRes({});
    //{ onlyIfTrusted: true }
    try {
      const res = await provider.connect() || {};
      console.log('provider.connect', res);
      const { address, publicKey } = res;
      const address1 = publicKey ? publicKey.toString() : '';
      console.log('connect', { address, address1 }, res, getBnString({
        _bn: publicKey._bn
      }));
      
      setRes({
        method: 'connect',
        res
      });
      
      //todo: publicKey 的格式
      setAddress(address1 || address);
    } catch (err) {
      console.error("connected error", err);
    }
  };
  
  const connectOnlyIfTrusted = async () => {
    if (!provider) { 
      alert('provider err');
      return;
    }
    setRes({});
    //{ onlyIfTrusted: true }
    try {
      const res = await provider.connect({ onlyIfTrusted: true }) || {};
      const { address, publicKey } = res;
      const address1 = publicKey ? publicKey.toString() : '';
      setRes({
        method: 'connect',
        params: { onlyIfTrusted: true },
        res
      });      
      //todo: publicKey 的格式
      setAddress(address1);
    } catch (err) {
      console.error("connected error", err);
    }
  };

  const connect2 = async () => {
    if (!provider) { 
      alert('provider err');
      return;
    }
    setRes({});
    try {
      let res = await provider.request({
        method: 'connect',
      });
      const { address, publicKey } = res;
      const address1 = publicKey ? publicKey.toString() : '';
      setRes({
        method: 'request.connect',
        res
      });
      setAddress(address1);
    } catch (err) {
      console.error("connected error", err);
    }
  };

  const disconnect = async () => {
    if (!provider) { 
      alert('provider err');
      return;
    }
    setRes({});
    try {
      // const res = await provider.request({ method: "disconnect" });
      const res = await provider.disconnect();
      setAddress('');
      setRes({
        method: 'disconnect',
        res
      });
    } catch (err) {
      console.error("disconnect error", err);
    }
  }

  const getAccount = async () => {
    // if (!address) { 
    //   alert('please connect 1st');
    //   return;
    // };
    setRes({});
    try {
      const res = await provider.request({
        method: 'getAccount',
      });
      const { address, publicKey } = res || {};
      const address1 = publicKey ? publicKey.toString() : address;
      setRes({
        method: 'getAccount',
        params: '',
        res: [address1]
      });
      setAddress(address1);
      console.log('getAccount', res);
    } catch (err) {
      console.error("getAccount error", err);
    }
  };

  const accountChanged = async () => { 
    console.log('accountChanged reg ok');
    provider.on("accountChanged", (publicKey) => {
      if (publicKey) {
        console.log(`dapp.on.accountChanged linstener: ${publicKey.toBase58()}`, publicKey);
      } else { 
        console.log('social wallet, no publicKey');
      }
      setRes({
        method: 'dapp.on.accountChanged',
        res: {publicKey}
      });
    });
  }

  const signMessage = async () => {
    if (!address) { 
      alert('please connect 1st');
      return;
    };
    setRes({});
    try {
      // uint8Array
      const message = `You can use uint8array to verify`;
      const encodedMessage = new TextEncoder().encode(message);

      const signedMessage = await provider.signMessage(encodedMessage, "utf8");
      console.log(new TextDecoder().decode(encodedMessage), encodedMessage, signedMessage);

      const signature = signedMessage?.signature;
      setSignature(signature);
      setRes({
        method: 'signMessage',
        res: signedMessage
      });
    } catch (err) {
      console.error('signMessage', err);
    }
  };

  const signMessage2 = async () => {
    if (!address) { 
      alert('please connect 1st');
      return;
    };
    setRes({});
    try {
      // uint8Array
      const message = `To avoid digital dognappers, sign below to authenticate with CryptoCorgis`;
      const encodedMessage = new TextEncoder().encode(message);
      
      const signedMessage = await provider.request({
        method: 'signMessage',
        params: {
          message: encodedMessage,
          display: "hex",
        }
      });
      console.log(message, signedMessage);
      setRes({
        method: 'request.signMessage',
        res: signedMessage
      });
    } catch (e) {
      console.error(e);
    }
  };

  const signAndSendTransaction = async () => { 
    setRes({});
    const tx = await createLegacyTx();
    const { signature } = await provider.signAndSendTransaction(tx);

    console.log('signAndSendTransaction legacyTransaction', tx, signature);
    addSignedData(signature);

    setRes({
      method: 'signAndSendTransaction',
      type: 'legacyTransaction',
      signature
    });

  }

  const signAndSendTransaction2 = async () => { 
    setRes({});
    const tx = await createVersionedTx();
    const { signature } = await provider.signAndSendTransaction(tx);

    console.log('signAndSendTransaction versionedTransaction', tx, signature);
    addSignedData(signature);

    setRes({
      method: 'signAndSendTransaction',
      type: 'versionedTransaction',
      signature
    });
  }

  const signAndSendTransaction3 = async () => { 
    setRes({});

    const tx = await createLookupTx();
    const { signature } = await provider.signAndSendTransaction(tx);

    setRes({
      method: 'signAndSendTransaction.lookupTransaction',
      type: 'lookupMessage',
      signature
    });
  }  

  const signAndSendAllTransactions = async () => {
    setRes({});
    const transactions = [await createLegacyTx(), await createVersionedTx(), await createLookupTx()];


    console.log('signAndSendTransaction list 1', transactions);
    const { signatures, publicKey } = await provider.signAndSendAllTransactions(transactions);

    console.log('signAndSendTransaction list 2', transactions, publicKey, signatures);
    addSignedData(signatures);

    setRes({
      method: 'signAndSendAllTransactions',
      transactions,
      signatures,
      publicKey
    });
  }

  const signVersionedTransaction = async () => {
    if (!address) { 
      alert('please connect 1st');
      return;
    };
    setRes({});

    const transactionV0 = await createVersionedTx();
    const signedTransaction = await provider.signTransaction(transactionV0);

    setRes({
      method: 'signTransaction',
      type: 'versionedTransaction',
      signedTransaction,
      transactionV0
    });
  };

  const signLegacyTransaction = async () => {
    if (!address) { 
      alert('please connect 1st');
      return;
    };
    setRes({});

    const transaction = await createLegacyTx();
    const signedTransaction =  await provider.signTransaction(transaction);
    setRes({
      method: 'signTransaction',
      type: 'legacyTransaction',
      transaction,
      signedTransaction
    });
  };

  const signLookupTransaction = async () => {
    if (!address) { 
      alert('please connect 1st');
      return;
    };
    setRes({});

    const transaction = await createLookupTx();
    const signedTransaction =  await provider.signTransaction(transaction);
    setRes({
      method: 'signTransaction',
      type: 'lookupTransaction',
      transaction,
      signedTransaction
    });
  };

  //not recommended
  const signAllTransactions = async () => {
    setRes({});
    const transactions = [await createLegacyTx(), await createVersionedTx(), await createLookupTx()];

    const signedTransactions = await provider.signAllTransactions(transactions);

    setRes({
      method: 'signAllTransactions',
      transactions,
      signedTransactions
    });
  }

  const toPubkey = new PublicKey('AKqmic16R22m7syDCJZXFH1ZtVYuWTszr511cKo7Zqpc');
  const toPubkey2 = new PublicKey('HceqDsbSEXu7XV2i4WDDZ3wv6TQH5NXz4c2YYPQxBUd');
  const toPubkey3 = new PublicKey('7q6PYSw2dCYfw74igJtDB4iodhCrGBvUg78TnScK6kZj');
  async function createLegacyTx() { 
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: provider.publicKey, //payer
        toPubkey, //toAccount
        lamports: 0.11 * LAMPORTS_PER_SOL, //, https://solana-labs.github.io/solana-web3.js/variables/LAMPORTS_PER_SOL.html
      }),
    );
    transaction.feePayer = provider.publicKey;
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;

    const { data, keys, programId } = transaction.instructions?.[0] || {};

    console.log('createLegacyTx', transaction, {
      feePayer: transaction.feePayer.toString(),
      programId: programId.toString(),
      pubkey1: keys[0].pubkey.toString(),
      pubkey2: keys[1].pubkey.toString(),
      data1: new TextDecoder().decode(data),
      data2: bs58.encode(data),
    })

    return transaction;
  }

  async function createVersionedTx() { 
    // let minRent = await connection.getMinimumBalanceForRentExemption(0);
    // create array of instructions
    const instructions = [
      SystemProgram.transfer({
        fromPubkey: provider.publicKey,
        toPubkey: toPubkey2,
        lamports: 0.12 * LAMPORTS_PER_SOL,
      }),
    ];

    let blockhash = await connection.getLatestBlockhash().then((res) => res.blockhash);

    // create v0 compatible message
    const messageV0 = new TransactionMessage({
      payerKey: provider.publicKey,
      recentBlockhash: blockhash,
      instructions,
    }).compileToV0Message();

    // make a versioned transaction
    const transactionV0 = new VersionedTransaction(messageV0);
    return transactionV0;
  }

  async function createLookupTx() { 
    const publicKey = provider.publicKey;
    
    const recentSlot = await connection.getSlot();
    const [lookupTableInst, lookupTableAddress] = AddressLookupTableProgram.createLookupTable({
      authority: publicKey,
      payer: publicKey,
      recentSlot,
    });

    const transferInstruction = SystemProgram.transfer({
      fromPubkey: publicKey,
      toPubkey: toPubkey3,
      lamports: 0.13 * LAMPORTS_PER_SOL,
    });

    // To create the Address Lookup Table on chain:
    // send the `lookupTableInst` instruction in a transaction
    const blockhash =  (await connection.getLatestBlockhash()).blockhash;
    const lookupMessage = new TransactionMessage({
      payerKey: publicKey,
      recentBlockhash: blockhash,
      instructions: [lookupTableInst, transferInstruction],
    }).compileToV0Message();

    const lookupTransaction = new VersionedTransaction(lookupMessage);
    return lookupTransaction;
  }

  function addSignedData(sign) { 
    window.addSigned = window.addSigned || {};
    if (typeof sign === 'string') { 
      window.addSigned[sign] = true;
      return;
    }
    sign.forEach((signItem) => { 
      window.addSigned[signItem] = true;
    });
  }

  useEffect(() => {
    const signedMap = window.addSigned || {};
    for (var signature in signedMap) { 
      connection.getSignatureStatus(signature).then((res) => {
        console.log('getSignatureStatus:', signature, res);
      });
    }
  }, [window.addSigned]);

  return (
    <div className="m-5 text-sm">
      <div className="mt-2 bg-[#f5f5f5] p-2">
        <h1>Solana Dapp Demo</h1>
        <div>solana web3: <a className="text-[skyblue]" href="https://solana-labs.github.io/solana-web3.js/classes/Connection.html#getsignaturestatuses">https://solana-labs.github.io/solana-web3.js/classes/Connection.html#getsignaturestatuses</a></div>
          {address && <p>connected: {address}</p>}
          
        current wallet: {provider.isPhantom ? 'phantom' : 'mydoge' } <br />
        switch to:
        <button onClick={() => {
          const provider = window.mydoge?.solana;
          if (!provider) {
            window.open('https://qsg07xytt12z.sg.larksuite.com/wiki/I5ZDwtq6MiQQpWk9MRelFpjtg9b', '_blank');
            return;
          }
          setProvider(provider);
        }} className="bg-[#666] text-[#fff] p-1 m-2">
          mydoge
        </button>
          <button onClick={() => {
            const provider = window.phantom?.solana;
            if (!provider) {
              window.open('https://phantom.app/', '_blank');
              return;
            }
            setProvider(provider);
          }} className="bg-[#666] text-[#fff] p-1 m-2">
            phantom
          </button>
      </div>

      <div className="mt-2">
        <button onClick={connect} className="bg-[#000] text-[#fff] p-1 m-2">
          connect
        </button>

        <button onClick={connectOnlyIfTrusted} className="bg-[#000] text-[#fff] p-1 m-2">
          connectOnlyIfTrusted
        </button>

        <button onClick={connect2} className="bg-[#000] text-[#fff] p-1 m-2">
          request.connect
        </button>

        <button onClick={disconnect} className="bg-[#000] text-[#fff] p-1 m-2">
          disconnect
        </button>
      </div>

      <div className="mt-2">
        <button onClick={accountChanged} className="bg-[#000] text-[#fff] p-1 m-2">
          accountChanged
        </button>
        <button onClick={getAccount} className="bg-[#000] text-[#fff] p-1 m-2">
          getAccount
        </button>
      </div>

      <div className={ 'mt-6 ' + (address ? '' : 'opacity-40')}>
        <button onClick={signMessage} className="bg-[#000] text-[#fff] p-1 m-2">
          signMessage
        </button>

        <button
          onClick={signMessage2}
          className="bg-[#000] text-[#fff] p-1 m-2"
        >
          request.signMessage
        </button>

        <div className="h-[30px]"></div>

        <button onClick={signAndSendTransaction} className="bg-[#000] text-[#fff] p-1 m-2">signAndSendTransaction.legacyTransaction</button>
        <button onClick={signAndSendTransaction2} className="bg-[#000] text-[#fff] p-1 m-2">signAndSendTransaction.versionedTransaction</button>
        <button onClick={signAndSendTransaction3} className="bg-[#000] text-[#fff] p-1 m-2">signAndSendTransaction.lookupTransaction</button>
        <button onClick={signAndSendAllTransactions} className="bg-[#000] text-[#fff] p-1 m-2">signAndSendAllTransactions</button>

        <div className="h-[0px]"></div>

        <button
          onClick={signLegacyTransaction}
          className="bg-[#000] text-[#fff] p-1 m-2"
        >
          signTransaction.legacyTransaction
        </button>
        <button
          onClick={signVersionedTransaction}
          className="bg-[#000] text-[#fff] p-1 m-2"
        >
          signTransaction.versionedTransaction
        </button>
        <button
          onClick={signLookupTransaction}
          className="bg-[#000] text-[#fff] p-1 m-2"
        >
          signTransaction.lookupTransaction
        </button>

        <button
          onClick={signAllTransactions}
          className="bg-[#000] text-[#fff] p-1 m-2"
        >
          signAllTransactions
        </button>
      </div>

      {res.method && <div className="bg-[#f5f5f5] border-1 p-5 mt-4 text-xs">
        <h2 className="text-lg mb-4">{provider.isPhantom ? 'phantom' : 'mydoge' }:</h2>
        <pre style={{ wordWrap: "break-word" }}>
          {JSON.stringify(res, null, "\t")}
        </pre>
      </div>}
    </div>
  );
}