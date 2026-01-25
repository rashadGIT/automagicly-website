# Bruno Collection Documentation

This document describes the endpoints covered by the Bruno collection, how to call them, and what to expect.

## Collection Map

- n8n - ChatBot
  - Success Cases
  - Validation Errors
  - Auth Errors
  - Edge Cases
- n8n - Audit AI
  - Success Cases
  - Validation Errors
  - Auth Errors
  - Completion-Escalation
- Automagicly - Node Endpoints
  - Audit AI (POST /api/audit/session, POST /api/audit/message)
  - Chat (POST /api/chat)
  - Reviews (GET/PATCH/DELETE /api/reviews)
  - Reviews Simple (GET /api/reviews-simple)
  - Calendar (GET /api/calendar/availability)
  - Auth (GET /api/auth/session)

## Environments

- Local: use for Next.js API routes (sets `auditBaseUrl` to `http://localhost:3000`).
- Production: use for n8n webhook tests (sets `baseUrl` and `apiKey`).

## Variables

- `baseUrl`: n8n cloud base URL for webhooks.
- `apiKey`: n8n API key for webhook auth (X-API-Key).
- `auditBaseUrl`: Next.js base URL for `/api/*` routes.
- `auditSessionId`: set by the audit create session test and reused for follow-ups.

## Global Requirements

- **CSRF protection**: For protected endpoints, `Origin` must match `auditBaseUrl`.
- **JSON endpoints**: Use `Content-Type: application/json` for POST/PATCH routes that accept JSON bodies.
- **Rate limiting**: `/api/chat` and `/api/audit/message` rate limit by sessionId and IP. `/api/audit/session` rate limits by IP.
- **Auth**: Admin-only endpoints require a NextAuth admin session cookie.

## n8n Webhook Endpoints

### POST /webhook/chat

Handles the n8n ChatBot workflow.

Headers:
- `Content-Type: application/json`
- `X-API-Key: {{apiKey}}`

Body:
- `message` (string, required)
- `sessionId` (string, required)
- `userEmail` (string, optional)

Example request:
```json
{
  "message": "What services does AutoMagicly offer?",
  "sessionId": "test-success-001",
  "userEmail": "test@example.com"
}
```

Typical response:
```json
{
  "reply": "We can help automate your workflows...",
  "sessionId": "test-success-001"
}
```

### POST /webhook/audit-ai

Handles the n8n AI Business Audit workflow.

Headers:
- `Content-Type: application/json`
- `X-API-Key: {{apiKey}}`

Body:
- `sessionId` (string, required)
- `message` (string, required)
- `questionNumber` (number, required)
- `state` ("DISCOVERY" | "ADAPTIVE", required)
- `conversationHistory` (array, required)
- `currentConfidence` (object, required)
- `source` (string, optional)
- `submittedAt` (string ISO date, optional)

Example request:
```json
{
  "sessionId": "bruno-test-001",
  "message": "Healthcare - I run a small medical practice",
  "questionNumber": 1,
  "state": "DISCOVERY",
  "conversationHistory": [],
  "currentConfidence": {
    "I": 0,
    "R": 0,
    "P": 0,
    "M": 0,
    "K": 0
  }
}
```

Typical response:
```json
{
  "nextQuestion": "What does a typical workday look like?",
  "updatedConfidence": {
    "I": 0.2,
    "R": 0.1,
    "P": 0,
    "M": 0,
    "K": 0,
    "overall": 0.07
  },
  "suggestedResponses": [
    "I see patients all day",
    "Mostly admin work",
    "A mix of both"
  ],
  "shouldStop": false
}
```

## Next.js API Endpoints

### POST /api/audit/session

Creates a new audit session or resumes an existing one.

Headers:
- `Origin: {{auditBaseUrl}}` (required for CSRF)
- `Content-Type: application/json` (optional, but if present must be JSON)

Body (optional):
- `resumeSessionId` (uuid, optional)
- `contactInfo` (object, optional)
  - `name` (string, required if contactInfo present)
  - `email` (string, required if contactInfo present)
  - `phone` (string, optional)

Example request:
```json
{
  "contactInfo": {
    "name": "Test User",
    "email": "test@example.com",
    "phone": "555-123-4567"
  }
}
```

Success response (200):
```json
{
  "sessionId": "uuid",
  "question": "What industry do you work in?",
  "questionNumber": 1,
  "totalQuestions": 10,
  "isFixedQuestion": true,
  "state": "DISCOVERY"
}
```

Errors:
- 403 Invalid request origin
- 400 Invalid content type (if header present and not JSON)
- 400 Invalid request data
- 429 Too many requests
- 500 Failed to create audit session

### POST /api/audit/message

Submits an answer and returns the next question or a completion/escalation.

Headers:
- `Origin: {{auditBaseUrl}}` (required for CSRF)
- `Content-Type: application/json`

Body:
- `sessionId` (uuid, required)
- `message` (string, 1-2000, required)

Continue response (200):
```json
{
  "sessionId": "uuid",
  "question": "Next question text",
  "questionNumber": 2,
  "totalQuestions": 10,
  "isFixedQuestion": true,
  "state": "DISCOVERY",
  "progress": 20,
  "suggestedResponses": ["Option A", "Option B"]
}
```

