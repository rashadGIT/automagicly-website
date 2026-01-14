# n8n AI Review Generator - OpenAI Prompt

## Setup Instructions

In your n8n workflow, add an **OpenAI Chat Model** node with the following configuration:

### Node Configuration

**Model:** `gpt-4` or `gpt-4-turbo` (for best results)

---

## System Prompt

```
You are an expert at writing authentic, human-sounding customer reviews. Your task is to create a review based on the customer's rating, preferred tone, and their answers to questions about their experience.

CRITICAL RULES:
1. Write in FIRST PERSON ("We", "I", "Our")
2. Match the sentiment to the star rating (5 stars = very positive, 1 star = critical)
3. Use the specified tone (professional, enthusiastic, or casual)
4. MAXIMUM LENGTH: 250 characters (strict limit)
5. NEVER include PII: no names, company names, emails, phone numbers, or identifying details
6. NO profanity or inappropriate language
7. Sound like a real person, not AI
8. Tell a story: problem → solution → results
9. Be specific but concise
10. Return ONLY the review text - no quotes, no extra formatting

TONE GUIDELINES:
- Professional: Clear, articulate, business-focused
- Enthusiastic: Energetic, excited, highly positive
- Casual: Conversational, friendly, relaxed

RATING SENTIMENT:
- 5 stars: Exceptional, exceeded expectations, glowing praise
- 4 stars: Very good, positive with realistic nuance
- 3 stars: Satisfactory, balanced, met basic expectations
- 2 stars: Disappointing, constructive criticism
- 1 star: Poor experience, significant issues
```

---

## User Prompt (Dynamic)

Use this format in your n8n workflow. Replace the `{{ }}` placeholders with actual data from the webhook:

```
Generate a customer review with the following details:

RATING: {{ $json.rating }}/5 stars

TONE: {{ $json.tone }}

CUSTOMER ANSWERS:
{{#each $json.answers}}
Q: {{ this.question }}
A: {{ this.answer }}

{{/each}}

Write a review that:
- Matches the {{ $json.rating }}-star rating sentiment
- Uses a {{ $json.tone }} tone
- Incorporates insights from the answers WITHOUT revealing PII
- Is maximum 250 characters
- Tells a natural before/during/after story

Return only the review text.
```

---

## Alternative User Prompt (JavaScript Expression)

If your n8n version supports JavaScript expressions, use this for cleaner formatting:

```javascript
`Generate a customer review with the following details:

RATING: ${$json.rating}/5 stars

TONE: ${$json.tone}

CUSTOMER ANSWERS:
${$json.answers.map((qa, i) => `Q: ${qa.question}\nA: ${qa.answer || 'Not provided'}`).join('\n\n')}

Write a review that:
- Matches the ${$json.rating}-star rating sentiment
- Uses a ${$json.tone} tone
- Incorporates insights from the answers WITHOUT revealing PII
- Is maximum 250 characters
- Tells a natural before/during/after story

Return only the review text.`
```

---

## n8n Workflow Example

```
1. Webhook (Trigger)
   ↓
2. OpenAI Chat Model
   - System Message: [Use System Prompt above]
   - User Message: [Use User Prompt above]
   ↓
3. Set (optional - extract just the text)
   - review: {{ $json.choices[0].message.content }}
   ↓
4. Respond to Webhook
   - Body: { "review": "{{ $json.review }}" }
```

---

## Response Format

The OpenAI node will return:

```json
{
  "choices": [
    {
      "message": {
        "content": "We were drowning in manual tasks before working with them. They automated our processes seamlessly, and now we save hours every week. The experience was smooth and professional. Highly satisfied!"
      }
    }
  ]
}
```

Extract the review text from: `$json.choices[0].message.content`

---

## Testing Tips

1. **Test with different ratings** (1-5) to ensure sentiment matches
2. **Test with each tone** to verify voice consistency
3. **Test with minimal answers** (some fields blank) to ensure it still generates
4. **Test with detailed answers** to ensure it doesn't exceed 250 characters
5. **Check for PII leakage** - make sure names/companies are generalized

---

## Character Limit Handling

If reviews consistently exceed 250 characters, add this to the System Prompt:

```
STRICT LENGTH ENFORCEMENT:
- Count characters as you write
- If approaching 250 characters, conclude the review naturally
- Prioritize clarity over completeness
- Better to end at 200 characters than exceed 250
```

---

## Fallback Prompt (If Webhook Data Missing)

Add error handling in n8n:

```javascript
{{ $json.rating ? $json.rating : 5 }}
{{ $json.tone ? $json.tone : 'professional' }}
{{ $json.answers && $json.answers.length > 0 ? $json.answers : [] }}
```

This ensures the prompt still works even with incomplete data.
