import { NextRequest, NextResponse } from 'next/server';
import { isPricingRequest, containsProfanity, verifyCsrfToken, sanitizeHtml } from '@/lib/utils';
import { chatMessageSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

const N8N_CHAT_WEBHOOK_URL = process.env.N8N_CHAT_WEBHOOK_URL;
const N8N_CHAT_API_KEY = process.env.N8N_CHAT_API_KEY;

function getPricingRefusalMessage(): string {
  return "I can't provide pricing or custom quotes through chat. Each automation is different, and pricing depends on your specific needs and workflow complexity.\n\nTo get accurate information, I recommend scheduling a Free AI Audit where we'll:\n\n• Review your specific workflows\n• Identify automation opportunities\n• Discuss what's involved\n• Provide a tailored recommendation\n\nWould you like to book your audit?";
}

function getDefaultFallbackResponse(): string {
  return "I\'m here to answer general questions about AutoMagicly\'s automation services. I can help with:\n\n• What tasks we can automate\n• How the AI Audit works\n• Service options (AI Partnership vs One-Off)\n• Tool integrations\n• Typical timelines\n\nFor pricing, custom quotes, or detailed proposals, please schedule a Free AI Audit. How can I help?";
}

export async function POST(request: NextRequest) {
  // CSRF Protection
  if (!verifyCsrfToken(request)) {
    logger.security('CSRF validation failed', {
      path: '/api/chat',
      method: request.method,
      origin: request.headers.get('origin'),
      referer: request.headers.get('referer'),
    });
    return NextResponse.json(
      {
        reply: 'Invalid request origin',
        blocked: true,
        reason: 'csrf_validation_failed'
      },
      { status: 403 }
    );
  }

  // Validate Content-Type
  const contentType = request.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return NextResponse.json(
      {
        reply: 'Content-Type must be application/json',
        blocked: true,
        reason: 'invalid_content_type'
      },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();

    // Validate input with zod
    const validation = chatMessageSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          reply: 'Invalid request data.',
          details: validation.error.issues
        },
        { status: 400 }
      );
    }

    const { message, sessionId } = validation.data;

    // Get client IP for additional rate limiting
    const clientIp = getClientIp(request);

    // Check both session-based and IP-based rate limits (DynamoDB-based)
    const sessionAllowed = await checkRateLimit(sessionId);
    if (!sessionAllowed) {
      logger.warn('Session rate limit exceeded', {
        path: '/api/chat',
        sessionId,
      });
      return NextResponse.json(
        {
          reply: 'You\'re sending messages too quickly. Please wait a moment and try again.',
          blocked: true,
          reason: 'rate_limit'
        },
        { status: 429 }
      );
    }

    const ipAllowed = await checkRateLimit(clientIp, true);
    if (!ipAllowed) {
      logger.warn('IP rate limit exceeded', {
        path: '/api/chat',
        clientIp,
      });
      return NextResponse.json(
        {
          reply: 'Too many requests from your network. Please wait a moment and try again.',
          blocked: true,
          reason: 'ip_rate_limit'
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
            'X-API-Key': N8N_CHAT_API_KEY || '',
          },
          body: JSON.stringify({
            message,
            sessionId
          }),
        });

        if (!n8nResponse.ok) {
          throw new Error('n8n request failed');
        }

        const n8nData = await n8nResponse.json();

        // Validate n8n response structure
        if (typeof n8nData !== 'object' || n8nData === null) {
          throw new Error('Invalid n8n response format');
        }

        // Handle n8n AI Agent response format (current workflow)
        if (n8nData.reply && typeof n8nData.reply === 'string') {
          // Sanitize message content to prevent XSS
          const sanitizedMessage = sanitizeHtml(n8nData.reply);

          return NextResponse.json({
            reply: sanitizedMessage,
            sources: [], // AI Agent workflow doesn't return sources
            sessionId: typeof n8nData.sessionId === 'string' ? n8nData.sessionId : sessionId,
            timestamp: typeof n8nData.timestamp === 'string' ? n8nData.timestamp : new Date().toISOString()
          });
        }

        // Handle RAG chatbot response format (legacy/alternative workflow)
        if (n8nData.success && n8nData.message) {
          // Sanitize message content to prevent XSS
          const sanitizedMessage = typeof n8nData.message === 'string'
            ? sanitizeHtml(n8nData.message)
            : getDefaultFallbackResponse();

          // Validate sources array
          const validatedSources = Array.isArray(n8nData.sources)
            ? n8nData.sources.slice(0, 10) // Limit to 10 sources max
            : [];

          return NextResponse.json({
            reply: sanitizedMessage,
            sources: validatedSources,
            conversationId: typeof n8nData.conversationId === 'string' ? n8nData.conversationId : undefined,
            timestamp: typeof n8nData.timestamp === 'string' ? n8nData.timestamp : undefined
          });
        }

        // Check if n8n blocked the request (fallback for other n8n workflows)
        if (n8nData.blocked) {
          return NextResponse.json({
            reply: n8nData.reason === 'pricing_request'
              ? getPricingRefusalMessage()
              : n8nData.reply || getDefaultFallbackResponse(),
            blocked: true,
            reason: n8nData.reason
          });
        }

        // Fallback for unexpected response format
        return NextResponse.json({
          reply: n8nData.reply || n8nData.message || getDefaultFallbackResponse()
        });
      } catch (error) {
        logger.warn('N8N request failed, using fallback response', {
          path: '/api/chat',
          n8nUrl: N8N_CHAT_WEBHOOK_URL,
        });
        // Fall through to default response
      }
    }

    // Default response (no n8n configured or n8n failed)
    return NextResponse.json({
      reply: getDefaultFallbackResponse()
    });

  } catch (error: any) {
    logger.error('Chat request failed', {
      path: '/api/chat',
      method: 'POST',
    }, error);
    return NextResponse.json(
      { reply: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
