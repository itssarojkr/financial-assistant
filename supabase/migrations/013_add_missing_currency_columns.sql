-- Add missing currency columns to budgets and spending_alerts tables
-- This migration adds currency columns that are expected by the application

-- Add currency column to budgets table
ALTER TABLE public.budgets 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';

-- Add currency column to spending_alerts table  
ALTER TABLE public.spending_alerts 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';

-- Add updated_at column to budgets table if it doesn't exist
ALTER TABLE public.budgets 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add updated_at column to spending_alerts table if it doesn't exist
ALTER TABLE public.spending_alerts 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_budgets_updated_at ON public.budgets;
CREATE TRIGGER update_budgets_updated_at
    BEFORE UPDATE ON public.budgets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_spending_alerts_updated_at ON public.spending_alerts;
CREATE TRIGGER update_spending_alerts_updated_at
    BEFORE UPDATE ON public.spending_alerts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for currency columns
CREATE INDEX IF NOT EXISTS idx_budgets_currency ON public.budgets(currency);
CREATE INDEX IF NOT EXISTS idx_spending_alerts_currency ON public.spending_alerts(currency);

-- End of migration 