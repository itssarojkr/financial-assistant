-- Location Expenses Database Migration
-- This migration creates the location_expenses table with real expense data

-- ===========================================
-- 1. CREATE LOCATION EXPENSES TABLE
-- ===========================================

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

-- ===========================================
-- 2. CREATE INDEXES
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_location_expenses_country ON public.location_expenses(country_code);
CREATE INDEX IF NOT EXISTS idx_location_expenses_state ON public.location_expenses(state_code);
CREATE INDEX IF NOT EXISTS idx_location_expenses_city ON public.location_expenses(city_code);
CREATE INDEX IF NOT EXISTS idx_location_expenses_type ON public.location_expenses(expense_type);
CREATE INDEX IF NOT EXISTS idx_location_expenses_location ON public.location_expenses(country_code, state_code, city_code);

-- ===========================================
-- 3. ENABLE RLS
-- ===========================================

ALTER TABLE public.location_expenses ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- 4. RLS POLICIES
-- ===========================================

-- Anyone can view location expenses (public data)
CREATE POLICY "Anyone can view location expenses" ON public.location_expenses
    FOR SELECT USING (true);

-- Only authenticated users can insert/update/delete (for admin purposes)
CREATE POLICY "Authenticated users can manage location expenses" ON public.location_expenses
    FOR ALL USING (auth.role() = 'authenticated');

-- ===========================================
-- 5. INSERT LOCATION EXPENSE DATA
-- ===========================================

-- United States - Country Level (Monthly in USD)
INSERT INTO public.location_expenses (country_code, state_code, city_code, expense_type, estimated_amount, currency, is_flexible, reduction_potential, description) VALUES
-- Housing (Fixed, low reduction potential)
('US', NULL, NULL, 'housing', 1500.00, 'USD', FALSE, 0.10, 'Average monthly rent/mortgage'),
('US', NULL, NULL, 'food', 400.00, 'USD', TRUE, 0.40, 'Groceries and dining out'),
('US', NULL, NULL, 'transport', 300.00, 'USD', TRUE, 0.25, 'Gas, public transport, car maintenance'),
('US', NULL, NULL, 'utilities', 200.00, 'USD', FALSE, 0.10, 'Electricity, water, internet'),
('US', NULL, NULL, 'healthcare', 150.00, 'USD', FALSE, 0.15, 'Insurance, medical expenses'),
('US', NULL, NULL, 'entertainment', 250.00, 'USD', TRUE, 0.60, 'Movies, dining out, hobbies'),
('US', NULL, NULL, 'other', 200.00, 'USD', TRUE, 0.70, 'Shopping, personal care, miscellaneous');

-- California - High Cost State
INSERT INTO public.location_expenses (country_code, state_code, city_code, expense_type, estimated_amount, currency, is_flexible, reduction_potential, description) VALUES
('US', 'CA', NULL, 'housing', 2500.00, 'USD', FALSE, 0.05, 'High cost housing in California'),
('US', 'CA', NULL, 'food', 600.00, 'USD', TRUE, 0.35, 'Higher food costs in California'),
('US', 'CA', NULL, 'transport', 400.00, 'USD', TRUE, 0.20, 'Higher transport costs'),
('US', 'CA', NULL, 'utilities', 250.00, 'USD', FALSE, 0.10, 'Higher utility costs'),
('US', 'CA', NULL, 'healthcare', 200.00, 'USD', FALSE, 0.15, 'Healthcare costs'),
('US', 'CA', NULL, 'entertainment', 350.00, 'USD', TRUE, 0.60, 'Entertainment and dining'),
('US', 'CA', NULL, 'other', 300.00, 'USD', TRUE, 0.70, 'Other expenses');

