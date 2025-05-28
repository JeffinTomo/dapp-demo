import React, { useState, useEffect } from "react";

export default function Wallets({ chainType, onProviderChange }) {
  const providerNames = ['mydoge', 'tronLink', 'okxwallet', 'bitkeep'];
  const tronWallets = {
    mydoge: {
      providerName: "mydoge",
      name: "MyDoge Wallet",
      installLink: "https://qsg07xytt12z.sg.larksuite.com/wiki/I5ZDwtq6MiQQpWk9MRelFpjtg9b",
      doc: "https://qsg07xytt12z.sg.larksuite.com/wiki/ECaVwtEt6i2iuukiiZFlu3Dxg0p",
      provider: "window.mydoge?.unisat"
    },
    unisat: {
      providerName: "unisat",
      name: "Unisat Wallet",
      installLink: "https://chromewebstore.google.com/detail/unisat-wallet/ppbibelpcjmhbdihakflkdcoccbgbkpo",
      doc: "https://docs.unisat.io/dev/open-api-documentation/unisat-wallet",
      provider: "window.unisat"
    },
    okxwallet: {
      providerName: "okxwallet",
      name: "OKX Wallet",
      installLink: "https://chrome.google.com/webstore/detail/okx-wallet/mcohilncbfahbmgdjkbpemcciiolgcge",
      doc: "https://web3.okx.com/zh-hans/build/dev-docs/sdks/chains/tron/provider",
      provider: "window.okxwallet?.unisat"
    },
    bitkeep: {
      providerName: "bitkeep",
      name: "Bitget Wallet",
      installLink: "https://web3.bitget.com/zh-CN/wallet-download",
      doc: "https://web3.bitget.com/en/docs/provider-api/tron.html",
      provider: "window.bitkeep?.unisat"
    }
  };

  return (
    <>
      {providerName}: <a href={tronWallets[providerName]?.doc} target="_blank">{tronWallets[providerName]?.doc}</a>

      <p></p>

      current wallet: <span className="text-2xl text-[red]">{providerName}</span> <br />
      switch to:
      {providerNames.map((_providerName) => <button key={_providerName} onClick={() => {
        let provider = window[_providerName]?.tronLink;
        if (_providerName === "unisat") {
          provider = window?.unisat;
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
    </>
  );
}