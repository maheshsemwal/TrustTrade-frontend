import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import type { BrowserProvider, JsonRpcSigner } from 'ethers';

interface WalletState {
  account: string | null;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  isConnecting: boolean;
  isConnected: boolean;
  chainId: number | null;
  error: Error | null;
}

const WALLET_STORAGE_KEY = 'trusttrade_wallet_address';

export function useWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    account: null,
    provider: null,
    signer: null,
    isConnecting: false,
    isConnected: false,
    chainId: null,
    error: null,
  });

  const isWalletInstalled = useCallback(() => {
    return typeof window !== 'undefined' && window.ethereum !== undefined;
  }, []);

  // Load wallet from localStorage on init
  useEffect(() => {
    const loadSavedWallet = async () => {
      if (!isWalletInstalled()) return;
      
      const savedAddress = localStorage.getItem(WALLET_STORAGE_KEY);
      if (savedAddress) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.listAccounts();
          
          // Check if the saved wallet is still available in the wallet
          if (accounts.some(account => account.address.toLowerCase() === savedAddress.toLowerCase())) {
            const signer = await provider.getSigner();
            const network = await provider.getNetwork();
            
            setWalletState({
              account: savedAddress,
              provider,
              signer,
              isConnecting: false,
              isConnected: true,
              chainId: Number(network.chainId),
              error: null,
            });
            
            // Update the database with the wallet information
            try {
              await updateWalletInDatabase(savedAddress, Number(network.chainId));
            } catch (error) {
              console.error("Failed to update wallet in database:", error);
            }
          } else {
            // Saved wallet is no longer available, clear localStorage
            localStorage.removeItem(WALLET_STORAGE_KEY);
          }
        } catch (error) {
          console.error("Failed to reconnect wallet:", error);
          localStorage.removeItem(WALLET_STORAGE_KEY);
        }
      }
    };
    
    loadSavedWallet();
  }, [isWalletInstalled]);

  const updateWalletInDatabase = async (address: string, chainId: number) => {
    try {
      const response = await fetch('/api/user/update-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: address,
          chainId: chainId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update wallet information in database');
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error updating wallet in database:", error);
      throw error;
    }
  };

  const connectWallet = useCallback(async () => {
    if (!isWalletInstalled()) {
      setWalletState(prev => ({
        ...prev,
        error: new Error('No Ethereum wallet detected. Please install MetaMask or another wallet.'),
      }));
      return false;
    }

    try {
      setWalletState(prev => ({ ...prev, isConnecting: true, error: null }));
      
      // Connect to wallet
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      
      // Save to state
      setWalletState({
        account: accounts[0],
        provider,
        signer,
        isConnecting: false,
        isConnected: true,
        chainId: Number(network.chainId),
        error: null,
      });
      
      // Save to localStorage
      localStorage.setItem(WALLET_STORAGE_KEY, accounts[0]);
      
      // Save to database
      try {
        await updateWalletInDatabase(accounts[0], Number(network.chainId));
      } catch (error) {
        console.error("Failed to update wallet in database:", error);
      }
      
      return true;
    } catch (error) {
      setWalletState(prev => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error : new Error('Failed to connect wallet'),
      }));
      return false;
    }
  }, [isWalletInstalled]);

  const disconnectWallet = useCallback(async () => {
    // Clear from localStorage
    localStorage.removeItem(WALLET_STORAGE_KEY);
    
    // Clear from state
    setWalletState({
      account: null,
      provider: null,
      signer: null,
      isConnecting: false,
      isConnected: false,
      chainId: null,
      error: null,
    });
    
    // Update database
    try {
      await updateWalletInDatabase('', 0); // Clear wallet in database
    } catch (error) {
      console.error("Failed to update wallet in database:", error);
    }
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (!isWalletInstalled()) return;

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected their wallet
        disconnectWallet();
      } else if (walletState.isConnected) {
        // Account changed while connected
        const newAccount = accounts[0];
        
        setWalletState(prev => ({
          ...prev,
          account: newAccount,
        }));
        
        // Update localStorage
        localStorage.setItem(WALLET_STORAGE_KEY, newAccount);
        
        // Update database
        try {
          if (walletState.chainId) {
            await updateWalletInDatabase(newAccount, walletState.chainId);
          }
        } catch (error) {
          console.error("Failed to update wallet in database:", error);
        }
      }
    };

    const handleChainChanged = async (chainIdHex: string) => {
      const chainId = parseInt(chainIdHex, 16);
      
      // Update database with new chain ID
      if (walletState.account) {
        try {
          await updateWalletInDatabase(walletState.account, chainId);
        } catch (error) {
          console.error("Failed to update chain ID in database:", error);
        }
      }
      
      // Handle chain changes - page reload is recommended by MetaMask
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [disconnectWallet, isWalletInstalled, walletState.isConnected, walletState.account, walletState.chainId]);

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    isWalletInstalled,
  };
}

// Add TypeScript definitions for the ethereum object on window
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (request: { method: string; params?: any[] }) => Promise<any>;
      send: (method: string, params?: any[]) => Promise<any>;
      on: (eventName: string, listener: (...args: any[]) => void) => void;
      removeListener: (eventName: string, listener: (...args: any[]) => void) => void;
    };
  }
}