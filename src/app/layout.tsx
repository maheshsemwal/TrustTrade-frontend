import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans'; // Use specific import
import './globals.css';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider'; // Import ThemeProvider
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

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
            {/* Navbar will be added in child layouts */}
            <main className="flex-1">{children}</main>
          </div>
          <Toaster /> {/* Add Toaster for notifications */}
        </ThemeProvider>
      </body>
    </html>
  );
}
