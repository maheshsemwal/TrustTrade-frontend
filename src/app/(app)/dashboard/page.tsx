// src/app/(app)/dashboard/page.tsx
"use client"; // Mark as client component for state and hooks

import { useState, useEffect } from 'react';
import { BuyerView } from '@/components/dashboard/buyer-view';
import { SellerView } from '@/components/dashboard/seller-view';
import { ArbitratorView } from '@/components/dashboard/arbitrator-view';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShieldCheck, ShoppingBag, Scale } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

type UserRole = 'buyer' | 'seller' | 'arbitrator' | null;

export default function DashboardPage() {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string | null>(null); // Example state for connected wallet

  // Mock function to get user role based on wallet address (replace with actual logic)
  const fetchUserRole = async (address: string): Promise<UserRole> => {
    console.log("Fetching role for:", address); // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    // Example: Determine role based on address or a stored profile
    if (address.endsWith('abc')) return 'buyer';
    if (address.endsWith('def')) return 'seller';
    if (address.endsWith('ghi')) return 'arbitrator';
    return null; // Or default to buyer/seller
  };

   // Simulate wallet connection check
   useEffect(() => {
    // Replace with actual Web3 wallet connection check
    const checkWallet = async () => {
        // Mock: Assume wallet is connected after a delay
        await new Promise(resolve => setTimeout(resolve, 500));
        const connectedAddress = '0x123...abc'; // Replace with actual connected address if available
        setWalletAddress(connectedAddress);

        if (connectedAddress) {
            const role = await fetchUserRole(connectedAddress);
            setUserRole(role);
        }
        setIsLoading(false);
    };
    checkWallet();
   }, []);


  // Function to manually switch roles for demo purposes
  const handleRoleChange = (role: UserRole) => {
    setUserRole(role);
  }

  const renderDashboardContent = () => {
    if (isLoading) {
      return <DashboardSkeleton />;
    }

    if (!walletAddress) {
        return (
             <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Connect Wallet</CardTitle>
                    <CardDescription>Please connect your wallet to access the dashboard.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button>Connect Wallet</Button> {/* Add connect functionality */}
                </CardContent>
            </Card>
        )
    }


    switch (userRole) {
      case 'buyer':
        return <BuyerView />;
      case 'seller':
        return <SellerView />;
      case 'arbitrator':
        return <ArbitratorView />;
      default:
        // Render a role selection or default view if role is null/unknown
        return (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Welcome to TrustTrade</CardTitle>
              <CardDescription>Select your primary role or complete your profile.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Maybe show profile setup prompt */}
              <p className="text-muted-foreground">Could not determine role based on connected wallet.</p>
               {/* Temporary Role Selector for Demo */}
               <div className="mt-4 flex gap-2">
                <Button onClick={() => handleRoleChange('buyer')} variant="outline"><ShoppingBag className="mr-2 h-4 w-4"/> I'm a Buyer</Button>
                <Button onClick={() => handleRoleChange('seller')} variant="outline"><ShieldCheck className="mr-2 h-4 w-4"/> I'm a Seller</Button>
                <Button onClick={() => handleRoleChange('arbitrator')} variant="outline"><Scale className="mr-2 h-4 w-4"/> I'm an Arbitrator</Button>
               </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
         {/* Role Switcher (For Demo / Dev purposes) */}
         {walletAddress && !isLoading && (
           <Select onValueChange={(value: UserRole) => handleRoleChange(value)} value={userRole ?? ''}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Switch Role (Dev)" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="buyer">Buyer</SelectItem>
                <SelectItem value="seller">Seller</SelectItem>
                <SelectItem value="arbitrator">Arbitrator</SelectItem>
            </SelectContent>
            </Select>
         )}

      </div>
      {renderDashboardContent()}
    </div>
  );
}

// Loading Skeleton Component
const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
     <Card>
      <CardHeader>
        <Skeleton className="h-6 w-1/4 mb-2" />
         <Skeleton className="h-4 w-1/3" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </CardContent>
    </Card>
  </div>
);
