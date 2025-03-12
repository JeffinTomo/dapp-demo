import React, { useEffect, useState } from "react";
import Web3 from "web3";
import { ethers } from "ethers";
import {
  isHex,
  toHex,
  isAddressEqual,
  fromHex,
  formatEther,
  parseTransaction,
  verifyMessage,
  recoverTypedDataAddress,
} from "viem";

import {
  init,
  getBalance,
  allowance,
  approve,
  transfer,
} from "./erc20/contract";

//https://base.blockscout.com/token/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
const erc20ContractAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

export default function EvmDApp() {
  const [providerName, setProviderName] = useState("mydoge.ethereum");
  let provider = window.mydoge.ethereum;
  const web3 = new Web3(provider);

  const [currentInfo, setCurrentInfo] = useState({});
  const [res, setRes] = useState("");
  const [address, setAddress] = useState("");

  //not connect
  const connect = async () => {
    let res = (await provider.request({ method: "eth_requestAccounts" })) || [];
    // let res = (await provider.connect()) || [];
    // let res = (await provider.enable()) || [];
    console.log("res", res);
    setAddress(res[0]);
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
    if (!address) {
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
    if (!address) {
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
    if (!address) {
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
    if (!address) {
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
    if (!address) {
      alert("plase connect 1st");
      return;
    }
    const customTokenInfo = {
      type: "ERC20",
      options: {
        address: "0x3B86Ad95859b6AB773f55f8d94B4b9d443EE931f",
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

  let exampleMessage =
    "Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message. \n\nExample `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message. \n\nExample `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message. \n\nExample `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message. \n\nExample `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message. \n\nExample `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message. \n\nExample `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message. \n\nExample `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message. \n\nExample `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message. \n\nExample `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message. \n\nExample `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message. \n\nExample `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message. \n\nExample `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message. \n\nExample `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message. \n\nExample `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message. \n\nExample `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message. \n\nExample `personal_sign` message.Example `personal_sign` message.Example `personal_sign` message.Example";

  exampleMessage = exampleMessage.substring(0, 5000);
  console.log(exampleMessage.length);

  const signMessage = async () => {
    if (!address) {
      alert("plase connect 1st");
      return;
    }
    try {
      const sign = await provider.request({
        method: "personal_sign",
        params: [exampleMessage, address],
      });

      let pramas = {
        address,
        message: exampleMessage,
        signature: sign,
      };
      let isValid = await verifyMessage(pramas);
      console.log("verify SignedMessage", isValid, pramas);
      return pramas;
    } catch (err) {
      console.error(err);
      return `Error: ${err.message}`;
    }
  };

  const signTypedData = async () => {
    if (!address) {
      alert("plase connect 1st");
      return;
    }
    let chainIdHex = await provider.request({ method: "eth_chainId" });
    let chainId = fromHex(chainIdHex, "number");

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
      chainId: chainId,
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
      contents:
        "Hello, Bob! I think that it's extraordinarily important that we in computer science keep fun in computing. When it started out, it was an awful lot of fun. Of course, the paying customers got shafted every now and then, and after a while we began to take their complaints seriously. We began to feel as if we really were responsible for the successful, error-free perfect use of these machines. I don't think we are. I think we're responsible for stretching them, setting them off in new directions, and keeping fun in the house. I hope the field of computer science never loses its sense of fun.",
    };

    let signature = await provider.request({
      method: "eth_signTypedData_v4",
      params: [
        address,
        {
          types,
          primaryType: "Mail",
          domain,
          message,
        },
      ],
    });

    const addressRecovered = await recoverTypedDataAddress({
      domain,
      types,
      primaryType: "Mail",
      message,
      signature,
    });

    if (isAddressEqual(addressRecovered, address)) {
      console.log(
        "eth_signTypedData_v4 ok",
        signature,
        address,
        addressRecovered,
      );
    } else {
      console.error(
        "eth_signTypedData_v4 fail",
        signature,
        address,
        addressRecovered,
      );
    }
    return signature;
  };

  //https://docs.metamask.io/wallet/reference/json-rpc-methods/eth_decrypt/
  //https://viem.sh/docs/utilities/recoverTypedDataAddress#signature
  const decryptMessage = async (signature) => {
    if (!address) {
      alert("plase connect 1st");
      return;
    }
    await provider.request({
      method: "eth_decrypt",
      params: [signature, address],
    });
  };

  //https://viem.sh/docs/utilities/verifyMessage
  const verifySignedMessage = async (message, signature) => {
    const valid = await verifyMessage({
      address,
      message: "hello world",
      signature,
    });
    return valid;
  };

  const sendTransaction = async () => {
    if (!address) {
      alert("plase connect 1st");
      return;
    }
    let amount = 0.0001;
    let value = web3.utils.toWei(amount, "ether");
    value = web3.utils.numberToHex(value);
    let transactionParameters = {
      to: "0xef565b426ce34c617170379168b61b150c223b87",
      value,
      from: address,
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

  const otherRequests = () => {
    let hash =
      "0x47a3e1bce2cf0a10170c2dde69886c27038ea6ac7f1d742df208d4c4da7fc282";
    let methods = {
      web3_clientVersion: [],
      eth_blockNumber: [],
      eth_estimateGas: [
        {
          from: address,
          to: address,
          value: "0x1",
        },
      ],
      eth_feeHistory: ["0x5", "latest", [20, 30]],
      eth_gasPrice: [],
      eth_getBalance: [address, "latest"],
      eth_getBlockByHash: [hash, false],
      eth_getBlockByNumber: ["0x68b3", false],
      eth_getBlockTransactionCountByHash: [hash],
      eth_getBlockTransactionCountByNumber: ["0xe8"],
      eth_getCode: ["0x3B86Ad95859b6AB773f55f8d94B4b9d443EE931f", "latest"],
      eth_getStorageAt: [address, "0x0", "latest"],
      eth_getTransactionByBlockHashAndIndex: [hash, "0x2"],
      eth_getTransactionByBlockNumberAndIndex: ["0x1442e", "0x2"],
      eth_getTransactionByHash: [hash],
      eth_getTransactionCount: [address, "latest"],
      eth_getTransactionReceipt: [hash],
      eth_getUncleCountByBlockHash: [hash],
      eth_getUncleCountByBlockNumber: ["0xe8"],
      eth_sendRawTransaction: [
        "0xf869018203e882520894f17f52151ebef6c7334fad080c5704d77216b732881bc16d674ec80000801ba02da1c48b670996dcb1f447ef9ef00b33033c48a4fe938f420bec3e56bfd24071a062e0aa78a81bf0290afbc3a9d8e9a068e6d74caa66c5e0fa8a46deaae96b0833",
      ],
    };

    let index = 0;
    for (let m in methods) {
      index += 1;
      setTimeout(async () => {
        try {
          let res = await provider.request({
            method: m,
            params: methods[m] || [],
          });
          console.log("evm.request", m, methods[m], res);
        } catch (err) {
          console.error("evm.request", m, methods[m], res);
        }
      }, index * 200);
    }

    setTimeout(async () => {
      index += 1;
      let res = await provider.request({
        method: "wallet_revokePermissions",
        params: [
          {
            eth_accounts: {},
          },
        ],
      });
      console.log("evm.request wallet_revokePermissions", res);
    }, 200 * index);
  };

  useEffect(() => {
    if (!address) {
      return;
    }

    //init erc20 contract
    init(provider, erc20ContractAddress);
  }, [address]);

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
    "otherRequests",
  ];

  return (
    <div
      id="evm-dapp"
      className="rounded p-3 w-5/12 text-xs"
      style={{ marginRight: "40px" }}
    >
      <div
        id="elementId"
        style={{ height: "0px", overflow: "auto" }}
        onScroll={(e) => {
          let target = e.target;
          console.log(
            target,
            target.clientHeight,
            target.scrollHeight,
            target.scrollTop,
          );
          if (
            target.clientHeight + target.scrollTop >=
            target.scrollHeight - 100
          ) {
            // User has scrolled to the bottom
            console.log("Reached bottom!");
          }
        }}
      >
        <div style={{ height: "1000px", border: "10px solid red" }}></div>
      </div>
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
          otherRequests,
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

      <ERC20Contact address={address} />
    </div>
  );
}

function getHashData(hashDetail) {
  let data = {};
  for (var prop in hashDetail) {
    if (typeof hashDetail[prop] === "bigint") {
      data[prop] = hashDetail[prop].toString();
    }
    if (typeof hashDetail[prop] === "string") {
      data[prop] = hashDetail[prop];
    }
  }
  return data;
}

function ERC20Contact({ address }) {
  const [data, setData] = useState({});

  return (
    <>
      <div className="mt-10">
        <h2 className="mt-5 mb-2 text-lg">erc20</h2>
        <button
          size="sm"
          className="border-1 rounded-5 bg-[#dedede] p-1 mr-5"
          onClick={async () => {
            if (!address) {
              alert("plase connect 1st.");
              return;
            }
            let balance = await getBalance(address);
            let limit = await allowance(address);
            console.log("erc20 allowance/balance:", { balance, limit });
            setData({
              balance: balance.toString(),
              allowance: limit.toString(),
              title: "erc20 allowance/balance",
            });
          }}
        >
          allowance
        </button>
        <button
          size="sm"
          className="border-1 rounded-5 bg-[#dedede] p-1 mr-5"
          onClick={async () => {
            if (!address) {
              alert("plase connect 1st.");
              return;
            }
            let hashDetail = await approve({
              address,
              amount: 10 * Math.ceil(Math.random() * 9),
            });
            console.log(
              "erc20 approve:",
              hashDetail.transactionHash,
              hashDetail,
            );
            setData({
              title: "erc20 approve",
              hash: hashDetail.transactionHash,
              hashDetail: getHashData(hashDetail),
            });
          }}
        >
          approve
        </button>
        <button
          size="sm"
          className="border-1 rounded-5 bg-[#dedede] p-1 mr-5"
          onClick={async () => {
            if (!address) {
              alert("plase connect 1st.");
              return;
            }
            let hashDetail = await transfer({
              address,
              to: address,
              amount: 123,
            });
            console.log(
              "erc20 transfer:",
              hashDetail?.transactionHash,
              hashDetail,
            );
            setData({
              title: "erc20 transfer",
              hash: hashDetail?.transactionHash,
              hashDetail: getHashData(hashDetail),
            });
          }}
        >
          transfer
        </button>
      </div>

      {data.title && (
        <pre className="bg-[#f5f5f5] border-1 p-5 mt-5">
          {JSON.stringify(data, null, "\t")}
        </pre>
      )}
    </>
  );
}
