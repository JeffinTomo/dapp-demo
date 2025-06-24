import React, { useState, useEffect } from "react";

const unisateWallets = {
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
    doc: "https://web3.okx.com/zh-hans/build/dev-docs/sdks/chains/bitcoin/provider",
    provider: "window.okxwallet?.unisat"
  },
  bitkeep: {
    providerName: "bitkeep",
    name: "Bitget Wallet",
    installLink: "https://web3.bitget.com/zh-CN/wallet-download",
    doc: "https://web3.bitget.com/en/docs/provider-api/btc.html",
    provider: "window.bitkeep?.unisat"
  }
};

const solanaWallets = {
  mydoge: {
    providerName: "mydoge",
    name: "MyDoge Wallet",
    installLink: "https://qsg07xytt12z.sg.larksuite.com/wiki/I5ZDwtq6MiQQpWk9MRelFpjtg9b",
    doc: "https://qsg07xytt12z.sg.larksuite.com/wiki/ECaVwtEt6i2iuukiiZFlu3Dxg0p",
    provider: window.mydoge?.solana
  },
  phantom: {
    providerName: "phantom",
    name: "Phantom Wallet",
    installLink: "https://phantom.app/",
    doc: "https://docs.phantom.app/integrate/web3-provider",
    provider: window.phantom?.solana
  },
  okxwallet: {
    providerName: "okxwallet",
    name: "OKX Wallet",
    installLink: "https://web3.okx.com/zh-hans/build/docs/sdks/web-detect-okx-wallet",
    doc: "https://web3.okx.com/zh-hans/build/docs/sdks/web-detect-okx-wallet",
    provider: window.okxwallet?.solana
  },
  bitkeep: {
    providerName: "bitkeep",
    name: "Bitget Wallet",
    installLink: "https://web3.bitget.com/zh-CN/wallet-download",
    doc: "https://web3.bitget.com/en/docs/provider-api/solana.html",
    provider: window.bitkeep?.solana
  }
}

export const walletsConfig = {
  unisat: {
    providerNames: ['mydoge', 'unisat', 'okxwallet', 'bitkeep'],
    wallets: unisateWallets
  },
  solana: {
    providerNames: ['mydoge', 'phantom', 'okxwallet', 'bitkeep'],
    wallets: solanaWallets
  }
}


export function Wallets({ type, onChanged }) {
  if (!walletsConfig[type]) {
    alert(`no ${type} config.`)
  }
  const { providerNames, wallets } = walletsConfig[type];
  const [providerName, setProviderName] = useState(providerNames[0]);

  return (<>
    {providerName}: <a href={wallets[providerName]?.doc} target="_blank">{wallets[providerName]?.doc}</a>

    <p></p>

    current wallet: <span className="text-2xl text-[red]">{providerName}</span> <br />
    switch to:
    {providerNames.map((_providerName) => <button key={_providerName} onClick={() => {
      let provider = window[_providerName]?.unisat;
      if (_providerName === "unisat") {
        provider = window?.unisat;
      }
      if (!provider) {
        const link = wallets[_providerName]?.installLink
        window.open(link, '_blank');
        return;
      }
      setProviderName(_providerName);
      onChanged && onChanged(wallets[_providerName]);
    }} className={"text-[#fff] p-1 m-2 " + (providerName === _providerName ? "bg-[#000]" : "bg-[#666]")}>
      {_providerName === "bitkeep" ? "bitget" : _providerName}
    </button>)
    }
  </>);
}