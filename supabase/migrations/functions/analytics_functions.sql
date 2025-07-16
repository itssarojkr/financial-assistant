-- Analytics functions and materialized views

-- Monthly expense summary for each user
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_monthly_expense_summary AS
SELECT 
    user_id,
    DATE_TRUNC('month', date) as month,
    category_id,
    SUM(amount) as total_amount,
    COUNT(*) as transaction_count,
    AVG(amount) as avg_amount
FROM public.expenses
GROUP BY user_id, DATE_TRUNC('month', date), category_id;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_mv_monthly_expense_user_month ON mv_monthly_expense_summary(user_id, month DESC);

-- Budget vs actual spending comparison
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_budget_vs_actual AS
SELECT 
    b.user_id,
    b.category_id,
    b.period,
    b.amount as budget_amount,
    COALESCE(SUM(e.amount), 0) as actual_amount,
    b.amount - COALESCE(SUM(e.amount), 0) as difference
FROM public.budgets b
LEFT JOIN public.expenses e ON b.user_id = e.user_id 
    AND b.category_id = e.category_id 
    AND e.date BETWEEN b.start_date AND b.end_date
GROUP BY b.user_id, b.category_id, b.period, b.amount, b.start_date, b.end_date;

-- Create index on budget vs actual view
CREATE INDEX IF NOT EXISTS idx_mv_budget_vs_actual_user ON mv_budget_vs_actual(user_id);

-- Function to get user's monthly expense summary
CREATE OR REPLACE FUNCTION get_user_monthly_expenses(
    p_user_id UUID,
    p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    p_month INTEGER DEFAULT EXTRACT(MONTH FROM CURRENT_DATE)
)
RETURNS TABLE (
    category_id INTEGER,
    category_name TEXT,
    total_amount NUMERIC,
    transaction_count BIGINT,
    avg_amount NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ec.id as category_id,
        ec.name as category_name,
        COALESCE(SUM(e.amount), 0) as total_amount,
        COUNT(e.id) as transaction_count,
        COALESCE(AVG(e.amount), 0) as avg_amount
    FROM public.expense_categories ec
    LEFT JOIN public.expenses e ON ec.id = e.category_id 
        AND e.user_id = p_user_id
        AND EXTRACT(YEAR FROM e.date) = p_year
        AND EXTRACT(MONTH FROM e.date) = p_month
    GROUP BY ec.id, ec.name
    ORDER BY total_amount DESC;
END;
$$;

-- Function to get user's spending alerts with category info
CREATE OR REPLACE FUNCTION get_user_spending_alerts(p_user_id UUID)
RETURNS TABLE (
    alert_id UUID,
    category_id INTEGER,
    category_name TEXT,
    threshold NUMERIC,
    period TEXT,
    active BOOLEAN,
    current_spending NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sa.id as alert_id,
        sa.category_id,
        ec.name as category_name,
        sa.threshold,
        sa.period,
        sa.active,
        COALESCE(SUM(e.amount), 0) as current_spending
    FROM public.spending_alerts sa
    JOIN public.expense_categories ec ON sa.category_id = ec.id
    LEFT JOIN public.expenses e ON sa.category_id = e.category_id 
        AND e.user_id = sa.user_id
        AND e.date >= CASE 
            WHEN sa.period = 'monthly' THEN DATE_TRUNC('month', CURRENT_DATE)
            WHEN sa.period = 'weekly' THEN DATE_TRUNC('week', CURRENT_DATE)
            WHEN sa.period = 'yearly' THEN DATE_TRUNC('year', CURRENT_DATE)
            ELSE DATE_TRUNC('month', CURRENT_DATE)
        END
    WHERE sa.user_id = p_user_id AND sa.active = true
    GROUP BY sa.id, sa.category_id, ec.name, sa.threshold, sa.period, sa.active;
END;
$$;

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_monthly_expense_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_budget_vs_actual;
END;
$$;

-- Function to get paginated expenses with optimized queries
CREATE OR REPLACE FUNCTION get_user_expenses_paginated(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0,
    p_category_id INTEGER DEFAULT NULL,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    category_id INTEGER,
    category_name TEXT,
    amount NUMERIC,
    currency TEXT,
    date DATE,
    description TEXT,
    total_count BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN QUERY
    WITH expense_data AS (
        SELECT 
            e.id,
            e.category_id,
            ec.name as category_name,
            e.amount,
            e.currency,
            e.date,
            e.description,
            COUNT(*) OVER() as total_count
        FROM public.expenses e
        LEFT JOIN public.expense_categories ec ON e.category_id = ec.id
        WHERE e.user_id = p_user_id
            AND (p_category_id IS NULL OR e.category_id = p_category_id)
            AND (p_start_date IS NULL OR e.date >= p_start_date)
            AND (p_end_date IS NULL OR e.date <= p_end_date)
        ORDER BY e.date DESC, e.created_at DESC
        LIMIT p_limit OFFSET p_offset
    )
    SELECT 
        ed.id,
        ed.category_id,
        ed.category_name,
        ed.amount,
        ed.currency,
        ed.date,
        ed.description,
        ed.total_count
    FROM expense_data ed;
END;
$$; 