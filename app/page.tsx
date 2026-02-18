import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import ComponentSkeleton from '@/components/ComponentSkeleton';

// Lazy load below-the-fold components for better performance
const SocialProof = dynamic(() => import('@/components/SocialProof'), {
  loading: () => <ComponentSkeleton />,
});

const WhatWeDo = dynamic(() => import('@/components/WhatWeDo'), {
  loading: () => <ComponentSkeleton />,
});

const AuditSection = dynamic(() => import('@/components/AuditSection'), {
  loading: () => <ComponentSkeleton />,
});

const ROICalculator = dynamic(() => import('@/components/ROICalculator'), {
  loading: () => <ComponentSkeleton />,
});

const ExampleAutomations = dynamic(() => import('@/components/ExampleAutomations'), {
  loading: () => <ComponentSkeleton />,
});

const Services = dynamic(() => import('@/components/Services'), {
  loading: () => <ComponentSkeleton />,
});

const HowItWorks = dynamic(() => import('@/components/HowItWorks'), {
  loading: () => <ComponentSkeleton />,
});

const FAQ = dynamic(() => import('@/components/FAQ'), {
  loading: () => <ComponentSkeleton />,
});

const Reviews = dynamic(() => import('@/components/Reviews'), {
  loading: () => <ComponentSkeleton />,
});

const Referrals = dynamic(() => import('@/components/Referrals'), {
  loading: () => <ComponentSkeleton />,
});

const ComingSoon = dynamic(() => import('@/components/ComingSoon'), {
  loading: () => <ComponentSkeleton />,
});

const Footer = dynamic(() => import('@/components/Footer'), {
  loading: () => <ComponentSkeleton />,
});

const StatsBar = dynamic(() => import('@/components/StatsBar'), {
  loading: () => <ComponentSkeleton />,
});

const StickyAuditCTA = dynamic(() => import('@/components/StickyAuditCTA'), {
  loading: () => null,
});

// Chat widget - load on demand
const ChatWidget = dynamic(() => import('@/components/ChatWidget'), {
  loading: () => null, // No loader for chat widget
});

export const metadata = {
  title: 'AutoMagicly | AI Automation That Saves Hours Every Week',
  description: 'We design and implement AI-powered workflows that handle repetitive tasks across email, CRM, documents, scheduling, and reporting - so your team can focus on customers.',
};

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Hero />
      <SocialProof />
      <StatsBar />
      <WhatWeDo />
      <ErrorBoundary>
        <AuditSection />
      </ErrorBoundary>
      <ROICalculator />
      <ExampleAutomations />
      <Services />
      <HowItWorks />
      <FAQ />
      <ErrorBoundary>
        <Reviews />
      </ErrorBoundary>
      <Referrals />
      <ComingSoon />
      <Footer />
      <StickyAuditCTA />
      <ErrorBoundary>
        <ChatWidget />
      </ErrorBoundary>
    </main>
  );
}
