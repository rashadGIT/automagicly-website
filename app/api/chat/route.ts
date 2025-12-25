import { NextRequest, NextResponse } from 'next/server';
import { isPricingRequest, containsProfanity } from '@/lib/utils';

const N8N_CHAT_WEBHOOK_URL = process.env.N8N_CHAT_WEBHOOK_URL;

// Simple in-memory rate limiting (for production, use Redis or similar)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 messages per minute

function checkRateLimit(sessionId: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(sessionId) || [];

  // Filter out timestamps outside the window
  const recentTimestamps = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW);

  if (recentTimestamps.length >= RATE_LIMIT_MAX) {
    return false; // Rate limit exceeded
  }

  recentTimestamps.push(now);
  rateLimitMap.set(sessionId, recentTimestamps);
  return true;
}

function getPricingRefusalMessage(): string {
  return "I can't provide pricing or custom quotes through chat. Each automation is different, and pricing depends on your specific needs and workflow complexity.\n\nTo get accurate information, I recommend scheduling a Free AI Audit where we'll:\n\n• Review your specific workflows\n• Identify automation opportunities\n• Discuss what's involved\n• Provide a tailored recommendation\n\nWould you like to book your audit?";
}

function getDefaultFallbackResponse(): string {
  return "I'm here to answer general questions about AutoMagicly's automation services. I can help with:\n\n• What tasks we can automate\n• How the AI Audit works\n• Service options (AI Partnership vs One-Off)\n• Tool integrations\n• Typical timelines\n\nFor pricing, custom quotes, or detailed proposals, please schedule a Free AI Audit. How can I help?";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, sessionId } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { reply: 'Please provide a valid message.' },
        { status: 400 }
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { reply: 'Session ID required.' },
        { status: 400 }
      );
    }

    // Rate limiting
    if (!checkRateLimit(sessionId)) {
      return NextResponse.json(
        {
          reply: 'You're sending messages too quickly. Please wait a moment and try again.',
          blocked: true,
          reason: 'rate_limit'
        },
        { status: 429 }
      );
    }

    // Profanity filter
    if (containsProfanity(message)) {
      return NextResponse.json(
        {
          reply: 'Please keep the conversation professional.',
          blocked: true,
          reason: 'profanity'
        },
        { status: 400 }
      );
    }

    // Pricing/proposal guard (local enforcement)
    if (isPricingRequest(message)) {
      return NextResponse.json({
        reply: getPricingRefusalMessage(),
        blocked: true,
        reason: 'pricing_request'
      });
    }

    // If n8n webhook is configured, forward the request
    if (N8N_CHAT_WEBHOOK_URL) {
      try {
        const n8nResponse = await fetch(N8N_CHAT_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            source: 'automagicly-website',
            submittedAt: new Date().toISOString(),
            sessionId,
            message
          }),
        });

        if (!n8nResponse.ok) {
          throw new Error('n8n request failed');
        }

        const n8nData = await n8nResponse.json();

        // Check if n8n blocked the request
        if (n8nData.blocked) {
          return NextResponse.json({
            reply: n8nData.reason === 'pricing_request'
              ? getPricingRefusalMessage()
              : n8nData.reply || getDefaultFallbackResponse(),
            blocked: true,
            reason: n8nData.reason
          });
        }

        return NextResponse.json({
          reply: n8nData.reply || getDefaultFallbackResponse()
        });
      } catch (error) {
        console.error('Error calling n8n webhook:', error);
        // Fall through to default response
      }
    }

    // Default response (no n8n configured or n8n failed)
    return NextResponse.json({
      reply: getDefaultFallbackResponse()
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { reply: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
