import { NextResponse } from 'next/server';

/**
 * Debug endpoint to check n8n configuration
 * Access at: /api/debug-n8n
 *
 * IMPORTANT: Remove or protect this endpoint in production!
 */
export async function GET() {
  const config = {
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),

    // Public webhooks (visible to browser)
    publicWebhooks: {
      audit: process.env.NEXT_PUBLIC_N8N_AUDIT_WEBHOOK_URL || 'NOT_SET',
      reviews: process.env.NEXT_PUBLIC_N8N_REVIEWS_WEBHOOK_URL || 'NOT_SET',
      referrals: process.env.NEXT_PUBLIC_N8N_REFERRALS_WEBHOOK_URL || 'NOT_SET',
      waitlist: process.env.NEXT_PUBLIC_N8N_WAITLIST_WEBHOOK_URL || 'NOT_SET',
      auditAI: process.env.NEXT_PUBLIC_N8N_AUDIT_AI_WEBHOOK_URL || 'NOT_SET',
    },

    // Server-side webhooks (NOT visible to browser)
    serverWebhooks: {
      chat: process.env.N8N_CHAT_WEBHOOK_URL ? 'SET' : 'NOT_SET',
      chatUrl: process.env.N8N_CHAT_WEBHOOK_URL || 'NOT_SET',
      auditEmail: process.env.N8N_AUDIT_EMAIL_WEBHOOK_URL ? 'SET' : 'NOT_SET',
    },

    // API Keys (show only if they exist, not the actual values)
    apiKeys: {
      chatApiKey: process.env.N8N_CHAT_API_KEY ? 'SET' : 'NOT_SET',
      auditApiKey: process.env.N8N_AUDIT_AI_API_KEY ? 'SET' : 'NOT_SET',
    },

    // Other config
    other: {
      nextAuthUrl: process.env.NEXTAUTH_URL || 'NOT_SET',
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasGoogleServiceAccount: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      region: process.env.REGION || 'NOT_SET',
    },

    // Path analysis
    pathCheck: {
      chatUsesTest: process.env.N8N_CHAT_WEBHOOK_URL?.includes('/webhook/') || false,
      chatUsesProd: process.env.N8N_CHAT_WEBHOOK_URL?.includes('/webhook/') && !process.env.N8N_CHAT_WEBHOOK_URL?.includes('/webhook/') || false,
      auditUsesTest: process.env.NEXT_PUBLIC_N8N_AUDIT_WEBHOOK_URL?.includes('/webhook/') || false,
    },
  };

  // Recommendations
  const recommendations: string[] = [];

  if (config.pathCheck.chatUsesProd && process.env.NEXTAUTH_URL?.includes('test.')) {
    recommendations.push('⚠️  N8N_CHAT_WEBHOOK_URL uses /webhook/ but NEXTAUTH_URL indicates test environment. Should use /webhook/');
  }

  if (!process.env.N8N_CHAT_WEBHOOK_URL) {
    recommendations.push('❌ N8N_CHAT_WEBHOOK_URL is not set. Chat feature will use fallback responses.');
  }

  if (!process.env.N8N_CHAT_API_KEY) {
    recommendations.push('⚠️  N8N_CHAT_API_KEY is not set. n8n may reject requests.');
  }

  if (!process.env.NEXT_PUBLIC_N8N_AUDIT_AI_WEBHOOK_URL) {
    recommendations.push('⚠️  NEXT_PUBLIC_N8N_AUDIT_AI_WEBHOOK_URL is not set. AI Audit may not work.');
  }

  return NextResponse.json({
    ...config,
    recommendations,
    instructions: recommendations.length > 0
      ? 'See TEST_ENV_N8N_FIX.md for detailed fix instructions'
      : 'Configuration looks good!',
  }, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
