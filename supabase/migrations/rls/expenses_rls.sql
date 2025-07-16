-- RLS policies for expense-related tables
-- Enable RLS on all expense tables
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spending_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;

-- Expenses RLS policies
DROP POLICY IF EXISTS "Users can view own expenses" ON public.expenses;
CREATE POLICY "Users can view own expenses" ON public.expenses
    FOR SELECT USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own expenses" ON public.expenses;
CREATE POLICY "Users can insert own expenses" ON public.expenses
    FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own expenses" ON public.expenses;
CREATE POLICY "Users can update own expenses" ON public.expenses
    FOR UPDATE USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own expenses" ON public.expenses;
CREATE POLICY "Users can delete own expenses" ON public.expenses
    FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- Budgets RLS policies
DROP POLICY IF EXISTS "Users can view own budgets" ON public.budgets;
CREATE POLICY "Users can view own budgets" ON public.budgets
    FOR SELECT USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own budgets" ON public.budgets;
CREATE POLICY "Users can insert own budgets" ON public.budgets
    FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own budgets" ON public.budgets;
CREATE POLICY "Users can update own budgets" ON public.budgets
    FOR UPDATE USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own budgets" ON public.budgets;
CREATE POLICY "Users can delete own budgets" ON public.budgets
    FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- Spending alerts RLS policies
DROP POLICY IF EXISTS "Users can view own alerts" ON public.spending_alerts;
CREATE POLICY "Users can view own alerts" ON public.spending_alerts
    FOR SELECT USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own alerts" ON public.spending_alerts;
CREATE POLICY "Users can insert own alerts" ON public.spending_alerts
    FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own alerts" ON public.spending_alerts;
CREATE POLICY "Users can update own alerts" ON public.spending_alerts
    FOR UPDATE USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own alerts" ON public.spending_alerts;
CREATE POLICY "Users can delete own alerts" ON public.spending_alerts
    FOR DELETE USING ((SELECT auth.uid()) = user_id); 