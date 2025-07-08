# Database Performance Guide

This document provides tips and best practices for optimizing database performance in the Financial Assistant project.

## Related Migration
- `003_performance_optimization.sql` in `supabase/migrations/` adds performance-related indexes, materialized views, and query optimizations. Review this migration before adding new performance-related changes.

## Indexing
- Use composite indexes for common query patterns.
- Regularly review and optimize indexes as the schema evolves.

## Query Optimization
- Use efficient SQL queries and avoid N+1 query problems.
- Use materialized views for pre-computed analytics data.
- Monitor query performance and refactor slow queries.

## Connection Management
- Use connection pooling for efficient resource usage.
- Monitor and tune connection limits as needed.

## Maintenance
- Regularly vacuum and analyze tables.
- Archive or delete old data to keep tables lean.

---

For schema details, see [Database Schema](./schema.md).
For migration management, see [Migration Guide](./migrations.md). 