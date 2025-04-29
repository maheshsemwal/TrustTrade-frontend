import Link from 'next/link';
import { Twitter, Linkedin, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="py-6 md:px-8 md:py-0 border-t border-border/40 bg-background/95">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-20 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          Built by TrustTrade Team. © {new Date().getFullYear()} All rights reserved.
        </p>
        <div className="flex items-center space-x-4">
          <Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link>
          <Link href="/terms-of-service" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</Link>
          <div className="flex items-center space-x-2">
             <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
               <Twitter className="h-5 w-5" />
               <span className="sr-only">Twitter</span>
            </a>
             <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
               <Linkedin className="h-5 w-5" />
               <span className="sr-only">LinkedIn</span>
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
