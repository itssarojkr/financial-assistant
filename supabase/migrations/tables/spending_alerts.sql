-- Spending Alerts Table
-- User spending alert management table

CREATE TABLE IF NOT EXISTS public.spending_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category_id INTEGER REFERENCES public.expense_categories(id),
    threshold NUMERIC(12,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    period TEXT NOT NULL,
    type TEXT DEFAULT 'amount' CHECK (type IN ('amount', 'percentage')),
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
    active BOOLEAN DEFAULT TRUE,
    calculation_id UUID REFERENCES public.user_data(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE public.spending_alerts IS 'Stores user spending alerts and thresholds';
COMMENT ON COLUMN public.spending_alerts.calculation_id IS 'Reference to the tax calculation this alert belongs to';
COMMENT ON COLUMN public.spending_alerts.type IS 'Type of alert: amount or percentage';
COMMENT ON COLUMN public.spending_alerts.severity IS 'Alert severity: low, medium, or high';
COMMENT ON COLUMN public.spending_alerts.currency IS 'Currency for the alert threshold';
COMMENT ON COLUMN public.spending_alerts.updated_at IS 'Timestamp of last update'; 