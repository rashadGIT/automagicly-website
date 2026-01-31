// JSON-LD Structured Data for SEO
// This helps search engines understand your business and display rich snippets

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://automagicly.com';

// Organization Schema
export function OrganizationJsonLd() {
  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AutoMagicly',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description:
      'We design and implement AI-powered workflows that handle repetitive tasks across email, CRM, documents, scheduling, and reporting.',
    foundingDate: '2024',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      url: `${siteUrl}/#booking`,
    },
    sameAs: [
      // Add your social media profiles
      // 'https://twitter.com/automagicly',
      // 'https://linkedin.com/company/automagicly',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      suppressHydrationWarning
    />
  );
}

// Local Business Schema (if you serve specific areas)
export function LocalBusinessJsonLd() {
  const businessData = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'AutoMagicly',
    url: siteUrl,
    description:
      'AI automation consulting and implementation services for small and medium businesses.',
    priceRange: '$$',
    image: `${siteUrl}/og-image.png`,
    serviceType: [
      'AI Automation',
      'Workflow Automation',
      'Business Process Automation',
      'AI Consulting',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(businessData) }}
      suppressHydrationWarning
    />
  );
}

// Service Schema
export function ServiceJsonLd() {
  const serviceData = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'AI Automation Services',
    provider: {
      '@type': 'Organization',
      name: 'AutoMagicly',
      url: siteUrl,
    },
    description:
      'Custom AI-powered workflow automation that handles repetitive tasks across email, CRM, documents, scheduling, and reporting.',
    offers: [
      {
        '@type': 'Offer',
        name: 'AI Partnership (Full Service)',
        description:
          'Ongoing automation support with continuous improvements, monitoring, and monthly roadmap.',
      },
      {
        '@type': 'Offer',
        name: 'Simple Workflow Automation',
        description:
          'Build a single workflow end-to-end with training and handoff documentation.',
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceData) }}
      suppressHydrationWarning
    />
  );
}

// FAQ Schema (helps with rich snippets)
export function FAQJsonLd() {
  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is AI automation?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'AI automation uses artificial intelligence to handle repetitive business tasks automatically, such as email responses, data entry, scheduling, and reporting.',
        },
      },
      {
        '@type': 'Question',
        name: 'How long does it take to implement automation?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Simple workflows can be deployed in days. More complex automation projects typically take 2-4 weeks depending on the scope.',
        },
      },
      {
        '@type': 'Question',
        name: 'What tasks can be automated?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Common automations include lead follow-up, invoice processing, appointment scheduling, customer support FAQs, weekly reporting, and document processing.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do I need technical knowledge to use the automations?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. We handle all the technical implementation and provide training so your team can use and manage the workflows confidently.',
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
      suppressHydrationWarning
    />
  );
}

// WebSite Schema with SearchAction (for sitelinks search box)
export function WebSiteJsonLd() {
  const websiteData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AutoMagicly',
    url: siteUrl,
    description: 'AI Automation That Saves Hours Every Week',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
      suppressHydrationWarning
    />
  );
}

// Combined component for all JSON-LD schemas
// Rendered inside <head> in layout.tsx
export default function JsonLd() {
  return (
    <>
      <OrganizationJsonLd />
      <LocalBusinessJsonLd />
      <ServiceJsonLd />
      <FAQJsonLd />
      <WebSiteJsonLd />
    </>
  );
}
