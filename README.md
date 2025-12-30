# AutoMagicly Landing Page

A production-ready, conversion-focused landing page for AutoMagicly, an AI automation agency. Built with Next.js, React, TypeScript, and Tailwind CSS.

## Features

- **Mobile-first responsive design**
- **Conversion-optimized layout** with clear CTAs
- **Interactive ROI Calculator** to demonstrate value
- **AI Chat Widget** with built-in guardrails (no pricing/proposals)
- **Calendly Integration** for booking AI Audits
- **n8n Webhook Integration** for all forms and chat
- **Reviews & Referrals System** with moderation
- **Coming Soon / Waitlist** for future products
- **No fake content** - all copy is professional and real

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Font**: Inter (Google Fonts)
- **Integrations**: n8n webhooks, Calendly

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- A Calendly account (for booking integration)
- An n8n instance (optional, for webhook integrations)

### Installation

1. **Clone the repository**
   ```bash
   cd /path/to/autoMagicly
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your actual values:
   ```env
   # n8n Webhook URLs (Public - Frontend)
   NEXT_PUBLIC_N8N_AUDIT_WEBHOOK_URL=https://your-n8n-instance.com/webhook/audit
   NEXT_PUBLIC_N8N_REVIEWS_WEBHOOK_URL=https://your-n8n-instance.com/webhook/reviews
   NEXT_PUBLIC_N8N_REFERRALS_WEBHOOK_URL=https://your-n8n-instance.com/webhook/referrals
   NEXT_PUBLIC_N8N_WAITLIST_WEBHOOK_URL=https://your-n8n-instance.com/webhook/waitlist

   # Calendly URL (Public - Frontend)
   NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/your-handle/ai-audit

   # n8n Chat Webhook (Server-only - Backend)
   N8N_CHAT_WEBHOOK_URL=https://your-n8n-instance.com/webhook/chat
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
autoMagicly/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # Chat API endpoint with guardrails
│   ├── globals.css               # Global styles and Tailwind imports
│   ├── layout.tsx                # Root layout with metadata
│   └── page.tsx                  # Main landing page
├── components/
│   ├── Header.tsx                # Sticky navigation header
│   ├── Hero.tsx                  # Hero section with CTAs
│   ├── WhatWeDo.tsx              # Services overview
│   ├── ROICalculator.tsx         # Interactive ROI calculator
│   ├── ExampleAutomations.tsx    # Use-case grid
│   ├── Services.tsx              # Service options (Partnership vs One-Off)
│   ├── HowItWorks.tsx            # Process steps
│   ├── CalendlyBooking.tsx       # Calendly embed + fallback form
│   ├── ChatWidget.tsx            # AI chat widget
│   ├── FAQ.tsx                   # Frequently asked questions
│   ├── Reviews.tsx               # Review submission and display
│   ├── Referrals.tsx             # Referral submission form
│   ├── ComingSoon.tsx            # Coming soon + waitlist
│   └── Footer.tsx                # Footer with links and CTA
├── lib/
│   ├── types.ts                  # TypeScript type definitions
│   └── utils.ts                  # Utility functions
├── .env.example                  # Example environment variables
├── package.json                  # Dependencies and scripts
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # This file
```

## Integration Guide

### Calendly Setup

1. Create a Calendly event type for "AI Audit" (30-minute call)
2. Connect your Google Calendar to Calendly for availability
3. Copy your Calendly event URL (e.g., `https://calendly.com/your-handle/ai-audit`)
4. Add it to `.env.local` as `NEXT_PUBLIC_CALENDLY_URL`

### n8n Webhook Setup

The site supports 5 webhook integrations. Each can be configured independently in n8n:

#### 1. AI Audit Booking (Fallback Form)
- **Webhook**: `NEXT_PUBLIC_N8N_AUDIT_WEBHOOK_URL`
- **Payload**:
  ```json
  {
    "source": "automagicly-website",
    "submittedAt": "2024-01-15T10:30:00.000Z",
    "name": "John Doe",
    "email": "john@example.com",
    "company": "Acme Corp",
    "biggestTimeWaster": "Manual invoice processing",
    "tools": ["Google Workspace", "QuickBooks"],
    "preferredContact": "email"
  }
  ```

#### 2. Reviews
- **Webhook**: `NEXT_PUBLIC_N8N_REVIEWS_WEBHOOK_URL`
- **Payload**:
  ```json
  {
    "source": "automagicly-website",
    "submittedAt": "2024-01-15T10:30:00.000Z",
    "name": "Jane Smith",
    "company": "ABC Inc",
    "rating": 5,
    "reviewText": "Great service!",
    "serviceType": "AI Partnership"
  }
  ```

