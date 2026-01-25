# n8n AI Business Audit Workflow Setup

This document explains how to set up the n8n workflow for the AI Business Audit feature.

## Overview

The AI Business Audit is an adaptive questionnaire that:
1. Asks 3 fixed discovery questions
2. Asks up to 12 adaptive follow-up questions based on responses
3. Generates personalized automation recommendations
4. Escalates to human consultation when needed

## Webhook Configuration

### Endpoint URL
```
https://rashadbarnett.app.n8n.cloud/webhook/audit-ai
```

### Authentication
The webhook should validate the `X-API-Key` header:
```
X-API-Key: automagicly_audit_key_2026
```

## Request/Response Contract

### Incoming Request (from Next.js API)

```json
{
  "sessionId": "uuid-string",
  "message": "User's answer to the previous question",
  "questionNumber": 3,
  "state": "DISCOVERY",
  "conversationHistory": [
    { "role": "assistant", "content": "What industry do you work in?" },
    { "role": "user", "content": "I'm a plumber" },
    { "role": "assistant", "content": "What does a typical workday look like?" },
    { "role": "user", "content": "I handle calls, schedule jobs, do repairs..." }
  ],
  "currentConfidence": {
    "I": 0.8,
    "R": 0.5,
    "P": 0.3,
    "M": 0.2,
    "K": 0.0
  },
  "source": "automagicly-website-audit",
  "submittedAt": "2026-01-23T10:30:00.000Z"
}
```

### Expected Response

**For continuing conversation (more questions needed):**
```json
{
  "nextQuestion": "What tools or software do you currently use for scheduling and invoicing?",
  "updatedConfidence": {
    "I": 0.9,
    "R": 0.7,
    "P": 0.5,
    "M": 0.3,
    "K": 0.0,
    "overall": 0.58
  },
  "derivedPainPoints": [
    {
      "category": "scheduling",
      "description": "Manual scheduling leads to missed calls during jobs",
      "severity": "high"
    }
  ],
  "shouldStop": false,
  "recommendations": null,
  "shouldEscalate": false
}
```

**For completion (confidence threshold met):**
```json
{
  "nextQuestion": null,
  "updatedConfidence": {
    "I": 1.0,
    "R": 0.9,
    "P": 0.8,
    "M": 0.7,
    "K": 0.0,
    "overall": 0.85
  },
  "derivedPainPoints": [
    {
      "category": "scheduling",
      "description": "Missed calls during job sites",
      "severity": "high"
    },
    {
      "category": "invoicing",
      "description": "Manual invoice creation takes 2+ hours weekly",
      "severity": "medium"
    }
  ],
  "shouldStop": true,
  "recommendations": [
    {
      "title": "AI-Powered Call Handling",
      "description": "Automated call answering and scheduling system that captures leads 24/7",
      "mappedPainPoint": "Missed calls during job sites",
      "complexity": "medium",
      "priority": 1
    },
    {
      "title": "Automated Invoice Generation",
      "description": "Generate and send invoices automatically after job completion",
      "mappedPainPoint": "Manual invoice creation",
      "complexity": "low",
      "priority": 2
    }
  ],
  "shouldEscalate": false,
  "nextSteps": "Book a free consultation to discuss implementing these automations."
}
```

**For escalation (needs human consultation):**
```json
{
  "nextQuestion": null,
  "updatedConfidence": {
    "I": 0.3,
    "R": 0.4,
    "P": 0.2,
    "M": 0.1,
    "K": 0.3,
    "overall": 0.22
  },
  "derivedPainPoints": [],
  "shouldStop": false,
  "recommendations": null,
  "shouldEscalate": true,
  "escalationReason": "Complex multi-department workflow requiring custom solution design"
}
```

## Confidence Scoring

