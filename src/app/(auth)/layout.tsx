import type { Metadata } from 'next';

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
    <div className="flex h-screen items-center justify-center bg-background">
      {children}
    </div>
  );
}