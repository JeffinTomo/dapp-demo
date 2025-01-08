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

import EvmApp from './evm';
import BtcApp from './unisat'

function App() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setLoaded(true);
    }, 1000);
  }, []);

  if (!loaded) {
    return 'loading';
  }

  return (
    <div style={{display: 'flex', justifyContent: 'center', gap: '20'}}>
      <EvmApp />
      <BtcApp />
    </div>
  );
}

export default App;
