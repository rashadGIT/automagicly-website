import { NextRequest, NextResponse } from 'next/server';
import { verifyCsrfToken } from '@/lib/utils';
import { auditSessionCreateSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { createAuditSession, getAuditSession } from '@/lib/audit-db';
import { CreateSessionResponse, DISCOVERY_QUESTIONS, MAX_QUESTIONS, ContactInfo } from '@/lib/audit-types';

export async function POST(request: NextRequest) {
  // CSRF Protection
  if (!verifyCsrfToken(request)) {
    logger.security('CSRF validation failed', {
      path: '/api/audit/session',
      method: request.method,
      origin: request.headers.get('origin'),
      referer: request.headers.get('referer'),
    });
    return NextResponse.json(
      { error: 'Invalid request origin' },
      { status: 403 }
    );
  }

  // Validate Content-Type
  const contentType = request.headers.get('content-type');
  if (contentType && !contentType.includes('application/json')) {
    return NextResponse.json(
      { error: 'Content-Type must be application/json' },
      { status: 400 }
    );
  }

  try {
    // Get client IP for rate limiting
    const clientIp = getClientIp(request);

    // Check IP-based rate limit
    const ipAllowed = await checkRateLimit(clientIp, true);
    if (!ipAllowed) {
      logger.warn('IP rate limit exceeded for audit session creation', {
        path: '/api/audit/session',
        clientIp,
      });
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment and try again.' },
        { status: 429 }
      );
    }

    // Parse body (may be empty for new session)
    let body = {};
    try {
      const text = await request.text();
      if (text) {
        body = JSON.parse(text);
      }
    } catch {
      // Empty body is fine for new session
    }

    // Validate input
    const validation = auditSessionCreateSchema?.safeParse(body);
    if (validation && !validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation?.data;

    // Check if resuming an existing session
    if (data?.resumeSessionId) {
      const existingSession = await getAuditSession(data.resumeSessionId);

      if (existingSession && existingSession.status === 'active') {
        // Return current state for resumption
        const lastAssistantMessage = [...existingSession.messages]
          .reverse()
          .find(m => m.role === 'assistant');

        const response: CreateSessionResponse = {
          sessionId: existingSession.sessionId,
          question: lastAssistantMessage?.content || DISCOVERY_QUESTIONS[0],
          questionNumber: existingSession.questionCount,
          totalQuestions: MAX_QUESTIONS,
          isFixedQuestion: existingSession.questionCount <= 3,
          state: existingSession.state
        };

        logger.info('Audit session resumed', {
          path: '/api/audit/session',
          sessionId: existingSession.sessionId,
          questionCount: existingSession.questionCount
        });

        return NextResponse.json(response);
      }
    }

    // Create new session with contact info if provided
    const contactInfo: ContactInfo | undefined = data?.contactInfo ? {
      name: data.contactInfo.name,
      email: data.contactInfo.email,
      phone: data.contactInfo.phone || undefined
    } : undefined;

    const session = await createAuditSession(contactInfo);

    const response: CreateSessionResponse = {
      sessionId: session.sessionId,
      question: DISCOVERY_QUESTIONS[0],
      questionNumber: 1,
      totalQuestions: MAX_QUESTIONS,
      isFixedQuestion: true,
      state: 'DISCOVERY'
    };

    logger.info('New audit session created', {
      path: '/api/audit/session',
      sessionId: session.sessionId,
      hasContactInfo: !!contactInfo
    });

    return NextResponse.json(response);

  } catch (error: any) {
    logger.error('Audit session creation failed', {
      path: '/api/audit/session',
      method: 'POST',
    }, error);

    return NextResponse.json(
      { error: 'Failed to create audit session. Please try again.' },
      { status: 500 }
    );
  }
}
