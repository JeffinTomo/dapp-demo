import React, { useState, useEffect } from "react";
import bs58 from "bs58";
import BN from "bn.js";

export default function TronDApp() {
  const [address, setAddress] = useState("");

  const [providerName, setProviderName] = useState('mydoge');
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
      console.log("tron_requestAccounts.ready=true: ", provider.tronWeb);
    } else {
      const res = await provider.request({ method: 'tron_requestAccounts' });
      if (res.code === 200) {
        tronWeb = provider.tronWeb;
      }
      setRes({
        method: "tron_requestAccounts",
        res
      });
      console.log("tron_requestAccounts.ready = false: ", provider.tronWeb);
    }
    setAddress(tronWeb?.defaultAddress?.base58);
    return tronWeb;
  }

  async function connect() { 
    setRes();
    if (!provider) { 
      alert('provider err');
      return;
    }

    if (!provider.connect) { 
      alert('no connect function');
      return;
    }

    const res = await provider.connect();
    setRes({
      method: "provider.connect",
      res
    });
    console.log("provider.connect: ", provider.tronWeb);
  }

  async function disconnect() { 
    setRes();
    if (!provider) { 
      alert('provider err');
      return;
    }

    if (!provider.disconnect) { 
      alert('no disconnect function');
      return;
    }

    const res = await provider.disconnect();
    setRes({
      method: "provider.disconnect",
      tronWeb: provider.tronWeb,
      res
    });
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

  const [signedTx, setSignedTx] = useState(null);
  async function signTransaction() {
    const tronWeb = await getTronWeb();
    if (!tronWeb) { 
      alert('tronWeb err, please reconnect');
      return;
    }
    const toAddress = address;
    if (!toAddress) { 
      alert('no address');
      return;
    }

    const activePermissionId = 2;
    // const tx = await tronWeb.transactionBuilder.sendTrx(toAddress, 10, fromAddress); // Step1
    const tx = await tronWeb.transactionBuilder.sendTrx(
      toAddress, 10,
      { permissionId: activePermissionId}
    ); // step 1
    try {
      const signedTx = await tronWeb.trx.multiSign(tx, undefined, activePermissionId); // step 2
      setSignedTx(signedTx);

      setRes({
        method: "tronWeb.trx.multiSign",
        tx,
        signedTx,
      });
    } catch (err) {
      setRes({
        method: "tronWeb.trx.multiSign",
        tx,
        err
      });
    }
  }

  async function sendRawTransaction() { 
    const tronWeb = await getTronWeb();
    if (!tronWeb) { 
      alert('tronWeb err, please reconnect');
      return;
    }
    const toAddress = address;
    if (!toAddress) { 
      alert('no address');
      return;
    }
    if (signedTx === null) { 
      alert('no signedTx');
      return;
    }

    try {
      const res = await tronWeb.trx.sendRawTransaction(signedTx);
      setRes({
        method: "tronWeb.trx.sendRawTransaction",
        signedTx,
        res
      });
      setSignedTx(null);
    } catch (err) {
      setRes({
        method: "tronWeb.trx.sendRawTransaction",
        signedTx,
        err
      });
    }
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
        }} className={"text-[#fff] p-1 m-2 " + (providerName === "mydoge" ? "bg-[#000]": "bg-[#666]")}>
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
        }} className={"text-[#fff] p-1 m-2 " + (providerName === "tronLink" ? "bg-[#000]": "bg-[#666]")}>
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
        }} className={"text-[#fff] p-1 m-2 " + (providerName === "okxwallet" ? "bg-[#000]": "bg-[#666]")}>
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
        }} className={"text-[#fff] p-1 m-2 " + (providerName === "bitkeep" ? "bg-[#000]": "bg-[#666]")}>
          bitget
        </button>
      </div>

      <div className="mt-2">
        <button onClick={connect} className="bg-[#000] text-[#fff] p-1 m-2">
          connect
        </button>
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
        <button onClick={signTransaction} className="bg-[#000] text-[#fff] p-1 m-2">
        signTransaction
        </button>
        <button onClick={sendRawTransaction} className="bg-[#000] text-[#fff] p-1 m-2">
          sendRawTransaction
        </button>
      </div>

      {res?.method && <div className="bg-[#f5f5f5] border-1 p-5 mt-4 text-xs">
        <h2 className="text-lg mb-4">{ providerName || "tronLink" }: {res.method}</h2>
        <pre style={{ wordWrap: "break-word" }}>
          {JSON.stringify(res, null, "\t")}
        </pre>
      </div>}
    </div>
  );
}