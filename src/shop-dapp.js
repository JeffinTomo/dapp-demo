import React, { useState, useEffect } from "react";

export default function ShopDApp() {
  const providerName = "shop";
  const provider = window.mydoge?.[providerName];

  const [res, setRes] = useState({});

  const welcomeDialog = async () => {
    if (!provider) { 
      alert('provider err');
      return;
    }
    setRes({});
    //{ onlyIfTrusted: true }
    try {
      const res = await provider.welcomeDialog({
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

  const addToCartDialog = async () => {
    if (!provider) { 
      alert('provider err');
      return;
    }
    setRes({});
    //{ onlyIfTrusted: true }
    try {
      const res = await provider.addToCartDialog({
      });
      setRes({
        method: 'addToCart',
        res
      });
    } catch (err) {
      console.error("addToCart error", err);
    }
  };
  
  const rewardEstimatedDialog = async () => {
    if (!provider) { 
      alert('provider err');
      return;
    }
    setRes({});
    //{ onlyIfTrusted: true }
    try {
      const res = await provider.rewardEstimatedDialog({
        reward: Math.floor(Math.random()*9876)/100,
        totalInCart: "$" + (Math.floor(Math.random()*9876)/100 + 1000),
      });
      setRes({
        method: 'rewardEstimated',
        res
      });
    } catch (err) {
      console.error("rewardEstimated error", err);
    }
  };

  const rewardClaimedDialog = async () => {
    if (!provider) { 
      alert('provider err');
      return;
    }
    setRes({});
    try {
      const res = await provider.rewardClaimedDialog({
        reward: Math.floor(Math.random()*9876)/100,
        claimedRecord: "https://www.walmart.com/?reward-done?r=" + Math.random()
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
        <button onClick={welcomeDialog} className="bg-[#000] text-[#fff] p-1 m-2">
          welcomeDialog
        </button>

        <button onClick={addToCartDialog} className="bg-[#000] text-[#fff] p-1 m-2">
          addToCartDialog
        </button>

        <button onClick={rewardEstimatedDialog} className="bg-[#000] text-[#fff] p-1 m-2">
          rewardEstimatedDialog
        </button>

        <button onClick={rewardClaimedDialog} className="bg-[#000] text-[#fff] p-1 m-2">
          rewardClaimedDialog
        </button>
      </div>

      {res.method && <div className="bg-[#f5f5f5] border-1 p-5 mt-4 text-xs">
        <h2 className="text-lg mb-4">{providerName}.{res.method}:</h2>
        <pre style={{ wordWrap: "break-word" }}>
          {JSON.stringify(res, null, "\t")}
        </pre>
      </div>}
    </div>
  );
}