import React, { useState, useEffect } from "react";

export default function ShopDApp() {
  const providerName = "shop";
  const provider = window.mydoge?.[providerName];

  const [res, setRes] = useState({});
  
  const connect = async () => {
    if (!provider) { 
      alert('provider err');
      return;
    }
    setRes({});
    //{ onlyIfTrusted: true }
    try {
      const res = await provider.connect({params: "connect"}) || {};      
      setRes({
        method: 'connect',
        res
      });
    } catch (err) {
      console.error("connected error", err);
    }
  };

  const welcome = async () => {
    if (!provider) { 
      alert('provider err');
      return;
    }
    setRes({});
    //{ onlyIfTrusted: true }
    try {
      const res = await provider.welcome({
        rewardPercent: "8%"
      });
      setRes({
        method: 'welcome',
        res
      });
    } catch (err) {
      console.error("welcome error", err);
    }
  };

  const addToCart = async () => {
    if (!provider) { 
      alert('provider err');
      return;
    }
    setRes({});
    //{ onlyIfTrusted: true }
    try {
      const res = await provider.addToCart({
        rewardPercent: "8%"
      });
      setRes({
        method: 'addToCart',
        res
      });
    } catch (err) {
      console.error("addToCart error", err);
    }
  };
  
  const rewardEstimated = async () => {
    if (!provider) { 
      alert('provider err');
      return;
    }
    setRes({});
    //{ onlyIfTrusted: true }
    try {
      const res = await provider.rewardEstimated({
        reward: "12.07",
        totalInCart: "$340.35",
        rewardPercent: "8%"
      });
      setRes({
        method: 'rewardEstimated',
        res
      });
    } catch (err) {
      console.error("rewardEstimated error", err);
    }
  };

  const rewardClaimed = async () => {
    if (!provider) { 
      alert('provider err');
      return;
    }
    setRes({});
    try {
      const res = await provider.rewardClaimed({
        reward: "12.07",
        claimedRecord: "https://www.walmart.com/?reward-done"
      });
      setRes({
        method: 'rewardClaimed',
        res
      });
    } catch (err) {
      console.error("rewardClaimed error", err);
    }
  }

  const shopLink = "https://www.walmart.com/";
  return (
    <div className="m-5 text-sm">
      <div className="mt-0 bg-[#f5f5f5] p-2">
        <h1>Moso Shaop Demo</h1>
        <ol className="mt-4">
          <li><a href={shopLink} target="_blank" rel="noopener noreferrer">{ shopLink}</a></li>
        </ol>
      </div>

      <div className="mt-2">
        <button onClick={connect} className="bg-[#000] hidden text-[#fff] p-1 m-2">
          connect
        </button>

        <button onClick={welcome} className="bg-[#000] text-[#fff] p-1 m-2">
          welcome
        </button>

        <button onClick={addToCart} className="bg-[#000] text-[#fff] p-1 m-2">
          addToCart
        </button>

        <button onClick={rewardEstimated} className="bg-[#000] text-[#fff] p-1 m-2">
          rewardEstimated
        </button>

        <button onClick={rewardClaimed} className="bg-[#000] text-[#fff] p-1 m-2">
          rewardClaimed
        </button>
      </div>

      {/* {res.method && <div className="bg-[#f5f5f5] border-1 p-5 mt-4 text-xs">
        <h2 className="text-lg mb-4">{providerName}.{res.method}:</h2>
        <pre style={{ wordWrap: "break-word" }}>
          {JSON.stringify(res, null, "\t")}
        </pre>
      </div>} */}
    </div>
  );
}