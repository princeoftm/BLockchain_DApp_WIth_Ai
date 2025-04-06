import React, { createContext, useContext, useEffect, useState } from "react";
import Web3 from "web3";
import toast from "react-hot-toast";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const connectToMetaMask = async () => {
    try {
      setConnecting(true);

      if (!window.ethereum) {
        toast.error("MetaMask is not installed!");
        setConnecting(false);
        return;
      }

      const web3Instance = new Web3(window.ethereum);

      // Request accounts
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const selectedAccount = accounts[0];

      setWeb3(web3Instance);
      setAccount(selectedAccount);
      setConnected(true);
      toast.success("Connected to MetaMask!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to connect MetaMask!");
    } finally {
      setConnecting(false);
    }
  };

  const checkIfWalletIsConnected = async () => {
    if (!window.ethereum) return;

    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      if (accounts.length > 0) {
        setWeb3(new Web3(window.ethereum));
        setAccount(accounts[0]);
        setConnected(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setConnected(true);
          toast("Account changed!");
        } else {
          // No account connected
          setAccount(null);
          setConnected(false);
        }
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
        connected,
        connecting,
        connectToMetaMask,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
