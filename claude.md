# Claude Code Instructions

Project-specific instructions for Claude Code when working on AutoMagicly.

## Available Tools

### Wave Speed AI - Image & Video Generation

Claude can use Wave Speed AI to generate images or videos when needed for the project.

**API Key:** Stored in `.env.local` as `WAVESPEED_API_KEY`

**Usage Example:**
```bash
source .env.local && curl -s -X POST "https://api.wavespeed.ai/api/v3/wavespeed-ai/flux-schnell" \
  -H "Authorization: Bearer $WAVESPEED_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Your image description here",
    "size": "512x512"
  }'
```

**Fetch Result:**
```bash
curl -s "https://api.wavespeed.ai/api/v3/predictions/{prediction_id}/result" \
  -H "Authorization: Bearer $WAVESPEED_API_KEY"
```

**Available Models:**
- `wavespeed-ai/flux-schnell` - Fast image generation
- `wavespeed-ai/flux-dev` - Higher quality images
- See https://wavespeed.ai/docs for full model list

**Use Cases:**
- Generate placeholder images
- Create illustrations for pages (e.g., 404 page robots)
- Generate marketing assets
- Create video content
