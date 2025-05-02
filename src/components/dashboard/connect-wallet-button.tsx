import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useWallet } from '@/hooks/use-wallet';

export function ConnectWalletButton() {
  const { 
    connectWallet, 
    disconnectWallet, 
    isConnected, 
    isConnecting, 
    account, 
    error, 
    isWalletInstalled 
  } = useWallet();

  const handleConnectClick = async () => {
    if (isConnected) {
      disconnectWallet();
    } else {
      if (!isWalletInstalled()) {
        // Open MetaMask installation page if no wallet is detected
        window.open('https://metamask.io/download/', '_blank');
        return;
      }
      await connectWallet();
    }
  };

  // Format the account address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="flex flex-col gap-2">
      <Button 
        onClick={handleConnectClick}
        variant={isConnected ? "outline" : "default"}
        disabled={isConnecting}
        className="min-w-[140px]"
      >
        {isConnecting ? (
          <>
            <span className="animate-spin mr-2">⚙️</span>
            Connecting...
          </>
        ) : isConnected && account ? (
          <>
            {formatAddress(account)}
          </>
        ) : (
          "Connect Wallet"
        )}
      </Button>

      {!isWalletInstalled() && (
        <Alert variant="destructive" className="mt-2">
          <AlertTitle>Wallet Not Found</AlertTitle>
          <AlertDescription>
            <p>No wallet detected. Please install MetaMask to continue.</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => window.open('https://metamask.io/download/', '_blank')}
            >
              Install MetaMask
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}