import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans'; // Use specific import
import './globals.css';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider'; // Import ThemeProvider
import { Toaster } from "@/components/ui/toaster"; // Import Toaster
import Link from 'next/link';
import { ModeToggle } from '@/components/theme-toggle';

export const metadata: Metadata = {
  title: 'TrustTrade UI',
  description: 'Fast, Fair, Decentralized B2B Dispute Resolution',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          GeistSans.variable // Apply font variable directly
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark" // Default to dark theme
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            {/* Navbar with Logo and Theme Toggle */}
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-14 items-center justify-between">
                <div className="flex items-center">
                  <Link href="/" className="flex items-center space-x-2">
                    {/* TrustTrade Logo */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
                      <path d="M12 2l3.09 6.3 6.91.99-5 4.86 1.18 6.86L12 17.25l-6.18 3.76 1.18-6.86-5-4.86 6.91-.99L12 2z"/>
                    </svg>
                    <span className="font-bold text-lg">TrustTrade</span>
                  </Link>
                </div>
                <div className="flex items-center space-x-2">
                  <ModeToggle />
                </div>
              </div>
            </header>
            <main className="flex-1">{children}</main>
          </div>
          <Toaster /> {/* Add Toaster for notifications */}
        </ThemeProvider>
      </body>
    </html>
  );
}
