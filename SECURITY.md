# Security Policy

## Supported Versions

Security updates are provided for the following branches:

| Version/Branch | Supported |
|----------------|-----------|
| `main`         | Yes       |

## Reporting a Vulnerability

Please do **not** open public GitHub issues for security vulnerabilities.

Instead, report privately to:

- **Email:** gustavosilvafranco643@gmail.com
- **GitHub:** [Security Advisories](https://github.com/GustavoSF643/permissions.api/security/advisories/new) (after the repository is published)

Include:

1. A clear description of the issue and impact
2. Steps to reproduce (proof of concept if possible)
3. Affected endpoints/files and environment details
4. Suggested fix or mitigation (optional)

We will acknowledge receipt as soon as possible and work on triage/fix.

## Security Best Practices for Contributors

- Never commit `.env` files, private keys, tokens, or credentials
- Keep dependencies updated and avoid unnecessary packages
- Use least-privilege defaults for permissions/roles
- Validate and sanitize all external input
- Prefer secure defaults in configuration and auth flows
