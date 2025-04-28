import React, { useState, useEffect } from "react";
import bs58 from "bs58";
import BN from "bn.js";

import { verify } from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import { hmac } from '@noble/hashes/hmac';
import * as ed from '@noble/ed25519';

import {
  PublicKey,
  AddressLookupTableProgram,
  TransactionMessage,
  VersionedTransaction,
  Transaction,
  SystemProgram,
  Connection,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
  sendAndConfirmRawTransaction
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createTransferInstruction, getAssociatedTokenAddress } from "@solana/spl-token";

ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

export const txToHex = (tx) => {
  if (tx instanceof VersionedTransaction) {
    return Buffer.from(tx.serialize()).toString("hex");
  }

  if (tx instanceof Transaction) {
    return Buffer.from(
      tx.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      }),
    ).toString("hex");
  }
  return "";
};
//goon
const tokenAddress = "2w2MAmvLgYxpMFRy4QjByUN47bsgH3dNXU9rgFuhyssd";

export default function SolanaDApp() {
  const [address, setAddress] = useState("");
  const [fromPubkey, setFromPubkey] = useState(null);
  const [signature, setSignature] = useState("");
  const [rawTransaction, setRawTransaction] = useState("");

  const network = "mainnet-beta";
  const rpcUrl = "https://rpc.ankr.com/solana/c2d7e8a3db5dce62e202db3d28cca25e74da5028abbf20764e2961918ba34dfc";
  const connection = new Connection(rpcUrl);

  const [providerName, setProviderName] = useState('mydoge');
  const [provider, setProvider] = useState(window[providerName]?.solana);

  const [res, setRes] = useState({});

  useEffect(() => {
    setRes({});
    // Store user's public key once they connect
    provider.on("connect", (res) => {
      console.log('dapp.on.connect', res);
    });

    // Forget user's public key once they disconnect
    provider.on("disconnect", (res) => {
      console.log('dapp.on.disconnect', res);
    });
  }, [provider]);
  
  const connect = async () => {
    if (!provider) { 
      alert('provider err');
      return;
    }
    setRes({});
    //{ onlyIfTrusted: true }
    try {
      const res = await provider.connect() || {};
      console.log('provider.connect', res);

      const { address, publicKey } = res;
      const address1 = publicKey ? publicKey.toString() : address.toString();
      setFromPubkey(publicKey || new PublicKey(address));
      // console.log('connect publicKey', publicKey, publicKey.toString());
      
      setRes({
        method: 'connect',
        res
      });
      
      //todo: publicKey 的格式
      setAddress(address1);
    } catch (err) {
      console.error("connected error", err);
    }
  };
  
  const connectOnlyIfTrusted = async () => {
    if (!provider) { 
      alert('provider err');
      return;
    }
    setRes({});
    //{ onlyIfTrusted: true }
    try {
      const params = { onlyIfTrusted: true };
      const res = await provider.connect(params) || {};
      setRes({
        method: 'connect',
        params,
        res
      });      
    } catch (err) {
      console.error("connected error", err);
    }
  };

  const connect2 = async () => {
    if (!provider) { 
      alert('provider err');
      return;
    }
    setRes({});
    try {
      let res = await provider.request({
        method: 'connect',
      });
      setRes({
        method: 'request.connect',
        res
      });
    } catch (err) {
      console.error("connected error", err);
    }
  };

  const disconnect = async () => {
    if (!provider) { 
      alert('provider err');
      return;
    }
    setRes({});
    try {
      // const res = await provider.request({ method: "disconnect" });
      const res = await provider.disconnect();
      setAddress('');
      setRes({
        method: 'disconnect',
        res
      });
    } catch (err) {
      console.error("disconnect error", err);
    }
  }

  const getAccount = async () => {
    // if (!address) { 
    //   alert('please connect 1st');
    //   return;
    // };
    setRes({});
    try {
      const res = await provider.request({
        method: 'getAccount',
      });
      setRes({
        method: 'getAccount',
        res
      });
      console.log('getAccount', res);
    } catch (err) {
      console.error("getAccount error", err);
    }
  };

  const accountChanged = async () => { 
    console.log('accountChanged reg ok');
    provider.on("accountChanged", (publicKey) => {
      if (publicKey) {
        console.log(`dapp.on.accountChanged: ${publicKey.toBase58()}`, Math.random());
      } else { 
        console.log('social wallet, no publicKey');
      }
      setRes({
        method: 'on.accountChanged',
        res: {publicKey}
      });
    });
  }

  const verifySignature = async(result) =>{
    try {
      const { signature, publicKey, message } = result;
      
      console.log('验证签名 params：1', { signature, publicKey, message });

      // 验证签名
      /*
      function verify(
        signature: Hex, // returned by the `sign` function
        message: Hex, // message that needs to be verified
        publicKey: Hex // public (not private) key,
        options = { zip215: true } // ZIP215 or RFC8032 verification type
      ): boolean;
      */
      return await verify(signature, message, publicKey);
    } catch (error) {
      console.error('验证签名 res：', error);
      return false;
    }
  }

  const uint8ArrayToHex = (bytes, withPrefix = false) => {
    const hex = Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
      
    return withPrefix ? `0x${hex}` : hex;
  }

  const signMessage = async () => {
    if (!address) { 
      alert('please connect 1st');
      return;
    };
    setRes({});
    try {
      // uint8Array
      const message = `To avoid digital dognappers, sign below to authenticate with CryptoCorgis`;
      const encodedMessage = new TextEncoder().encode(message);

      const res = await provider.signMessage(encodedMessage, "utf8");
      console.log('signMessage req:', { message, encodedMessage });
      console.log('signMessage res:', res);

      const params = {
        message: encodedMessage,
        signature: res.signature,
        publicKey: res.publicKey ? res.publicKey.toBytes() : new PublicKey(address).toBytes(),
        address: res.publicKey ? res.publicKey.toBytes() : new PublicKey(address).toBytes()
      };
      console.log('signMessage check 1:', uint8ArrayToHex(res.signature), uint8ArrayToHex(encodedMessage));
      console.log('signMessage check params:', params);

      const checkResult = await verifySignature(params);
      console.log('signMessage check result:', checkResult);
      if (!checkResult) { 
        console.error('signMessage check error', encodedMessage, res)
      }


      if (res?.signature) { 
        setSignature(signature);
      }
      setRes({
        method: 'signMessage',
        checkResult,
        res
      });
    } catch (err) {
      console.error('signMessage', err);
    }
  };

  const signMessage2 = async () => {
    if (!address) { 
      alert('please connect 1st');
      return;
    };
    setRes({});
    try {
      // uint8Array
      const message = `To avoid digital dognappers, sign below to authenticate with CryptoCorgis`;
      const encodedMessage = new TextEncoder().encode(message);
      
      const res = await provider.request({
        method: 'signMessage',
        params: {
          message: encodedMessage,
          display: "hex",
        }
      });

      console.log('request.signMessage:', encodedMessage, res);
      
      const params = {
        message: encodedMessage,
        signature: res.signature,
        publicKey: res.publicKey ? res.publicKey.toBytes() : ""
      };
      console.log('request.signMessage check params:', params);

      const checkResult = await verifySignature(params);
      console.log('request.signMessage check result:', checkResult);
      if (!checkResult) { 
        console.error('signMessage error', encodedMessage, res)
      }

      setRes({
        method: 'request.signMessage',
        checkResult,
        res
      });
    } catch (e) {
      console.error(e);
    }
  };

  const signIn = async () => {
    if (!address) { 
      alert('please connect 1st');
      return;
    };
    setRes({});
    try {
      const params = {
        domain: window.location.host,
        statement: "Clicking Sign or Approve only means you have proved this wallet is owned by you. This request will not trigger any blockchain transaction or cost any gas fee.",
        version: "1",
        nonce: "oBbLoEldZs",
        issuedAt: new Date().toISOString(),
        resources: ["https://example.com", "https://phantom.app/"],
      };
      const res = await provider.signIn(params);

      // console.log('signIn', params, res);
      // const checkResult = await verifySignature({
      //   message: res.signedMessage,
      //   signature: res.signature,
      //   publicKey: res.publicKey
      // });
      // console.log('signIn check result:', checkResult);
      
      setRes({
        method: 'signIn',
        params,
        res
      });
    } catch (e) {
      console.error(e);
    }
  };

  const signAndSendTransaction = async () => { 
    setRes({});
    const tx = await createLegacyTx();
    const res = await provider.signAndSendTransaction(tx);

    console.log('signAndSendTransaction legacyTransaction', tx, signature);
    addSignedData(res.signature);
    
    setRes({
      method: 'signAndSendTransaction',
      type: 'legacyTransaction',
      res
    });

  }

  const signAndSendTransaction2 = async () => { 
    setRes({});
    const tx = await createVersionedTx();
    const res = await provider.signAndSendTransaction(tx);

    console.log('signAndSendTransaction versionedTransaction', tx, signature);
    addSignedData(res.signature);

    setRes({
      method: 'signAndSendTransaction',
      type: 'versionedTransaction',
      res
    });
  }

  const signAndSendTransaction3 = async () => { 
    setRes({});

    const tx = await createLookupTx();
    const res = await provider.signAndSendTransaction(tx);
    addSignedData(res.signature);

    setRes({
      method: 'signAndSendTransaction.lookupTransaction',
      type: 'lookupMessage',
      res
    });
  }  

  const signAndSendAllTransactions = async () => {
    setRes({});
    //createLookupTx
    const transactions = [await createLegacyTx(), await createVersionedTx()];

    const res = await provider.signAndSendAllTransactions(transactions);

    setRes({
      method: 'signAndSendAllTransactions',
      transactions: "legacy + versioned",
      res,
    });
  }

  const sendRawTransaction = async () => { 
    if (!address) { 
      alert('please connect 1st');
      return;
    };
    if (!rawTransaction) { 
      alert('please user signTransaction create rawTransaction 1st');
      return;
    };
    setRes({});

    const res = await provider.sendRawTransaction(rawTransaction);
    addSignedData(res.signature);

    setRes({
      method: 'sendRawTransaction',
      res,
    });
  }

  const signVersionedTransaction = async () => {
    if (!address) { 
      alert('please connect 1st');
      return;
    };
    setRes({});

    const transactionV0 = await createVersionedTx();
    const res = await provider.signTransaction(transactionV0);
    setRawTransaction(res.signature);

    setRes({
      method: 'signTransaction',
      type: 'versionedTransaction',
      res,
    });
  };

  const signLegacyTransaction = async () => {
    if (!address) { 
      alert('please connect 1st');
      return;
    };
    setRes({});

    const transaction = await createLegacyTx();
    // console.log('txToHex transaction', txToHex(transaction));
    const res = await provider.signTransaction(transaction);
    setRawTransaction(res.signature);
    setRes({
      method: 'signTransaction',
      type: 'legacyTransaction',
      res
    });
  };

  const signLookupTransaction = async () => {
    if (!address) { 
      alert('please connect 1st');
      return;
    };
    setRes({});

    const transaction = await createLookupTx();
    const res =  await provider.signTransaction(transaction);
    setRawTransaction(res.signature);
    setRes({
      method: 'signTransaction',
      type: 'lookupTransaction',
      res
    });
  };

  //not recommended
  const signAllTransactions = async () => {
    setRes({});
    //, await createLookupTx()
    const transactions = [await createLegacyTx(), await createVersionedTx()];

    const res = await provider.signAllTransactions(transactions);

    setRes({
      method: 'signAllTransactions',
      transactions: "legacy + versioned",
      res
    });
  }

  const sendSolana = async () => { 
    const balances = await connection.getMultipleAccountsInfo([address].map((addr) => new PublicKey(addr)));

    setRes({
      method: 'sendSolana',
      balances
    });
    const params = {
      from: address,
      to: address,
      amount: 0.0001,
      // priorityFee: 4567,
    };
    const res = await provider.sendSolana(params);
    addSignedData(res.signature);
    setRes({
      method: 'sendSolana',
      params,
      res
    });
  }

  const sendSolana2 = async () => { 
    const balances = await connection.getMultipleAccountsInfo([address].map((addr) => new PublicKey(addr)));

    setRes({
      method: 'sendSolana',
      balances
    });
    const params = {
      from: address,
      to: address,
      amount: 123456789,
      // priorityFee: 1234,
    };
    const res = await provider.sendSolana(params);
    addSignedData(res.signature);
    addSignedData(signature);
    setRes({
      method: 'sendSolana',
      params,
      res
    });
  }

  //https://solscan.io/token/4TBi66vi32S7J8X1A6eWfaLHYmUXu7CStcEmsJQdpump
  const sendToken = async () => { 
    const pubkey = new PublicKey(address);
  
    const accounts = await connection.getParsedTokenAccountsByOwner(pubkey, {
      programId: TOKEN_PROGRAM_ID,
    });
    console.log('sendToken 1', accounts);
  
    const balances = {};
    accounts.value.map((account) => {
      const parsedData = account.account.data;
      const info = parsedData.parsed?.info;

      console.log('sendToken 2', parsedData);
  
      const balance = Number(info.tokenAmount.amount);
      if (balance > 0) { 
        balances[info.mint] =  {
        tokenAddress: info.mint,
        balance,
        decimals: info.tokenAmount.decimals,
      };
      }
    });

    setRes({
      method: 'sendToken',
      balances
    });
    const params = {
      tokenAddress,
      from: address,
      to: address,
      amount: 1,
      // priorityFee: 456,
    };
    const res = await provider.sendToken(params);
    addSignedData(res.signature);
    setRes({
      method: 'sendToken',
      params,
      res
    });
  }

  const sendToken2 = async () => { 
    const params = {
      tokenAddress,
      from: address,
      to: address,
      amount: 12345678910,
      // priorityFee: 123,
    };
    const res = await provider.sendToken(params);
    addSignedData(res.signature);
    setRes({
      method: 'sendToken',
      params,
      res
    });
  }

  const sendSignedTx = async () => {
    const signedTx = "7DQ4JxKhz8YttxmH6PwdM7Yzi2PWhkWSJu9BbLMdiuzdH9SRjboHsikwfkmHTQXb2R1C5XTZ1qyDziFY1VeXiz47pSWgvmeg2xiknqoDhcPvuKxKa4VCLPMXFdK986DhMU29S8u7GxCRogCuxee8Ww4xievxAPPrEqaRJDNv91vBQXJMyV1wbfuhKv6NA6UTdDJAXXzTYCoFZf67dak6sjErT9vQVhcsdjB6hVvVpBgVrTh5tswuSV5ej4cs3sV6zF7rJmLgE7RrpfjJHK1GrRSKsYkxv4ukXH4kk9gi3UBKCXe5zyEqWKUs";
  
    // const rawTransaction = Buffer.from(bs58.decode(signedTx));
    let rawTransaction;
    try {
      const hexBuffer = Buffer.from(signedTx, "hex");
      VersionedTransaction.deserialize(hexBuffer);
      rawTransaction = hexBuffer;
    } catch (error) {
      const base58Buffer = Buffer.from(bs58.decode(signedTx));
      VersionedTransaction.deserialize(base58Buffer);
      rawTransaction = base58Buffer;
    }
  
    console.log("solana.sendSignedTx 1", signedTx, rawTransaction);
    const transaction = VersionedTransaction.deserialize(rawTransaction);
    if (!transaction.signatures || transaction.signatures.length === 0) {
      throw new Error("lack of sign");
    }
  
    const simulation = await connection.simulateTransaction(transaction, {
      sigVerify: true,
      commitment: "confirmed",
    });
    console.log("solana.sendSignedTx 2", transaction, simulation);
    if (simulation.value.err) {
      console.error(simulation);
      throw new Error(`simulation failed: ${simulation.value.err}`);
    }
  
    const confirmationStrategy = {
      commitment: "confirmed",
      preflightCommitment: "confirmed",
      skipPreflight: false,
      maxRetries: 3,
    };
    const signature = await sendAndConfirmRawTransaction(connection, rawTransaction, confirmationStrategy);
  
    console.log("solana.sendSignedTx 3", confirmationStrategy, signature, rawTransaction);
  
    return { signature };
  };


  const toPubkey = address ? new PublicKey(address) : null;

  //https://solana.com/zh/docs/tokens/basics/transfer-tokens#typescript
  async function createLegacyTx() { 
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey, //payer
        toPubkey, //toAccount
        lamports: 0.0001 * LAMPORTS_PER_SOL, //, https://solana-labs.github.io/solana-web3.js/variables/LAMPORTS_PER_SOL.html
      }),
    );
    transaction.feePayer = fromPubkey;
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;

    const { data, keys, programId } = transaction.instructions?.[0] || {};

    console.log('createLegacyTx', transaction, {
      feePayer: transaction.feePayer.toString(),
      programId: programId.toString(),
      pubkey1: keys[0].pubkey.toString(),
      pubkey2: keys[1].pubkey.toString(),
      data1: new TextDecoder().decode(data),
      data2: bs58.encode(data),
    })

    return transaction;
  }

  async function createVersionedTx() { 
    if (!fromPubkey) {
      throw new Error('Please connect wallet first');
    }

    const instructions = [
      SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports: Math.floor(0.0002 * LAMPORTS_PER_SOL), // 确保金额为整数
      }),
    ];

    const { blockhash } = await connection.getLatestBlockhash();
    console.log('createVersionedTx', [blockhash, Math.floor(0.0002 * LAMPORTS_PER_SOL)]);

    const messageV0 = new TransactionMessage({
      payerKey: fromPubkey,
      recentBlockhash: blockhash,
      instructions,
    }).compileToV0Message();

    const transaction = new VersionedTransaction(messageV0);
    return transaction;
  }

  async function createLookupTx() { 
    const publicKey = fromPubkey;
    
    const recentSlot = await connection.getSlot();
    const [lookupTableInst, lookupTableAddress] = AddressLookupTableProgram.createLookupTable({
      authority: publicKey,
      payer: publicKey,
      recentSlot,
    });

    const transferInstruction = SystemProgram.transfer({
      fromPubkey: publicKey,
      toPubkey,
      lamports: 0.0003 * LAMPORTS_PER_SOL,
    });

    // To create the Address Lookup Table on chain:
    // send the `lookupTableInst` instruction in a transaction
    const blockhash =  (await connection.getLatestBlockhash()).blockhash;
    const lookupMessage = new TransactionMessage({
      payerKey: publicKey,
      recentBlockhash: blockhash,
      instructions: [lookupTableInst, transferInstruction],
    }).compileToV0Message();

    const lookupTransaction = new VersionedTransaction(lookupMessage);
    return lookupTransaction;
  }

  function openTxDetail (signature) { 
    window.open(`https://explorer.solana.com/tx/${signature}?cluster=${network}`);
  }
  function addSignedData(signature) {
    signature = bs58.encode(signature);
    openTxDetail(signature);
    window.addSigned = window.addSigned || {};
    if (typeof signature === 'string') { 
      window.addSigned[signature] = true;
    }
  }

  useEffect(() => {
    const signedMap = window.addSigned || {};
    for (var signature in signedMap) { 
      connection.getSignatureStatus(signature).then((res) => {
        console.log('getSignatureStatus:', signature, res);
      });
    }
  }, [window.addSigned]);

  return (
    <div className="m-5 text-sm">
      <div className="mt-2 bg-[#f5f5f5] p-2">
        <h1>Solana Dapp Demo</h1>
        <div>solana web3: <a className="text-[skyblue]" href="https://solana-labs.github.io/solana-web3.js/classes/Connection.html#getsignaturestatuses">https://solana-labs.github.io/solana-web3.js/classes/Connection.html#getsignaturestatuses</a></div>
          {address && <p>connected: <span className="text-xl text-[red]">{address}</span></p>}
          
        current wallet: <span className="text-2xl text-[red]">{providerName}</span> <br />
        switch to:
        <button onClick={() => {
          const provider = window.mydoge?.solana;
          if (!provider) {
            window.open('https://qsg07xytt12z.sg.larksuite.com/wiki/I5ZDwtq6MiQQpWk9MRelFpjtg9b', '_blank');
            return;
          }
          setProvider(provider);
          setProviderName('mydoge');
        }} className="bg-[#666] text-[#fff] p-1 m-2">
          mydoge
        </button>
        <button onClick={() => {
          const provider = window.phantom?.solana;
          if (!provider) {
            window.open('https://phantom.app/', '_blank');
            return;
          }
          setProvider(provider);
          setProviderName('phantom');
        }} className="bg-[#666] text-[#fff] p-1 m-2">
          phantom
        </button>
        <button onClick={() => {
          const provider = window.okxwallet?.solana;
          if (!provider) {
            window.open('https://web3.okx.com/zh-hans/build/docs/sdks/web-detect-okx-wallet', '_blank');
            return;
          }
          setProvider(provider);
          setProviderName('okxwallet');
        }} className="bg-[#666] text-[#fff] p-1 m-2">
          okxwallet
        </button>
        <button onClick={() => {
          const provider = window.bitkeep?.solana;
          if (!provider) {
            window.open('https://web3.bitget.com/zh-CN/wallet-download', '_blank');
            return;
          }
          setProvider(provider);
          setProviderName('bitget');
        }} className="bg-[#666] text-[#fff] p-1 m-2">
          bitget
        </button>
      </div>

      <div className="mt-2">
        <button onClick={connect} className="bg-[#000] text-[#fff] p-1 m-2">
          connect
        </button>

        <button onClick={connectOnlyIfTrusted} className="bg-[#000] text-[#fff] p-1 m-2">
          connectOnlyIfTrusted
        </button>

        <button onClick={connect2} className="bg-[#000] text-[#fff] p-1 m-2">
          request.connect
        </button>

        <button onClick={disconnect} className="bg-[#000] text-[#fff] p-1 m-2">
          disconnect
        </button>
      </div>

      <div className="mt-2">
        <button onClick={accountChanged} className="bg-[#000] text-[#fff] p-1 m-2">
          accountChanged
        </button>
        <button onClick={getAccount} className="bg-[#000] text-[#fff] p-1 m-2">
          getAccount
        </button>
      </div>

      <div className={ 'mt-6 ' + (address ? '' : 'opacity-40')}>
        <button onClick={signMessage} className="bg-[#000] text-[#fff] p-1 m-2">
          signMessage
        </button>

        <button
          onClick={signMessage2}
          className="bg-[#000] text-[#fff] p-1 m-2"
        >
          request.signMessage
        </button>

        <button onClick={signIn} className="bg-[#000] text-[#fff] p-1 m-2">
          signIn
        </button>

        {/* <button onClick={sendSignedTx} className="bg-[#000] text-[#fff] p-1 m-2">
          sendSignedTx
        </button> */}

        <div className="h-[30px]"></div>

        <button
          onClick={sendSolana}
          className="bg-[#000] text-[#fff] p-1 m-2"
        >
          sendSolana
        </button> 

        <button
          onClick={sendSolana2}
          className="bg-[#000] text-[#fff] p-1 m-2"
        >
          sendSolana(over balance)
        </button>

        <button
          onClick={sendToken}
          className="bg-[#000] text-[#fff] p-1 m-2"
        >
          sendToken
        </button> 

        <button
          onClick={sendToken2}
          className="bg-[#000] text-[#fff] p-1 m-2"
        >
          sendToken(over balance)
        </button> 

        <div className="h-[30px]"></div>

        <button
          onClick={signLegacyTransaction}
          className="bg-[#000] text-[#fff] p-1 m-2"
        >
          signTransaction.legacyTransaction
        </button>
        <button
          onClick={signVersionedTransaction}
          className="bg-[#000] text-[#fff] p-1 m-2"
        >
          signTransaction.versionedTransaction
        </button>
        <button
          onClick={signLookupTransaction}
          className="bg-[#000] hidden text-[#fff] p-1 m-2"
        >
          signTransaction.lookupTransaction
        </button>

        <button
          onClick={signAllTransactions}
          className="bg-[#000] opacity-40 text-[#fff] p-1 m-2"
        >
          ?signAllTransactions
        </button> 

        <div className="h-[0px]"></div>

        <button onClick={signAndSendTransaction} className="bg-[#000] text-[#fff] p-1 m-2">signAndSendTransaction.legacyTransaction</button>
        <button onClick={signAndSendTransaction2} className="bg-[#000] text-[#fff] p-1 m-2">signAndSendTransaction.versionedTransaction</button>
        <button onClick={signAndSendTransaction3} className="bg-[#000] hidden text-[#fff] p-1 m-2">signAndSendTransaction.lookupTransaction</button>
        <button onClick={signAndSendAllTransactions} className="bg-[#000] opacity-40 text-[#fff] p-1 m-2">?signAndSendAllTransactions</button>
      </div>

      {res.method && <div className="bg-[#f5f5f5] border-1 p-5 mt-4 text-xs">
        <h2 className="text-lg mb-4">{ providerName }: {res.method}</h2>
        <pre style={{ wordWrap: "break-word" }}>
          {JSON.stringify(res, null, "\t")}
        </pre>
      </div>}
    </div>
  );
}