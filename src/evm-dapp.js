import React, { useEffect, useMemo, useState } from "react";
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

import { Wallets } from "./wallets";

import { get } from 'lodash-es'

//https://base.blockscout.com/token/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
// const erc20ContractAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const erc20ContractAddress = "0xAC1Bd2486aAf3B5C0fc3Fd868558b082a531B2B4";

//risk token
// const erc20ContractAddress = "0xcdE172dc5ffC46D228838446c57C1227e0B82049";

export default function EvmDApp() {
  const [providerName, setProviderName] = useState("mydoge");
  const [provider, setProvider] = useState(window?.mydoge?.ethereum);

  const web3 = useMemo(() => new Web3(provider), [provider]);

  const [res, setRes] = useState({});
  const [address, setAddress] = useState("");

  //not connect
  const connect = async () => {
    let res = (await provider.request({ method: "eth_requestAccounts" })) || [];
    // let res = (await provider.connect()) || [];
    // let res = (await provider.enable()) || [];
    // console.log("res", res);
    setAddress(res[0]);
    setRes({
      method: "connect/eth_requestAccounts",
      res
    });
  };

  const disconnect = async () => {
    try {
      // Request to revoke permissions
      const res = await provider.disconnect();
      // const res = await ethereum.request({
      //   method: "wallet_revokePermissions",
      //   params: [
      //     {
      //       eth_accounts: {}, // Revoke access to accounts
      //     },
      //   ],
      // });
      setRes({
        method: "disconnect",
        res
      });
    } catch (error) {
      console.error("Error revoking permissions:", error);
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
    setRes({
      method: "accountsChanged",
      res: "waiting for switch"
    });
    provider.on("accountsChanged", (res) => {
      console.log("dapp accountsChanged", res);
      setRes({
        method: "accountsChanged",
        res
      });
    });
  };

  const getChainId = async () => {
    const res = await provider.request({ method: "eth_chainId" });
    setRes({
      method: "getChainId/eth_chainId",
      res
    });
    return res;
  }
  const onChainChanged = async () => {
    if (!address) {
      alert("plase connect 1st");
      return;
    }
    setRes({
      method: "onChainChanged",
      res: "waiting for switch"
    });
    provider.on("chainChanged", (chainId) => {
      console.log("dapp chain changed id:", chainId);
      setRes({
        method: "chainChanged",
        res: chainId
      });
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
    const res = await provider.request({
      method: "wallet_addEthereumChain",
      params: [chainInfo2],
    });
    console.log("addChain", res);
    setRes({
      method: "wallet_addEthereumChain",
      res,
    });
  };

  const switchChain = async () => {
    if (!address) {
      alert("plase connect 1st");
      return;
    }
    const currentChainId = await getChainId();
    // let currentChainId = provider.chainId;
    let chainId = "0x1";
    if (currentChainId === chainId) {
      chainId = "0x2105";
      chainId = toHex(221122420); //dogeos devnet
    }
    // chainId = "0x1b58"; for bitget
    // try {
    let res = await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId }],
    });
    console.log("wallet_switchEthereumChain", res);

    setRes({
      method: "wallet_switchEthereumChain",
      res,
    });
    // } catch (switchError) {
    //   console.log(switchError);
    // }
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
        address: "0xB6fe221Fe9EeF5aBa221c348bA20A1Bf5e73624c",
        symbol: "USDS",
        name: "USDS",
        decimals: 18,
        image: "",
      },
    };

    const res = await provider.request({
      method: "wallet_watchAsset",
      params: customTokenInfo,
    });
    setRes({
      method: "wallet_watchAsset",
      res,
    });
  };

  let exampleMessage = "Example message.Example";

  const [signature, setSignature] = useState();
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
      setSignature(sign);

      setRes({
        method: "personal_sign",
        message: exampleMessage,
        res: sign,
      });

      let pramas = {
        address,
        message: exampleMessage,
        signature: sign,
      };
      // let isValid = await verifyMessage(pramas);
      // console.log("verify SignedMessage", isValid, pramas);
      return pramas;
    } catch (err) {
      console.error(err);
      setRes({
        method: "personal_sign",
        err,
      });
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

    const params = [
      address,
      {
        types,
        primaryType: "Mail",
        domain,
        message,
      },
    ];
    let signature = await provider.request({
      method: "eth_signTypedData_v4",
      params,
    });

    setRes({
      method: "eth_signTypedData_v4",
      message: params,
      res: signature,
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
  const [encryptedMessage, setEncryptedMessage] = useState('');
  const message3 = "mydoge support eth_encrypt/eth_decrypt";
  const encryptMessage = async () => {
    if (!address) {
      alert("plase connect 1st");
      return;
    }
    let encryptedMessage = await provider.request({
      method: "eth_encrypt",
      params: [message3, address],
    });

    setRes({
      method: "eth_encrypt",
      message: message3,
      res: encryptedMessage,
    });

    setEncryptedMessage(encryptedMessage);
    console.log('encryptedMessage', encryptedMessage);
    return JSON.stringify(encryptedMessage);
  };

  const decryptMessage = async () => {
    if (!address) {
      alert("plase connect 1st");
      return;
    }
    if (!encryptedMessage) {
      alert("plase encryptMessage 1st");
      return;
    }
    let res = await provider.request({
      method: "eth_decrypt",
      params: [encryptedMessage, address],
    });

    setRes({
      method: "eth_decrypt",
      message: encryptedMessage,
      res,
    });
    console.log('decryptMessage', res === message3, encryptedMessage, address, res);
    return res;
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
      to: address,
      value,
      from: address,
      data: web3.utils.toHex("tx data test"),
    };

    console.log("sendTransaction", value, transactionParameters);

    let txHash = await provider.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });
    console.log("sendTransaction back:", txHash);

    setRes({
      method: "eth_sendTransaction",
      tx: transactionParameters,
      res: txHash,
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

  const otherRequests = async () => {
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
          console.log("evm.request", {
            method: m,
            params: methods[m],
            res
          });
          setRes({
            method: m,
            params: methods[m],
            res
          })
        } catch (err) {
          console.error("evm.request", m, methods[m], res);
          setRes({
            method: m,
            error: err,
          })
        }
      }, index * 500);
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
    "encryptMessage",
    "decryptMessage",
    "signTypedData",
    "sendTransaction",
    "otherRequests",
  ];

  return (
    <div
      id="evm-dapp"
      className="rounded p-3 text-xs"
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
        ETH DApp Demo
      </h2>

      <div className="mt-2 bg-[#f5f5f5] p-2">
        {address && <p>connected: <span className="text-xl text-[red]">{address}</span></p>}

        <p></p>
        <Wallets type="evm" onChanged={({ provider, providerName }) => {
          setProviderName(providerName);
          setProvider(provider);
          setAddress('');
        }} />
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
          encryptMessage,
          decryptMessage,
          signTypedData,
          sendTransaction,
          otherRequests,
        ].map((func, index) => (
          <div key={index}>
            <button
              size="sm"
              className={"border-1 rounded-5 bg-[#000] text-[#fff] p-1" + (funcList[index] !== "connect" && address === "" ? " opacity-40" : "")}
              onClick={async () => {
                setRes({})
                try {
                  await func();
                } catch (e) {
                  console.error(funcList[index], e);
                  setRes({
                    method: funcList[index],
                    error: e,
                  })
                }
              }}
            >
              {funcList[index]}
            </button>
          </div>
        ))}
      </div>

      <div className={"bg-[#f5f5f5] border-1 p-5" + ((res.err || res.error) ? ' border-[red]' : '')}>
        <pre style={{ wordWrap: "break-word" }}>
          {JSON.stringify(res, null, "\t")}
        </pre>
      </div>

      {address && <ERC20Contact address={address} provider={provider} providerName={providerName} />}
      <div className="h-[200px]"></div>
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

