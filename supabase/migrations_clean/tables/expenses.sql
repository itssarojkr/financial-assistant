-- Canonical expense tracking tables
-- expenses, expense_categories, budgets, spending_alerts

CREATE TABLE IF NOT EXISTS public.expense_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT,
    color TEXT,
    is_default BOOLEAN DEFAULT TRUE
);

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
    calculation_id UUID REFERENCES public.user_data(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category_id INTEGER REFERENCES public.expense_categories(id),
    amount NUMERIC(12,2) NOT NULL,
    period TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    currency TEXT DEFAULT 'USD',
    calculation_id UUID REFERENCES public.user_data(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.spending_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category_id INTEGER REFERENCES public.expense_categories(id),
    threshold NUMERIC(12,2) NOT NULL,
    period TEXT NOT NULL,
    type TEXT DEFAULT 'amount' CHECK (type IN ('amount', 'percentage')),
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
    currency TEXT DEFAULT 'USD',
    calculation_id UUID REFERENCES public.user_data(id) ON DELETE CASCADE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
); 