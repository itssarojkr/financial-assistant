-- Add missing columns to spending_alerts table
-- This migration adds columns that are expected by the application

-- Add severity column to spending_alerts table
ALTER TABLE public.spending_alerts 
ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high'));

-- Add type column to spending_alerts table
ALTER TABLE public.spending_alerts 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'amount' CHECK (type IN ('amount', 'percentage'));

-- Add currency column to spending_alerts table (already added in previous migration, but ensure it exists)
ALTER TABLE public.spending_alerts 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';

-- Add calculation_id column to spending_alerts table (already added in previous migration, but ensure it exists)
ALTER TABLE public.spending_alerts 
ADD COLUMN IF NOT EXISTS calculation_id UUID REFERENCES public.user_data(id) ON DELETE CASCADE;

-- Add updated_at column to spending_alerts table (already added in previous migration, but ensure it exists)
ALTER TABLE public.spending_alerts 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create trigger for updated_at if it doesn't exist
DROP TRIGGER IF EXISTS update_spending_alerts_updated_at ON public.spending_alerts;
CREATE TRIGGER update_spending_alerts_updated_at
    BEFORE UPDATE ON public.spending_alerts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_spending_alerts_severity ON public.spending_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_spending_alerts_type ON public.spending_alerts(type);
CREATE INDEX IF NOT EXISTS idx_spending_alerts_calculation_id ON public.spending_alerts(calculation_id);

-- Update existing records to have default values
UPDATE public.spending_alerts 
SET 
    severity = COALESCE(severity, 'medium'),
    type = COALESCE(type, 'amount'),
    currency = COALESCE(currency, 'USD')
WHERE severity IS NULL OR type IS NULL OR currency IS NULL; 