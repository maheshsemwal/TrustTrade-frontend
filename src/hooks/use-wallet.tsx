import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import type { BrowserProvider, JsonRpcSigner } from 'ethers';
import { useStore, useAuth as useAuthStore } from '../lib/store';
import { AuthService } from '../lib/auth';

interface WalletState {
  account: string | null;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  isConnecting: boolean;
  isConnected: boolean;
  chainId: number | null;
  error: Error | null;
}

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
  
  // Get the user object from auth store
  const authState = useAuthStore();
  const userWalletAddress = authState.user?.walletAddress;

  const isWalletInstalled = useCallback(() => {
    return typeof window !== 'undefined' && window.ethereum !== undefined;
  }, []);

  // Load wallet from user object on init
  useEffect(() => {
    const loadSavedWallet = async () => {
      if (!isWalletInstalled()) return;
      
      // Use wallet address from user object instead of localStorage
      if (userWalletAddress) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.listAccounts();
          
          // Check if the saved wallet is still available in the wallet
          if (accounts.some(account => account.address.toLowerCase() === userWalletAddress.toLowerCase())) {
            const signer = await provider.getSigner();
            const network = await provider.getNetwork();
            
            setWalletState({
              account: userWalletAddress,
              provider,
              signer,
              isConnecting: false,
              isConnected: true,
              chainId: Number(network.chainId),
              error: null,
            });
          }
        } catch (error) {
          console.error("Failed to reconnect wallet:", error);
        }
      }
    };
    
    loadSavedWallet();
  }, [isWalletInstalled, userWalletAddress]);

  const updateWalletInDatabase = async (address: string, chainId: number) => {
    try {
      // Use the AuthService.updateProfile to update the wallet address
      const result = await AuthService.updateProfile({
        walletAddress: address
      });
      
      if (!result.success) {
        throw new Error('Failed to update wallet information in database');
      }
      
      return result.data;
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
      
      // Save to database and update user object
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
    
    // Update database with empty wallet address
    try {
      await updateWalletInDatabase('', 0);
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
        
        // Update database with new wallet address
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
          // We only need to update the wallet address here, not the chain ID
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