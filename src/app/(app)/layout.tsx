// src/app/(app)/layout.tsx
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import type { PropsWithChildren } from 'react';

// This layout wrapper provides shared elements within the authenticated part of the app
export default function AppLayout({ children }: PropsWithChildren) {
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
