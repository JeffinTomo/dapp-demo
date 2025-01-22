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

// import { Buffer } from 'buffer';
// window.Buffer = Buffer;

// import { getVaultDecrypt } from './account-recovery';
// import { hasEoaAccounts } from './mydoge-recovery';

function App() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setLoaded(true);
    }, 500);

    // const wallets = [];
    // window.addEventListener('eip6963:announceProvider', (e) => {
    //   wallets.push(e.detail);
    //   let { info, provider } = e.detail;
    //   if (info.rdns === 'io.metamask') {
    //     console.log('metamask provider', provider, wallets);
    //   }
    // });

    // window.dispatchEvent(new Event('eip6963:requestProvider'));
  }, []);

  if (!loaded) {
    return 'loading';
  }

  return (
    <div style={{display: 'flex', justifyContent: 'center', gap: '20'}}>
      {/* <EvmApp /> */}
      <BtcApp />
    </div>
  );
}

export default App;
