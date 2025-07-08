# Financial Assistant Project Knowledge Base

## Reference Links
- [Coding Guidelines](./CODING_GUIDELINES.md)
- [Project Overview](./overview.md)

## Project Structure & File/Folder Descriptions

- `src/` - Main source code for the web and shared logic.
  - `application/` - Application services and business logic.
  - `components/` - React UI components, organized by feature/domain.
  - `contexts/` - React context providers (e.g., AuthContext).
  - `core/` - Domain entities, value objects, enums, and interfaces for clean architecture.
  - `hooks/` - Custom React hooks.
  - `infrastructure/` - Database, notifications, and security services.
  - `integrations/` - Third-party integrations (e.g., Supabase client).
  - `lib/` - Utility functions and tax calculation strategies.
  - `pages/` - Top-level page components for routing.
  - `presentation/` - Presentation layer: UI components, hooks, and pages.
  - `services/` - Shared services for app features (e.g., analytics, preferences).
  - `shared/` - Shared constants, types, and utility functions.
  - `test/` - Unit and integration tests.
- `android/` - Android native project for mobile app.
- `public/` - Static assets for the web app.
- `supabase/` - Supabase configuration and migration scripts.
- `docs/` - Documentation, including this knowledge base.

## Change Log

_This section must be updated with every change, deletion, or rename in the codebase._

- **2024-07-07**: Added calculation_id columns and RLS policies for expenses, budgets, and alerts. Updated domain entities and UserDataService for calculation linkage. Refactored FinancialDashboard for per-calculation data. (AI)
- **2024-07-07**: Fixed migration errors by removing duplicate RLS policy creation for profiles. (AI)
- **2024-07-07**: Created this knowledge base and file/folder descriptions. (AI)

## Architectural & Security Decisions

- RLS (Row Level Security) policies for the `profiles` table are created in 001_initial_schema.sql and optimized in 002_security_optimization.sql. The optimized version uses ((SELECT auth.uid()) = id) for performance. Do not recreate this policy in future migrations unless updating or dropping it first.
- All calculation-linked data (expenses, budgets, alerts) must use the calculation_id field for proper multi-calculation support.
- All migrations must be idempotent: use DROP POLICY IF EXISTS before CREATE POLICY, and avoid duplicating policy creation across migrations.
- Supabase client credentials are managed via environment variables and the Supabase CLI, not hardcoded in the codebase.

---

_This document is intended for use by AI tools and developers. Update the Change Log and file/folder descriptions with every change for reliable future reference._ 