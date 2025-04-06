import React, { createContext, useContext, useEffect, useState } from "react";
import Web3 from "web3";
import toast from "react-hot-toast";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const connectWallet = async () => {
    try {
      setConnecting(true);
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3Instance.eth.getAccounts();
        setWeb3(web3Instance);
        setAccount(accounts[0]);
        setConnected(true);
        toast.success("Wallet connected!");
      } else {
        toast.error("Please install MetaMask!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Connection failed");
    } finally {
      setConnecting(false);
    }
  };

  // Auto connect if already authorized
  useEffect(() => {
    const autoConnect = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        const accounts = await web3Instance.eth.getAccounts();
        if (accounts.length > 0) {
          setWeb3(web3Instance);
          setAccount(accounts[0]);
          setConnected(true);
        }
      }
    };
    autoConnect();
  }, []);

  return (
    <AppContext.Provider value={{ web3, account, connected, connecting, connectWallet }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
