import React, { useEffect, useState } from "react";
import { Card, Button, Input, InputOtp, Spinner } from "@nextui-org/react";
import Web3 from "web3";
import { ethers } from "ethers";

// const provider = window.ethereum;

// console.log("tomo_evm", provider);

export default function EvmDApp() {

  const provider = window.tomo_evm;
  const web3 = new Web3(provider);


  const [currentInfo, setCurrentInfo] = useState({});
  const [res, setRes] = useState("");
  const [account, setAccount] = useState("");

  //not connect
  const connect = async () => {
    let res = (await provider.request({ method: "eth_requestAccounts" })) || [];
    console.log("res", res);
    setAccount(res[0]);
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

  const addChain = async () => {
    let chainInfo = {
      chainId: "0x1b58",
      chainName: "ZetaChain",
      nativeCurrency: {
        name: "ZetaChain",
        symbol: "ZETA",
        decimals: 18,
      },
      rpcUrls: ["https://zetachain-evm.blockpi.network/v1/rpc/public"],
    };
    return await provider.request({
      method: "wallet_addEthereumChain",
      params: [chainInfo],
    });
  };

  const switchChain = async () => {
    // let chainId = web3.utils.toHex("11501");
    let chainId = "0x2ced";
    console.log(chainId);
    try {
      return await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          return await provider.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId,
                chainName: "BEVM Mainnet",
                rpcUrls: ["https://rpc-mainnet-1.bevm.io"],
              },
            ],
          });
        } catch (addError) {
          // Handle "add" error.
          return "err:" + JSON.stringify(addError);
        }
      }
      // Handle other "switch" errors.
    }
  };

  //https://docs.metamask.io/wallet/reference/json-rpc-methods/wallet_watchasset/
  const addToken = async () => {
    const customTokenInfo = {
      type: "ERC20",
      options: {
        address: account,
        symbol: "token name",
        decimals: 18,
        image: "http://...",
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
      chainId: 1,
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
    // web3.utils.toHex(web3.utils.toWei("1.234", "ether"));
    let gasLimit = 1200;
    let gasPrice = 2500000;
    let transactionParameters = {
      to: "0xa593300E785cBAADc6d4a507868bF43e6f1C1a16",
      value: "1234567890",
      data: "",
      gasLimit: web3.utils.toHex(gasLimit),
      gasPrice: web3.utils.toHex(gasPrice),
      from: account,
    };

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
  }, []);

  return (
    <div id="evm-dapp" className="rounded p-5" style={{marginRight: '100px'}}>
      <h2>
        ETH DApp Demo，{" "}
        <a
          className="text-blue-700"
          href="https://chromewebstore.google.com/detail/tomo-wallet/pfccjkejcgoppjnllalolplgogenfojk"
        >
          老插件
        </a>
      </h2>

      <div className="mb-4 mt-2 bg-gray-400 p-2 text-xs">
        provider = window.tomo_evm
      </div>

      <div style={{ display: "grid", gap: 10 }} className="mb-2">
        {[
          connect,
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
            <Button
              size="sm"
              onPress={async () => {
                setCurrentInfo({});
                try {
                  setCurrentInfo({
                    "function name": func.name,
                    "function returns": await func(),
                  });
                } catch (e) {
                  console.error(e);
                }
              }}
            >
              {func.name}
            </Button>
          </div>
        ))}
      </div>
      {Object.keys(currentInfo).map((k) => (
        <div
          key={k}
          style={{ wordWrap: "break-word" }}
          className="mt-1 bg-gray-100 p-5 text-xs"
        >
          {k}: {JSON.stringify(currentInfo[k]) || res}
        </div>
      ))}
    </div>
  );
}