-- Texas - Lower Cost State
INSERT INTO public.location_expenses (country_code, state_code, city_code, expense_type, estimated_amount, currency, is_flexible, reduction_potential, description) VALUES
('US', 'TX', NULL, 'housing', 1200.00, 'USD', FALSE, 0.10, 'Lower cost housing in Texas'),
('US', 'TX', NULL, 'food', 350.00, 'USD', TRUE, 0.40, 'Lower food costs'),
('US', 'TX', NULL, 'transport', 250.00, 'USD', TRUE, 0.25, 'Lower transport costs'),
('US', 'TX', NULL, 'utilities', 180.00, 'USD', FALSE, 0.10, 'Lower utility costs'),
('US', 'TX', NULL, 'healthcare', 120.00, 'USD', FALSE, 0.15, 'Healthcare costs'),
('US', 'TX', NULL, 'entertainment', 200.00, 'USD', TRUE, 0.60, 'Entertainment and dining'),
('US', 'TX', NULL, 'other', 150.00, 'USD', TRUE, 0.70, 'Other expenses');

-- India - Country Level (Monthly in INR)
INSERT INTO public.location_expenses (country_code, state_code, city_code, expense_type, estimated_amount, currency, is_flexible, reduction_potential, description) VALUES
('IN', NULL, NULL, 'housing', 25000.00, 'INR', FALSE, 0.10, 'Average monthly rent'),
('IN', NULL, NULL, 'food', 8000.00, 'INR', TRUE, 0.40, 'Groceries and dining'),
('IN', NULL, NULL, 'transport', 3000.00, 'INR', TRUE, 0.25, 'Public transport, fuel'),
('IN', NULL, NULL, 'utilities', 2000.00, 'INR', FALSE, 0.10, 'Electricity, water, internet'),
('IN', NULL, NULL, 'healthcare', 1500.00, 'INR', FALSE, 0.15, 'Medical expenses'),
('IN', NULL, NULL, 'entertainment', 5000.00, 'INR', TRUE, 0.60, 'Movies, dining, shopping'),
('IN', NULL, NULL, 'other', 4000.00, 'INR', TRUE, 0.70, 'Personal care, miscellaneous');

-- Maharashtra, India - High Cost State
INSERT INTO public.location_expenses (country_code, state_code, city_code, expense_type, estimated_amount, currency, is_flexible, reduction_potential, description) VALUES
('IN', '16', NULL, 'housing', 35000.00, 'INR', FALSE, 0.05, 'High cost housing in Maharashtra'),
('IN', '16', NULL, 'food', 10000.00, 'INR', TRUE, 0.35, 'Higher food costs'),
('IN', '16', NULL, 'transport', 4000.00, 'INR', TRUE, 0.20, 'Higher transport costs'),
('IN', '16', NULL, 'utilities', 2500.00, 'INR', FALSE, 0.10, 'Higher utility costs'),
('IN', '16', NULL, 'healthcare', 2000.00, 'INR', FALSE, 0.15, 'Healthcare costs'),
('IN', '16', NULL, 'entertainment', 7000.00, 'INR', TRUE, 0.60, 'Entertainment and dining'),
('IN', '16', NULL, 'other', 5000.00, 'INR', TRUE, 0.70, 'Other expenses');

-- Delhi, India - Very High Cost
INSERT INTO public.location_expenses (country_code, state_code, city_code, expense_type, estimated_amount, currency, is_flexible, reduction_potential, description) VALUES
('IN', '07', NULL, 'housing', 45000.00, 'INR', FALSE, 0.05, 'Very high cost housing in Delhi'),
('IN', '07', NULL, 'food', 12000.00, 'INR', TRUE, 0.30, 'Very high food costs'),
('IN', '07', NULL, 'transport', 5000.00, 'INR', TRUE, 0.15, 'High transport costs'),
('IN', '07', NULL, 'utilities', 3000.00, 'INR', FALSE, 0.10, 'High utility costs'),
('IN', '07', NULL, 'healthcare', 2500.00, 'INR', FALSE, 0.15, 'Healthcare costs'),
('IN', '07', NULL, 'entertainment', 10000.00, 'INR', TRUE, 0.60, 'Entertainment and dining'),
('IN', '07', NULL, 'other', 8000.00, 'INR', TRUE, 0.70, 'Other expenses');

