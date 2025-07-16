-- Triggers for expense-related tables

-- Updated_at triggers for expense tables
DROP TRIGGER IF EXISTS update_expenses_updated_at ON public.expenses;
CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON public.expenses
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_budgets_updated_at ON public.budgets;
CREATE TRIGGER update_budgets_updated_at
    BEFORE UPDATE ON public.budgets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_spending_alerts_updated_at ON public.spending_alerts;
CREATE TRIGGER update_spending_alerts_updated_at
    BEFORE UPDATE ON public.spending_alerts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Materialized view refresh trigger function
CREATE OR REPLACE FUNCTION trigger_refresh_expense_views()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Refresh materialized views asynchronously
    PERFORM pg_notify('refresh_views', 'expenses_changed');
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers for automatic view refresh
DROP TRIGGER IF EXISTS trigger_expenses_refresh_views ON public.expenses;
CREATE TRIGGER trigger_expenses_refresh_views
    AFTER INSERT OR UPDATE OR DELETE ON public.expenses
    FOR EACH ROW EXECUTE FUNCTION trigger_refresh_expense_views();

DROP TRIGGER IF EXISTS trigger_budgets_refresh_views ON public.budgets;
CREATE TRIGGER trigger_budgets_refresh_views
    AFTER INSERT OR UPDATE OR DELETE ON public.budgets
    FOR EACH ROW EXECUTE FUNCTION trigger_refresh_expense_views(); 