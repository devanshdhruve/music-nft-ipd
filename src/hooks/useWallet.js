//hooks/useWallet

import { useState, useEffect } from "react";
import { ethers } from "ethers";

const useWallet = () => {
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) setAccount(accounts[0]);
      }
    };
    checkConnection();
  }, []);

  return { account };
};

export default useWallet;
