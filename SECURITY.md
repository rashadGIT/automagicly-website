# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of AutoMagicly seriously. If you've discovered a security vulnerability, we appreciate your help in disclosing it to us responsibly.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

1. **Email:** Send details to `security@automagicly.com` (if configured)
2. **GitHub Security Advisories:** Use the "Security" tab in this repository
3. **Direct Contact:** Reach out to the maintainers directly

### What to Include

Please include the following information:

- Type of vulnerability (e.g., XSS, CSRF, SQL injection, etc.)
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability, including how an attacker might exploit it

### Response Timeline

- **Initial Response:** Within 48 hours
- **Status Update:** Within 7 days
- **Fix Timeline:** Depends on severity
  - Critical: 1-7 days
  - High: 7-14 days
  - Medium: 14-30 days
  - Low: 30-90 days

### Safe Harbor

We support responsible vulnerability disclosure. If you comply with this policy:

- We will not pursue legal action against you
- We will work with you to understand and resolve the issue
- Your name will be acknowledged in our security acknowledgments (unless you prefer anonymity)

## Security Measures

### Current Protections

Our application implements multiple layers of security:

#### Authentication & Authorization
- NextAuth.js with bcrypt password hashing
- JWT-based session management
- Role-based access control (RBAC)
- Protected admin routes via middleware
- Session expiry (7 days max, 24-hour idle timeout)

#### Input Validation & Sanitization
- Zod schemas for all API endpoints
- XSS protection via DOMPurify
- Profanity filtering
- Email format validation
- Request size limits (1MB max)

#### Network Security
- CSRF protection (origin/referer validation)
- Content Security Policy (CSP) headers
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin

#### Rate Limiting
- DynamoDB-based rate limiting
- 10 requests/min per session
- 20 requests/min per IP
- Fail-open for availability

#### Infrastructure Security
- Server-side environment variables protected
- No secrets in client bundle
- Structured logging for security events
- Automated security testing via GitHub Actions

### Known Limitations

1. **In-Memory Rate Limiting:** While we use DynamoDB for rate limiting, serverless cold starts may reset limits. This is acceptable for our threat model but may not prevent sophisticated DDoS attacks.

2. **Client-Side Validation:** We validate on both client and server, but client-side validation can be bypassed. Server-side validation is the source of truth.

3. **No Web Application Firewall (WAF):** Currently not implemented. Consider adding CloudFront WAF for production at scale.

## Security Best Practices for Contributors

If you're contributing code:

1. **Never commit secrets** - Use environment variables
2. **Validate all inputs** - Use Zod schemas
3. **Sanitize all outputs** - Use DOMPurify for user content
4. **Use parameterized queries** - Prevent injection attacks
5. **Test security features** - Add tests for security controls
6. **Follow principle of least privilege** - Minimal permissions
7. **Keep dependencies updated** - Run `npm audit` regularly

## Security Testing

We perform:

- Automated security tests on every commit (GitHub Actions)
- Dependency vulnerability scanning (`npm audit`)
- Secret scanning (TruffleHog)
- Input validation tests
- Authorization tests
- CSRF protection tests
- XSS protection tests

## Incident Response

In the event of a security incident:

1. **Immediate:** Isolate affected systems
2. **Within 1 hour:** Assess impact and scope
3. **Within 4 hours:** Begin remediation
4. **Within 24 hours:** Notify affected users (if applicable)
5. **Within 7 days:** Post-incident review and updates

## Security Contacts

- **Security Team:** (Configure your contact email)
- **Repository Maintainer:** Check GitHub profile
- **Emergency Contact:** (Configure emergency contact)

## Security Acknowledgments

We'd like to thank the following individuals for responsibly disclosing security vulnerabilities:

- (List will be updated as reports come in)

## Updates to This Policy

This security policy may be updated from time to time. Please check back regularly.

**Last Updated:** January 10, 2026
**Policy Version:** 1.0
