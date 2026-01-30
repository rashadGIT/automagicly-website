import Header from '@/components/Header';
import Hero from '@/components/Hero';
import WhatWeDo from '@/components/WhatWeDo';
import AuditSection from '@/components/AuditSection';
import ROICalculator from '@/components/ROICalculator';
import ExampleAutomations from '@/components/ExampleAutomations';
import Services from '@/components/Services';
import HowItWorks from '@/components/HowItWorks';
import ChatWidget from '@/components/ChatWidget';
import FAQ from '@/components/FAQ';
import Reviews from '@/components/Reviews';
import Referrals from '@/components/Referrals';
import ComingSoon from '@/components/ComingSoon';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'AutoMagicly | AI Automation That Saves Hours Every Week',
  description: 'We design and implement AI-powered workflows that handle repetitive tasks across email, CRM, documents, scheduling, and reporting - so your team can focus on customers.',
};

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Hero />
      <WhatWeDo />
      <AuditSection />
      <ROICalculator />
      <ExampleAutomations />
      <Services />
      <HowItWorks />
      <FAQ />
      <Reviews />
      <Referrals />
      <ComingSoon />
      <Footer />
      <ChatWidget />
    </main>
  );
}
