# TODO

## Cleanup Tasks

- [ ] Remove admin-related code and tests (routes already removed)
  - `lib/auth.ts` - NextAuth credentials provider
  - `app/api/auth/[...nextauth]/route.ts` - NextAuth API route
  - `app/api/reviews/route.ts` - PATCH/DELETE endpoints (keep GET for public reviews)
  - `app/api/reviews-simple/route.ts` - Admin-only endpoint
  - `app/providers.tsx` - SessionProvider wrapper
  - `middleware.ts` - Admin route protection (if any)
  - `__tests__/lib/auth.test.ts`
  - `__tests__/security/authorization.test.ts`
  - Bruno collections for admin auth and review moderation
  - Dependencies: `next-auth`, `bcryptjs`, `@types/bcryptjs`
  - Environment variables: `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `NEXTAUTH_SECRET`
