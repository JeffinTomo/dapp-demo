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

import EvmDapp from "./evm";
import UnisatDapp from "./unisat";
import SolanaDapp from "./solana";

// import { Buffer } from 'buffer';
// window.Buffer = Buffer;

function App() {
  const chains = ["unisat", "evm", "solana"];
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
    <div>
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
          <Route exact path="/unisat" element={<UnisatDapp />} />
          <Route exact path="/solana" element={<SolanaDapp />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
