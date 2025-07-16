-- Database Permissions
-- Comprehensive GRANT statements for all database objects

-- ===========================================
-- TABLE PERMISSIONS
-- ===========================================

-- Spending habits table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.spending_habits TO authenticated;

-- Location expenses table permissions
GRANT SELECT ON public.location_expenses TO authenticated;
GRANT SELECT ON public.location_expenses TO anon;

-- ===========================================
-- VIEW PERMISSIONS
-- ===========================================

-- Dashboard views permissions
GRANT SELECT ON public.expenses_with_categories TO authenticated;
GRANT SELECT ON public.budgets_with_categories TO authenticated;
GRANT SELECT ON public.alerts_with_categories TO authenticated;

-- Location views permissions
GRANT SELECT ON location_hierarchy TO authenticated;
GRANT SELECT ON location_hierarchy TO anon;

-- ===========================================
-- FUNCTION PERMISSIONS
-- ===========================================

-- Location functions permissions
GRANT EXECUTE ON FUNCTION get_locations_by_country(VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION search_locations(VARCHAR) TO authenticated;

-- Analytics functions permissions
GRANT EXECUTE ON FUNCTION get_user_monthly_expenses(UUID, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_spending_alerts(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_analytics_views() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_expenses_paginated(UUID, INTEGER, INTEGER, INTEGER, DATE, DATE) TO authenticated;

-- ===========================================
-- MATERIALIZED VIEW PERMISSIONS
-- ===========================================

-- Analytics materialized views permissions
GRANT SELECT ON mv_monthly_expense_summary TO authenticated;
GRANT SELECT ON mv_budget_vs_actual TO authenticated;

-- ===========================================
-- SEQUENCE PERMISSIONS (if any auto-increment sequences exist)
-- ===========================================

-- Grant usage on sequences for authenticated users
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated; 