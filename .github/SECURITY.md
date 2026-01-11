# Security Policy

## Reporting Security Issues

**Please do not report security vulnerabilities through public GitHub issues.**

If you believe you've found a security vulnerability in AutoMagicly, please report it to us through coordinated disclosure.

### Preferred Method

1. **GitHub Security Advisories:** [Report a vulnerability](../../security/advisories/new)
2. **Email:** security@automagicly.com (if configured)

### What We Need

Please include as much of the following information as possible:

- Type of vulnerability
- Full paths of source files related to the issue
- Location of affected code (tag/branch/commit)
- Step-by-step instructions to reproduce
- Proof-of-concept or exploit code
- Impact and how an attacker might exploit it

### Response Process

1. **Acknowledgment:** Within 48 hours
2. **Investigation:** Within 7 days
3. **Fix Development:** Based on severity
4. **Disclosure:** After fix is deployed

### Safe Harbor

We support responsible disclosure:

- We will not take legal action against security researchers
- We will work with you to understand and fix the issue
- We will credit you (unless you prefer anonymity)

## Security Features

This application implements:

- ✅ NextAuth.js authentication
- ✅ Role-based access control
- ✅ Input validation (Zod)
- ✅ XSS protection (DOMPurify)
- ✅ CSRF protection
- ✅ Security headers (CSP, X-Frame-Options, etc.)
- ✅ Rate limiting (DynamoDB)
- ✅ Automated security tests
- ✅ Secret scanning
- ✅ Dependency vulnerability scanning

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x     | ✅        |

**Last Updated:** January 10, 2026