#### 3. Referrals
- **Webhook**: `NEXT_PUBLIC_N8N_REFERRALS_WEBHOOK_URL`
- **Payload**:
  ```json
  {
    "source": "automagicly-website",
    "submittedAt": "2024-01-15T10:30:00.000Z",
    "yourName": "Bob Jones",
    "yourEmail": "bob@example.com",
    "referralName": "Alice Brown",
    "referralContact": "alice@example.com",
    "referralCompany": "XYZ Corp",
    "helpNeeded": "Need automation for invoicing"
  }
  ```

#### 4. Waitlist
- **Webhook**: `NEXT_PUBLIC_N8N_WAITLIST_WEBHOOK_URL`
- **Payload**:
  ```json
  {
    "source": "automagicly-website",
    "submittedAt": "2024-01-15T10:30:00.000Z",
    "email": "user@example.com",
    "interest": "business-in-a-box"
  }
  ```

#### 5. Chat (Server-side only)
- **Webhook**: `N8N_CHAT_WEBHOOK_URL` (no `NEXT_PUBLIC_` prefix)
- **Request Payload**:
  ```json
  {
    "source": "automagicly-website",
    "submittedAt": "2024-01-15T10:30:00.000Z",
    "sessionId": "session_1705315800000_abc123",
    "message": "What can you automate?"
  }
  ```
- **Expected Response**:
  ```json
  {
    "reply": "We can automate tasks like...",
    "blocked": false
  }
  ```
- **Blocked Response** (for pricing requests):
  ```json
  {
    "reply": "I can't provide pricing...",
    "blocked": true,
    "reason": "pricing_request"
  }
  ```

### Demo Mode (No Webhooks)

If you don't configure webhook URLs, the site will work in demo mode:
- Forms will show success messages without sending data
- Reviews and referrals are stored in `localStorage`
- Chat will return a default response

## Chat Guardrails

The chat widget has strict guardrails to prevent it from providing pricing or proposals:

1. **Client-side guard**: Detects pricing keywords before sending to server
2. **Server-side guard**: Double-checks before calling n8n
3. **Rate limiting**: 10 messages per minute per session
4. **Profanity filter**: Basic filtering for inappropriate content

**Chat will refuse to answer**:
- Pricing questions
- Custom quotes
- Detailed proposals
- Guaranteed results

**Chat will answer**:
- General service questions
- How the AI Audit works
- Tool integrations
- Typical timelines
- Security principles

## Building for Production

```bash
npm run build
npm start
```

Or deploy to Vercel:

```bash
vercel deploy
```

## Customization

### Changing Headlines

The Hero component includes 5 headline options in code comments. To use a different one:

1. Open `components/Hero.tsx`
2. Find the commented headlines
3. Replace the active headline with your preferred option

### Modifying the ROI Calculator

Edit `components/ROICalculator.tsx`:
- `commonTasks`: List of task options
- `buildCostPresets`: Low/Medium/High complexity costs
- Default values: `timePerTask`, `timesPerWeek`, `hourlyCost`, `efficiencyGain`

### Adding Approved Reviews

Reviews are moderated by default. To display approved reviews:

1. Open `components/Reviews.tsx`
2. Add hardcoded reviews to the "Approved Reviews" section
3. Remove the empty state

## Environment Variables Reference

| Variable | Required | Type | Description |
|----------|----------|------|-------------|
| `NEXT_PUBLIC_N8N_AUDIT_WEBHOOK_URL` | No | Public | Webhook for AI Audit fallback form |
| `NEXT_PUBLIC_N8N_REVIEWS_WEBHOOK_URL` | No | Public | Webhook for review submissions |
| `NEXT_PUBLIC_N8N_REFERRALS_WEBHOOK_URL` | No | Public | Webhook for referral submissions |
| `NEXT_PUBLIC_N8N_WAITLIST_WEBHOOK_URL` | No | Public | Webhook for waitlist signups |
| `NEXT_PUBLIC_CALENDLY_URL` | Yes | Public | Calendly event URL for AI Audit |
| `N8N_CHAT_WEBHOOK_URL` | No | Server | Webhook for chat (server-side only) |

## License

All rights reserved. This is proprietary software for AutoMagicly.

## Support

For questions or issues, contact: hello@automagicly.com

