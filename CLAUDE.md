# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/claude-code) when working with this codebase.

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

## Code Standards

- **Always write tests for code changes.** Every new feature, bug fix, or modification must include corresponding unit tests (Jest) and/or e2e tests (Playwright) as appropriate.
- Run `npm run test` to verify tests pass before completing any task.

## API Documentation (Bruno Collections)

- **Keep Bruno collections up to date.** When creating or modifying API endpoints, always update the corresponding Bruno collection in `bruno-collections/`.
- Each API collection should include:
  - Success case tests
  - Error case tests (invalid input, missing fields, auth failures)
  - Environment files for Local and Production
  - A README.md documenting the endpoints
- Bruno collections serve as both API documentation and integration test suites.

### Existing Collections

| Collection | Path | Description |
|------------|------|-------------|
| AutoMagicly API | `bruno-collections/AutoMagicly-Chat-API/` | All API tests (Chat + Audit) |
