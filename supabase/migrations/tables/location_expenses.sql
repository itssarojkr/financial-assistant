-- Location Expenses Table
-- Stores real estimated monthly expenses for different locations

CREATE TABLE IF NOT EXISTS public.location_expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    country_code TEXT NOT NULL,
    state_code TEXT, -- NULL for country-level defaults
    city_code TEXT, -- NULL for state-level defaults
    expense_type TEXT NOT NULL CHECK (expense_type IN ('housing', 'food', 'transport', 'utilities', 'healthcare', 'entertainment', 'other')),
    estimated_amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL,
    is_flexible BOOLEAN DEFAULT FALSE,
    reduction_potential DECIMAL(3,2) DEFAULT 0.0, -- 0.0 to 1.0 (0% to 100%)
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(country_code, state_code, city_code, expense_type)
);

-- Add comments for documentation
COMMENT ON TABLE public.location_expenses IS 'Stores real estimated monthly expenses for different locations';
COMMENT ON COLUMN public.location_expenses.country_code IS 'Country code this expense applies to';
COMMENT ON COLUMN public.location_expenses.state_code IS 'State code this expense applies to (NULL for country-level)';
COMMENT ON COLUMN public.location_expenses.city_code IS 'City code this expense applies to (NULL for state-level)';
COMMENT ON COLUMN public.location_expenses.expense_type IS 'Type of expense: housing, food, transport, utilities, healthcare, entertainment, other';
COMMENT ON COLUMN public.location_expenses.estimated_amount IS 'Estimated monthly amount in local currency';
COMMENT ON COLUMN public.location_expenses.currency IS 'Currency code for the expense amount';
COMMENT ON COLUMN public.location_expenses.is_flexible IS 'Whether this expense can be reduced (TRUE) or is fixed (FALSE)';
COMMENT ON COLUMN public.location_expenses.reduction_potential IS 'How much this expense can be reduced (0.0 to 1.0, where 1.0 = 100% reduction)'; 