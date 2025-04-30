'use client';

import { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Wallet, Mail } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Handle Email Login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        email,
        password,
      });

      alert(`Welcome ${res.data.user.username}`);
      // Store token or handle further actions here
    } catch (err) {
      alert(err.response?.data?.msg || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle MetaMask Login
  const handleMetaMaskLogin = async () => {
    if (!window.ethereum) {
      alert('MetaMask is not installed');
      return;
    }

    try {
      setLoading(true);

      // Request user accounts from MetaMask
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Get the first account address
      const userAddress = accounts[0];

      // Update state with the user's address
      setAddress(userAddress);

      // Send the MetaMask address to the backend for authentication
      const response = await axios.post(`${BACKEND_URL}/api/auth/wallet-login`, {
        walletAddress: userAddress,
      });

      alert(`Logged in successfully! Address: ${userAddress}`);
    } catch (error) {
      console.error(error);
      alert('MetaMask login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full px-4">
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Sign in to your TrustTrade account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              <Mail className="mr-2 h-4 w-4" />
              {loading ? 'Logging in...' : 'Login with Email'}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button
            onClick={handleMetaMaskLogin}
            disabled={loading}
            variant="outline"
            className="w-full bg-[#f6851b]/10 hover:bg-[#f6851b]/20 text-[#f6851b] hover:text-[#f6851b]"
          >
            <Wallet className="mr-2 h-4 w-4" />
            {loading ? 'Connecting...' : 'Login with MetaMask'}
          </Button>

          {/* Display MetaMask Address */}
          {address && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Connected with: {address.slice(0, 6)}...{address.slice(-4)}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="text-sm text-center text-muted-foreground mt-2">
            Don't have an account?{' '}
            <Link href="/signup" className="text-primary underline-offset-4 hover:underline">
              Sign up
            </Link>
          </div>
          <div className="text-sm text-center text-muted-foreground mt-2">
            <Link href="/" className="text-primary underline-offset-4 hover:underline">
              Back to home
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}