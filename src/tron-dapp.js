import React, { useState, useEffect } from "react";
import bs58 from "bs58";
import BN from "bn.js";

export default function TronDApp() {
  const [address, setAddress] = useState("");

  const [providerName, setProviderName] = useState('');
  const [provider, setProvider] = useState(providerName ? window[providerName]?.tronLink : window.tronLink);

  const [res, setRes] = useState({});

  async function getTronWeb() {
    let tronWeb;
    if (provider.ready) {
      tronWeb = provider.tronWeb;
      setRes({
        method: "tron_requestAccounts",
        ready: true
      });
    } else {
      const res = await provider.request({ method: 'tron_requestAccounts' });
      if (res.code === 200) {
        tronWeb = tronLink.tronWeb;
      }
      setRes({
        method: "tron_requestAccounts",
        res
      });
    }
    setAddress(tronWeb?.defaultAddress?.base58);
    return tronWeb;
  }

  async function disconnect() { 

  }

  async function signMessage() { 
    const tronWeb = await getTronWeb();
    try {
      const message = "0x1e"; // any hex string
      const signedString = await tronWeb.trx.sign(message);

      setRes({
        method: "tronWeb.trx.sign",
        message,
        signedString
      });
    } catch (e) {
        
    }
  }

  async function sendRawTransaction() {
    const tronWeb = await getTronWeb();
    const toAddress = address;
    if (!toAddress) { 
      alert('no address');
    }

    const activePermissionId = 2;
    const tx = await tronWeb.transactionBuilder.sendTrx(
      toAddress, 10,
      { permissionId: activePermissionId}
    ); // step 1
    try {
      const signedTx = await tronWeb.trx.multiSign(tx, undefined, activePermissionId); // step 2
      const res = await tronWeb.trx.sendRawTransaction(signedTx); // step 3

      setRes({
        method: "tronWeb.trx.sendRawTransaction",
        signedTx,
        res
      });
    } catch (err) {
      setRes({
        method: "tronWeb.trx.sendRawTransaction",
        signedTx,
        err
      });
    }
  }

  async function sendRawTransaction2() { 
    const tronWeb = await getTronWeb();
    const toAddress = address;
    const fromAddress = address;
    if (!toAddress || !fromAddress) { 
      alert('no address');
    }

    const tx = await tronweb.transactionBuilder.sendTrx(toAddress, 10, fromAddress); // Step1
    try {
      const signedTx = await tronWeb.trx.sign(tx); // Step2
      await tronWeb.trx.sendRawTransaction(signedTx); // Step3

      setRes({
        method: "tronWeb.trx.sendRawTransaction",
        signedTx,
        res
      });
    } catch (err) {
      setRes({
        method: "tronWeb.trx.sendRawTransaction",
        signedTx,
        err
      });
    }
  }

  async function stake2(){ 

  }

  return (
    <div className="m-5 text-sm">
      <div className="mt-2 bg-[#f5f5f5] p-2">
        <h1>Tron Dapp Demo: </h1>
        {address && <p>connected: <span className="text-xl text-[red]">{address}</span></p>}


        <p></p>

        tronWeb: <a href="https://developers.tron.network/reference/tronweb-object">https://developers.tron.network/reference/tronweb-object</a>

        <p></p>
          
        current wallet: <span className="text-2xl text-[red]">{providerName}</span> <br />
        switch to:
        <button onClick={() => {
          const provider = window.mydoge?.tronLink;
          if (!provider) {
            window.open('https://qsg07xytt12z.sg.larksuite.com/wiki/I5ZDwtq6MiQQpWk9MRelFpjtg9b', '_blank');
            return;
          }
          setProvider(provider);
          setProviderName('mydoge');
        }} className="bg-[#666] text-[#fff] p-1 m-2">
          mydoge
        </button>
        <button onClick={() => {
          const provider = window?.tronLink;
          if (!provider) {
            window.open('https://docs.tronlink.org/dapp/start-developing', '_blank');
            return;
          }
          setProvider(provider);
          setProviderName('tronLink');
        }} className="bg-[#666] text-[#fff] p-1 m-2">
          tronLink
        </button>
        <button onClick={() => {
          const provider = window.okxwallet?.tronLink;
          if (!provider) {
            window.open('https://web3.okx.com/zh-hans/build/docs/sdks/web-detect-okx-wallet', '_blank');
            return;
          }
          setProvider(provider);
          setProviderName('okxwallet');
        }} className="bg-[#666] text-[#fff] p-1 m-2">
          okxwallet
        </button>
        <button onClick={() => {
          const provider = window.bitkeep?.solana;
          if (!provider) {
            window.open('https://web3.bitget.com/zh-CN/wallet-download', '_blank');
            return;
          }
          setProvider(provider);
          setProviderName('bitget');
        }} className="bg-[#666] text-[#fff] p-1 m-2">
          bitget
        </button>
      </div>

      <div className="mt-2">
        <button onClick={getTronWeb} className="bg-[#000] text-[#fff] p-1 m-2">
          tron_requestAccounts
        </button>

        <button onClick={disconnect} className="bg-[#000] text-[#fff] p-1 m-2">
          disconnect
        </button>
      </div>


      <div className={ 'mt-6 ' + (address ? '' : 'opacity-40')}>
        <button onClick={signMessage} className="bg-[#000] text-[#fff] p-1 m-2">
          signMessage
        </button>
        <button onClick={sendRawTransaction} className="bg-[#000] text-[#fff] p-1 m-2">
          sendRawTransaction
        </button>
        <button onClick={sendRawTransaction2} className="bg-[#000] text-[#fff] p-1 m-2">
          General Transfer
        </button>
      </div>

      {res.method && <div className="bg-[#f5f5f5] border-1 p-5 mt-4 text-xs">
        <h2 className="text-lg mb-4">{ providerName || "tronLink" }: {res.method}</h2>
        <pre style={{ wordWrap: "break-word" }}>
          {JSON.stringify(res, null, "\t")}
        </pre>
      </div>}
    </div>
  );
}