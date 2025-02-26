import React, { useEffect, useState } from "react";
import Web3 from "web3";
import { ethers } from "ethers";
import { isHex, toHex, fromHex, parseTransaction, verifyMessage } from "viem";

// const provider = window.ethereum;

// console.log("tomo_evm", provider);

export default function EvmDApp() {
  const [providerName, setProviderName] = useState("mydoge.ethereum");
  let provider = window.mydoge.ethereum;
  const web3 = new Web3(provider);

  const [currentInfo, setCurrentInfo] = useState({});
  const [res, setRes] = useState("");
  const [account, setAccount] = useState("");

  //not connect
  const connect = async () => {
    // let res = (await provider.request({ method: "eth_requestAccounts" })) || [];
    // let res = (await provider.connect()) || [];
    let res = (await provider.enable()) || [];
    console.log("res", res);
    setAccount(res[0]);
    return res;
  };

  const disconnect = async () => {
    if (!provider.disconnect) {
      try {
        // Request to revoke permissions
        let result = await ethereum.request({
          method: "wallet_revokePermissions",
          params: [
            {
              eth_accounts: {}, // Revoke access to accounts
            },
          ],
        });

        console.log("Permissions revoked:", result);
        return result;
      } catch (error) {
        console.error("Error revoking permissions:", error);
      }
      return;
    }
    let res = await provider.disconnect();
    console.log("res", res);
    return res;
  };

  const accountsChanged = async () => {
    if (!account) {
      alert("plase connect 1st");
      return;
    }
    provider.on("accountsChanged", (res) => {
      console.log("dapp accountsChanged", res);
      setRes("accountsChanged:" + JSON.stringify(res));
    });
  };

  const getChainId = () => provider.request({ method: "eth_chainId" });
  const onChainChanged = async () => {
    if (!account) {
      alert("plase connect 1st");
      return;
    }
    provider.on("chainChanged", (chainId) => {
      console.log("dapp chain changed id:", chainId);
      setRes("chainChanged:" + JSON.stringify({ chainId }));
    });
  };

  let chainInfo = {
    chainId: "0x1b58",
    chainName: "ZetaChain",
    nativeCurrency: {
      name: "ZetaChain",
      symbol: "ZETA",
      decimals: 18,
    },
    rpcUrls: [
      "https://zeta-chain.drpc.org",
      "https://zetachain-evm.blockpi.network/v1/rpc/public",
    ],
    blockExplorerUrls: ["https://explorer.zetachain.com/"],
  };

  const rpcUrls = [
    "https://eth-sepolia.api.onfinality.io/public",
    "https://eth-sepolia-public.unifra.io",
    "https://sepolia.drpc.org",
    "https://ethereum-sepolia-rpc.publicnode.com",
    "https://rpc-sepolia.rockx.com",
    "https://rpc.sepolia.ethpandaops.io",
    "https://api.zan.top/eth-sepolia",
  ];
  let chainInfo2 = {
    chainId: "0xaa36a7",
    chainName: "Sepolia",
    nativeCurrency: {
      name: "Sepolia Testnet",
      symbol: "SepoliaETH",
      decimals: 18,
    },
    rpcUrls: [rpcUrls[Math.floor(Math.random() * rpcUrls.length)]],
  };

  const addChain = async () => {
    if (!account) {
      alert("plase connect 1st");
      return;
    }
    let res = await provider.request({
      method: "wallet_addEthereumChain",
      params: [chainInfo2],
    });
    console.log("addChain", res);
    return res;
  };

  const switchChain = async () => {
    if (!account) {
      alert("plase connect 1st");
      return;
    }
    let currentChainId = await getChainId();
    // let currentChainId = provider.chainId;
    let chainId = "0x1";
    if (currentChainId === chainId) {
      chainId = "0x2105";
    }
    // chainId = "0x1b58"; for bitget
    try {
      let res = await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId }],
      });
      console.log("switchChain", chainId, res);
      return res;
    } catch (switchError) {
      console.log(switchError);
    }
  };

  //https://docs.metamask.io/wallet/reference/json-rpc-methods/wallet_watchasset/
  //https://base-sepolia.blockscout.com/address/0x87C51CD469A0E1E2aF0e0e597fD88D9Ae4BaA967
  const addToken = async () => {
    if (!account) {
      alert("plase connect 1st");
      return;
    }
    const customTokenInfo = {
      type: "ERC20",
      options: {
        address: "0x820C137fa70C8691f0e44Dc420a5e53c168921Dc",
        symbol: "USDS",
        name: "USDS",
        decimals: 18,
        image: "",
      },
    };

    return await provider.request({
      method: "wallet_watchAsset",
      params: customTokenInfo,
    });
  };

  const exampleMessage = "Example `personal_sign` message.";
  const signMessage = async () => {
    if (!account) {
      alert("plase connect 1st");
      return;
    }
    try {
      const sign = await provider.request({
        method: "personal_sign",
        params: [exampleMessage, account],
      });
      return sign;
    } catch (err) {
      console.error(err);
      return `Error: ${err.message}`;
    }
  };

  const signTypedData = async () => {
    if (!account) {
      alert("plase connect 1st");
      return;
    }
    let types = {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
      ],
      Person: [
        { name: "name", type: "string" },
        { name: "wallet", type: "address" },
      ],
      Mail: [
        { name: "from", type: "Person" },
        { name: "to", type: "Person" },
        { name: "contents", type: "string" },
      ],
    };

    let domain = {
      name: "Ether Mail",
      version: "1",
      chainId: 7000,
      verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
    };

    //mail
    let message = {
      from: {
        name: "Cow",
        wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
      },
      to: {
        name: "Bob",
        wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
      },
      contents: "Hello, Bob!",
    };

    return await provider.request({
      method: "eth_signTypedData_v4",
      params: [
        account,
        {
          types,
          primaryType: "Mail",
          domain,
          message,
        },
      ],
    });
  };

  //https://docs.metamask.io/wallet/reference/json-rpc-methods/eth_decrypt/
  //https://viem.sh/docs/utilities/recoverTypedDataAddress#signature
  const decryptMessage = async (signature) => {
    if (!account) {
      alert("plase connect 1st");
      return;
    }
    await provider.request({
      method: "eth_decrypt",
      params: [signature, account],
    });
  };

  //https://viem.sh/docs/utilities/verifyMessage
  const verifySignedMessage = async (message, signature) => {
    const valid = await verifyMessage({
      address: account,
      message: "hello world",
      signature,
    });
    return valid;
  };

  const sendTransaction = async () => {
    if (!account) {
      alert("plase connect 1st");
      return;
    }
    let amount = 0.0001;
    let value = web3.utils.toWei(amount, "ether");
    value = web3.utils.numberToHex(value);
    let transactionParameters = {
      to: "0xa593300E785cBAADc6d4a507868bF43e6f1C1a16",
      value,
      from: account,
      data: web3.utils.toHex("tx data test"),
    };

    console.log("sendTransaction", value, transactionParameters);

    let txHash = await provider.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });

    return {
      send: sendTransaction,
      type: "eth_sendTransaction",
      result: txHash,
    };

    // .then((txHash) =>
    //   return {
    //     send: sendTransaction,
    //     type: 'eth_sendTransaction',
    //     result: txHash
    //   };
    // )
    // .catch((error) =>
    //   return error;
    // );
  };

  const txCount = async () => {
    return await provider.request({
      method: "eth_getTransactionCount",
      params: ["0xc94770007dda54cF92009BFF0dE90c06F603a09f", "latest"],
    });
  };

  useEffect(() => {
    (async () => {})();
  }, []);

  const funcList = [
    "connect",
    "disconnect",
    "accountsChanged",
    "onChainChanged",
    "getChainId",
    "addChain",
    "switchChain",
    "addToken",
    "signMessage",
    "signTypedData",
    "sendTransaction",
    "txCount",
  ];

  return (
    <div
      id="evm-dapp"
      className="rounded p-3 w-5/12 text-xs"
      style={{ marginRight: "40px" }}
    >
      <h2 className="text-lg">
        ETH DApp Demo，{" "}
        <a
          className="text-blue-700"
          href="https://chromewebstore.google.com/detail/tomo-wallet/pfccjkejcgoppjnllalolplgogenfojk"
        >
          tomo wallet 插件
        </a>
      </h2>
      <div className="mb-2 bg-gray-400 p-4 text-xs">
        provider = window.{providerName};
      </div>

      <div className="bg-[#dedede] p-1 mb-1">
        <button
          className="bg-[#000] text-[#fff] p-1 m-5"
          onClick={async () => {
            setProviderName("mydoge.ethereum");
            provider = window.mydoge.ethereum;
          }}
        >
          use mydoge wallet
        </button>
        <button
          className="bg-[#000] text-[#fff] p-1 mr-5"
          onClick={async () => {
            setProviderName("ethereum");
            provider = window.ethereum;
          }}
        >
          use metamask
        </button>
        <button
          className="bg-[#000] text-[#fff] p-1 mr-5"
          onClick={async () => {
            setProviderName("bitkeep.ethereum");
            provider = window.bitkeep.ethereum;
          }}
        >
          use bitget wallet
        </button>
        <button
          className="bg-[#000] text-[#fff] p-1 mr-5"
          onClick={async () => {
            setProviderName("okxwallet.ethereum");
            provider = window.okxwallet;
          }}
        >
          use okxwallet
        </button>
      </div>

      <div style={{ gap: 10 }} className="m-5 flex flex-wrap">
        {[
          connect,
          disconnect,
          accountsChanged,
          onChainChanged,
          getChainId,
          addChain,
          switchChain,
          addToken,
          signMessage,
          signTypedData,
          sendTransaction,
          txCount,
        ].map((func, index) => (
          <div key={index}>
            <button
              size="sm"
              className="border-1 rounded-5 bg-[#dedede] p-1"
              onClick={() => {
                setCurrentInfo({});
                try {
                  func().then((res) => {
                    setCurrentInfo({
                      "function name": func.name,
                      "function returns": res,
                    });
                  });
                } catch (e) {
                  console.error(e);
                }
              }}
            >
              {funcList[index]}
            </button>
          </div>
        ))}
      </div>
      <div className="bg-[#f5f5f5] border-1 p-5">
        {Object.keys(currentInfo).map((k) => (
          <div key={k} style={{ wordWrap: "break-word" }}>
            {k}: {JSON.stringify(currentInfo[k]) || res}
          </div>
        ))}
      </div>
    </div>
  );
}