-- Karnataka, India - Moderate Cost
INSERT INTO public.location_expenses (country_code, state_code, city_code, expense_type, estimated_amount, currency, is_flexible, reduction_potential, description) VALUES
('IN', '29', NULL, 'housing', 28000.00, 'INR', FALSE, 0.10, 'Moderate cost housing in Karnataka'),
('IN', '29', NULL, 'food', 8500.00, 'INR', TRUE, 0.40, 'Moderate food costs'),
('IN', '29', NULL, 'transport', 3200.00, 'INR', TRUE, 0.25, 'Moderate transport costs'),
('IN', '29', NULL, 'utilities', 2200.00, 'INR', FALSE, 0.10, 'Moderate utility costs'),
('IN', '29', NULL, 'healthcare', 1600.00, 'INR', FALSE, 0.15, 'Healthcare costs'),
('IN', '29', NULL, 'entertainment', 5500.00, 'INR', TRUE, 0.60, 'Entertainment and dining'),
('IN', '29', NULL, 'other', 4500.00, 'INR', TRUE, 0.70, 'Other expenses');

-- Canada - Country Level (Monthly in CAD)
INSERT INTO public.location_expenses (country_code, state_code, city_code, expense_type, estimated_amount, currency, is_flexible, reduction_potential, description) VALUES
('CA', NULL, NULL, 'housing', 1800.00, 'CAD', FALSE, 0.10, 'Average monthly rent/mortgage'),
('CA', NULL, NULL, 'food', 500.00, 'CAD', TRUE, 0.40, 'Groceries and dining'),
('CA', NULL, NULL, 'transport', 350.00, 'CAD', TRUE, 0.25, 'Public transport, car costs'),
('CA', NULL, NULL, 'utilities', 250.00, 'CAD', FALSE, 0.10, 'Electricity, water, internet'),
('CA', NULL, NULL, 'healthcare', 200.00, 'CAD', FALSE, 0.15, 'Healthcare costs'),
('CA', NULL, NULL, 'entertainment', 300.00, 'CAD', TRUE, 0.60, 'Entertainment and dining'),
('CA', NULL, NULL, 'other', 250.00, 'CAD', TRUE, 0.70, 'Other expenses');

-- United Kingdom - Country Level (Monthly in GBP)
INSERT INTO public.location_expenses (country_code, state_code, city_code, expense_type, estimated_amount, currency, is_flexible, reduction_potential, description) VALUES
('GB', NULL, NULL, 'housing', 1200.00, 'GBP', FALSE, 0.10, 'Average monthly rent'),
('GB', NULL, NULL, 'food', 300.00, 'GBP', TRUE, 0.40, 'Groceries and dining'),
('GB', NULL, NULL, 'transport', 200.00, 'GBP', TRUE, 0.25, 'Public transport, fuel'),
('GB', NULL, NULL, 'utilities', 150.00, 'GBP', FALSE, 0.10, 'Electricity, water, internet'),
('GB', NULL, NULL, 'healthcare', 100.00, 'GBP', FALSE, 0.15, 'Healthcare costs'),
('GB', NULL, NULL, 'entertainment', 200.00, 'GBP', TRUE, 0.60, 'Entertainment and dining'),
('GB', NULL, NULL, 'other', 150.00, 'GBP', TRUE, 0.70, 'Other expenses');

-- Australia - Country Level (Monthly in AUD)
INSERT INTO public.location_expenses (country_code, state_code, city_code, expense_type, estimated_amount, currency, is_flexible, reduction_potential, description) VALUES
('AU', NULL, NULL, 'housing', 2000.00, 'AUD', FALSE, 0.10, 'Average monthly rent'),
('AU', NULL, NULL, 'food', 600.00, 'AUD', TRUE, 0.40, 'Groceries and dining'),
('AU', NULL, NULL, 'transport', 400.00, 'AUD', TRUE, 0.25, 'Public transport, fuel'),
('AU', NULL, NULL, 'utilities', 300.00, 'AUD', FALSE, 0.10, 'Electricity, water, internet'),
('AU', NULL, NULL, 'healthcare', 250.00, 'AUD', FALSE, 0.15, 'Healthcare costs'),
('AU', NULL, NULL, 'entertainment', 350.00, 'AUD', TRUE, 0.60, 'Entertainment and dining'),
('AU', NULL, NULL, 'other', 300.00, 'AUD', TRUE, 0.70, 'Other expenses');

