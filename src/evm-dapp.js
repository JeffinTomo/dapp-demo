import React, { useEffect, useState } from "react";
import Web3 from "web3";
import { ethers } from "ethers";
import { isHex, toHex, fromHex } from "viem";

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
    let res = await provider.disconnect();
    console.log("res", res);
    return res;
  };

  const accountsChanged = async () => {
    provider.on("accountsChanged", (res) => {
      // console.log("accountsChanged", res);
      setRes("accountsChanged:" + JSON.stringify(res));
    });
  };

  const getChain = () => provider.request({ method: "eth_chainId" });
  const onChainChanged = () => {
    provider.on("chainChanged", (chainId) => {
      console.log("chain changed id:", chainId);
      setRes("chainChanged:" + JSON.stringify({ chainId }));
    });

    return null;
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
    blockExplorerUrls: [],
  };

  const addChain = async () => {
    let res = await provider.request({
      method: "wallet_addEthereumChain",
      params: [chainInfo2],
    });
    console.log("addChain", res);
    return res;
  };

  const switchChain = async () => {
    let currentChainId = await getChain();
    // let currentChainId = provider.chainId;
    let chainId = "0x1";
    if (currentChainId === chainId) {
      chainId = "0xaa36a7";
    }
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
  const addToken = async () => {
    const customTokenInfo = {
      type: "ERC20",
      options: {
        address: "0x54D2252757e1672EEaD234D27B1270728fF90581",
        symbol: "symbol",
        name: "name",
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
    try {
      const from = account;
      // For historical reasons, you must submit the message to sign in hex-encoded UTF-8.
      // This uses a Node.js-style buffer shim in the browser.
      // const msg = `0x${Buffer.from(exampleMessage, "utf8").toString("hex")}`;
      const sign = await provider.request({
        method: "personal_sign",
        params: [exampleMessage, from],
      });
      return sign;
    } catch (err) {
      console.error(err);
      return `Error: ${err.message}`;
    }
  };

  const signTypedData = async () => {
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

  const verifyMessage = async (message, signature) => {
    // const recoveredAddress = ethers.verifyMessage(message, signature);
    // return recoveredAddress === signerAddress;
    // return recoveredAddress;
  };

  const sendTransaction = async () => {
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

  useEffect(() => {
    (async () => {
      // await connect();
      //

      let sign =
        "0xb0f0104788a16743f2f6a5f2b57109dc59f973cee322a3d063f49462822477ec5d604e419e8a7d3acb57ec74f743e0330deb636e176c2f7eeceac29ff35d09ee1c";
      let address = await verifyMessage(exampleMessage, sign);
      // console.log("verifyMessage result:", address);
    })();

    console.log(fromHex("0x1b58", "number"));
    console.log(toHex("7000"));
    console.log(toHex(7000));
  }, []);

  const funcList = [
    "connect",
    "disconnect",
    "accountsChanged",
    "onChainChanged",
    "getChain",
    "addChain",
    "switchChain",
    "addToken",
    "signMessage",
    "signTypedData",
    "sendTransaction",
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
            provider = window.okxwallet.ethereum;
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
          getChain,
          addChain,
          switchChain,
          addToken,
          signMessage,
          signTypedData,
          sendTransaction,
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
