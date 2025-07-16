-- Triggers for spending habits table

-- Updated_at trigger function for spending habits
CREATE OR REPLACE FUNCTION public.update_spending_habits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_spending_habits_updated_at ON public.spending_habits;
CREATE TRIGGER update_spending_habits_updated_at
    BEFORE UPDATE ON public.spending_habits
    FOR EACH ROW EXECUTE FUNCTION public.update_spending_habits_updated_at(); 