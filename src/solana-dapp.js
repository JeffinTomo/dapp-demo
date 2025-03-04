import React, { useState } from "react";
import bs58 from "bs58";
import {
  TransactionMessage,
  VersionedTransaction,
  SystemProgram,
  Connection,
  Transaction,
} from "@solana/web3.js";

const provider = window.phantom?.solana;

export default function SolanaDApp() {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState("");
  const [signature, setSignature] = useState("");
  const [transaction, setTransaction] = useState("");
  const [signedTransaction, setSignedTransaction] = useState("");

  const connection = new Connection("https://api.devnet.solana.com/");

  const connect = async () => {
    if (!provider) return;
    try {
      let { publicKey = "" } = (await provider.connect()) || {};
      let address = publicKey?.toBase58();
      console.log(publicKey.toString());
      console.log(`Switched to account ${address}, publicKey: ${publicKey}`);
      setConnected(true);
      setAddress(address);
    } catch (err) {
      setConnected(false);
      console.error("connected error", err);
    }
  };

  // const contractAddress = await provider.getAccount();

  const signMessage = async () => {
    if (!connected) return;
    try {
      // uint8Array
      const message = `You can use uint8array to verify`;
      const encodedMessage = new TextEncoder().encode(message);
      const signedMessage = await provider.signMessage(encodedMessage);
      const signature = signedMessage?.signature;
      setSignature(signature);
    } catch (e) {
      alert(e);
    }
  };

  const signVersionedTransaction = async () => {
    if (!provider) return;

    let minRent = await connection.getMinimumBalanceForRentExemption(0);

    // create array of instructions
    const instructions = [
      SystemProgram.transfer({
        fromPubkey: provider.publicKey,
        toPubkey: provider.publicKey,
        lamports: minRent,
      }),
    ];

    let blockhash = await connection
      .getLatestBlockhash()
      .then((res) => res.blockhash);

    // create v0 compatible message
    const messageV0 = new TransactionMessage({
      payerKey: provider.publicKey,
      recentBlockhash: blockhash,
      instructions,
    }).compileToV0Message();

    // make a versioned transaction
    const transactionV0 = new VersionedTransaction(messageV0);

    const signedTransaction = await provider.signTransaction(transactionV0);
    setTransaction(JSON.stringify(signedTransaction));
  };

  const signLegacyTransaction = async () => {
    if (!provider) return;

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: provider.publicKey, //payer
        toPubkey: provider.publicKey, //toAccount
        lamports: 100,
      }),
    );
    transaction.feePayer = provider.publicKey;

    const anyTransaction = transaction;
    anyTransaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;

    const signedTransaction = await provider.signTransaction(transaction);
    setSignedTransaction(JSON.stringify(signedTransaction));
  };

  return (
    <div className="m-5 text-sm">
      <h2>Solana Dapp Demo</h2>

      <br />
      <button onClick={connect} className="bg-[#000] text-[#fff] p-1 mb-2">
        connect
      </button>
      <p className="bg-[#f5f5f5] border-1 p-5">
        {connected ? "connected" : "not connected"}
      </p>
      {address && <p>地址：{address}</p>}
      <br />

      <br />
      <button onClick={signMessage} className="bg-[#000] text-[#fff] p-1 mb-2">
        signMessage
      </button>
      {signature && (
        <div
          style={{ width: "80%", wordBreak: "break-all" }}
          className="bg-[#f5f5f5] border-1 p-5"
        >
          签名： {signature}
          <div>todo: verifyMessage</div>
        </div>
      )}
      <br />

      <br />
      <button
        onClick={signVersionedTransaction}
        className="bg-[#000] text-[#fff] p-1 mb-2"
      >
        signVersionedTransaction
      </button>
      {transaction && <p>Versioned Transaction:{transaction}</p>}
      <br />

      <br />
      <button
        onClick={signLegacyTransaction}
        className="bg-[#000] text-[#fff] p-1 mb-2"
      >
        signLegacyTransaction
      </button>
      {signedTransaction && (
        <p className="bg-[#f5f5f5] border-1 p-5">
          Legacy Transaction:{signedTransaction}
        </p>
      )}
      <br />
      <br />
    </div>
  );
}
