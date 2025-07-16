-- Financial Dashboard Service Integration Fixes
-- This migration adds missing fields and updates the schema to support proper FinancialDashboard functionality

-- ===========================================
-- 1. ADD MISSING CALCULATION_ID FIELDS
-- ===========================================

-- Add calculation_id to expenses table
ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS calculation_id UUID REFERENCES public.user_data(id) ON DELETE CASCADE;

-- Add calculation_id to budgets table  
ALTER TABLE public.budgets 
ADD COLUMN IF NOT EXISTS calculation_id UUID REFERENCES public.user_data(id) ON DELETE CASCADE;

-- Add calculation_id to spending_alerts table
ALTER TABLE public.spending_alerts 
ADD COLUMN IF NOT EXISTS calculation_id UUID REFERENCES public.user_data(id) ON DELETE CASCADE;

-- Add missing fields to spending_alerts table
ALTER TABLE public.spending_alerts 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'amount' CHECK (type IN ('amount', 'percentage')),
ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';

-- Add missing fields to budgets table
ALTER TABLE public.budgets 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing fields to expenses table
ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing fields to spending_alerts table
ALTER TABLE public.spending_alerts 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ===========================================
-- 2. CREATE INDEXES FOR NEW FIELDS
-- ===========================================

-- Create indexes for calculation_id fields
CREATE INDEX IF NOT EXISTS idx_expenses_calculation_id ON public.expenses(calculation_id);
CREATE INDEX IF NOT EXISTS idx_budgets_calculation_id ON public.budgets(calculation_id);
CREATE INDEX IF NOT EXISTS idx_spending_alerts_calculation_id ON public.spending_alerts(calculation_id);

-- Create indexes for other new fields
CREATE INDEX IF NOT EXISTS idx_expenses_updated_at ON public.expenses(updated_at);
CREATE INDEX IF NOT EXISTS idx_budgets_updated_at ON public.budgets(updated_at);
CREATE INDEX IF NOT EXISTS idx_spending_alerts_updated_at ON public.spending_alerts(updated_at);

-- ===========================================
-- 3. UPDATE RLS POLICIES
-- ===========================================

-- Update RLS policies to include calculation_id filtering
DROP POLICY IF EXISTS "Users can view own expenses" ON public.expenses;
CREATE POLICY "Users can view own expenses" ON public.expenses
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own expenses" ON public.expenses;
CREATE POLICY "Users can update own expenses" ON public.expenses
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own expenses" ON public.expenses;
CREATE POLICY "Users can insert own expenses" ON public.expenses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own expenses" ON public.expenses;
CREATE POLICY "Users can delete own expenses" ON public.expenses
    FOR DELETE USING (auth.uid() = user_id);

-- Update RLS policies for budgets
DROP POLICY IF EXISTS "Users can view own budgets" ON public.budgets;
CREATE POLICY "Users can view own budgets" ON public.budgets
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own budgets" ON public.budgets;
CREATE POLICY "Users can update own budgets" ON public.budgets
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own budgets" ON public.budgets;
CREATE POLICY "Users can insert own budgets" ON public.budgets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own budgets" ON public.budgets;
CREATE POLICY "Users can delete own budgets" ON public.budgets
    FOR DELETE USING (auth.uid() = user_id);

-- Update RLS policies for spending_alerts
DROP POLICY IF EXISTS "Users can view own alerts" ON public.spending_alerts;
CREATE POLICY "Users can view own alerts" ON public.spending_alerts
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own alerts" ON public.spending_alerts;
CREATE POLICY "Users can update own alerts" ON public.spending_alerts
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own alerts" ON public.spending_alerts;
CREATE POLICY "Users can insert own alerts" ON public.spending_alerts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own alerts" ON public.spending_alerts;
CREATE POLICY "Users can delete own alerts" ON public.spending_alerts
    FOR DELETE USING (auth.uid() = user_id);

-- ===========================================
-- 4. CREATE UPDATED_AT TRIGGERS
-- ===========================================

-- Create trigger for expenses updated_at
CREATE OR REPLACE FUNCTION public.update_expenses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_expenses_updated_at ON public.expenses;
CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON public.expenses
    FOR EACH ROW EXECUTE FUNCTION public.update_expenses_updated_at();

-- Create trigger for budgets updated_at
CREATE OR REPLACE FUNCTION public.update_budgets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_budgets_updated_at ON public.budgets;
CREATE TRIGGER update_budgets_updated_at
    BEFORE UPDATE ON public.budgets
    FOR EACH ROW EXECUTE FUNCTION public.update_budgets_updated_at();

-- Create trigger for spending_alerts updated_at
CREATE OR REPLACE FUNCTION public.update_spending_alerts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_spending_alerts_updated_at ON public.spending_alerts;
CREATE TRIGGER update_spending_alerts_updated_at
    BEFORE UPDATE ON public.spending_alerts
    FOR EACH ROW EXECUTE FUNCTION public.update_spending_alerts_updated_at();

-- ===========================================
-- 5. CREATE HELPER VIEWS FOR FINANCIAL DASHBOARD
-- ===========================================

-- Remove all CREATE VIEW, DROP VIEW, and GRANT SELECT for *_with_categories views from this file.

-- ===========================================
-- 6. GRANT PERMISSIONS
-- ===========================================

-- Grant permissions on views
-- Remove all GRANT SELECT for *_with_categories views from this file.

-- ===========================================
-- 7. ADD COMMENTS FOR DOCUMENTATION
-- ===========================================

COMMENT ON COLUMN public.expenses.calculation_id IS 'Reference to the tax calculation this expense belongs to';
COMMENT ON COLUMN public.budgets.calculation_id IS 'Reference to the tax calculation this budget belongs to';
COMMENT ON COLUMN public.spending_alerts.calculation_id IS 'Reference to the tax calculation this alert belongs to';
COMMENT ON COLUMN public.spending_alerts.type IS 'Type of alert: amount or percentage';
COMMENT ON COLUMN public.spending_alerts.severity IS 'Alert severity: low, medium, or high';
COMMENT ON COLUMN public.spending_alerts.currency IS 'Currency for the alert threshold'; 

-- ===========================================
-- 8. RECREATE *_with_categories VIEWS WITHOUT SECURITY DEFINER (2024-07-13)
-- ===========================================

-- Drop existing views if they exist
-- Remove all DROP VIEW for *_with_categories views from this file.

-- Recreate views without SECURITY DEFINER
-- Remove all CREATE VIEW for *_with_categories views from this file.

-- Re-grant permissions on the views
-- Remove all GRANT SELECT for *_with_categories views from this file. 