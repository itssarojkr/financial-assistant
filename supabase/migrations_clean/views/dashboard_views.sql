-- Canonical dashboard and location views

-- Drop existing views if they exist
DROP VIEW IF EXISTS public.expenses_with_categories;
DROP VIEW IF EXISTS public.budgets_with_categories;
DROP VIEW IF EXISTS public.alerts_with_categories;
DROP VIEW IF EXISTS location_hierarchy;

-- Expenses with category info
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

-- Budgets with category info
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

-- Alerts with category info
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

-- Location hierarchy view
CREATE VIEW location_hierarchy AS
SELECT 
  c.id as country_id,
  c.code as country_code,
  c.name as country_name,
  c.currency,
  c.region,
  s.id as state_id,
  s.name as state_name,
  s.code as state_code,
  s.capital as state_capital,
  ci.id as city_id,
  ci.name as city_name,
  ci.population as city_population,
  ci.latitude,
  ci.longitude,
  ci.timezone
FROM countries c
LEFT JOIN states s ON c.id = s.country_id
LEFT JOIN cities ci ON s.id = ci.state_id;

-- Grant permissions
GRANT SELECT ON public.expenses_with_categories TO authenticated;
GRANT SELECT ON public.budgets_with_categories TO authenticated;
GRANT SELECT ON public.alerts_with_categories TO authenticated;
GRANT SELECT ON location_hierarchy TO authenticated;
GRANT SELECT ON location_hierarchy TO anon; 