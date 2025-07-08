# Project Changelog

This changelog records all significant changes, migrations, refactors, documentation reorganizations, and architectural decisions for the Financial Assistant project. All future changes must be logged here for reference by AI tools and developers.

---

## 2024-07-07
- Added calculation_id columns and RLS policies for expenses, budgets, and alerts. Updated domain entities and UserDataService for calculation linkage. Refactored FinancialDashboard for per-calculation data. (AI)
- Fixed migration errors by removing duplicate RLS policy creation for profiles. (AI)
- Created a comprehensive knowledge base (KNOWLEDGE_BASE.md) with file/folder purposes, change log, and architectural/security decisions. (AI)
- Created a standalone, reusable coding guidelines document (CODING_GUIDELINES.md). (AI)
- Reorganized all documentation into purpose-driven folders: database, security, mobile, testing, deployment, performance, troubleshooting. (AI)
- Updated README.md and overview.md for navigation and clarity. (AI)
- Added cross-links between all major docs and coding guidelines. (AI)

## 2024-07-08
- Restored calculation edit feature in Financial Dashboard: added edit icon, integrated SaveCalculationModal, and enabled editing/saving calculations from the dashboard view. (AI)
- Began feature regression audit to identify and restore features lost during reorganization. (AI)

## 2024-07-09
- Comprehensive accessibility and responsive design audit: improved semantic HTML, ARIA, keyboard navigation, focus management, and mobile layouts across all forms, modals, navigation, and dashboard components.
- Enhanced profile editing: added avatar upload/change functionality with Supabase Storage integration, improved accessibility and responsive design for profile settings.
- Polished NotFound page: added skip link, accessible headings, helpful navigation options (Home, Dashboard, Help), and mobile-friendly layout.
- Performance optimizations: implemented code splitting (React.lazy/Suspense) for all main routes/pages, added accessible loading spinners, and ensured all images use lazy loading and descriptive alt text.
- Security improvements: sanitized all user input, ensured safe usage of dangerouslySetInnerHTML in charts, and reviewed session management for best practices.
- Expanded E2E and accessibility testing: added jest-axe a11y checks to dashboard and forms, ensured all major flows are covered with accessible queries and user interaction tests.
- **Process update:** All future code, documentation, or architectural changes must be logged in this changelog immediately after they are made, for both AI and human developer reference.

---

## Instructions
- **Every time you make a change, deletion, or rename in the codebase or documentation, add a new dated entry here.**
- Include a brief but clear description of what was changed and why.
- This file is intended for use by both AI tools and human developers for reliable project history and context. 