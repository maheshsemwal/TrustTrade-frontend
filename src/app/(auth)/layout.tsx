import type { Metadata } from 'next';
import SimpleNavbar from '@/components/layout/simple-navbar';

export const metadata: Metadata = {
  title: 'TrustTrade - Authentication',
  description: 'Login or sign up to TrustTrade',
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col h-screen bg-background">
      <SimpleNavbar />
      <div className="flex-1 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}