-- Migration: Create *_with_categories views for dashboard (no SECURITY DEFINER)
-- ===========================================
-- Drop existing views if they exist
DROP VIEW IF EXISTS public.expenses_with_categories;
DROP VIEW IF EXISTS public.budgets_with_categories;
DROP VIEW IF EXISTS public.alerts_with_categories;

-- Create a view for expenses with category information
CREATE VIEW public.expenses_with_categories AS
SELECT 
    e.id,
    e.user_id,
    e.category_id,
    e.amount,
    e.currency,
    e.date,
    e.description,
    e.location,
    e.source,
    e.calculation_id,
    e.created_at,
    e.updated_at,
    ec.name as category_name,
    ec.icon as category_icon,
    ec.color as category_color
FROM public.expenses e
LEFT JOIN public.expense_categories ec ON e.category_id = ec.id;

-- Create a view for budgets with category information
CREATE VIEW public.budgets_with_categories AS
SELECT 
    b.id,
    b.user_id,
    b.category_id,
    b.amount,
    b.currency,
    b.period,
    b.start_date,
    b.end_date,
    b.calculation_id,
    b.created_at,
    b.updated_at,
    ec.name as category_name,
    ec.icon as category_icon,
    ec.color as category_color
FROM public.budgets b
LEFT JOIN public.expense_categories ec ON b.category_id = ec.id;

-- Create a view for alerts with category information
CREATE VIEW public.alerts_with_categories AS
SELECT 
    sa.id,
    sa.user_id,
    sa.category_id,
    sa.threshold,
    sa.type,
    sa.severity,
    sa.period,
    sa.active,
    sa.currency,
    sa.calculation_id,
    sa.created_at,
    sa.updated_at,
    ec.name as category_name,
    ec.icon as category_icon,
    ec.color as category_color
FROM public.spending_alerts sa
LEFT JOIN public.expense_categories ec ON sa.category_id = ec.id;

-- Grant permissions on views
GRANT SELECT ON public.expenses_with_categories TO authenticated;
GRANT SELECT ON public.budgets_with_categories TO authenticated;
GRANT SELECT ON public.alerts_with_categories TO authenticated; 