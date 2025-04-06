import React from 'react';
import { MetaMaskProvider } from '@metamask/sdk-react';
 
const MetamaskProvider = ({ children }) => {
  return (
    <>
      <MetaMaskProvider
        debug={true}
        sdkOptions={{
          dappMetadata: {
            name: 'Storage App',
            url: window.location.host,
          },
        }}
      >
        {children};
      </MetaMaskProvider>
    </>
  );
};
 
export default MetamaskProvider;