### Signals (0-1 scale)
- **I (Industry Clarity)**: How clearly the user's industry is understood
- **R (Role/Process Understanding)**: How well day-to-day tasks are understood
- **P (Pain Point Clarity)**: Number and specificity of identified pain points
- **M (Mappability)**: How well pain points map to automatable solutions
- **K (Complexity Penalty)**: Deduction for contradictions or unclear needs

### Formula
```
C = 0.25*I + 0.25*R + 0.30*P + 0.20*M - K
```

### Stop Criteria
Stop asking questions and generate recommendations when:
- `C >= 0.75` AND `P >= 0.7` AND `M >= 0.5`

### Escalation Criteria
Escalate to human when:
- `questionCount == 15` AND `C < 0.75`
- OR user explicitly requests human consultation
- OR business needs require custom software (not workflow automation)

## n8n Workflow Structure

### Node 1: Webhook Trigger
- Method: POST
- Path: `/audit-ai`
- Authentication: Header Auth (`X-API-Key`)

### Node 2: Validate Request
- Check required fields exist
- Validate sessionId format
- Check questionNumber is within range

### Node 3: AI Agent (Claude)
Configure with this system prompt:

```
You are an AI Business Audit specialist for AutoMagicly, an automation consulting company.

## Your Role
Conduct an adaptive business audit to:
1. Understand the user's business and identify repetitive tasks
2. Determine if AI/workflow automation can help
3. Provide actionable recommendations

## Fixed Discovery Questions (Q1-Q3)
Always start with these in order:
1. "What industry do you work in?"
2. "What does a typical workday look like for you right now?"
3. "What is the biggest challenge or frustration you face in your business or role today?"

## Adaptive Questions (Q4-Q15)
After discovery, ask clarifying questions about:
- Process details and volumes ("How many invoices per week?")
- Current tools and systems
- Time spent on specific tasks
- Failed automation attempts
- Growth bottlenecks
- Communication workflows

## Confidence Scoring
Update these scores (0-1) after each response:
- I: Industry clarity (1.0 = explicit like "residential plumber")
- R: Role/process clarity (based on described tasks and tools)
- P: Pain point clarity (1.0 = 2+ specific, measurable pain points)
- M: Mappability to automation (1.0 = clear automation opportunity)
- K: Penalty for contradictions or unclear needs

## When to Stop
Stop and recommend when: C >= 0.75 AND P >= 0.7 AND M >= 0.5

## Recommendation Categories
Map to these solution types:
- AI chatbots/intake forms
- Automated lead follow-up
- CRM/pipeline automation
- Scheduling automation
- AI content generation
- Automated reporting

## Escalation Triggers
Set shouldEscalate=true if:
- Business needs custom software development (not workflow automation)
- Compliance/security concerns need human review
- User explicitly asks to speak with someone
- After 15 questions, confidence remains low

## Output Format
Always return valid JSON matching the response schema.
```

### Node 4: Parse Response
Extract structured data from Claude's response.

### Node 5: Format Response
Ensure response matches the expected schema.

### Node 6: Respond to Webhook
Return JSON response to the Next.js API.

## Testing

### Test with curl
```bash
curl -X POST https://rashadbarnett.app.n8n.cloud/webhook/audit-ai \
  -H "Content-Type: application/json" \
  -H "X-API-Key: automagicly_audit_key_2026" \
  -d '{
    "sessionId": "test-123",
    "message": "I run a plumbing business",
    "questionNumber": 1,
    "state": "DISCOVERY",
    "conversationHistory": [
      {"role": "assistant", "content": "What industry do you work in?"}
    ],
    "currentConfidence": {"I": 0, "R": 0, "P": 0, "M": 0, "K": 0},
    "source": "automagicly-website-audit",
    "submittedAt": "2026-01-23T10:30:00.000Z"
  }'
```

## Fallback Behavior

If the n8n webhook is unavailable, the Next.js API provides fallback questions:
1. Discovery questions 1-3 (fixed)
2. Generic adaptive questions about tools, time spent, bottlenecks
3. Keyword-based recommendation generation

This ensures users can complete the audit even without n8n connectivity.
