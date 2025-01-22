import React, { useState } from "react";
// import { verifyMessage } from "@unisat/wallet-utils";
import { Card, Button, Input, InputOtp, Spinner } from "@nextui-org/react";

// const provider = window.unisat;
// const provider = window.tomo_btc;

export default function UnisatDApp() {
  let provider = window.mydoge.doge;

  const [currentInfo, setCurrentInfo] = useState({});
  const [params, setParams] = useState("");
  const [amount, setAmount] = useState(0.1);
  const [toAddress, setToAddress] = useState('DLsbf5qa5XKXGsMamvLUWeimmMKBnFMV7h');
  const [providerName, setProviderName] = useState("mydoge.doge");

  const requestAccounts = async () => await provider.requestAccounts();
  const getAccounts = async () => await provider.getAccounts();
  const getNetwork = async () => await provider.getNetwork();
  const switchNetwork = async (args) => await provider.switchNetwork(args);
  const getPublicKey = async () => await provider.getPublicKey();
  const getBalance = async () => await provider.getBalance();
  // const getInscriptions = async () => await provider.getInscriptions();

  const networkChanged = () => {};
  const accountsChanged = () => {};

  const sendBitcoin = async () =>
    await provider.sendBitcoin(toAddress, amount);

  // const sendInscription = async () =>
  // args = [
  //   "tb1q8h8s4zd9y0lkrx334aqnj4ykqs220ss7mjxzny",
  //   "e9b86a063d78cc8a1ed17d291703bcc95bcd521e087ab0c7f1621c9c607def1ai0",
  //   { feeRate: 15 },
  // ],
  // await provider.sendInscription(toAddress, "1");

  // https://docs.unisat.io/dev/unisat-developer-center/unisat-wallet#signmessage
  const signMessage = async () => {
    const message = "abcdefghijk123456789";
    const signature = await provider.signMessage(message, "");
    // const pubkey = await getPublicKey();
    // const res = verifyMessage(pubkey, message, signature);
    return {
      message,
      signature,
    };
  };

  const signMessageBip322Simple = async () => {
    const message = "abcdefghijk123456789";
    const signature = await provider.signMessage(message, "bip322-simple");
    // const pubkey = await getPublicKey();
    // const res = verifyMessage(pubkey, message, signature);
    return {
      message,
      signature,
    };
  };

  let psbt =
    "70736274ff0100890200000001668438b4fcafa31fe575284af4fd144a5b1f74edbc1733609de2634f5683607e0100000000ffffffff02920b000000000000225120f0a8ac7eeeb1a7d919c670d60120b94ef502b13e19ffda0b35cc21f8e8b458335c46000000000000225120921792fcbe19532f5a2e79734a71fb5f1270c2a1ef667d8fe2d7f9bc939e37bb000000000001012b8e5b000000000000225120921792fcbe19532f5a2e79734a71fb5f1270c2a1ef667d8fe2d7f9bc939e37bb01172047eafdc07e0d12def374cebee7a9fcf81130f6eb34530fcf936e4557a762c602000000";
  const signPsbt = async () => await provider.signPsbt(psbt);
  const signPsbts = async () => await provider.signPsbts([psbt, psbt]);


  const funcList = [
    "requestAccounts",
    "getAccounts",
    "getPublicKey",
    "accountsChanged",

    "switchNetwork",
    "getNetwork",
    "networkChanged",

    "getBalance",
    "signMessage",
    "signMessageBip322Simple",
    "signPsbt",
    "signPsbts",
    "sendBitcoin",
  ];

  return (
    <div className="p-3">
      <h2>Unisat DApp Demo</h2>
      <div className="mb-4 bg-gray-400 p-4 text-xs">
        provider = window.{ providerName};
      </div>


      <Button onPress={async () => { setProviderName('mydoge.doge'); provider = window.mydoge.doge; }}>
        use mydoge wallet
      </Button>
      <Button onPress={async () => { setProviderName('unisat'); provider = window.unisat; }}>
        use unisat wallet
      </Button>
      <Button onPress={async () => { setProviderName('bitkeep.unisat'); provider = window.bitkeep.unisat; }}>
        use bitget wallet
      </Button>

      <p></p>

      <textarea
        className="m-4 w-4/5 border-1"
        value={params}
        onChange={(e) => setParams(e.target.value)}
      />

      <p></p>

      <div style={{ display: "grid", gap: 20 }}>
        {[
          requestAccounts,
          getAccounts,
          getPublicKey,
          accountsChanged,

          switchNetwork,
          getNetwork,
          networkChanged,

          getBalance,
          signMessage,
          signMessageBip322Simple,
          signPsbt,
          signPsbts,
          sendBitcoin,
        ].map((func, index) => (
          <div key={index}>
            <Button
              onPress={async () => {
                window.location.hash = func.name;
                try {
                  setCurrentInfo({
                    "update time": new Date().getTime(),
                    "function name": func.name,
                    "function params": params.split(","),
                    "function returns": await func(
                      params ? params.split(",") : undefined,
                    ),
                  });
                } catch (e) {
                  console.error(e);
                }
              }}
            >
              {funcList[index]}
            </Button>
          </div>
        ))}
      </div>
      <div>
        amount: <input type="text" value={amount} onChange={(e) => {
          setAmount(e.target.value/1);
        }} />
        <p></p>
        to <input type="text" value={toAddress} style={{width: '300px'}} onChange={(e) => {
            setToAddress(e.target.value);
          }} />
      </div>
      {Object.keys(currentInfo).map((k) => (
        <div key={k} style={{ wordWrap: "break-word" }}>
          {k}: {JSON.stringify(currentInfo[k])}
        </div>
      ))}
    </div>
  );
}