function ERC20Contact({ address, providerName, provider }) {
  const [data, setData] = useState({});

  useEffect(() => {
    (async () => {
      const chainId = await provider.request({ method: "eth_chainId" });
      if (chainId !== "0x2105") {
        return;
      }

      //init erc20 contract
      const contractToken = init(provider, erc20ContractAddress);

      const decimals = await contractToken.methods.decimals().call();
      const name = await contractToken.methods.name().call();
      const symbol = await contractToken.methods.symbol().call();
      // console.log('contract instance', contractToken, { decimals: Number(decimals), name, symbol });
      setData({
        title: 'contract info',
        contractAddress: erc20ContractAddress,
        decimals: Number(decimals),
        name,
        symbol,
      });
    })();
  }, [address, provider, providerName]);

  return (
    <>
      <div className="mt-10">
        <h2 className="mt-5 mb-2 text-lg">erc20: {erc20ContractAddress}</h2>
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
            setData({
              contractAddress: erc20ContractAddress,
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
            approve({
              address,
              amount: 10 * Math.ceil(Math.random() * 9),
            }).then((hashDetail) => {
              console.log(
                "erc20 approve:",
                hashDetail.transactionHash,
                hashDetail,
              );
              setData({
                title: "erc20 approve",
                contractAddress: erc20ContractAddress,
                hash: hashDetail.transactionHash,
                hashDetail: getHashData(hashDetail),
              });
            }).catch((err) => {
              setData({
                title: "erc20 approve",
                err
              });
              console.error(err);
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
            await transfer({
              address,
              to: address,
              amount: 1,
            }).then((hashDetail) => {
              console.log(
                "erc20 transfer:",
                hashDetail?.transactionHash,
                hashDetail,
              );
              setData({
                title: "erc20 transfer",
                contractAddress: erc20ContractAddress,
                hash: hashDetail?.transactionHash,
                hashDetail: getHashData(hashDetail),
              });
            }).catch((err) => {
              setData({
                title: "erc20 transfer",
                err,
              });
              console.error(err);
            });
          }}
        >
          transfer
        </button>
      </div>

      {data.title && (
        <pre className={"bg-[#f5f5f5] border-1 p-5 mt-5" + (data.err ? ' text-red-500' : '')}>
          {JSON.stringify(data, null, "\t")}
        </pre>
      )}
    </>
  );
}
