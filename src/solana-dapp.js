import React, { useState, useEffect } from "react";
import bs58 from "bs58";
import {
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
  SystemProgram,
  Connection,
  Transaction,
} from "@solana/web3.js";


export default function SolanaDApp() {
  const [address, setAddress] = useState("");
  const [signature, setSignature] = useState("");
  const [transaction, setTransaction] = useState("");
  const [signedTransaction, setSignedTransaction] = useState("");

  const connection = new Connection("https://api.devnet.solana.com/");

  const provider = window.mydoge?.solana;
  // const provider = window.phantom?.solana;

  const [res, setRes] = useState({});

  useEffect(() => {
    setRes({});
    // Store user's public key once they connect
    provider.on("connect", (res) => {
      console.log('dapp.on.connect', res);
      setRes({
          method: 'dapp.on.connect',
        res
      });
    });

    // Forget user's public key once they disconnect
    provider.on("disconnect", (res) => {
      console.log('dapp.on.disconnect', res);
      setRes({
          method: 'dapp.on.disconnect',
        res
      });
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
      setRes({
        method: 'connect',
        res
      });
      const { address, publicKey } = res;
      const address1 = publicKey ? publicKey.toString() : '';
      console.log('connect', {address, address1}, res);
      
      //todo: publicKey 的格式
      setAddress(address || res);
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
      setRes({
        method: 'connect',
        params: { onlyIfTrusted: true },
        res
      });
      const { address, publicKey } = res;
      
      //todo: publicKey 的格式
      setAddress(address);
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
      setRes({
        method: 'request.connect',
        res
      });
      let { publicKey = "", address } = res || {};
      console.log(`Switched to account ${address}, publicKey: ${publicKey}`);
      setAddress(address);
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
      let res = await provider.disconnect();
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
      setRes({
        method: 'getAccount',
        params: '',
        res
      });
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
        res: publicKey
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

      console.log(new TextDecoder().decode(encodedMessage), encodedMessage);
      const signedMessage = await provider.signMessage(encodedMessage, "utf8");
      const signature = signedMessage?.signature;
      setSignature(signature);
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
      const message = `You can use uint8array to verify`;
      const signedMessage = await provider.request({
        method: 'signMessage2',
        params: message
      });
    } catch (e) {
      alert(e);
    }
  };

  const signAndSendTransaction = async () => { }

  const signAndSendAllTransactions = async () => { }

  const signTransaction = async () => { }

  const signAllTransactions = async () => { }
  
  const sendRawTransaction = async () => { }

  const signVersionedTransaction = async () => {
    if (!address) { 
      alert('please connect 1st');
      return;
    };
    setRes({});

    let minRent = await connection.getMinimumBalanceForRentExemption(0);

    // create array of instructions
    const instructions = [
      SystemProgram.transfer({
        fromPubkey: provider.publicKey,
        toPubkey: provider.publicKey,
        lamports: minRent,
      }),
    ];

    let blockhash = await connection
      .getLatestBlockhash()
      .then((res) => res.blockhash);

    // create v0 compatible message
    const messageV0 = new TransactionMessage({
      payerKey: provider.publicKey,
      recentBlockhash: blockhash,
      instructions,
    }).compileToV0Message();

    // make a versioned transaction
    const transactionV0 = new VersionedTransaction(messageV0);

    const signedTransaction = await provider.signTransaction(transactionV0);
    setTransaction(JSON.stringify(signedTransaction));
  };

  const signLegacyTransaction = async () => {
    if (!address) { 
      alert('please connect 1st');
      return;
    };
    setRes({});

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: provider.publicKey, //payer
        toPubkey: provider.publicKey, //toAccount
        lamports: 100,
      }),
    );
    transaction.feePayer = provider.publicKey;

    const anyTransaction = transaction;
    anyTransaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;

    const signedTransaction =  await provider.signTransaction(transaction);
    setSignedTransaction(JSON.stringify(signedTransaction));
  };

  const getTransactionVersion = async () => { }
  const getSignatureStatuses = async () => { }

  return (
    <div className="m-5 text-sm">
      <h2>Solana Dapp Demo</h2>
      {address && <p>connected: { address }</p>}

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

      <div className={ 'mt-2 ' + (address ? '' : 'opacity-40')}>
        <button onClick={signMessage} className="bg-[#000] text-[#fff] p-1 m-2">
          signMessage
        </button>

        <button
          onClick={signMessage2}
          className="bg-[#000] text-[#fff] p-1 m-2"
        >
          request.signMessage
        </button>

        <p></p>

        <button
          onClick={signAndSendTransaction}
          className="bg-[#000] text-[#fff] p-1 m-2"
        >
          signAndSendTransaction
        </button>

        <button
          onClick={signAndSendAllTransactions}
          className="bg-[#000] text-[#fff] p-1 m-2"
        >
          signAndSendAllTransactions
        </button>

        <button
          onClick={signTransaction}
          className="bg-[#000] text-[#fff] p-1 m-2"
        >
          signTransaction
        </button>

        <button
          onClick={signAllTransactions}
          className="bg-[#000] text-[#fff] p-1 m-2"
        >
          signAllTransactions
        </button>
                
        <button
          onClick={sendRawTransaction}
          className="bg-[#000] text-[#fff] p-1 m-2"
        >
          sendRawTransaction
        </button>

        <p></p>

        <button
          onClick={signVersionedTransaction}
          className="bg-[#000] text-[#fff] p-1 m-2"
        >
          signVersionedTransaction
        </button>
        <button
          onClick={signLegacyTransaction}
          className="bg-[#000] text-[#fff] p-1 m-2"
        >
          signLegacyTransaction
        </button>
      </div>

      <div className={ 'mt-2 ' + (address ? '' : 'opacity-40')}>
        <button
          onClick={getSignatureStatuses}
          className="bg-[#000] text-[#fff] p-1 m-2"
        >
          getSignatureStatuses
        </button>

        <button
          onClick={getTransactionVersion}
          className="bg-[#000] text-[#fff] p-1 m-2"
        >
          getTransactionVersion
        </button>
      </div>

      {res.method && <div className="bg-[#f5f5f5] border-1 p-5 mt-4 text-xs">
        <div style={{ wordWrap: "break-word" }}>
          {JSON.stringify(res, null, "\t")}
        </div>
      </div>}
    </div>
  );
}