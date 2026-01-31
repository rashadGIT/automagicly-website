# AutoMagicly API - Bruno Collection

This Bruno collection covers both n8n webhook tests and Next.js API routes.

## Setup

1. Open Bruno and select "Open Collection".
2. Choose `bruno-collections/AutoMagicly-Chat-API`.
3. Pick an environment:
   - Local: Next.js API routes (uses `auditBaseUrl`).
   - Production: n8n webhooks (uses `baseUrl` and `apiKey`).

## Collection Layout

- `n8n - ChatBot`: webhook tests grouped by Success, Validation, Auth, and Edge cases.
- `n8n - Audit AI`: webhook tests grouped by Success, Validation, Auth, and Completion-Escalation.
- `Automagicly - Node Endpoints`: Next.js API routes grouped by feature.

## Running Tests

- In Bruno UI: select any request and click "Send".
- CLI:
```bash
bruno run bruno-collections/AutoMagicly-Chat-API
```

## Notes

- CSRF-protected routes require the `Origin` header to match `auditBaseUrl`.
- Admin-only routes (`/api/reviews`, `/api/reviews-simple`) require an admin session.
- Calendar availability requires Google service account credentials on the server.

For full details, see `bruno-collections/AutoMagicly-Chat-API/DOCUMENTATION.md`.
