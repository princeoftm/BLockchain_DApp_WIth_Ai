import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import MetamaskProvider from './Utils/MetamaskProvider';
 
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <MetamaskProvider>
      <App />
    </MetamaskProvider>
  </React.StrictMode>
);