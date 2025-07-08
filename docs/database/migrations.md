# Database Migration Guide

This document covers how to manage database migrations for the Financial Assistant project.

## Migration Scripts Overview

All migration scripts are located in `supabase/migrations/` and must be applied in order. Each script addresses a specific area:

- `001_initial_schema.sql`: Creates the initial database schema, tables, indexes, and basic RLS policies.
- `002_security_optimization.sql`: Optimizes RLS policies for performance and security, and fixes function search paths.
- `003_performance_optimization.sql`: Adds performance-related indexes, materialized views, and query optimizations.
- `009_comprehensive_location_data.sql`: Adds comprehensive location and locality data for all supported countries.
- `010_calculation_linkage.sql`: Adds calculation_id columns and RLS policies for expenses, budgets, and alerts, enabling per-calculation data linkage.

## Other SQL Scripts

- `location_data.sql` (project root): Standalone script for importing or updating location data. Use only if not covered by migrations.

## Best Practices for Creating New Migrations

- **Before creating a new migration, always check existing scripts to see if your change is already covered.**
- Never duplicate table, index, or policy creation. Use `DROP ... IF EXISTS` before `CREATE ...` for idempotency.
- Document the purpose of each migration at the top of the file.
- Test migrations on a staging environment before applying to production.
- Use `supabase db push` to apply migrations.

## How to Check for Existing Logic

1. Review the migration filenames and their documented purposes above.
2. Search within the `supabase/migrations/` folder for relevant table, column, or policy names.
3. If adding location/locality data, check both `009_comprehensive_location_data.sql` and `location_data.sql`.
4. If in doubt, consult the [Knowledge Base](../KNOWLEDGE_BASE.md) or ask a team member.

## Standalone Location Data Script

- `location_data.sql` (project root):
  - Use this script for one-off imports or updates of location data if not already covered by `009_comprehensive_location_data.sql`.
  - **Warning:** Always check if the data or schema changes are already handled by the comprehensive migration before running or modifying this script to avoid duplication or conflicts.

---

For schema details, see [Database Schema](./schema.md).
For performance tips, see [Performance Guide](./performance.md). 