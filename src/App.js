import React, { useEffect, useState, Suspense } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  BrowserRouter,
  HashRouter,
  Routes,
  Route,
  Link,
  useParams,
} from "react-router-dom";

import EvmDapp from "./evm-dapp";
import DogeDapp from "./doge-dapp";
import SolanaDapp from "./solana-dapp";

// import { Buffer } from 'buffer';
// window.Buffer = Buffer;

function App() {
  const chains = ["doge", "evm", "solana"];
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setLoaded(true);
    }, 500);
  }, []);

  if (!loaded) {
    return "loading";
  }

  return (
    <div className="w-12/12">
      <BrowserRouter>
        <div className="dapps bg-[#000] p-3 mb-4">
          {chains.map((chain, index) => (
            <Link to={"/" + chain} key={index} className="m-3 text-[#fff]">
              {chain}
            </Link>
          ))}
        </div>

        <Routes>
          <Route exact path="/" element={<EvmDapp />} />
          <Route exact path="/evm" element={<EvmDapp />} />
          <Route exact path="/doge" element={<DogeDapp />} />
          <Route exact path="/solana" element={<SolanaDapp />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