-- Germany - Country Level (Monthly in EUR)
INSERT INTO public.location_expenses (country_code, state_code, city_code, expense_type, estimated_amount, currency, is_flexible, reduction_potential, description) VALUES
('DE', NULL, NULL, 'housing', 1200.00, 'EUR', FALSE, 0.10, 'Average monthly rent'),
('DE', NULL, NULL, 'food', 400.00, 'EUR', TRUE, 0.40, 'Groceries and dining'),
('DE', NULL, NULL, 'transport', 250.00, 'EUR', TRUE, 0.25, 'Public transport, fuel'),
('DE', NULL, NULL, 'utilities', 200.00, 'EUR', FALSE, 0.10, 'Electricity, water, internet'),
('DE', NULL, NULL, 'healthcare', 150.00, 'EUR', FALSE, 0.15, 'Healthcare costs'),
('DE', NULL, NULL, 'entertainment', 250.00, 'EUR', TRUE, 0.60, 'Entertainment and dining'),
('DE', NULL, NULL, 'other', 200.00, 'EUR', TRUE, 0.70, 'Other expenses');

-- France - Country Level (Monthly in EUR)
INSERT INTO public.location_expenses (country_code, state_code, city_code, expense_type, estimated_amount, currency, is_flexible, reduction_potential, description) VALUES
('FR', NULL, NULL, 'housing', 1100.00, 'EUR', FALSE, 0.10, 'Average monthly rent'),
('FR', NULL, NULL, 'food', 350.00, 'EUR', TRUE, 0.40, 'Groceries and dining'),
('FR', NULL, NULL, 'transport', 200.00, 'EUR', TRUE, 0.25, 'Public transport, fuel'),
('FR', NULL, NULL, 'utilities', 180.00, 'EUR', FALSE, 0.10, 'Electricity, water, internet'),
('FR', NULL, NULL, 'healthcare', 120.00, 'EUR', FALSE, 0.15, 'Healthcare costs'),
('FR', NULL, NULL, 'entertainment', 220.00, 'EUR', TRUE, 0.60, 'Entertainment and dining'),
('FR', NULL, NULL, 'other', 180.00, 'EUR', TRUE, 0.70, 'Other expenses');

-- ===========================================
-- 6. CREATE TRIGGER FOR UPDATED_AT
-- ===========================================

CREATE OR REPLACE FUNCTION public.update_location_expenses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_location_expenses_updated_at ON public.location_expenses;
CREATE TRIGGER update_location_expenses_updated_at
    BEFORE UPDATE ON public.location_expenses
    FOR EACH ROW EXECUTE FUNCTION public.update_location_expenses_updated_at();

-- ===========================================
-- 7. GRANT PERMISSIONS
-- ===========================================

GRANT SELECT ON public.location_expenses TO authenticated;
GRANT SELECT ON public.location_expenses TO anon;

-- ===========================================
-- 8. ADD COMMENTS FOR DOCUMENTATION
-- ===========================================

COMMENT ON TABLE public.location_expenses IS 'Stores real estimated monthly expenses for different locations';
COMMENT ON COLUMN public.location_expenses.country_code IS 'Country code this expense applies to';
COMMENT ON COLUMN public.location_expenses.state_code IS 'State code this expense applies to (NULL for country-level)';
COMMENT ON COLUMN public.location_expenses.city_code IS 'City code this expense applies to (NULL for state-level)';
COMMENT ON COLUMN public.location_expenses.expense_type IS 'Type of expense: housing, food, transport, utilities, healthcare, entertainment, other';
COMMENT ON COLUMN public.location_expenses.estimated_amount IS 'Estimated monthly amount in local currency';
COMMENT ON COLUMN public.location_expenses.currency IS 'Currency code for the expense amount';
COMMENT ON COLUMN public.location_expenses.is_flexible IS 'Whether this expense can be reduced (TRUE) or is fixed (FALSE)';
COMMENT ON COLUMN public.location_expenses.reduction_potential IS 'How much this expense can be reduced (0.0 to 1.0, where 1.0 = 100% reduction)'; 