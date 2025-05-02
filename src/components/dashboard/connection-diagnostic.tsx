'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { socketService } from '@/lib/socket';
import { useToast } from '@/hooks/use-toast';
import { Wallet } from 'lucide-react';

export default function ConnectionDiagnostic() {
    const [status, setStatus] = useState({
        connected: false,
        socketId: null as string | null,
        transport: null as string | null,
        timestamp: new Date().toISOString(),
    });
    const [walletStatus, setWalletStatus] = useState({
        connected: false,
        address: null as string | null,
    });
    const { toast } = useToast();

    // Check if MetaMask is installed
    const isMetaMaskInstalled = typeof window !== 'undefined' && window.ethereum !== undefined;

    // Update status periodically
    useEffect(() => {
        const updateStatus = () => {
            const isConnected = socketService.isConnected();
            setStatus({
                connected: isConnected,
                socketId: socketService.getSocketId(),
                transport: socketService.getTransport(),
                timestamp: new Date().toISOString(),
            });
        };
        
        // Update immediately
        updateStatus();
        
        // Then update every 3 seconds
        const interval = setInterval(updateStatus, 3000);
        
        return () => clearInterval(interval);
    }, []);

    // Check if wallet is already connected on component mount
    useEffect(() => {
        const checkWalletConnection = async () => {
            if (isMetaMaskInstalled) {
                try {
                    // Check if we're already connected
                    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                    if (accounts.length > 0) {
                        setWalletStatus({
                            connected: true,
                            address: accounts[0],
                        });
                    }
                } catch (error) {
                    console.error("Error checking wallet connection:", error);
                }
            }
        };

        checkWalletConnection();
    }, [isMetaMaskInstalled]);

    // Handle MetaMask events
    useEffect(() => {
        if (!isMetaMaskInstalled) return;

        const handleAccountsChanged = (accounts: string[]) => {
            if (accounts.length === 0) {
                // User disconnected wallet
                setWalletStatus({
                    connected: false,
                    address: null,
                });
                toast({
                    title: "Wallet Disconnected",
                    description: "Your wallet has been disconnected",
                });
            } else {
                // User switched accounts
                setWalletStatus({
                    connected: true,
                    address: accounts[0],
                });
            }
        };

        window.ethereum.on('accountsChanged', handleAccountsChanged);
        
        // Clean up event listener
        return () => {
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        };
    }, [isMetaMaskInstalled, toast]);

    const handleForceReconnect = () => {
        toast({
            title: "Reconnecting...",
            description: "Forcing WebSocket reconnection",
        });
        socketService.forceReconnect();
    };

    const handleConnectWallet = async () => {
        if (!isMetaMaskInstalled) {
            toast({
                title: "MetaMask Not Installed",
                description: "Please install MetaMask browser extension to connect your wallet",
                variant: "destructive",
            });
            window.open('https://metamask.io/download/', '_blank');
            return;
        }

        try {
            // Request accounts from MetaMask
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const userAddress = accounts[0];

            setWalletStatus({
                connected: true,
                address: userAddress,
            });

            toast({
                title: "Wallet Connected",
                description: `Connected: ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`,
            });
            
            // In a production app, you might want to store this address in your user profile
            // This would be handled by an API call to your backend
        } catch (error) {
            console.error("Error connecting wallet:", error);
            toast({
                title: "Connection Failed",
                description: "Failed to connect to wallet. Please try again.",
                variant: "destructive",
            });
        }
    };

    return (
        <Card className="mb-6">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span>Connection Status</span>
                    <Badge 
                        variant={status.connected ? "default" : "destructive"}
                        className="ml-2"
                    >
                        {status.connected ? "Connected" : "Disconnected"}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
                <div className="grid grid-cols-3 gap-2">
                    <div>
                        <span className="font-semibold">Socket ID:</span>
                    </div>
                    <div className="col-span-2 truncate">
                        {status.socketId || 'None'}
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <div>
                        <span className="font-semibold">Transport:</span>
                    </div>
                    <div className="col-span-2">
                        {status.transport === 'websocket' ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                WebSocket
                            </Badge>
                        ) : status.transport === 'polling' ? (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                HTTP Polling
                            </Badge>
                        ) : (
                            'Unknown'
                        )}
                    </div>
                </div>
                {/* Wallet Connection Status */}
                <div className="grid grid-cols-3 gap-2">
                    <div>
                        <span className="font-semibold">Wallet:</span>
                    </div>
                    <div className="col-span-2">
                        {walletStatus.connected ? (
                            <div className="flex items-center">
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mr-1">
                                    Connected
                                </Badge>
                                <span className="text-xs truncate">
                                    {walletStatus.address ? 
                                        `${walletStatus.address.slice(0, 6)}...${walletStatus.address.slice(-4)}` : 
                                        'Unknown'}
                                </span>
                            </div>
                        ) : (
                            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                                Not Connected
                            </Badge>
                        )}
                    </div>
                </div>
                <div className="pt-2 space-y-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleForceReconnect}
                        className="w-full text-xs"
                    >
                        Force WebSocket Reconnection
                    </Button>
                    
                    <Button 
                        variant={walletStatus.connected ? "outline" : "default"}
                        size="sm" 
                        onClick={handleConnectWallet}
                        className="w-full text-xs"
                    >
                        <Wallet className="mr-2 h-4 w-4" />
                        {walletStatus.connected ? 'Reconnect Wallet' : 'Connect Wallet'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}