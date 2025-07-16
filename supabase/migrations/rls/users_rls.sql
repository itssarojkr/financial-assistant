-- RLS policies for user-related tables
-- Enable RLS on all user tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies (optimized with subqueries)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK ((SELECT auth.uid()) = id OR (SELECT auth.uid()) IS NOT NULL);

-- User sessions RLS policies
DROP POLICY IF EXISTS "Users can view own sessions" ON public.user_sessions;
CREATE POLICY "Users can view own sessions" ON public.user_sessions
    FOR SELECT USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own sessions" ON public.user_sessions;
CREATE POLICY "Users can update own sessions" ON public.user_sessions
    FOR UPDATE USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own sessions" ON public.user_sessions;
CREATE POLICY "Users can insert own sessions" ON public.user_sessions
    FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own sessions" ON public.user_sessions;
CREATE POLICY "Users can delete own sessions" ON public.user_sessions
    FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- User data RLS policies
DROP POLICY IF EXISTS "Users can view own data" ON public.user_data;
CREATE POLICY "Users can view own data" ON public.user_data
    FOR SELECT USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own data" ON public.user_data;
CREATE POLICY "Users can update own data" ON public.user_data
    FOR UPDATE USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own data" ON public.user_data;
CREATE POLICY "Users can insert own data" ON public.user_data
    FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own data" ON public.user_data;
CREATE POLICY "Users can delete own data" ON public.user_data
    FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- User preferences RLS policies
DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
CREATE POLICY "Users can view own preferences" ON public.user_preferences
    FOR SELECT USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own preferences" ON public.user_preferences;
CREATE POLICY "Users can insert own preferences" ON public.user_preferences
    FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;
CREATE POLICY "Users can update own preferences" ON public.user_preferences
    FOR UPDATE USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own preferences" ON public.user_preferences;
CREATE POLICY "Users can delete own preferences" ON public.user_preferences
    FOR DELETE USING ((SELECT auth.uid()) = user_id); 