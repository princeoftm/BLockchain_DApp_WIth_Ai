// src/contexts/AppContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import Web3 from "web3";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const connectToMetaMask = async () => {
    try {
      setConnecting(true);
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3Instance.eth.getAccounts();
        setWeb3(web3Instance);
        setAccount(accounts[0]);
        setConnected(true);
      } else {
        alert("Please install MetaMask!");
      }
    } catch (error) {
      console.error("Connection Error:", error);
      alert("Failed to connect MetaMask");
    } finally {
      setConnecting(false);
    }
  };

  // Handle account/network change
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", () => {
        window.location.reload();
      });
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        web3,
        account,
        connectToMetaMask,
        connected,
        connecting,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
