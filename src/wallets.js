import React, { useState, useEffect } from "react";

const walletInfos = {
  mydoge: {
    providerName: "mydoge",
    name: "MyDoge Wallet",
    installLink: "https://qsg07xytt12z.sg.larksuite.com/wiki/I5ZDwtq6MiQQpWk9MRelFpjtg9b",
    doc: "https://qsg07xytt12z.sg.larksuite.com/wiki/ECaVwtEt6i2iuukiiZFlu3Dxg0p",
  },
  unisat: {
    providerName: "unisat",
    name: "Unisat Wallet",
    installLink: "https://chromewebstore.google.com/detail/unisat-wallet/ppbibelpcjmhbdihakflkdcoccbgbkpo",
    doc: "https://docs.unisat.io/dev/open-api-documentation/unisat-wallet",
  },
  okxwallet: {
    providerName: "okxwallet",
    name: "OKX Wallet",
    installLink: "https://chrome.google.com/webstore/detail/okx-wallet/mcohilncbfahbmgdjkbpemcciiolgcge",
    doc: "https://web3.okx.com/zh-hans/build/dev-docs/sdks/chains/bitcoin/provider",
  },
  bitkeep: {
    providerName: "bitkeep",
    name: "Bitget Wallet",
    installLink: "https://web3.bitget.com/zh-CN/wallet-download",
    doc: "https://web3.bitget.com/en/docs/provider-api/btc.html",
  },
  phantom: {
    providerName: "phantom",
    name: "Phantom Wallet",
    installLink: "https://phantom.app/",
    doc: "https://docs.phantom.app/integrate/web3-provider",
  },
  tomo: {
    providerName: "tomo",
    name: "Tomo Wallet",
    installLink: "https://qsg07xytt12z.sg.larksuite.com/wiki/I5ZDwtq6MiQQpWk9MRelFpjtg9b",
    doc: "https://qsg07xytt12z.sg.larksuite.com/wiki/J6F0wd2Imi5VJzk40yMlKd8JgCf",
  },
}

const unisateWallets = {
  mydoge: {
    providerName: "mydoge",
    provider: window.mydoge?.unisat
  },
  tomo: {
    providerName: "tomo",
    provider: window.tomo_wallet?.unisat
  },
  unisat: {
    providerName: "unisat",
    provider: window.unisat
  },
  okxwallet: {
    providerName: "okxwallet",
    provider: window.okxwallet?.unisat
  },
  bitkeep: {
    providerName: "bitkeep",
    provider: window.bitkeep?.unisat
  }
};

const solanaWallets = {
  mydoge: {
    providerName: "mydoge",
    provider: window.mydoge?.solana
  },
  tomo: {
    providerName: "tomo",
    provider: window.tomo_wallet?.solana
  },
  phantom: {
    providerName: "phantom",
    provider: window.phantom?.solana
  },
  okxwallet: {
    providerName: "okxwallet",
    provider: window.okxwallet?.solana
  },
  bitkeep: {
    providerName: "bitkeep",
    provider: window.bitkeep?.solana
  }
}


const tronWallets = {
  mydoge: {
    providerName: "mydoge",
    provider: window.mydoge?.tronLink
  },
  tomo: {
    providerName: "tomo",
    provider: window.tomo_wallet?.tronLink
  },
  tronLink: {
    providerName: "tronLink",
    provider: window.tronLink
  },
  okxwallet: {
    providerName: "okxwallet",
    provider: window.okxwallet?.tronLink
  },
  bitkeep: {
    providerName: "bitkeep",
    provider: window.bitkeep?.tronLink
  }
};

export const walletsConfig = {
  unisat: {
    providerNames: ['mydoge', 'tomo', 'unisat', 'okxwallet', 'bitkeep'],
    wallets: getWallets(unisateWallets)
  },
  solana: {
    providerNames: ['mydoge', 'tomo', 'phantom', 'okxwallet', 'bitkeep'],
    wallets: getWallets(solanaWallets)
  },
  tron: {
    providerNames: ['mydoge', 'tomo', 'tronLink', 'okxwallet', 'bitkeep'],
    wallets: getWallets(tronWallets)
  }
}


function getWallets(wallets) {
  return Object.keys(wallets).map((key) => {
    const wallet = wallets[key];
    return {
      ...walletInfos[wallet.providerName],
      ...wallet
    }
  })
}

export function Wallets({ type, onChanged }) {
  if (!walletsConfig[type]) {
    alert(`no ${type} config.`)
  }
  const { providerNames, wallets } = walletsConfig[type];
  const [providerName, setProviderName] = useState(providerNames[0]);

  return (<>
    {providerName}: <a href={walletInfos[providerName]?.doc} target="_blank">{walletInfos[providerName]?.doc}</a>

    <p></p>

    current wallet: <span className="text-2xl text-[red]">{providerName}</span> <br />
    switch to:
    {wallets.map((wallet) => <button key={wallet.providerName} onClick={() => {
      const { provider, installLink } = wallet;
      if (!provider) {
        window.open(installLink, '_blank');
        return;
      }
      setProviderName(wallet.providerName);
      onChanged && onChanged(wallet);
    }} className={"text-[#fff] p-1 m-2 " + (providerName === wallet.providerName ? "bg-[#000]" : "bg-[#666]")}>
      {wallet.providerName === "bitkeep" ? "bitget" : wallet.providerName}
    </button>)
    }
  </>);
}