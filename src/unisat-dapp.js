import React, { useState, useEffect } from "react";
import { Wallets } from "./wallets";

export default function UnisatDApp() {
  const [address, setAddress] = useState("");

  const [providerName, setProviderName] = useState('mydoge');

  const [res, setRes] = useState({});

  useEffect(() => {
    window.addEventListener('unisat#initialized', (res) => {
      console.log('unisat#initialized', res);
    });
  }, [providerName]);

  function getProvider() {
    if (!providerName) {
      throw new Error("no provider name")
      return;
    }
    let provider = null;
    if (providerName === "unisat") {
      provider = window.unisat;
    } else {
      provider = window[providerName]?.unisat;
    }

    if (!provider) {
      throw new Error('provider err');
    }
    return provider;
  }

  const connect = async () => {
    setRes();
    const provider = getProvider();

    if (!provider.connect) {
      alert('provider not support connect');
      return;
    }

    try {
      const res = await provider.connect();
      setAddress(res?.address);

      setRes({
        method: "provider.connect",
        res,
      });
    } catch (err) {
      console.error("connect err", provider, err);
      setRes({
        method: "provider.connect",
        err,
      });
    }
  }

  const disconnect = async () => {
    setRes();

    const provider = getProvider();
    if (!provider.disconnect) {
      alert('provider not support disconnect');
      return;
    }

    try {
      const res = await provider.disconnect();
      setAddress("");

      setRes({
        method: "provider.disconnect",
        res,
      });
    } catch (err) {
      console.error("disconnect err", provider, err);
      setRes({
        method: "provider.disconnect",
        err,
      });
    }
  }

  const requestAccounts = async () => {
    setRes();

    try {
      const provider = getProvider();
      const res = await provider.requestAccounts();
      setAddress(res[0]);

      setRes({
        method: "provider.requestAccounts",
        res,
      });
    } catch (err) {
      setRes({
        method: "provider.requestAccounts",
        err,
      });
    }
  }

  const getAccounts = async () => {
    setRes();

    try {
      const provider = getProvider();
      const res = await provider.getAccounts();
      setAddress(res[0]);

      setRes({
        method: "provider.getAccounts",
        res,
      });
    } catch (err) {
      setRes({
        method: "provider.getAccounts",
        err,
      });
    }
  }

  const getPublicKey = async () => {
    setRes();

    try {
      const provider = getProvider();
      const res = await provider.getPublicKey();

      setRes({
        method: "provider.getPublicKey",
        res,
      });
    } catch (err) {
      setRes({
        method: "provider.getPublicKey",
        err,
      });
    }
  }

  const accountsChanged = () => {
    setRes();

    try {
      const provider = getProvider(); setRes({
        method: "provider.on(accountsChanged)",
        res: "waiting for accountsChanged",
      });
      provider.on("accountsChanged", (res) => {
        setRes({
          method: "provider.on(accountsChanged)",
          res,
        });
      });
    } catch (err) {
      setRes({
        method: "provider.on(accountsChanged)",
        err,
      });
    }
  };

  const getNetwork = async () => {
    setRes();

    try {
      const provider = getProvider();
      const res = await provider.getNetwork();

      setRes({
        method: "provider.getNetwork",
        res,
      });
    } catch (err) {
      setRes({
        method: "provider.getNetwork",
        err,
      });
    }
  };

  const switchNetwork = async () => {
    setRes();

    try {
      const provider = getProvider();
      const res = await provider.switchNetwork("testnet");

      setRes({
        method: "provider.switchNetwork",
        res,
      });
    } catch (err) {
      setRes({
        method: "provider.switchNetwork",
        err,
      });
    }
  };

  const getChain = async () => {
    setRes();

    try {
      const provider = getProvider();
      const res = await provider.getChain();

      setRes({
        method: "provider.getChain",
        res,
      });
    } catch (err) {
      setRes({
        method: "provider.getChain",
        err,
      });
    }
  };

  //https://docs.unisat.io/dev/open-api-documentation/unisat-wallet#switchchain
  const switchChain = async () => {
    setRes();

    try {
      const provider = getProvider();
      const chainId = "BITCOIN_TESTNET";
      const res = await provider.switchChain(chainId);

      setRes({
        method: "provider.switchChain",
        res,
      });
    } catch (err) {
      setRes({
        method: "provider.switchChain",
        err,
      });
    }
  };


  const networkChanged = () => {
    setRes();

    try {
      const provider = getProvider();
      provider.on("networkChanged", (res) => {
        setRes({
          method: "provider.on(networkChanged)",
          res,
        });
      });
    } catch (err) {
      setRes({
        method: "provider.on(networkChanged)",
        err,
      });
    }
  };


  const getBalance = async () => {
    setRes();

    try {
      const provider = getProvider();
      const res = await provider.getBalance();

      setRes({
        method: "provider.getBalance",
        res,
      });
    } catch (err) {
      setRes({
        method: "provider.getBalance",
        err,
      });
    }
  };

  // https://docs.unisat.io/dev/unisat-developer-center/unisat-wallet#signmessage
  const signMessage = async () => {
    setRes();

    try {
      const provider = getProvider();

      const message = "abcdefghijk123456789";
      const signature = await provider.signMessage(message);

      setRes({
        method: "provider.signMessage",
        message,
        signature,
        check: "https://bitaps.com/signature",
      });
    } catch (err) {
      setRes({
        method: "provider.signMessage",
        err,
      });
    }
  };

  const signMessageBip322Simple = async () => {
    setRes();

    try {
      const provider = getProvider();

      const message = "abcdefghijk123456789";
      const signature = await provider.signMessage(message, "bip322-simple");

      const pubkey = await provider.getPublicKey();
      const result = verifyMessage(pubkey, message, signature);

      setRes({
        method: "provider.signMessage",
        message,
        signature,
        pubkey,
        check: result,
      });
    } catch (err) {
      setRes({
        method: "provider.signMessage",
        err,
      });
    }
  };

  const sendBitcoin = async () => {
    setRes();

    try {
      const provider = getProvider();
      const amountSat = 10000;
      const options = { feeRate: 15, memo: "memo" };
      const res = await provider.sendBitcoin(address, amountSat, options);

      setRes({
        method: "provider.sendBitcoin",
        res,
      });
    } catch (err) {
      setRes({
        method: "provider.sendBitcoin",
        err,
      });
    }
  }

  const signPsbt = async () => {
    setRes();

    try {
      const provider = getProvider();
      const psbt = createPsbt();
      const res = await provider.signPsbt(psbt);

      setRes({
        method: "provider.signPsbt",
        res,
      });
    } catch (err) {
      setRes({
        method: "provider.signPsbt",
        err,
      });
    }
  };

  const signPsbts = async () => {
    setRes();

    try {
      const provider = getProvider();
      const psbts = [createPsbt(), createPsbt()];
      const res = await provider.signPsbts(psbts);

      setRes({
        method: "provider.signPsbts",
        res,
      });
    } catch (err) {
      setRes({
        method: "provider.signPsbts",
        err,
      });
    }
  };

  const pushTx = async () => {
    setRes();

    try {
      const provider = getProvider();
      const rawtx = "";
      let txid = await provider.pushTx({
        rawtx
      });

      setRes({
        method: "provider.pushTx",
        rawtx,
        txid,
      });
    } catch (err) {
      setRes({
        method: "provider.pushTx",
        err,
      });
    }
  }

  function createPsbt() {
    const psbt = new Psbt();
    const amount = 0.00001;
    psbt.addInput(address, amount);
    psbt.addOutput(address, amount);
    return psbt.toHex();
  }

  return (
    <div className="m-5 text-sm">
      <div className="mt-2 bg-[#f5f5f5] p-2">
        <h1>Unisat Dapp Demo: </h1>
        {address && <p>connected: <span className="text-xl text-[red]">{address}</span></p>}

        <p></p>
        <Wallets type="unisat" onChanged={({ provider, providerName }) => {
          setProviderName(providerName);
          setAddress('');
        }} />
      </div>

      <div className="mt-2">
        <button onClick={connect} className="bg-[#000] text-[#fff] p-1 m-2">
          connect
        </button>
        <button onClick={disconnect} className="bg-[#000] text-[#fff] p-1 m-2">
          disconnect
        </button>


        <button onClick={accountsChanged} className="bg-[#000] text-[#fff] p-1 m-2">
          accountsChanged
        </button>
        <button onClick={networkChanged} className="bg-[#000] text-[#fff] p-1 m-2 opacity-40">
          networkChanged
        </button>
      </div>

      <div className={'mt-2 ' + (address ? '' : 'opacity-40')}>
        <button onClick={getPublicKey} className="bg-[#000] text-[#fff] p-1 m-2">
          getPublicKey
        </button>
        <button onClick={getAccounts} className="bg-[#000] text-[#fff] p-1 m-2">
          getAccounts
        </button>
        <button onClick={requestAccounts} className="bg-[#000] text-[#fff] p-1 m-2">
          requestAccounts
        </button>

        <button onClick={getBalance} className="bg-[#000] text-[#fff] p-1 m-2">
          getBalance
        </button>
      </div>

      <div className={'mt-2 ' + (address ? '' : 'opacity-40')}>
        <button onClick={getNetwork} className="bg-[#000] text-[#fff] p-1 m-2">
          getNetwork
        </button>
        <button onClick={switchNetwork} className="bg-[#000] text-[#fff] p-1 m-2 opacity-40">
          switchNetwork
        </button>

        <button onClick={getChain} className="bg-[#000] text-[#fff] p-1 m-2">
          getChain
        </button>
        <button onClick={switchChain} className="bg-[#000] text-[#fff] p-1 m-2 opacity-40">
          switchChain
        </button>
      </div>

      <div className={'mt-2 ' + (address ? '' : 'opacity-40')}>
        <button onClick={signMessage} className="bg-[#000] text-[#fff] p-1 m-2">
          signMessage
        </button>
        <button onClick={signMessageBip322Simple} className="bg-[#000] text-[#fff] p-1 m-2 opacity-40">
          signMessageBip322Simple
        </button>
      </div>


      <div className={'mt-2 ' + (address ? '' : 'opacity-40')}>
        <button onClick={sendBitcoin} className="bg-[#000] opacity-40 text-[#fff] p-1 m-2">
          sendBitcoin
        </button>
        <button onClick={pushTx} className="bg-[#000] opacity-40 text-[#fff] p-1 m-2">
          pushTx
        </button>
        <button onClick={signPsbt} className="bg-[#000] opacity-40 text-[#fff] p-1 m-2">
          signPsbt
        </button>
        <button onClick={signPsbts} className="bg-[#000] opacity-40 text-[#fff] p-1 m-2">
          signPsbts
        </button>
      </div>

      {res?.method && <div className={"bg-[#f5f5f5] border-1 p-5 mt-4 text-xs" + ((res.err || res.error) ? ' border-[red]' : '')}>
        <h2 className="text-lg mb-4">{providerName || "tronLink"}: {res.method}</h2>
        <pre style={{ wordWrap: "break-word" }}>
          {JSON.stringify(res, null, "\t")}
        </pre>
      </div>}
    </div>
  );
}