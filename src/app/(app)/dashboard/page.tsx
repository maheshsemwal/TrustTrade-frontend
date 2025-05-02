// src/app/(app)/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {BuyerView} from '@/components/dashboard/buyer-view';
import {SellerView} from '@/components/dashboard/seller-view';
import {ArbitratorView} from '@/components/dashboard/arbitrator-view';
import { useAuth } from '@/hooks/use-auth';
import DirectMessages from '@/components/dashboard/direct-messages';
import ConnectionDiagnostic from '@/components/dashboard/connection-diagnostic';

type UserRole = 'buyer' | 'seller' | 'arbitrator' | null;

export default function DashboardPage() {
  const { userType } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      {/* Connection Diagnostic */}
      <ConnectionDiagnostic />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {userType === 'buyer' && <BuyerView />}
          {userType === 'seller' && <SellerView />}
          {userType === 'arbitrator' && <ArbitratorView />}
          {!userType && (
            <div className="bg-muted p-8 rounded-lg text-center">
              <h2 className="text-xl font-semibold">Welcome!</h2>
              <p className="mt-2">Please set up your account type to continue.</p>
            </div>
          )}
        </div>
        
        <div className="md:col-span-1">
          <DirectMessages />
        </div>
      </div>
    </div>
  );
}
