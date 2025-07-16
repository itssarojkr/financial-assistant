-- RLS policies for location-related tables
-- Enable RLS on all location tables
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE states ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE localities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_expenses ENABLE ROW LEVEL SECURITY;

-- Location tables RLS policies (read-only for all users)
CREATE POLICY "Allow read access to countries" ON countries FOR SELECT USING (true);
CREATE POLICY "Allow read access to states" ON states FOR SELECT USING (true);
CREATE POLICY "Allow read access to cities" ON cities FOR SELECT USING (true);
CREATE POLICY "Allow read access to localities" ON localities FOR SELECT USING (true);

-- Location expenses RLS policies
CREATE POLICY "Anyone can view location expenses" ON public.location_expenses
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage location expenses" ON public.location_expenses
    FOR ALL USING (auth.role() = 'authenticated'); 