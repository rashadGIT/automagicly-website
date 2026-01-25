# CODEX_INSTRUCTIONS.md

This file provides guidance to Codex CLI when working in this repository.

## Project Overview

autoMagicly is a Next.js 14 web application built with TypeScript and Tailwind CSS.

## Common Commands

```bash
# Development
npm run dev          # Start development server

# Building
npm run build        # Build for production
npm run start        # Start production server

# Testing
npm run test         # Run Jest unit tests
npm run test:watch   # Run tests in watch mode
npm run test:e2e     # Run Playwright e2e tests
npm run lint         # Run ESLint
```

## Architecture

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Auth**: NextAuth.js with Supabase adapter
- **Database**: AWS DynamoDB
- **Testing**: Jest + React Testing Library + Playwright

## Project Structure

```
app/           # Next.js App Router pages and API routes
components/    # React components
lib/           # Utility functions and shared logic
hooks/         # Custom React hooks
__tests__/     # Test files
```

## Codex Guidance

- Read `AGENTS.md` before any n8n workflow changes and follow its tool requirements.
- Use `rg` for search and prefer `apply_patch` for single-file edits.
- Avoid hardcoded credentials; call out required credentials by name.
- Keep edits minimal and consistent with existing patterns.

## Testing Expectations

- Every new feature, bug fix, or modification should include tests when feasible.
- Run `npm run test` (and `npm run test:e2e` when relevant) before finishing a task.
