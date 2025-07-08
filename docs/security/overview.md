# Security Overview

This document summarizes security best practices for the Financial Assistant project.

## General Security Principles
- Use secure authentication and authorization for all users.
- Encrypt all data in transit (HTTPS) and at rest.
- Apply Row Level Security (RLS) for all user data tables.
- Sanitize all user input to prevent XSS and injection attacks.
- Never hardcode secrets or credentials in the codebase.
- Regularly review and update security policies and practices.

## Supabase Security
- See [Supabase Security](./supabase.md) for platform-specific configuration and RLS policy details.

---

For coding guidelines, see [Coding Guidelines](../CODING_GUIDELINES.md). 