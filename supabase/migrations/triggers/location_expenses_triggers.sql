-- Triggers for location expenses table

-- Updated_at trigger function for location expenses
CREATE OR REPLACE FUNCTION public.update_location_expenses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_location_expenses_updated_at ON public.location_expenses;
CREATE TRIGGER update_location_expenses_updated_at
    BEFORE UPDATE ON public.location_expenses
    FOR EACH ROW EXECUTE FUNCTION public.update_location_expenses_updated_at(); 