import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

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
      <body className={inter.className}>{children}</body>
    </html>
  );
}
