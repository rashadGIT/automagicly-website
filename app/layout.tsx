import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { validateEnvironmentVariables } from '@/lib/env-validator';

// Validate environment variables on server startup
// This prevents the app from running with missing configuration
// Skip during build phase and in Amplify Lambda environment
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';
const isAmplifyLambda = process.env.AWS_EXECUTION_ENV?.startsWith('AWS_Lambda');
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test' && !isBuildPhase && !isAmplifyLambda) {
  validateEnvironmentVariables();
}

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AutoMagicly | AI Automation That Saves Hours Every Week',
  description: 'We design and implement AI-powered workflows that handle repetitive tasks across email, CRM, documents, scheduling, and reporting - so your team can focus on customers.',
  keywords: 'AI automation, workflow automation, business automation, process automation, AI workflows',
  authors: [{ name: 'AutoMagicly' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
