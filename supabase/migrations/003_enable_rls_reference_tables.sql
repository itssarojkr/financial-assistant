-- Enable RLS on all reference tables
-- These tables contain public reference data that should be readable by all users

-- Enable RLS on countries table
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all users to read countries data
CREATE POLICY "Allow public read access to countries" ON public.countries
    FOR SELECT
    TO public
    USING (true);

-- Create policy to allow authenticated users to read countries data
CREATE POLICY "Allow authenticated users to read countries" ON public.countries
    FOR SELECT
    TO authenticated
    USING (true);

-- Enable RLS on states table
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all users to read states data
CREATE POLICY "Allow public read access to states" ON public.states
    FOR SELECT
    TO public
    USING (true);

-- Create policy to allow authenticated users to read states data
CREATE POLICY "Allow authenticated users to read states" ON public.states
    FOR SELECT
    TO authenticated
    USING (true);

-- Enable RLS on cities table
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all users to read cities data
CREATE POLICY "Allow public read access to cities" ON public.cities
    FOR SELECT
    TO public
    USING (true);

-- Create policy to allow authenticated users to read cities data
CREATE POLICY "Allow authenticated users to read cities" ON public.cities
    FOR SELECT
    TO authenticated
    USING (true);

-- Enable RLS on localities table
ALTER TABLE public.localities ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all users to read localities data
CREATE POLICY "Allow public read access to localities" ON public.localities
    FOR SELECT
    TO public
    USING (true);

-- Create policy to allow authenticated users to read localities data
CREATE POLICY "Allow authenticated users to read localities" ON public.localities
    FOR SELECT
    TO authenticated
    USING (true);

-- Note: We don't create INSERT/UPDATE/DELETE policies since reference data
-- should be managed by administrators only, not by regular users 