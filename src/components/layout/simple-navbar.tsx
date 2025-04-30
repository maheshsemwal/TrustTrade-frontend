"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/theme-toggle';

export default function SimpleNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            {/* TrustTrade Logo */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
              <path d="M12 2l3.09 6.3 6.91.99-5 4.86 1.18 6.86L12 17.25l-6.18 3.76 1.18-6.86-5-4.86 6.91-.99L12 2z"/>
            </svg>
            <span className="font-bold text-lg">TrustTrade</span>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/login">
            <Button variant="outline" size="sm">Sign In</Button>
          </Link>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}