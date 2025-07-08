# Environment Configuration

This document describes environment variable setup and configuration for deployment.

## Environment Variables
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase public API key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (server only)
- `NODE_ENV`: Set to `production` for production builds
- Other secrets as needed for third-party integrations

## Best Practices
- Never commit secrets to version control
- Use `.env` files for local development
- Use secure secret management in CI/CD and production

---

For deployment steps, see [Deployment Overview](./overview.md).
For coding standards, see [Coding Guidelines](../CODING_GUIDELINES.md). 