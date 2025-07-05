-- Migration: Add expense tracking, budgets, categories, preferences, and alerts

-- 1. Expense Categories
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

-- 2. Expenses
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

-- 3. Budgets
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

-- 4. User Preferences
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

-- 5. Spending Alerts
CREATE TABLE IF NOT EXISTS public.spending_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category_id INTEGER REFERENCES public.expense_categories(id),
    threshold NUMERIC(12,2) NOT NULL,
    period TEXT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_expense_categories_name ON public.expense_categories(name);
CREATE INDEX IF NOT EXISTS idx_spending_alerts_user_id ON public.spending_alerts(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spending_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only allow users to access their own data
-- Expenses
CREATE POLICY "Users can view own expenses" ON public.expenses
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own expenses" ON public.expenses
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own expenses" ON public.expenses
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own expenses" ON public.expenses
    FOR DELETE USING (auth.uid() = user_id);

-- Budgets
CREATE POLICY "Users can view own budgets" ON public.budgets
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own budgets" ON public.budgets
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own budgets" ON public.budgets
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own budgets" ON public.budgets
    FOR DELETE USING (auth.uid() = user_id);

-- User Preferences
CREATE POLICY "Users can view own preferences" ON public.user_preferences
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON public.user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON public.user_preferences
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own preferences" ON public.user_preferences
    FOR DELETE USING (auth.uid() = user_id);

-- Spending Alerts
CREATE POLICY "Users can view own alerts" ON public.spending_alerts
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own alerts" ON public.spending_alerts
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own alerts" ON public.spending_alerts
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own alerts" ON public.spending_alerts
    FOR DELETE USING (auth.uid() = user_id); 