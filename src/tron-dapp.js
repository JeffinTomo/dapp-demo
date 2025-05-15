import React, { useState, useEffect } from "react";
import bs58 from "bs58";
import BN from "bn.js";

export default function TronDApp() {
  const [address, setAddress] = useState("");

  const [providerName, setProviderName] = useState('mydoge');
  const [provider, setProvider] = useState(providerName ? window[providerName]?.tronLink : window.tronLink);

  const toAddressList = ["TTWBUyNBFshkEgBJ2hMzXLuvY6tHrHoYaU", "TT67aSyGdPc9V1ZvewwHnT4nZcge3kM6kG"];
  const [res, setRes] = useState({});
  const [eventLogs, setEventLogs] = useState([]);

  useEffect(() => { 
    window.addEventListener('tronLink#initialized', (res) => { 
      console.log('tronLink#initialized', res);
    });

    window.addEventListener('message', function (e) {
      if (e.data.message && e.data.message.action) {
        setEventLogs(e.data.message);
      }
    });
  }, [providerName]);

  async function getTronWeb() { 
    if (!provider) { 
      alert('provider err');
      return;
    }
    return provider?.tronWeb;
  }
  
  async function connect() { 
    setRes();
    if (provider.ready) {
      setRes({
        method: "tronLink.request.tron_requestAccounts",
        ready: true
      });
      // console.log("tron_requestAccounts.ready=true: ", provider.tronWeb);
    } else {
      const res = await provider.request({ method: 'tron_requestAccounts' });
      if (res.code === 200) {
        // alert('tron_requestAccounts ok');
      }
      setRes({
        method: "tronLink.request.tron_requestAccounts",
        res
      });
      // console.log("tron_requestAccounts:", provider, res, provider.tronWeb);
    }
    setAddress(tronWeb?.defaultAddress?.base58 || "TDKLz7RwqF1X4qV3hRRXdS2BM4EnKyv6SW");
    // console.log(provider);
    return provider.tronWeb;
  }

  async function connect2() { 
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
      method: "tronLink.connect",
      res
    });
    setAddress(res?.address || "TDKLz7RwqF1X4qV3hRRXdS2BM4EnKyv6SW");
    // console.log("provider.connect: ", provider.tronWeb);
  }

  async function disconnect() { 
    setRes();
    if (!provider) { 
      alert('provider err');
      return;
    }

    if (!provider.disconnect) {
      alert("no disconnect.");
      return;
    }

    const res = await provider.disconnect();
    setRes({
      method: "tronLink.disconnect",
      tronWeb: provider.tronWeb,
      res
    });
    setAddress('');
  }

  async function signMessage() { 
    setRes();
    const tronWeb = await getTronWeb();
    if (!tronWeb) { 
      alert('tronWeb err');
      return;
    }
    try {
      const message = "0x1e"; // any hex string
      const signature = await tronWeb.trx.signMessageV2(message); //sign

      const base58Address = await tronWeb.trx.verifyMessageV2(message, signature);
      console.log('verifyMessageV2', base58Address === address);

      setRes({
        method: "tronWeb.trx.signMessageV2",
        message,
        signature
      });
    } catch (err) {
      setRes({
        method: "tronWeb.trx.signMessageV2",
        err,
      });
      console.error(err);
    }
  }

  async function wallet_watchAsset() { 
    setRes();
    if (!provider) { 
      alert('provider err');
      return;
    }
    try { 
      const res = await provider.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'TRC20',
          options: {
            address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'
          }
        },
      });
      setRes({
        method: "tronLink.request.wallet_watchAsset",
        res,
      });
    } catch (err) {
      setRes({
        method: "tronLink.request.wallet_watchAsset",
        err,
      });
      console.error(err);
    }
  }

  async function wallet_watchAsset2() { 
    setRes();
    const tronWeb = await getTronWeb();
    if (!tronWeb) { 
      alert('tronWeb err');
      return;
    }
    try { 
      const res = await tronWeb.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'TRC20',
          options: {
            address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'
          }
        },
      });
      setRes({
        method: "tronWeb.request.wallet_watchAsset",
        res,
      });
    } catch (err) {
      setRes({
        method: "tronWeb.request.wallet_watchAsset",
        err,
      });
      console.error(err);
    }
  }

  const [signedTx, setSignedTx] = useState(null);
  async function signTransaction() {
    const tronWeb = await getTronWeb();
    if (!tronWeb) { 
      alert('tronWeb err, please reconnect');
      return;
    }

    let toAddress = toAddressList[0];
    if (address === toAddressList[0]) { 
      toAddress = toAddressList[1];
    }

    const tx = tronWeb.transactionBuilder.sendTrx(
      toAddress,      // 接收方地址（Base58 格式，T 开头）
      10000,         // 金额，单位是 SUN（1 TRX = 1_000_000 SUN）
      address,     // 发送方地址（可选，通常钱包会自动填充）
    );
    try {
      const signedTx = await tronWeb.trx.sign(tx); // step 2
      setSignedTx(signedTx);

      setRes({
        method: "tronWeb.trx.multiSign",
        tx,
        signedTx,
      });
    } catch (err) {
      setRes({
        method: "tronWeb.trx.multiSign",
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

  async function signTokenTransaction() { 
    const tronWeb = await getTronWeb();
    if (!tronWeb) { 
      alert('tronWeb err, please reconnect');
      return;
    }

    const tokenAddress = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'; // USDT 合约举例
    let toAddress = toAddressList[0];
    if (address === toAddressList[0]) { 
      toAddress = toAddressList[1];
    }

    const amount = "100";

    //send trc20 token  
    const tx = await tronWeb.transactionBuilder.triggerSmartContract(
      tokenAddress,
      'transfer(address,uint256)',
      {
        feeLimit: 1_000_000, // 可调整
        callValue: 0,
        from: address,
      },
      [
        { type: 'address', value: toAddress },
        { type: 'uint256', value: amount }
      ],
      address
    );

    try {
      //const signedTx = await tronWeb.trx.sign(tx.transaction);
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
        err
      });
    }
  }

  async function sendTokenRawTransaction() { 
    const tronWeb = await getTronWeb();
    if (!tronWeb) { 
      alert('tronWeb err, please reconnect');
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
        type: 'token',
        signedTx,
        res
      });
      setSignedTx(null);
    } catch (err) {
      setRes({
        method: "tronWeb.trx.sendRawTransaction",
        type: 'token',
        signedTx,
        err
      });
    }
  }


  const providerNames = ['mydoge','tronLink','okxwallet','bitkeep'];
  const tronWallets = {
    mydoge: {
      providerName: "mydoge",
      name: "MyDoge Wallet",
      installLink: "https://qsg07xytt12z.sg.larksuite.com/wiki/I5ZDwtq6MiQQpWk9MRelFpjtg9b",
      doc: "https://qsg07xytt12z.sg.larksuite.com/wiki/J6F0wd2Imi5VJzk40yMlKd8JgCf",
      provider: "window.mydoge?.tronLink"
    },
    tronLink: {
      providerName: "tronLink",
      name: "TronLink Wallet",
      installLink: "https://chrome.google.com/webstore/detail/tronlink/ibnejdfjmmkpcnlpebklmnkoeoihofec",
      doc: "https://docs.tronlink.org/dapp/start-developing",
      provider: "window.tronLink"
    },
    okxwallet: {
      providerName: "okxwallet",
      name: "OKX Wallet",
      installLink: "https://chrome.google.com/webstore/detail/okx-wallet/mcohilncbfahbmgdjkbpemcciiolgcge",
      doc: "https://web3.okx.com/zh-hans/build/dev-docs/sdks/chains/tron/provider",
      provider: "window.okxwallet?.tronLink"
    },
    bitkeep: {
      providerName: "bitkeep",
      name: "Bitget Wallet",
      installLink: "https://web3.bitget.com/zh-CN/wallet-download",
      doc: "https://web3.bitget.com/en/docs/provider-api/tron.html",
      provider: "window.bitkeep?.tronLink"
    }
  };

  return (
    <div className="m-5 text-sm">
      <div className="mt-2 bg-[#f5f5f5] p-2">
        <h1>Tron Dapp Demo: </h1>
        {address && <p>connected: <span className="text-xl text-[red]">{address}</span></p>}


        <p></p>

        {providerName}: <a href={ tronWallets[providerName]?.doc } target="_blank">{ tronWallets[providerName]?.doc }</a>

        <p></p>
          
        current wallet: <span className="text-2xl text-[red]">{providerName}</span> <br />
        switch to:
        {providerNames.map((_providerName) => <button key={ _providerName} onClick={() => {
          let provider = window[_providerName]?.tronLink;
          if (_providerName === "tronLink") { 
            provider = window?.tronLink;
          }
          if (!provider) {
            const link = tronWallets[_providerName]?.installLink
            window.open(link, '_blank');
            return;
          }
          setProvider(provider);
          setProviderName(_providerName);
        }} className={"text-[#fff] p-1 m-2 " + (providerName === _providerName ? "bg-[#000]": "bg-[#666]")}>
          { _providerName }
        </button>)
        }
      </div>

      <div className="mt-2">
        <button onClick={connect2} className="bg-[#000] text-[#fff] p-1 m-2">
          tronLink.connect
        </button>
        <button onClick={connect} className="bg-[#000] text-[#fff] p-1 m-2">
          reqeust.tron_requestAccounts
        </button>

        <button onClick={disconnect} className="bg-[#000] text-[#fff] p-1 m-2">
          tronLink.disconnect
        </button>
      </div>


      <div className={ 'mt-6 ' + (address ? '' : 'opacity-40')}>
        <button onClick={signMessage} className="bg-[#000] text-[#fff] p-1 m-2">
          signMessage
        </button>
        <button onClick={wallet_watchAsset} className="bg-[#000] text-[#fff] p-1 m-2">
          tronLink.request.wallet_watchAsset
        </button>
        <button onClick={wallet_watchAsset2} className="bg-[#000] text-[#fff] p-1 m-2">
          tronWeb.request.wallet_watchAsset
        </button>
      </div>
        
      <div className={ 'mt-6 ' + (address ? '' : 'opacity-40')}> 
        <button onClick={signTransaction} className="bg-[#000] text-[#fff] p-1 m-2">
          ?signTransaction
        </button>
        <button onClick={sendRawTransaction} className="bg-[#000] text-[#fff] p-1 m-2">
          ?sendRawTransaction
        </button>
      </div>
        
      <div className={ 'mt-6 ' + (address ? '' : 'opacity-40')}> 
        <button onClick={signTokenTransaction} className="bg-[#000] text-[#fff] p-1 m-2">
          ?signTransaction(token)
        </button>
        <button onClick={sendTokenRawTransaction} className="bg-[#000] text-[#fff] p-1 m-2">
          ?sendRawTransaction(token)
        </button>
      </div>

      {res?.method && <div className={"bg-[#f5f5f5] border-1 p-5 mt-4 text-xs" +  ((res.err || res.error) ? ' border-[red]' : '')}>
        <h2 className="text-lg mb-4">{ providerName || "tronLink" }: {res.method}</h2>
        <pre style={{ wordWrap: "break-word" }}>
          {JSON.stringify(res, null, "\t")}
        </pre>
      </div>}


      <div className={"bg-[#f5f5f5] border-1 p-5 mt-4 text-xs"}>
        <h2 className="text-lg mb-4">{providerName || "tronLink"}: message</h2>
        
        doc: <a href="https://developers.tron.network/docs/tronlink-events">https://developers.tron.network/docs/tronlink-events</a>

        <pre style={{ wordWrap: "break-word" }}>
          {JSON.stringify(eventLogs, null, "\t")}
        </pre>
      </div>
    </div>
  );
}