import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { validateEnvironmentVariables } from '@/lib/env-validator';
import JsonLd from '@/components/JsonLd';

// Validate environment variables on server startup
// This prevents the app from running with missing configuration
// Skip during build phase and in Amplify Lambda environment
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';
const isAmplifyLambda = process.env.AWS_EXECUTION_ENV?.startsWith('AWS_Lambda');
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test' && !isBuildPhase && !isAmplifyLambda) {
  validateEnvironmentVariables();
}

const inter = Inter({ subsets: ['latin'] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://automagicly.com';

export const metadata: Metadata = {
  // Basic metadata
  title: {
    default: 'AutoMagicly | AI Automation That Saves Hours Every Week',
    template: '%s | AutoMagicly',
  },
  description: 'We design and implement AI-powered workflows that handle repetitive tasks across email, CRM, documents, scheduling, and reporting - so your team can focus on customers.',
  keywords: [
    'AI automation',
    'workflow automation',
    'business automation',
    'process automation',
    'AI workflows',
    'task automation',
    'small business automation',
    'AI consulting',
    'n8n automation',
    'zapier alternative',
    'business process automation',
    'automate repetitive tasks',
  ],
  authors: [{ name: 'AutoMagicly' }],
  creator: 'AutoMagicly',
  publisher: 'AutoMagicly',

  // Canonical URL
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
  },

  // Open Graph (Facebook, LinkedIn, etc.)
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'AutoMagicly',
    title: 'AutoMagicly | AI Automation That Saves Hours Every Week',
    description: 'We design and implement AI-powered workflows that handle repetitive tasks across email, CRM, documents, scheduling, and reporting - so your team can focus on customers.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AutoMagicly - AI Automation for Business',
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'AutoMagicly | AI Automation That Saves Hours Every Week',
    description: 'AI-powered workflows that handle repetitive tasks so your team can focus on customers.',
    images: ['/og-image.png'],
    creator: '@automagicly',
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Icons
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },

  // Verification (add your IDs when you have them)
  // verification: {
  //   google: 'your-google-verification-code',
  //   yandex: 'your-yandex-verification-code',
  // },

  // Category
  category: 'technology',
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
      <head>
        <JsonLd />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
