-- Rebuild Schema: Calculation Linking, RLS, and Indexes
-- This migration ensures all calculation_id columns, indexes, and RLS policies are present and correct

-- 1. Add calculation_id columns if not exists
ALTER TABLE public.expenses 
  ADD COLUMN IF NOT EXISTS calculation_id UUID REFERENCES public.user_data(id) ON DELETE CASCADE;
ALTER TABLE public.budgets 
  ADD COLUMN IF NOT EXISTS calculation_id UUID REFERENCES public.user_data(id) ON DELETE CASCADE;
ALTER TABLE public.spending_alerts 
  ADD COLUMN IF NOT EXISTS calculation_id UUID REFERENCES public.user_data(id) ON DELETE CASCADE;

-- 2. Add indexes for calculation_id
CREATE INDEX IF NOT EXISTS idx_expenses_calculation_id ON public.expenses(calculation_id);
CREATE INDEX IF NOT EXISTS idx_budgets_calculation_id ON public.budgets(calculation_id);
CREATE INDEX IF NOT EXISTS idx_spending_alerts_calculation_id ON public.spending_alerts(calculation_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_calculation ON public.expenses(user_id, calculation_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_calculation ON public.budgets(user_id, calculation_id);
CREATE INDEX IF NOT EXISTS idx_spending_alerts_user_calculation ON public.spending_alerts(user_id, calculation_id);

-- 3. Drop and recreate RLS policies for all relevant tables
-- PROFILES
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING ((SELECT auth.uid()) = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((SELECT auth.uid()) = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK ((SELECT auth.uid()) = id OR (SELECT auth.uid()) IS NOT NULL);

-- USER_SESSIONS
DROP POLICY IF EXISTS "Users can view own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON public.user_sessions;
CREATE POLICY "Users can view own sessions" ON public.user_sessions FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can update own sessions" ON public.user_sessions FOR UPDATE USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can insert own sessions" ON public.user_sessions FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can delete own sessions" ON public.user_sessions FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- USER_DATA
DROP POLICY IF EXISTS "Users can view own data" ON public.user_data;
DROP POLICY IF EXISTS "Users can update own data" ON public.user_data;
DROP POLICY IF EXISTS "Users can insert own data" ON public.user_data;
DROP POLICY IF EXISTS "Users can delete own data" ON public.user_data;
CREATE POLICY "Users can view own data" ON public.user_data FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can update own data" ON public.user_data FOR UPDATE USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can insert own data" ON public.user_data FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can delete own data" ON public.user_data FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- EXPENSES
DROP POLICY IF EXISTS "Users can view own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can insert own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON public.expenses;
CREATE POLICY "Users can view own expenses" ON public.expenses FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can insert own expenses" ON public.expenses FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can update own expenses" ON public.expenses FOR UPDATE USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can delete own expenses" ON public.expenses FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- BUDGETS
DROP POLICY IF EXISTS "Users can view own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can insert own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can update own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can delete own budgets" ON public.budgets;
CREATE POLICY "Users can view own budgets" ON public.budgets FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can insert own budgets" ON public.budgets FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can update own budgets" ON public.budgets FOR UPDATE USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can delete own budgets" ON public.budgets FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- USER_PREFERENCES
DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can delete own preferences" ON public.user_preferences;
CREATE POLICY "Users can view own preferences" ON public.user_preferences FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can insert own preferences" ON public.user_preferences FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can update own preferences" ON public.user_preferences FOR UPDATE USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can delete own preferences" ON public.user_preferences FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- SPENDING_ALERTS
DROP POLICY IF EXISTS "Users can view own alerts" ON public.spending_alerts;
DROP POLICY IF EXISTS "Users can insert own alerts" ON public.spending_alerts;
DROP POLICY IF EXISTS "Users can update own alerts" ON public.spending_alerts;
DROP POLICY IF EXISTS "Users can delete own alerts" ON public.spending_alerts;
CREATE POLICY "Users can view own alerts" ON public.spending_alerts FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can insert own alerts" ON public.spending_alerts FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can update own alerts" ON public.spending_alerts FOR UPDATE USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can delete own alerts" ON public.spending_alerts FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- 4. Helper functions
CREATE OR REPLACE FUNCTION public.get_calculation_currency(calc_id UUID)
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT (data_content->>'currency')::TEXT
        FROM public.user_data
        WHERE id = calc_id
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.validate_calculation_ownership(calc_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_data
        WHERE id = calc_id AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- End of migration 