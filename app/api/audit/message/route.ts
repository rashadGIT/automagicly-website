import { NextRequest, NextResponse } from 'next/server';
import { verifyCsrfToken, sanitizeHtml } from '@/lib/utils';
import { auditMessageSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { getAuditSession, updateAuditSession } from '@/lib/audit-db';
import {
  AuditMessageResponse,
  AuditContinueResponse,
  AuditCompleteResponse,
  AuditEscalatedResponse,
  N8nAuditRequest,
  N8nAuditResponse,
  DISCOVERY_QUESTIONS,
  MAX_QUESTIONS,
  AuditState
} from '@/lib/audit-types';

const N8N_AUDIT_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_AUDIT_AI_WEBHOOK_URL;
const N8N_AUDIT_API_KEY = process.env.N8N_AUDIT_AI_API_KEY;

// Fallback questions when n8n is unavailable
const FALLBACK_ADAPTIVE_QUESTIONS = [
  'What tools or software do you currently use for your daily tasks?',
  'How much time do you spend on repetitive tasks each week?',
  'What would you do with an extra 10 hours per week?',
  'Have you tried automating any processes before? What happened?',
  'What\'s your biggest bottleneck when it comes to growth?',
  'How do you currently handle customer communication?',
  'What tasks do you wish you could delegate but can\'t?',
  'How do you track and manage your leads or customers?',
  'What reports or data do you need that take too long to create?',
  'If you could wave a magic wand and fix one process, what would it be?',
  'How do you handle scheduling and appointments?',
  'What administrative tasks eat up most of your time?'
];

// Get next fallback question
function getFallbackQuestion(questionNumber: number): string {
  if (questionNumber <= 3) {
    return DISCOVERY_QUESTIONS[questionNumber - 1];
  }
  const adaptiveIndex = questionNumber - 4;
  if (adaptiveIndex < FALLBACK_ADAPTIVE_QUESTIONS.length) {
    return FALLBACK_ADAPTIVE_QUESTIONS[adaptiveIndex];
  }
  return 'Is there anything else you\'d like to share about your business challenges?';
}

// Generate fallback recommendations based on keywords in conversation
function generateFallbackRecommendations(messages: Array<{ role: string; content: string }>) {
  const userMessages = messages.filter(m => m.role === 'user').map(m => m.content.toLowerCase()).join(' ');

  const recommendations = [];

  if (userMessages.includes('email') || userMessages.includes('inbox') || userMessages.includes('message')) {
    recommendations.push({
      title: 'Email Automation',
      description: 'Automate email responses, sorting, and follow-ups to save hours weekly.',
      complexity: 'low' as const,
      priority: 1
    });
  }

  if (userMessages.includes('schedule') || userMessages.includes('calendar') || userMessages.includes('appointment') || userMessages.includes('booking')) {
    recommendations.push({
      title: 'Smart Scheduling System',
      description: 'Automated booking with calendar integration, reminders, and rescheduling.',
      complexity: 'medium' as const,
      priority: 2
    });
  }

  if (userMessages.includes('lead') || userMessages.includes('customer') || userMessages.includes('client') || userMessages.includes('crm')) {
    recommendations.push({
      title: 'Lead Management Automation',
      description: 'Automatic lead capture, qualification, and CRM updates.',
      complexity: 'medium' as const,
      priority: 1
    });
  }

  if (userMessages.includes('invoice') || userMessages.includes('payment') || userMessages.includes('billing')) {
    recommendations.push({
      title: 'Invoice & Billing Automation',
      description: 'Automated invoice generation, payment reminders, and reconciliation.',
      complexity: 'medium' as const,
      priority: 2
    });
  }

  if (userMessages.includes('report') || userMessages.includes('data') || userMessages.includes('spreadsheet') || userMessages.includes('excel')) {
    recommendations.push({
      title: 'Automated Reporting',
      description: 'Generate reports automatically from your data sources on schedule.',
      complexity: 'medium' as const,
      priority: 3
    });
  }

  if (userMessages.includes('social') || userMessages.includes('post') || userMessages.includes('content') || userMessages.includes('marketing')) {
    recommendations.push({
      title: 'Content & Social Automation',
      description: 'Schedule posts, generate content ideas, and track engagement automatically.',
      complexity: 'low' as const,
      priority: 3
    });
  }

  // Default recommendation if nothing specific matched
  if (recommendations.length === 0) {
    recommendations.push({
      title: 'Custom Workflow Assessment',
      description: 'Based on your unique needs, we recommend a personalized workflow analysis to identify the best automation opportunities.',
      complexity: 'medium' as const,
      priority: 1
    });
  }

  return recommendations.slice(0, 5); // Max 5 recommendations
}

export async function POST(request: NextRequest) {
  // CSRF Protection
  if (!verifyCsrfToken(request)) {
    logger.security('CSRF validation failed', {
      path: '/api/audit/message',
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
  if (!contentType || !contentType.includes('application/json')) {
    return NextResponse.json(
      { error: 'Content-Type must be application/json' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();

    // Validate input
    const validation = auditMessageSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { sessionId, message } = validation.data;

    // Get client IP for rate limiting
    const clientIp = getClientIp(request);

    // Check rate limits
    const sessionAllowed = await checkRateLimit(sessionId);
    if (!sessionAllowed) {
      logger.warn('Session rate limit exceeded for audit', {
        path: '/api/audit/message',
        sessionId,
      });
      return NextResponse.json(
        { error: 'You\'re sending messages too quickly. Please wait a moment.' },
        { status: 429 }
      );
    }

    const ipAllowed = await checkRateLimit(clientIp, true);
    if (!ipAllowed) {
      return NextResponse.json(
        { error: 'Too many requests from your network. Please wait a moment.' },
        { status: 429 }
      );
    }

    // Get existing session
    const session = await getAuditSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found. Please start a new audit.' },
        { status: 404 }
      );
    }

    // Check if session is already complete
    if (session.state === 'COMPLETE' || session.state === 'ESCALATED') {
      return NextResponse.json(
        { error: 'This audit session has already ended.' },
        { status: 400 }
      );
    }

    // Calculate next question number
    const nextQuestionNumber = session.questionCount + 1;
    const isFixedQuestion = nextQuestionNumber <= 3;
    const newState: AuditState = nextQuestionNumber <= 3 ? 'DISCOVERY' : 'ADAPTIVE';

    // Prepare conversation history for n8n
    const conversationHistory = session.messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    // Add current user message to history
    conversationHistory.push({ role: 'user', content: message });

    let nextQuestion: string;
    let suggestedResponses: string[] = [];
    let updatedConfidence = session.confidence;
    let painPoints = session.painPoints;
    let recommendations = undefined;
    let shouldComplete = false;
    let shouldEscalate = false;
    let escalationReason = '';
    let nextSteps = '';

    // Try to call n8n webhook for AI-powered responses
    if (N8N_AUDIT_WEBHOOK_URL) {
      try {
        const n8nRequest: N8nAuditRequest = {
          sessionId,
          message,
          questionNumber: session.questionCount,
          state: session.state === 'DISCOVERY' ? 'DISCOVERY' : 'ADAPTIVE',
          conversationHistory,
          currentConfidence: session.confidence,
          source: 'automagicly-website-audit',
          submittedAt: new Date().toISOString()
        };

        logger.info('Calling n8n audit webhook', {
          path: '/api/audit/message',
          sessionId,
          webhookUrl: N8N_AUDIT_WEBHOOK_URL,
          hasApiKey: !!N8N_AUDIT_API_KEY
        });

        const n8nResponse = await fetch(N8N_AUDIT_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // n8n headerAuth credential is configured with X-API-Key header
            ...(N8N_AUDIT_API_KEY && { 'X-API-Key': N8N_AUDIT_API_KEY })
          },
          body: JSON.stringify(n8nRequest)
        });

        logger.info('n8n audit webhook response', {
          path: '/api/audit/message',
          sessionId,
          status: n8nResponse.status,
          ok: n8nResponse.ok
        });

        if (n8nResponse.ok) {
          const n8nData: N8nAuditResponse = await n8nResponse.json();

          logger.info('n8n audit response received', {
            path: '/api/audit/message',
            sessionId,
            hasNextQuestion: !!n8nData.nextQuestion,
            shouldStop: n8nData.shouldStop,
            shouldEscalate: n8nData.shouldEscalate
          });

          // Update from n8n response
          if (n8nData.updatedConfidence) {
            updatedConfidence = n8nData.updatedConfidence;
          }
          if (n8nData.derivedPainPoints) {
            painPoints = n8nData.derivedPainPoints;
          }
          if (n8nData.nextQuestion) {
            nextQuestion = sanitizeHtml(n8nData.nextQuestion);
          } else {
            nextQuestion = getFallbackQuestion(nextQuestionNumber);
          }
          if (n8nData.suggestedResponses && Array.isArray(n8nData.suggestedResponses)) {
            suggestedResponses = n8nData.suggestedResponses.map(s => sanitizeHtml(s));
          }
          if (n8nData.shouldStop && n8nData.recommendations) {
            shouldComplete = true;
            recommendations = n8nData.recommendations;
            nextSteps = n8nData.nextSteps || 'Book a free consultation to get started with your automation journey.';
          }
          if (n8nData.shouldEscalate) {
            shouldEscalate = true;
            escalationReason = n8nData.escalationReason || 'Your needs require personalized attention.';
          }
        } else {
          // n8n failed, use fallback
          const errorText = await n8nResponse.text();
          logger.warn('n8n audit webhook returned error', {
            path: '/api/audit/message',
            sessionId,
            status: n8nResponse.status,
            error: errorText.substring(0, 500)
          });
          nextQuestion = getFallbackQuestion(nextQuestionNumber);
        }
      } catch (error) {
        logger.warn('n8n audit webhook failed, using fallback', {
          path: '/api/audit/message',
          sessionId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        nextQuestion = getFallbackQuestion(nextQuestionNumber);
      }
    } else {
      // No n8n configured, use fallback questions
      logger.info('No n8n webhook URL configured, using fallback', {
        path: '/api/audit/message',
        sessionId
      });
      nextQuestion = getFallbackQuestion(nextQuestionNumber);
    }

    // Check if we've reached max questions without n8n completing
    if (nextQuestionNumber >= MAX_QUESTIONS && !shouldComplete && !shouldEscalate) {
      // Generate fallback recommendations
      shouldComplete = true;
      recommendations = generateFallbackRecommendations(conversationHistory);
      nextSteps = 'Book a free consultation to discuss these recommendations in detail.';
    }

    // Determine final state
    let finalState: AuditState = newState;
    let finalStatus: 'active' | 'complete' | 'escalated' = 'active';

    if (shouldEscalate) {
      finalState = 'ESCALATED';
      finalStatus = 'escalated';
    } else if (shouldComplete) {
      finalState = 'COMPLETE';
      finalStatus = 'complete';
    }

    // Update session in database
    const updatedSession = await updateAuditSession(sessionId, {
      userMessage: message,
      assistantMessage: shouldComplete || shouldEscalate ? undefined : nextQuestion,
      questionNumber: shouldComplete || shouldEscalate ? session.questionCount : nextQuestionNumber,
      isFixedQuestion,
      state: finalState,
      confidence: updatedConfidence,
      painPoints,
      recommendations,
      escalationReason: shouldEscalate ? escalationReason : undefined,
      nextSteps: shouldComplete ? nextSteps : undefined,
      status: finalStatus
    });

    // Build response based on state
    let response: AuditMessageResponse;

    if (shouldEscalate) {
      response = {
        sessionId,
        state: 'ESCALATED',
        reason: escalationReason,
        message: 'Based on the information provided, we want to make sure you receive the best possible guidance. A member of the AutoMagicly team will reach out to you directly to better understand your needs and recommend the right solution.',
        bookingUrl: '/#booking'
      } as AuditEscalatedResponse;
    } else if (shouldComplete) {
      response = {
        sessionId,
        state: 'COMPLETE',
        painPoints: painPoints || [],
        recommendations: recommendations || [],
        nextSteps,
        confidence: updatedConfidence.overall
      } as AuditCompleteResponse;
    } else {
      response = {
        sessionId,
        question: nextQuestion!,
        questionNumber: nextQuestionNumber,
        totalQuestions: MAX_QUESTIONS,
        isFixedQuestion,
        state: newState,
        progress: Math.round((nextQuestionNumber / MAX_QUESTIONS) * 100),
        suggestedResponses
      } as AuditContinueResponse;
    }

    logger.info('Audit message processed', {
      path: '/api/audit/message',
      sessionId,
      questionNumber: nextQuestionNumber,
      state: finalState
    });

    return NextResponse.json(response);

  } catch (error: any) {
    logger.error('Audit message processing failed', {
      path: '/api/audit/message',
      method: 'POST',
    }, error);

    return NextResponse.json(
      { error: 'Failed to process your response. Please try again.' },
      { status: 500 }
    );
  }
}
