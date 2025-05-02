// src/app/(app)/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import type { PropsWithChildren } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { socketService } from '@/lib/socket';

// This layout wrapper provides shared elements within the authenticated part of the app
// and ensures that only authenticated users can access these routes
export default function AppLayout({ children }: PropsWithChildren) {
  const { isAuthenticated, loading, token } = useAuth();
  const router = useRouter();
  
  // Protect all routes under the (app) group
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Initialize WebSocket connection for authenticated users
  useEffect(() => {
    if (isAuthenticated && token) {
      // Initialize socket connection
      socketService.initialize();
      
      // Cleanup socket connection on unmount
      return () => {
        socketService.disconnect();
      };
    }
  }, [isAuthenticated, token]);

  // Show nothing while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Render app layout once authenticated
  return (
    <>
      <Header />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        {children}
      </div>
      <Footer />
    </>
  );
}
