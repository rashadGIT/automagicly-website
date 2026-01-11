'use client';

import { SessionProvider } from 'next-auth/react';
import { useEffect } from 'react';
import { initRUM } from '@/lib/rum-config';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize CloudWatch RUM on client-side
    if (typeof window !== 'undefined') {
      initRUM();
    }
  }, []);

  return <SessionProvider>{children}</SessionProvider>;
}
