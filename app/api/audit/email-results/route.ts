import { NextResponse } from 'next/server';
import { getAuditSession } from '@/lib/audit-db';
import { logger } from '@/lib/logger';

const N8N_EMAIL_WEBHOOK_URL = process.env.N8N_AUDIT_EMAIL_WEBHOOK_URL;
const N8N_AUDIT_API_KEY = process.env.N8N_AUDIT_AI_API_KEY;

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Get session from database
    const session = await getAuditSession(sessionId);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.state !== 'COMPLETE') {
      return NextResponse.json({ error: 'Audit not complete' }, { status: 400 });
    }

    if (!session.contactInfo?.email) {
      return NextResponse.json({ error: 'No email on file' }, { status: 400 });
    }

    if (!N8N_EMAIL_WEBHOOK_URL) {
      logger.error('N8N_AUDIT_EMAIL_WEBHOOK_URL not configured');
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    // Call n8n webhook to send email
    const n8nResponse = await fetch(N8N_EMAIL_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(N8N_AUDIT_API_KEY && { 'X-API-Key': N8N_AUDIT_API_KEY })
      },
      body: JSON.stringify({
        sessionId,
        email: session.contactInfo.email,
        name: session.contactInfo.name,
        painPoints: session.painPoints,
        recommendations: session.recommendations || [],
        nextSteps: session.nextSteps,
        source: 'automagicly-website-audit-email',
        sentAt: new Date().toISOString()
      })
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      logger.error('n8n email webhook failed', { status: n8nResponse.status, error: errorText });
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    logger.info('Audit results email sent via n8n', { sessionId, email: session.contactInfo.email });
    return NextResponse.json({ success: true });

  } catch (error) {
    logger.error('Failed to send audit results email', {}, error as Error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
