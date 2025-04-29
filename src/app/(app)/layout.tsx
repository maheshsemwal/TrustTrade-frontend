// src/app/(app)/layout.tsx
import type { PropsWithChildren } from 'react';

// This layout wrapper can be used for shared elements within the authenticated part of the app
// For now, it just renders children, but could include a sidebar, specific headers/footers, etc.
export default function AppLayout({ children }: PropsWithChildren) {
  return (
    <>
      {/* Potential for a sidebar or other app-specific layout elements here */}
      {children}
    </>
  );
}
