"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, FileText, Send, Loader2 } from "lucide-react";
import { ethers } from "ethers";

// API base URL - must match your API endpoint
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface CreateContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactId?: string;
  contactName?: string;
  walletAddress?: string;
}

export function CreateContractDialog({ 
  open, 
  onOpenChange, 
  contactId, 
  contactName,
  walletAddress 
}: CreateContractDialogProps) {
  const { account, provider, signer, isConnected, connectWallet } = useWallet();
  const { user, walletAddress: userWalletAddress } = useAuth();
  const { toast } = useToast();
  
  const [amount, setAmount] = useState<string>("");
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [senderAddress, setSenderAddress] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Set the wallet addresses from props and auth state
  useEffect(() => {
    // Set recipient address from contact
    if (walletAddress) {
      setRecipientAddress(walletAddress);
    } else if (contactId) {
      // If we have contactId but no address, show an appropriate message
      setError(`${contactName || 'This contact'} doesn't have a wallet address set`);
    }
    
    // Set sender address from currently logged in user
    if (userWalletAddress) {
      setSenderAddress(userWalletAddress);
    }
  }, [walletAddress, userWalletAddress, contactId, contactName]);

  // Handle wallet connection if not already connected
  const handleConnectWallet = async () => {
    if (!isConnected) {
      try {
        const success = await connectWallet();
        if (!success) {
          setError("Failed to connect wallet. Please try again.");
        }
      } catch (err) {
        setError("Error connecting wallet: " + (err instanceof Error ? err.message : String(err)));
      }
    }
  };

  // Reset the form when dialog closes
  useEffect(() => {
    if (!open) {
      setAmount("");
      setError(null);
    }
  }, [open]);

  // Handle contract creation
  const handleCreateContract = async () => {
    if (!isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    if (!recipientAddress || !ethers.isAddress(recipientAddress)) {
      setError("Invalid recipient address. Contact may not have a wallet address set.");
      return;
    }

    if (!senderAddress || !ethers.isAddress(senderAddress)) {
      setError("Invalid sender address. Please set up your wallet in profile settings.");
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      // In a real implementation, you would:
      // 1. Create a contract on the blockchain
      // 2. Store contract details in your backend
      
      // For now, we'll simulate this with a mock API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      // For this demo, we're just using a toast notification
      toast({
        title: "Contract Created",
        description: `Contract with ${contactName || recipientAddress} for ${amount} ETH has been initiated`,
      });
      
      onOpenChange(false);
    } catch (err) {
      console.error('Contract creation failed:', err);
      setError("Failed to create contract. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Contract</DialogTitle>
          <DialogDescription>
            Create a smart contract with {contactName || "this contact"}.
          </DialogDescription>
        </DialogHeader>
        
        {!isConnected ? (
          <div className="flex flex-col items-center space-y-4 p-4">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <p className="text-center text-muted-foreground">
              You need to connect your wallet to create a contract.
            </p>
            <Button onClick={handleConnectWallet}>
              Connect Wallet
            </Button>
          </div>
        ) : (
          <>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sender">From (Your Address)</Label>
                  {!senderAddress && (
                    <span className="text-xs text-red-500">
                      Not set in your profile
                    </span>
                  )}
                </div>
                <div className="flex items-center border rounded-md p-2 bg-muted/20">
                  <Send className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm font-mono truncate">
                    {senderAddress || "No wallet address set in your profile"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your wallet address will be used as the sender
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="recipient">To ({contactName})</Label>
                  {!recipientAddress && (
                    <span className="text-xs text-red-500">
                      Contact has no wallet
                    </span>
                  )}
                </div>
                <div className="flex items-center border rounded-md p-2 bg-muted/20">
                  <Send className="h-4 w-4 mr-2 text-muted-foreground rotate-180" />
                  <span className="text-sm font-mono truncate">
                    {recipientAddress || "Contact doesn't have a wallet address set"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {contactName}'s wallet address will receive the funds
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (ETH)</Label>
                <Input 
                  id="amount"
                  type="number" 
                  placeholder="0.1" 
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  The amount of ETH to transfer in this contract
                </p>
              </div>
            </div>
            
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateContract} 
                disabled={isCreating || !amount || !senderAddress || !recipientAddress}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : "Create Contract"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}