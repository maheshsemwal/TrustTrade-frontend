"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/theme-toggle';
import { Wallet, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';

export default function Header() {
  const [isConnected, setIsConnected] = useState(false); // Mock wallet connection state
  const [walletAddress, setWalletAddress] = useState(''); // Mock wallet address
  const { isAuthenticated, user, logout } = useAuth();

  const handleConnectWallet = () => {
    // Mock wallet connection logic
    setIsConnected(true);
    setWalletAddress('0x123...abc'); // Mock address
  };

  const handleDisconnectWallet = () => {
    // Mock wallet disconnection logic
    setIsConnected(false);
    setWalletAddress('');
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            {/* Replace with Logo if available */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M12 2l3.09 6.3 6.91.99-5 4.86 1.18 6.86L12 17.25l-6.18 3.76 1.18-6.86-5-4.86 6.91-.99L12 2z"/></svg>
            <span className="font-bold">TrustTrade</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/disputes">Disputes</Link>
            <Link href="/arbitration">Arbitration</Link>
            <Link href="/leaderboard">Leaderboard</Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <User className="mr-2 h-4 w-4" />
                  {user?.username || 'Account'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}

          {isConnected ? (
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Wallet className="mr-2 h-4 w-4" />
                  {walletAddress.substring(0, 5)}...{walletAddress.substring(walletAddress.length - 3)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  Balance: {/* Add balance logic here */} ETH
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDisconnectWallet}>
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={handleConnectWallet} size="sm">
              <Wallet className="mr-2 h-4 w-4" /> Connect Wallet
            </Button>
          )}
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}

// Add necessary imports if not already present
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