Complete response (200):
```json
{
  "sessionId": "uuid",
  "state": "COMPLETE",
  "painPoints": [],
  "recommendations": [],
  "nextSteps": "Book a free consultation...",
  "confidence": 0.78
}
```

Escalated response (200):
```json
{
  "sessionId": "uuid",
  "state": "ESCALATED",
  "reason": "Your needs require personalized attention.",
  "message": "A member of the AutoMagicly team will reach out...",
  "bookingUrl": "/#booking"
}
```

Errors:
- 403 Invalid request origin
- 400 Content-Type must be application/json
- 400 Invalid request data
- 404 Session not found
- 400 Session already ended
- 429 Rate limit exceeded
- 500 Failed to process your response

Notes:
- If `NEXT_PUBLIC_N8N_AUDIT_AI_WEBHOOK_URL` is set, the request is forwarded to n8n.
- If n8n fails, the endpoint uses fallback questions and recommendations.

### POST /api/chat

Chat endpoint for general questions and AI routing.

Headers:
- `Origin: {{auditBaseUrl}}` (required for CSRF)
- `Content-Type: application/json`

Body:
- `message` (string, 1-1000, required)
- `sessionId` (string, 1-200, required)

Success response (200):
```json
{
  "reply": "Response message",
  "sessionId": "session-123",
  "timestamp": "2026-01-14T00:00:00Z"
}
```

Blocked response (400/403/429):
```json
{
  "reply": "Reason message",
  "blocked": true,
  "reason": "profanity"
}
```

Errors:
- 403 Invalid request origin
- 400 Content-Type must be application/json
- 400 Invalid request data
- 429 Rate limit exceeded
- 500 An error occurred

Notes:
- If `N8N_CHAT_WEBHOOK_URL` is set, the request is forwarded to n8n with `X-API-Key`.
- Pricing and profanity checks are enforced locally before forwarding.

### GET /api/reviews

Fetches reviews (public and admin-aware).

Query params:
- `status` (optional): `approved`, `pending`, `rejected`, `all`

Behavior:
- Non-admin users only see `approved` reviews (rating >= 3).
- Admins can request any status, or `all`.

Success response (200):
```json
{
  "reviews": [],
  "count": 0
}
```

Errors:
- 500 Database configuration error
- 500 Failed to fetch reviews

### PATCH /api/reviews

Updates review status or featured flag (admin-only).

Headers:
- `Origin: {{auditBaseUrl}}` (required for CSRF)
- `Content-Type: application/json`

Body:
- `id` (string, required)
- `status` (optional): `approved`, `rejected`, `pending`
- `featured` (optional): boolean

Success response (200):
```json
{
  "success": true,
  "message": "Review approved",
  "review": {}
}
```

Errors:
- 403 Invalid request origin
- 403 Unauthorized - admin access required
- 400 Content-Type must be application/json
- 400 Invalid request data
- 404 Review not found
- 500 Failed to update review

### DELETE /api/reviews

Deletes a review (admin-only).

Headers:
- `Origin: {{auditBaseUrl}}` (required for CSRF)

Query params:
- `id` (string, required)

Success response (200):
```json
{
  "success": true,
  "message": "Review deleted"
}
```

Errors:
- 403 Invalid request origin
- 403 Unauthorized - admin access required
- 400 Invalid request data
- 500 Failed to delete review

### GET /api/reviews-simple

Admin-only review listing with no-cache headers.

Success response (200):
```json
{
  "success": true,
  "reviews": [],
  "count": 0
}
```

Errors:
- 401 Unauthorized - authentication required
- 403 Forbidden - admin access required
- 500 Database configuration error
- 500 Failed to fetch reviews

### GET /api/calendar/availability

Returns busy dates from Google Calendar.

Query params:
- `start` (YYYY-MM-DD, optional)
- `end` (YYYY-MM-DD, optional)
- `timezone` (IANA tz, optional; default America/New_York)

Success response (200):
```json
{
  "busyDates": ["2026-01-20", "2026-01-21"]
}
```

Errors:
- 400 Invalid query parameters
- 500 Calendar service not configured
- 500 Failed to fetch calendar availability

Notes:
- Default range is 60 days from `start` (or today in provided timezone).
- All events count as busy; dates are deduplicated and sorted.

### GET /api/auth/session

NextAuth session endpoint used to check auth status.

Success response (200):
```json
{
  "user": {
    "email": "admin@example.com",
    "role": "admin"
  },
  "expires": "2026-01-14T00:00:00.000Z"
}
```

Notes:
- Other NextAuth endpoints are exposed under `/api/auth/*` (signin, csrf, callback).
- Credentials provider uses `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH`.

## Required Credentials

- n8n webhooks: `apiKey` in Bruno environment.
- Audit AI n8n: `NEXT_PUBLIC_N8N_AUDIT_AI_WEBHOOK_URL`, `N8N_AUDIT_AI_API_KEY`.
- Chat n8n: `N8N_CHAT_WEBHOOK_URL`, `N8N_CHAT_API_KEY`.
- DynamoDB: `DB_ACCESS_KEY_ID`, `DB_SECRET_ACCESS_KEY`, `REGION`.
- Calendar: `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_CALENDAR_ID`.
- NextAuth: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`.
