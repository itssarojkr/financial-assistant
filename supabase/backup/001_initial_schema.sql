-- Initial Database Schema
-- This migration creates all core tables, indexes, and basic RLS policies

-- ===========================================
-- 1. CORE USER TABLES
-- ===========================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_sessions table to store user preferences and session data
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    session_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_data table to store user's tax calculations and saved data
CREATE TABLE IF NOT EXISTS public.user_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    data_type TEXT NOT NULL, -- 'tax_calculation', 'salary_data', 'preferences', etc.
    data_name TEXT NOT NULL, -- name for the saved data
    data_content JSONB NOT NULL,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, data_type, data_name)
);

-- ===========================================
-- 2. EXPENSE TRACKING TABLES
-- ===========================================

-- Expense Categories
CREATE TABLE IF NOT EXISTS public.expense_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT,
    color TEXT,
    is_default BOOLEAN DEFAULT TRUE
);

-- Insert default categories
INSERT INTO public.expense_categories (name, icon, color, is_default) VALUES
    ('Rent', 'home', '#4F46E5', TRUE),
    ('Food', 'utensils', '#16A34A', TRUE),
    ('Transport', 'car', '#F59E42', TRUE),
    ('Utilities', 'zap', '#FACC15', TRUE),
    ('Healthcare', 'heart', '#EF4444', TRUE),
    ('Insurance', 'shield', '#6366F1', TRUE),
    ('Phone', 'phone', '#0EA5E9', TRUE),
    ('Internet', 'wifi', '#A21CAF', TRUE),
    ('Shopping', 'shopping-bag', '#F472B6', TRUE),
    ('Entertainment', 'film', '#FBBF24', TRUE),
    ('Other', 'dots-horizontal', '#6B7280', TRUE)
ON CONFLICT DO NOTHING;

-- Expenses
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category_id INTEGER REFERENCES public.expense_categories(id),
    amount NUMERIC(12,2) NOT NULL,
    currency TEXT NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    location TEXT,
    source TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Budgets
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category_id INTEGER REFERENCES public.expense_categories(id),
    amount NUMERIC(12,2) NOT NULL,
    period TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    default_currency TEXT,
    theme TEXT,
    language TEXT,
    notifications JSONB,
    sms_scanning_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spending Alerts
CREATE TABLE IF NOT EXISTS public.spending_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category_id INTEGER REFERENCES public.expense_categories(id),
    threshold NUMERIC(12,2) NOT NULL,
    period TEXT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- 3. BASIC INDEXES
-- ===========================================

-- Core user table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON public.user_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_data_type ON public.user_data(data_type);
CREATE INDEX IF NOT EXISTS idx_user_data_favorite ON public.user_data(is_favorite);

-- Expense tracking indexes
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_expense_categories_name ON public.expense_categories(name);
CREATE INDEX IF NOT EXISTS idx_spending_alerts_user_id ON public.spending_alerts(user_id);

-- ===========================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spending_alerts ENABLE ROW LEVEL SECURITY;

-- Reference tables RLS (public read access)
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for user_sessions
DROP POLICY IF EXISTS "Users can view own sessions" ON public.user_sessions;
CREATE POLICY "Users can view own sessions" ON public.user_sessions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own sessions" ON public.user_sessions;
CREATE POLICY "Users can update own sessions" ON public.user_sessions
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own sessions" ON public.user_sessions;
CREATE POLICY "Users can insert own sessions" ON public.user_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own sessions" ON public.user_sessions;
CREATE POLICY "Users can delete own sessions" ON public.user_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_data
DROP POLICY IF EXISTS "Users can view own data" ON public.user_data;
CREATE POLICY "Users can view own data" ON public.user_data
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own data" ON public.user_data;
CREATE POLICY "Users can update own data" ON public.user_data
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own data" ON public.user_data;
CREATE POLICY "Users can insert own data" ON public.user_data
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own data" ON public.user_data;
CREATE POLICY "Users can delete own data" ON public.user_data
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for expenses
DROP POLICY IF EXISTS "Users can view own expenses" ON public.expenses;
CREATE POLICY "Users can view own expenses" ON public.expenses
    FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own expenses" ON public.expenses;
CREATE POLICY "Users can insert own expenses" ON public.expenses
    FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own expenses" ON public.expenses;
CREATE POLICY "Users can update own expenses" ON public.expenses
    FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own expenses" ON public.expenses;
CREATE POLICY "Users can delete own expenses" ON public.expenses
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for budgets
DROP POLICY IF EXISTS "Users can view own budgets" ON public.budgets;
CREATE POLICY "Users can view own budgets" ON public.budgets
    FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own budgets" ON public.budgets;
CREATE POLICY "Users can insert own budgets" ON public.budgets
    FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own budgets" ON public.budgets;
CREATE POLICY "Users can update own budgets" ON public.budgets
    FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own budgets" ON public.budgets;
CREATE POLICY "Users can delete own budgets" ON public.budgets
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_preferences
DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
CREATE POLICY "Users can view own preferences" ON public.user_preferences
    FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own preferences" ON public.user_preferences;
CREATE POLICY "Users can insert own preferences" ON public.user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;
CREATE POLICY "Users can update own preferences" ON public.user_preferences
    FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own preferences" ON public.user_preferences;
CREATE POLICY "Users can delete own preferences" ON public.user_preferences
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for spending_alerts
DROP POLICY IF EXISTS "Users can view own alerts" ON public.spending_alerts;
CREATE POLICY "Users can view own alerts" ON public.spending_alerts
    FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own alerts" ON public.spending_alerts;
CREATE POLICY "Users can insert own alerts" ON public.spending_alerts
    FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own alerts" ON public.spending_alerts;
CREATE POLICY "Users can update own alerts" ON public.spending_alerts
    FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own alerts" ON public.spending_alerts;
CREATE POLICY "Users can delete own alerts" ON public.spending_alerts
    FOR DELETE USING (auth.uid() = user_id);

-- Reference table policies (public read access)
DROP POLICY IF EXISTS "Allow public read access to expense categories" ON public.expense_categories;
CREATE POLICY "Allow public read access to expense categories" ON public.expense_categories
    FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Allow authenticated users to read expense categories" ON public.expense_categories;
CREATE POLICY "Allow authenticated users to read expense categories" ON public.expense_categories
    FOR SELECT TO authenticated USING (true);

-- ===========================================
-- 5. FUNCTIONS AND TRIGGERS
-- ===========================================

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
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

-- Create trigger to automatically create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
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

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_sessions_updated_at ON public.user_sessions;
CREATE TRIGGER update_user_sessions_updated_at
    BEFORE UPDATE ON public.user_sessions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_data_updated_at ON public.user_data;
CREATE TRIGGER update_user_data_updated_at
    BEFORE UPDATE ON public.user_data
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); 