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

import { Buffer } from 'buffer';
window.Buffer = Buffer;

// import { getVaultDecrypt } from './account-recovery';
import { hasEoaAccounts } from './mydoge-recovery';

function App() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setLoaded(true);
    }, 1000);

    (async () => {
      // getVaultDecrypt();
      await hasEoaAccounts();
    })();
  }, []);

  if (!loaded) {
    return 'loading';
  }

  return (
    <div style={{display: 'flex', justifyContent: 'center', gap: '20'}}>
      {/* <EvmApp />
      <BtcApp /> */}
    </div>
  );
}

export default App;
