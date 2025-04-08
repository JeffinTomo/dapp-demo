import React, { useState, useEffect } from "react";
import { createDogePsbt, getUtxos } from "./utils";

const recipientAddress = "D78HGysKL7hZyaitFWbvdJjMaxLvFrQmxF";

export default function DogeDApp() {
  const [address, setAddress] = useState("");
  const [signature, setSignature] = useState("");
  const [txId, setTxId] = useState("");

  const [providerName, setProviderName] = useState('mydoge');
  const [provider, setProvider] = useState(window[providerName]?.doge);

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
      
      setAddress(res.address);
      
      setRes({
        method: 'connect',
        res
      });
    } catch (err) {
      console.error("connected error", err);
    }
  };

  const getConnectionStatus = async () => {
    if (!provider) { 
      alert('provider err');
      return;
    }
    setRes({});
    //{ onlyIfTrusted: true }
    try {
      const res = await provider.getConnectionStatus();
      setRes({
        method: 'getConnectionStatus',
        res
      });
    } catch (err) {
      console.error("getConnectionStatus error", err);
    }
  };
  
  const requestAccounts = async () => {
    if (!provider) { 
      alert('provider err');
      return;
    }
    setRes({});
    //{ onlyIfTrusted: true }
    try {
      const res = await provider.requestAccounts();
      setRes({
        method: 'requestAccounts',
        res
      });
      setAddress(res.address);
    } catch (err) {
      console.error("requestAccounts error", err);
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

  const getAccounts = async () => {
    if (!provider) { 
      alert('provider err');
      return;
    }
    setRes({});
    try {
      const res = await provider.getAccounts();
      setRes({
        method: 'getAccounts',
        res
      });
    } catch (err) {
      console.error("getAccount error", err);
    }
  };

  const getBalance = async () => {
    if (!provider) { 
      alert('provider err');
      return;
    }
    setRes({});
    //{ onlyIfTrusted: true }
    try {
      const res = await provider.getBalance();
      setRes({
        method: 'getBalance',
        res
      });      
    } catch (err) {
      console.error("getBalance error", err);
    }
  };

  const verifySignature = async(result) =>{
    try {
      const { signature, publicKey, message } = result;
      
      // 验证签名
      /*
      function verify(
        signature: Hex, // returned by the `sign` function
        message: Hex, // message that needs to be verified
        publicKey: Hex // public (not private) key,
        options = { zip215: true } // ZIP215 or RFC8032 verification type
      ): boolean;
      */
      return await verify(
        signature,
        message,
        publicKey
      );
    } catch (error) {
      console.error('验证签名失败：', error);
      return false;
    }
  }

  const message = "abcdefghijk123456789";
  const signMessage = async () => {
    if (!provider) { 
      alert('provider err');
      return;
    }
    setRes({});
    try {
      const signature = await provider.signMessage(message, "");
      setSignature(signature);
      setRes({
        method: 'signMessage',
        message,
        signature
      });
    } catch (err) {
      console.error('signMessage', err);
    }
  };

  const signMessageBip322Simple = async () => {
    if (!provider) { 
      alert('provider err');
      return;
    }
    setRes({});
    try {
      const type = "bip322-simple";
      const signature = await provider.signMessage(message, "bip322-simple");
      setSignature(signature);
      setRes({
        method: 'signMessage',
        type,
        message,
        signature
      });
    } catch (err) {
      console.error('signMessage', err);
    }
  };

  const requestSignedMessage = async () => {
    if (!provider) { 
      alert('provider err');
      return;
    }
    setRes({});
    try {
      const signature = await provider.requestSignedMessage({
        message,
        type: "",
      });
      setSignature(signature);
      setRes({
        method: 'requestSignedMessage',
        message,
        signature
      });
    } catch (err) {
      console.error('requestSignedMessage', err);
    }
  };

  const requestSignedMessageBip322Simple = async () => {
    if (!provider) { 
      alert('provider err');
      return;
    }
    setRes({});
    try {
      const type = "bip322-simple";
      const signature = await provider.requestSignedMessage({
        message,
        type,
      });
      setSignature(signature);
      setRes({
        method: 'requestSignedMessage',
        type,
        message,
        signature
      });
    } catch (err) {
      console.error('requestSignedMessage', err);
    }
  };

  const requestDecryptedMessage = async () => {
    if (!provider) { 
      alert('provider err');
      return;
    }
    setRes({});
    try {
      const res = await provider.requestDecryptedMessage(signature, "");
      setRes({
        method: 'requestDecryptedMessage',
        message,
        signature,
        res
      });
    } catch (err) {
      console.error('requestDecryptedMessage', err);
    }
  }
  
  const requestTransaction = async () => {
    if (!provider) { 
      alert('provider err');
      return;
    }
    setRes({});
    //{ onlyIfTrusted: true }
    try {
      const res = await provider.requestTransaction({
        recipientAddress,
        dogeAmount: 0.1,
      });
      setTxId(res.txid);
      setRes({
        method: 'requestTransaction',
        res
      });      
    } catch (err) {
      console.error("requestTransaction error", err);
    }
  };
  
  const getTransactionStatus = async () => {
    if (!provider) { 
      alert('provider err');
      return;
    }
    setRes({});
    try {
      const res = await provider.getTransactionStatus({
        txId: txId || "ebaab4e5b79ad3c3d4daaa6ac1951a3abae839233ec1f2ea8a501950094c348b",
      });
      setRes({
        method: 'getTransactionStatus',
        res
      });      
    } catch (err) {
      console.error("getTransactionStatus error", err);
    }
  };


  const ticker = "dall";
  const limit = 1000;
  const getDRC20Balance = async () => {
    if (!provider) { 
      alert('provider err');
      return;
    }
    setRes({});
    try {
      const res = await provider.getDRC20Balance({
        ticker
      });
      setRes({
        method: 'getDRC20Balance',
        ticker,
        res
      });      
    } catch (err) {
      console.error("getDRC20Balance error", err);
    }
  };

  const getTransferableDRC20 = async () => {
    if (!provider) { 
      alert('provider err');
      return;
    }
    setRes({});
    try {
      const res = await provider.getTransferableDRC20({
        ticker
      });
      setRes({
        method: 'getTransferableDRC20',
        ticker,
        res
      });      
    } catch (err) {
      console.error("getTransferableDRC20 error", err);
    }
  };

  const requestAvailableDRC20Transaction = async () => {
    if (!provider) { 
      alert('provider err');
      return;
    }
    setRes({});
    try {
      const utxos = await getUtxos(address, "", [], "spendable");
      if (utxos.length === 0) { 
        alert('no utxos');
        return;
      }
      console.log('utxos', utxos);
      const res = await provider.requestAvailableDRC20Transaction({
        ticker,
        amount: 1
      });
      setRes({
        method: 'requestAvailableDRC20Transaction',
        ticker,
        res
      });      
    } catch (err) {
      console.error("requestAvailableDRC20Transaction error", err);
    }
  };

  const requestInscriptionTransaction = async () => {
    if (!provider) { 
      alert('provider err');
      return;
    }
    setRes({});
    try {
      const res = await provider.requestInscriptionTransaction({
        location: '18d83f35060323a20e158805805e217b3ab7d849d5a1131f0ed8eba3a31c39a7:0:0', 
        recipientAddress,
        feeRate: 10
      });
      setRes({
        method: 'requestInscriptionTransaction',
        res
      });
      setTxId(res.txid);
    } catch (err) {
      console.error("requestInscriptionTransaction error", err);
    }
  };

  const requestInscriptionMintTransaction = async () => {
    if (!provider) { 
      alert('provider err');
      return;
    }
    setRes({});
    try {
      const data = JSON.stringify({
        p: 'drc-20',
        op: 'mint',
        tick: 'doge',
        amt: '1000'
      });
      const res = await provider.requestInscriptionTransaction({
        data, 
        recipientAddress,
        feeRate: 10
      });
      setRes({
        method: 'requestInscriptionTransaction',
        ticker,
        res
      });
      setTxId(res.txid);  
    } catch (err) {
      console.error("requestInscriptionTransaction error", err);
    }
  }; 

  const requestPsbt = async () => {
    if (!provider) { 
      alert('provider err');
      return;
    }
    setRes({});
    
    const utxos = await getUtxos(address, "", [], "spendable");
    if (utxos.length === 0) { 
      alert('no utxos');
      return;
    }
    // console.log('utxos', utxos); 
    const psbtHex = await createDogePsbt({
      inputs: [
        {
          address,
          amount: 1,
          txid: utxos[0].txid,
          vout: utxos[0].vout
        },
      ],
      outputs: [
        {
          address,
          amount: 1,
        },
      ],
    });
    
    try {
      const res = await provider.requestPsbt({
        rawTx: psbtHex,
        signOnly: false, // Optionally return the signed transaction instead of broadcasting
      });
      setRes({
        method: 'requestPsbt',
        res
      });      
    } catch (err) {
      console.error("requestPsbt error", err);
    }
  };

  const requestPsbtSignOnly = async () => {
    if (!provider) { 
      alert('provider err');
      return;
    }
    setRes({});
    
    const utxos = await getUtxos(address, "", [], "spendable");
    if (utxos.length === 0) { 
      alert('no utxos');
      return;
    }
    // console.log('utxos', utxos); 
    const psbtHex = await createDogePsbt({
      inputs: [
        {
          address,
          amount: 1,
          txid: utxos[0].txid,
          vout: utxos[0].vout
        },
      ],
      outputs: [
        {
          address,
          amount: 1,
        },
      ],
    });
    // console.log('psbtHex', psbtHex);
    
    try {
      const res = await provider.requestPsbt({
        rawTx: psbtHex,
        signOnly: true, // Optionally return the signed transaction instead of broadcasting
      });
      setRes({
        method: 'requestPsbt',
        psbt: psbtHex,
        res
      });      
    } catch (err) {
      console.error("requestPsbt error", err);
    }
  };


  return (
    <div className="m-5 text-sm">
      <div className="mt-0 bg-[#f5f5f5] p-2">
        <h1>Solana Dapp Demo</h1>
        <div>
          <a href="https://mydoge-com.github.io/mydogemask/" target="_blank" rel="noopener noreferrer">
            https://mydoge-com.github.io/mydogemask/
          </a>
        </div>
        {address && <p>connected: <span className="text-xl text-[red]">{address}</span></p>}
          
        current wallet: <span className="text-2xl text-[red]">{providerName}</span> <br />
        
        switch to:
        <button onClick={() => {
          const provider = window.mydoge?.solana;
          if (!provider) {
            window.open('https://qsg07xytt12z.sg.larksuite.com/wiki/I5ZDwtq6MiQQpWk9MRelFpjtg9b', '_blank');
            return;
          }
          setProvider(provider);
          setProviderName('mydoge');
        }} className="bg-[#666] text-[#fff] p-1 m-2">
          mydoge
        </button>
      </div>

      <div className="mt-2">
        <button onClick={connect} className="bg-[#000] text-[#fff] p-1 m-2">
          connect
        </button>

        <button onClick={requestAccounts} className="bg-[#000] text-[#fff] p-1 m-2">
          requestAccounts
        </button>

        <button onClick={disconnect} className="bg-[#000] text-[#fff] p-1 m-2">
          disconnect
        </button>

        <button onClick={getConnectionStatus} className="bg-[#000] text-[#fff] p-1 m-2">
          getConnectionStatus
        </button>
      </div>

      <div className={ 'mt-0 ' + (address ? '' : 'opacity-40')}>
        <button onClick={getAccounts} className="bg-[#000] text-[#fff] p-1 m-2">
          getAccounts
        </button>

        <button onClick={getBalance} className="bg-[#000] text-[#fff] p-1 m-2">
          getBalance
        </button>
      </div>

      <div className={ 'mt-0 ' + (address ? '' : 'opacity-40')}>
        <button onClick={signMessage} className="bg-[#000] text-[#fff] p-1 m-2">
          signMessage
        </button> 

        <button onClick={signMessageBip322Simple} className="bg-[#000] text-[#fff] p-1 m-2">
          signMessageBip322Simple
        </button> 

        <button onClick={requestSignedMessage} className="bg-[#000] text-[#fff] p-1 m-2">
          requestSignedMessage
        </button> 

        <button onClick={requestSignedMessageBip322Simple} className="bg-[#000] text-[#fff] p-1 m-2">
          requestSignedMessageBip322Simple
        </button> 
        

        <button onClick={requestDecryptedMessage} className="bg-[#000] opacity-40 text-[#fff] p-1 m-2">
          ?requestDecryptedMessage
        </button>
      </div>

      <div className={ 'mt-0 ' + (address ? '' : 'opacity-40')}>
        <button onClick={requestPsbt} className="bg-[#000] opacity-70 text-[#fff] p-1 m-2">
          ?requestPsbt
        </button> 

        <button onClick={requestPsbtSignOnly} className="bg-[#000] text-[#fff] p-1 m-2">
          requestPsbt.signOnly
        </button> 

        {/* <button onClick={requestPsbts} className="bg-[#000] text-[#fff] p-1 m-2">
          requestPsbts
        </button>  */}

        <button onClick={requestTransaction} className="bg-[#000] opacity-70 text-[#fff] p-1 m-2">
          ?requestTransaction
        </button> 

        <button onClick={getTransactionStatus} className="bg-[#000] text-[#fff] p-1 m-2">
          getTransactionStatus
        </button> 
      </div>

      <div className={ 'mt-0 ' + (address ? '' : 'opacity-40')}>
        <button onClick={getDRC20Balance} className="bg-[#000] text-[#fff] p-1 m-2">
          getDRC20Balance
        </button> 

        <button onClick={getTransferableDRC20} className="bg-[#000] text-[#fff] p-1 m-2">
          getTransferableDRC20
        </button> 

        <button onClick={requestAvailableDRC20Transaction} className="bg-[#000] opacity-70 text-[#fff] p-1 m-2">
          ?requestAvailableDRC20Transaction
        </button>  

        <button onClick={requestInscriptionTransaction} className="bg-[#000] opacity-70 text-[#fff] p-1 m-2">
          ?requestInscriptionTransaction
        </button> 

        <button onClick={requestInscriptionMintTransaction} className="hidden bg-[#000] text-[#fff] p-1 m-2">
          ?requestInscriptionMintTransaction
        </button> 
      </div>

      {res.method && <div className="bg-[#f5f5f5] border-1 p-5 mt-4 text-xs">
        <h2 className="text-lg mb-4">{providerName}.{res.method}:</h2>
        <pre style={{ wordWrap: "break-word" }}>
          {JSON.stringify(res, null, "\t")}
        </pre>
      </div>}
    </div>
  );
}