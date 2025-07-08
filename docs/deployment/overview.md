# Deployment Overview

This document summarizes the deployment process for the Financial Assistant project.

## Deployment Steps
- Build the web app: `npm run build`
- Deploy to production server or hosting platform
- For mobile: build and publish via Android/iOS app stores
- Apply database migrations: `supabase db push`

## Environments
- Development: Local machine, feature branches
- Staging: Pre-production testing
- Production: Live environment

## Best Practices
- Use environment variables for secrets and configuration
- Automate deployments with CI/CD pipelines
- Monitor deployments and roll back on failure

---

For environment configuration, see [Environment Configuration](./environment.md).
For coding standards, see [Coding Guidelines](../CODING_GUIDELINES.md). 