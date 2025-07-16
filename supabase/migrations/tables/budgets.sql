-- Budgets Table
-- User budget management table

CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category_id INTEGER REFERENCES public.expense_categories(id),
    amount NUMERIC(12,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    period TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    calculation_id UUID REFERENCES public.user_data(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE public.budgets IS 'Stores user budget allocations';
COMMENT ON COLUMN public.budgets.calculation_id IS 'Reference to the tax calculation this budget belongs to';
COMMENT ON COLUMN public.budgets.updated_at IS 'Timestamp of last update'; 