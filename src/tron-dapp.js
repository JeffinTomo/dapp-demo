import React, { useState, useEffect } from "react";

const contractAddress = "TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7";
//https://tronscan.org/#/token20/TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7

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

    const actions = {
      connect: true,
      disconnect: true,
      accountChanged: true
    };
    window.addEventListener('message', function (e) {
      if (e.data.message && e.data.message.action && e.data.message.isMydoge) {
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

  function getAddress() {
    const tronWeb = provider.tronWeb;
    console.log("tronWeb.defaultAddress", tronWeb.defaultAddress);
    console.log("tronWeb.defaultAddress.base58", tronWeb.defaultAddress?.base58);
    console.log("tronWeb.defaultAddress.hex", tronWeb.defaultAddress?.hex);
    setAddress(tronWeb.defaultAddress?.base58);
  }

  async function connect() {
    setRes();
    if (provider.ready) {
      setRes({
        method: "tronLink.request.tron_requestAccounts",
        ready: true
      });
    } else {
      const res = await provider.request({ method: 'tron_requestAccounts' });
      setAddress(res?.address);

      setRes({
        method: "tronLink.request.tron_requestAccounts",
        res,
      });
    }

    getAddress();
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
    setAddress(res?.address);
    getAddress();
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
      let message = "hello world";
      message = tronWeb.toHex(message).replace(/^0x/, '');
      message = tronWeb.utils.code.hexStr2byteArray(message)

      message = tronWeb.sha3(message).replace(/^0x/, '');
      const signature = await tronWeb.trx.sign(message); //sign
      console.log('signature', signature);

      let signature0x = signature.replace(/^0x/, '');
      var tail = signature0x.substring(128, 130);
      if (tail == '01') {
        signature0x = signature0x.substring(0, 128) + '1c';
      }
      if (tail == '00') {
        signature0x = signature0x.substring(0, 128) + '1b';
      }

      console.log("verifyMessage", { message, signature, signature0x, tail, address });
      var res = await tronWeb.trx.verifyMessage(message, signature0x, address);

      setRes({
        method: "tronWeb.trx.sign",
        message,
        signature,
        checked: res
      });
    } catch (err) {
      console.error("tronWeb.trx.sign", err);
      setRes({
        method: "tronWeb.trx.sign",
        err: err?.message,
      });
    }
  }


  //https://tronweb.network/docu/docs/API%20List/trx/verifyMessageV2
  async function signMessageV2() {
    setRes();
    const tronWeb = await getTronWeb();
    if (!tronWeb) {
      alert('tronWeb err');
      return;
    }
    try {
      const message = "hello world";
      const signature = await tronWeb.trx.signMessageV2(message); //sign

      const base58Address = await tronWeb.trx.verifyMessageV2(message, signature);
      console.log('verifyMessageV2:', base58Address === address, { base58Address, address });

      setRes({
        method: "tronWeb.trx.signMessageV2",
        message,
        signature,
        verifyMessageV2: base58Address === address,
      });
    } catch (err) {
      setRes({
        method: "tronWeb.trx.signMessageV2",
        err,
      });
      console.error(err);
    }
  }

  async function getBalance() {
    const tronWeb = await getTronWeb();
    if (!tronWeb) {
      alert('tronWeb err');
      return;
    }
    if (!address) {
      alert('address err');
      return;
    }

    try {
      const balance = await tronWeb.trx.getBalance(address);
      setRes({
        method: "tronWeb.trx.getBalance",
        address,
        balance
      });
    } catch (err) {
      setRes({
        method: "tronWeb.trx.getBalance",
        address,
        err
      });
    }
  }

  async function getTrc20Balance(tronWeb, contractAddress, address) {
    const contract = await tronWeb.contract().at(contractAddress);
    const balance = await contract.balanceOf(address).call();
    // Most TRC20 tokens use 6 decimals, but check your token's decimals
    return tronWeb.toBigNumber(balance).toString();
  }

  async function getTokenBalance() {
    const tronWeb = await getTronWeb();
    if (!tronWeb) {
      alert('tronWeb err');
      return;
    }
    if (!address) {
      alert('address err');
      return;
    }

    try {
      const balance = await getTrc20Balance(tronWeb, contractAddress, address);
      setRes({
        method: "tronWeb.contract.balanceOf",
        type: "trc20",
        res: {
          address,
          contractAddress,
          balance
        }
      });
    } catch (err) {
      setRes({
        method: "tronWeb.contract.balanceOf",
        address,
        err
      });
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
            address: contractAddress
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
            address: contractAddress + "=="
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
    setRes({});
    const tronWeb = await getTronWeb();
    if (!tronWeb) {
      alert('tronWeb err, please reconnect');
      return;
    }

    let toAddress = toAddressList[0];
    if (address === toAddressList[0]) {
      toAddress = toAddressList[1];
    }

    const transaction = await tronWeb.transactionBuilder.sendTrx(
      toAddress,      // 接收方地址（Base58 格式，T 开头）
      999,         // 金额，单位是 SUN（1 TRX = 1_000_000 SUN）
    );
    // console.log('dapp.multiSign 1', tx);
    try {
      const { signature } = await tronWeb.trx.multiSign(transaction); // step 2
      const signedTx = { ...transaction, signature };
      setSignedTx(signedTx);

      setRes({
        method: "tronWeb.trx.multiSign",
        signedTx,
      });
      // console.log("signTransaction", tx, signedTx)
    } catch (err) {
      setRes({
        method: "tronWeb.trx.multiSign",
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

    let toAddress = toAddressList[0];
    if (address === toAddressList[0]) {
      toAddress = toAddressList[1];
    }

    const amount = "1999";

    //send trc20 token  
    const { transaction } = await tronWeb.transactionBuilder.triggerSmartContract(
      contractAddress,
      'transfer(address,uint256)',
      {
        feeLimit: 10000,
        callValue: 0,
        from: address,
      },
      [
        { type: 'address', value: toAddress },
        { type: 'uint256', value: amount }
      ],
      address
    );
    // console.log('dapp.multiSign 2', tx);

    try {
      const { signature } = await tronWeb.trx.multiSign(transaction);
      const signedTx = { ...transaction, signature }; // step 2
      setSignedTx(signedTx);
      // console.log('multiSign.token', tx.transaction, signedTx);

      setRes({
        method: "tronWeb.trx.multiSign",
        signedTx,
      });
      // console.log("signTransaction token", signedTx, transaction)
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
      console.log("sendRawTransaction 1", signedTx);
      const receipt = await tronWeb.trx.sendRawTransaction(signedTx);
      console.log("sendRawTransaction 2", receipt);
      setRes({
        method: "tronWeb.trx.sendRawTransaction",
        signedTx,
        receipt
      });
      const txid = receipt?.txid;
      window.open(`https://tronscan.org/#/transaction/${txid}`)
      // console.log("sendRawTransaction", signedTx, receipt)
      setSignedTx(null);
    } catch (err) {
      console.log("sendRawTransaction err", err);
      setRes({
        method: "tronWeb.trx.sendRawTransaction",
        signedTx,
        err
      });
    }
  }

  async function sendHexTransaction() {
    const tronWeb = await getTronWeb();
    if (!tronWeb) {
      alert('tronWeb err, please reconnect');
      return;
    }

    const signature = signedTx?.signature || [];
    if (signature.length === 0) {
      alert('no signedTx');
      return;
    }

    try {
      const signedHexTransaction = signature[0];
      const receipt = await tronWeb.trx.sendHexTransaction(signedHexTransaction);
      setRes({
        method: "tronWeb.trx.sendHexTransaction",
        signedTx,
        receipt
      });
      const txid = receipt?.txid;
      window.open(`https://tronscan.org/#/transaction/${txid}`)
    } catch (err) {
      console.log("sendHexTransaction err", err);
      setRes({
        method: "tronWeb.trx.sendHexTransaction",
        signedTx,
        err
      });
    }
  }


  async function sendTransaction() {
    setRes({});
    const tronWeb = await getTronWeb();
    if (!tronWeb) {
      alert('tronWeb err, please reconnect');
      return;
    }

    let toAddress = toAddressList[0];
    if (address === toAddressList[0]) {
      toAddress = toAddressList[1];
    }
    try {
      const res = await tronWeb.trx.sendTransaction(toAddress, 3999);

      if (res?.txid) {
        window.open(`https://tronscan.org/#/transaction/${res?.txid}`)

        setRes({
          method: "tronWeb.trx.sendTransaction",
          res,
        });
      } else {
        setRes({
          method: "tronWeb.trx.sendTransaction",
          err: res
        });
      }
    } catch (err) {
      setRes({
        method: "tronWeb.trx.sendTransaction",
        err
      });
    }
  }

  async function sendToken() {
    setRes({});
    const tronWeb = await getTronWeb();
    if (!tronWeb) {
      alert('tronWeb err, please reconnect');
      return;
    }

    let toAddress = toAddressList[0];
    if (address === toAddressList[0]) {
      toAddress = toAddressList[1];
    }
    try {
      // const contractAddress = "TXL6rJbvmjD46zeN1JssfgxvSo99qC8MRT";
      // const tokenInfo = await tronWeb.trx.getTokensIssuedByAddress(contractAddress);
      // const tokenId = tokenInfo?.BitTorrent?.id;
      // console.log('getTokensIssuedByAddress', contractAddress, tokenInfo);

      if (!contractAddress) {
        alert('contractAddress err');
        return;
      }

      const tokenId = "1002000";
      const res = await tronWeb.trx.sendToken(toAddress, 4999, contractAddress);

      if (res?.txid) {
        window.open(`https://tronscan.org/#/transaction/${res?.txid}`)

        setRes({
          method: "tronWeb.trx.sendToken",
          res,
        });
      } else {
        setRes({
          method: "tronWeb.trx.sendToken",
          err: res
        });
      }
    } catch (err) {
      setRes({
        method: "tronWeb.trx.sendToken",
        err
      });
    }
  }

  const providerNames = ['mydoge', 'tronLink', 'okxwallet', 'bitkeep'];
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

        trc20: <a href="https://coinranking.com/coins/trc-20">https://coinranking.com/coins/trc-20</a>

        <p></p>

        {providerName}: <a href={tronWallets[providerName]?.doc} target="_blank">{tronWallets[providerName]?.doc}</a>

        <p></p>

        current wallet: <span className="text-2xl text-[red]">{providerName}</span> <br />
        switch to:
        {providerNames.map((_providerName) => <button key={_providerName} onClick={() => {
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
          setAddress('');
        }} className={"text-[#fff] p-1 m-2 " + (providerName === _providerName ? "bg-[#000]" : "bg-[#666]")}>
          {_providerName === "bitkeep" ? "bitget" : _providerName}
        </button>)
        }
      </div>

      <div className="mt-2">
        <button onClick={connect} className="bg-[#000] text-[#fff] p-1 m-2">
          tronLink.reqeust.tron_requestAccounts
        </button>

        <button onClick={connect2} className="bg-[#000] text-[#fff] p-1 m-2">
          tronLink.connect
        </button>

        <button onClick={disconnect} className="bg-[#000] text-[#fff] p-1 m-2">
          tronLink.disconnect
        </button>
      </div>


      <div className={'mt-6 ' + (address ? '' : 'opacity-40')}>
        <button onClick={signMessage} className="bg-[#000] hidden text-[#fff] p-1 m-2">
          tronWeb.trx.sign
        </button>
        <button onClick={signMessageV2} className="bg-[#000] text-[#fff] p-1 m-2">
          tronWeb.trx.signMessageV2
        </button>
      </div>

      <div className={'mt-6 ' + (address ? '' : 'opacity-40')}>
        <button onClick={getBalance} className="bg-[#000] text-[#fff] p-1 m-2">
          tronLink.trx.getBalance
        </button>

        <button onClick={getTokenBalance} className="bg-[#000] text-[#fff] p-1 m-2">
          tronLink.trx.getBalance(token)
        </button>

        <button onClick={wallet_watchAsset} className="bg-[#000] text-[#fff] p-1 m-2">
          tronLink.request.wallet_watchAsset
        </button>
        <button onClick={wallet_watchAsset2} className="bg-[#000] text-[#fff] p-1 m-2">
          tronWeb.request.wallet_watchAsset
        </button>
      </div>

      <div className={'mt-6 ' + (address ? '' : 'opacity-40')}>
        <button onClick={signTransaction} className="bg-[#000] text-[#fff] p-1 m-2">
          signTransaction
        </button>
        <button onClick={signTokenTransaction} className="bg-[#000] text-[#fff] p-1 m-2">
          signTransaction(token)
        </button>
        <button onClick={sendRawTransaction} className="bg-[#000] text-[#fff] p-1 m-2">
          sendRawTransaction
        </button>

        {/* <button onClick={sendHexTransaction} className="bg-[#000] text-[#fff] p-1 m-2">
          sendHexTransaction
        </button> */}


        <button onClick={sendTransaction} className="bg-[#000] text-[#fff] p-1 m-2">
          sendTransaction
        </button>
        <button onClick={sendToken} className="bg-[#000] text-[#fff] p-1 m-2">
          sendToken
        </button>
      </div>

      {res?.method && <div className={"bg-[#f5f5f5] border-1 p-5 mt-4 text-xs" + ((res.err || res.error) ? ' border-[red]' : '')}>
        <h2 className="text-lg mb-4">{providerName || "tronLink"}: {res.method}</h2>
        <pre style={{ wordWrap: "break-word" }}>
          {JSON.stringify(res, null, "\t")}
        </pre>
      </div>}


      <div className={"bg-[#f5f5f5] border-1 p-5 mt-4 text-xs"}>
        <h2 className="text-lg mb-4">
          {providerName || "tronLink"}: message,
          doc: <a href="https://developers.tron.network/docs/tronlink-events">https://developers.tron.network/docs/tronlink-events</a>
        </h2>

        <pre style={{ wordWrap: "break-word" }}>
          {JSON.stringify(eventLogs, null, "\t")}
        </pre>
      </div>
    </div>
  );
}