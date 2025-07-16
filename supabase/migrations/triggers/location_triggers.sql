-- Triggers for location-related tables

-- Updated_at triggers for location tables
DROP TRIGGER IF EXISTS update_countries_updated_at ON countries;
CREATE TRIGGER update_countries_updated_at 
    BEFORE UPDATE ON countries 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_states_updated_at ON states;
CREATE TRIGGER update_states_updated_at 
    BEFORE UPDATE ON states 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_cities_updated_at ON cities;
CREATE TRIGGER update_cities_updated_at 
    BEFORE UPDATE ON cities 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_localities_updated_at ON localities;
CREATE TRIGGER update_localities_updated_at 
    BEFORE UPDATE ON localities 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_location_expenses_updated_at ON public.location_expenses;
CREATE TRIGGER update_location_expenses_updated_at
    BEFORE UPDATE ON public.location_expenses
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); 