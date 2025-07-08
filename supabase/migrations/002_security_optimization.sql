-- Security Optimization
-- This migration optimizes RLS policies for performance and fixes function search paths

-- ===========================================
-- 1. RLS PERFORMANCE OPTIMIZATION
-- ===========================================

-- Fix RLS policies by wrapping auth.uid() in subqueries for better performance

-- PROFILES TABLE
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (
        (SELECT auth.uid()) = id OR 
        (SELECT auth.uid()) IS NOT NULL
    );

-- USER_SESSIONS TABLE
DROP POLICY IF EXISTS "Users can view own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON public.user_sessions;

CREATE POLICY "Users can view own sessions" ON public.user_sessions
    FOR SELECT USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own sessions" ON public.user_sessions
    FOR UPDATE USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own sessions" ON public.user_sessions
    FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own sessions" ON public.user_sessions
    FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- USER_DATA TABLE
DROP POLICY IF EXISTS "Users can view own data" ON public.user_data;
DROP POLICY IF EXISTS "Users can update own data" ON public.user_data;
DROP POLICY IF EXISTS "Users can insert own data" ON public.user_data;
DROP POLICY IF EXISTS "Users can delete own data" ON public.user_data;

CREATE POLICY "Users can view own data" ON public.user_data
    FOR SELECT USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own data" ON public.user_data
    FOR UPDATE USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own data" ON public.user_data
    FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own data" ON public.user_data
    FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- EXPENSES TABLE
DROP POLICY IF EXISTS "Users can view own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can insert own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON public.expenses;

CREATE POLICY "Users can view own expenses" ON public.expenses
    FOR SELECT USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own expenses" ON public.expenses
    FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own expenses" ON public.expenses
    FOR UPDATE USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own expenses" ON public.expenses
    FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- BUDGETS TABLE
DROP POLICY IF EXISTS "Users can view own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can insert own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can update own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can delete own budgets" ON public.budgets;

CREATE POLICY "Users can view own budgets" ON public.budgets
    FOR SELECT USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own budgets" ON public.budgets
    FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own budgets" ON public.budgets
    FOR UPDATE USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own budgets" ON public.budgets
    FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- USER_PREFERENCES TABLE
DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can delete own preferences" ON public.user_preferences;

CREATE POLICY "Users can view own preferences" ON public.user_preferences
    FOR SELECT USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own preferences" ON public.user_preferences
    FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own preferences" ON public.user_preferences
    FOR UPDATE USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own preferences" ON public.user_preferences
    FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- SPENDING_ALERTS TABLE
DROP POLICY IF EXISTS "Users can view own alerts" ON public.spending_alerts;
DROP POLICY IF EXISTS "Users can insert own alerts" ON public.spending_alerts;
DROP POLICY IF EXISTS "Users can update own alerts" ON public.spending_alerts;
DROP POLICY IF EXISTS "Users can delete own alerts" ON public.spending_alerts;

CREATE POLICY "Users can view own alerts" ON public.spending_alerts
    FOR SELECT USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own alerts" ON public.spending_alerts
    FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own alerts" ON public.spending_alerts
    FOR UPDATE USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own alerts" ON public.spending_alerts
    FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- ===========================================
-- 2. FUNCTION SEARCH PATH FIXES
-- ===========================================

-- Fix function search path for handle_new_user function
-- Set explicit search path to prevent search path injection attacks
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Use SECURITY DEFINER to bypass RLS for this function
    INSERT INTO public.profiles (id, email, first_name, last_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    );
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- If profile already exists, just return
        RETURN NEW;
    WHEN OTHERS THEN
        -- Log the error but don't fail the signup
        RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;

-- Fix function search path for update_updated_at_column function
-- Set explicit search path to prevent search path injection attacks
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- ===========================================
-- 3. VERIFICATION QUERIES
-- ===========================================

-- Verify RLS policies use subqueries
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'user_sessions', 'user_data', 'expenses', 'budgets', 'user_preferences', 'spending_alerts')
ORDER BY tablename, policyname;

-- Verify functions have correct search path
SELECT 
    proname as function_name,
    CASE 
        WHEN proconfig IS NULL OR array_length(proconfig, 1) IS NULL THEN 'No search_path set'
        ELSE 'Search path configured'
    END as search_path_status,
    CASE 
        WHEN prosecdef THEN 'SECURITY DEFINER'
        ELSE 'SECURITY INVOKER'
    END as security_context
FROM pg_proc 
WHERE proname IN ('handle_new_user', 'update_updated_at_column')
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- ===========================================
-- 4. SECURITY NOTES
-- ===========================================

-- Note: To enable leaked password protection, go to:
-- Supabase Dashboard > Authentication > Settings > Security
-- Enable "Check for compromised passwords"

-- Performance benefits of RLS optimization:
-- 1. Reduced query planning time
-- 2. Better index utilization
-- 3. Improved scalability at high user counts
-- 4. Elimination of Supabase security warnings 