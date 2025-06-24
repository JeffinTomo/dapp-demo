import React, { useState, useEffect } from "react";

const walletInfos = {
  mydoge: {
    providerName: "mydoge",
    name: "MyDoge Wallet",
    installLink: "https://qsg07xytt12z.sg.larksuite.com/wiki/I5ZDwtq6MiQQpWk9MRelFpjtg9b",
  },
  unisat: {
    providerName: "unisat",
    name: "Unisat Wallet",
    installLink: "https://chromewebstore.google.com/detail/unisat-wallet/ppbibelpcjmhbdihakflkdcoccbgbkpo",
  },
  metamask: {
    providerName: "metamask",
    name: "Metamask Wallet",
    installLink: "https://metamask.io/",
  },
  okxwallet: {
    providerName: "okxwallet",
    name: "OKX Wallet",
    installLink: "https://chrome.google.com/webstore/detail/okx-wallet/mcohilncbfahbmgdjkbpemcciiolgcge",
  },
  bitkeep: {
    providerName: "bitkeep",
    name: "Bitget Wallet",
    installLink: "https://web3.bitget.com/zh-CN/wallet-download",
  },
  phantom: {
    providerName: "phantom",
    name: "Phantom Wallet",
    installLink: "https://phantom.app/",
  },
  tomo: {
    providerName: "tomo",
    name: "Tomo Wallet",
    installLink: "https://chromewebstore.google.com/detail/tomo-wallet/pfccjkejcgoppjnllalolplgogenfojk",
  },
}

const evmWallets = {
  mydoge: {
    providerName: "mydoge",
    provider: window.mydoge?.ethereum,
    doc: "https://qsg07xytt12z.sg.larksuite.com/wiki/XLq9wrNRLiAXANkCj4QlERCxg7f",
  },
  tomo: {
    providerName: "tomo",
    provider: window.tomo_wallet?.ethereum,
    doc: "https://qsg07xytt12z.sg.larksuite.com/wiki/XLq9wrNRLiAXANkCj4QlERCxg7f",
  },
  okxwallet: {
    providerName: "okxwallet",
    provider: window.okxwallet?.ethereum,
    doc: "https://web3.okx.com/zh-hans/build/dev-docs/sdks/chains/evm/provider",
  },
  bitkeep: {
    providerName: "bitkeep",
    provider: window.bitkeep?.ethereum,
    doc: "https://web3.bitget.com/en/docs/provider-api/evm.html",
  }
};

const unisatWallets = {
  mydoge: {
    providerName: "mydoge",
    provider: window.mydoge?.unisat,
    doc: "https://qsg07xytt12z.sg.larksuite.com/wiki/ECaVwtEt6i2iuukiiZFlu3Dxg0pp",
  },
  tomo: {
    providerName: "tomo",
    provider: window.tomo_wallet?.unisat,
    doc: "https://qsg07xytt12z.sg.larksuite.com/wiki/ECaVwtEt6i2iuukiiZFlu3Dxg0p",
  },
  unisat: {
    providerName: "unisat",
    provider: window.unisat,
    doc: "https://docs.unisat.io/dev/open-api-documentation/unisat-wallet",
  },
  okxwallet: {
    providerName: "okxwallet",
    provider: window.okxwallet?.unisat,
    doc: "https://web3.okx.com/zh-hans/build/dev-docs/sdks/chains/bitcoin/provider",
  },
  bitkeep: {
    providerName: "bitkeep",
    provider: window.bitkeep?.unisat,
    doc: "https://web3.bitget.com/en/docs/provider-api/btc.html",
  }
};

const solanaWallets = {
  mydoge: {
    providerName: "mydoge",
    provider: window.mydoge?.solana,
    doc: "https://qsg07xytt12z.sg.larksuite.com/wiki/LyVnwBkzaibRDEkUfXclabRmg6g",
  },
  tomo: {
    providerName: "tomo",
    provider: window.tomo_wallet?.solana,
    doc: "https://qsg07xytt12z.sg.larksuite.com/wiki/LyVnwBkzaibRDEkUfXclabRmg6g",
  },
  phantom: {
    providerName: "phantom",
    provider: window.phantom?.solana,
    doc: "https://docs.phantom.com/solana/detecting-the-provider",
  },
  okxwallet: {
    providerName: "okxwallet",
    provider: window.okxwallet?.solana,
    doc: "https://web3.okx.com/zh-hans/build/dev-docs/sdks/chains/solana/provider",
  },
  bitkeep: {
    providerName: "bitkeep",
    provider: window.bitkeep?.solana,
    doc: "https://web3.bitget.com/en/docs/provider-api/solana.html",
  }
}


const tronWallets = {
  mydoge: {
    providerName: "mydoge",
    provider: window.mydoge?.tronLink,
    doc: "https://qsg07xytt12z.sg.larksuite.com/wiki/J6F0wd2Imi5VJzk40yMlKd8JgCf",
  },
  tomo: {
    providerName: "tomo",
    provider: window.tomo_wallet?.tronLink,
    doc: "https://qsg07xytt12z.sg.larksuite.com/wiki/J6F0wd2Imi5VJzk40yMlKd8JgCf",
  },
  tronLink: {
    providerName: "tronLink",
    provider: window.tronLink,
    doc: "https://docs.tronlink.org/dapp/start-developing",
  },
  okxwallet: {
    providerName: "okxwallet",
    provider: window.okxwallet?.tronLink,
    doc: "https://web3.okx.com/zh-hans/build/dev-docs/sdks/chains/tron/provider",
  },
  bitkeep: {
    providerName: "bitkeep",
    provider: window.bitkeep?.tronLink,
    doc: "https://web3.bitget.com/en/docs/provider-api/tron.html",
  }
};

export const walletsConfig = {
  evm: {
    providerNames: ['mydoge', 'tomo', 'metamask', 'okxwallet', 'bitkeep'],
    wallets: getWallets(evmWallets)
  },
  unisat: {
    providerNames: ['mydoge', 'tomo', 'unisat', 'okxwallet', 'bitkeep'],
    wallets: getWallets(unisatWallets)
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
  const { providerNames = [], wallets = [] } = walletsConfig[type] || {};
  const [providerName, setProviderName] = useState(providerNames[0]);

  return (<>
    {providerName} doc: <a href={walletInfos[providerName]?.doc} target="_blank">{walletInfos[providerName]?.doc}</a>

    <p></p>

    current wallet: <span className="text-2xl text-[red]">{providerName}</span> <br />
    switch to:
    {wallets.map((wallet) => <button key={wallet.providerName} onClick={() => {
      console.log('wallet click', wallet.provider, wallet);
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