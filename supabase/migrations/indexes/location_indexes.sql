-- Indexes for location-related tables

-- Basic location indexes
CREATE INDEX IF NOT EXISTS idx_countries_code ON countries(code);
CREATE INDEX IF NOT EXISTS idx_countries_name ON countries(name);
CREATE INDEX IF NOT EXISTS idx_states_country_id ON states(country_id);
CREATE INDEX IF NOT EXISTS idx_states_name ON states(name);
CREATE INDEX IF NOT EXISTS idx_cities_state_id ON cities(state_id);
CREATE INDEX IF NOT EXISTS idx_cities_name ON cities(name);
CREATE INDEX IF NOT EXISTS idx_localities_city_id ON localities(city_id);

-- Location expenses indexes
CREATE INDEX IF NOT EXISTS idx_location_expenses_country ON public.location_expenses(country_code);
CREATE INDEX IF NOT EXISTS idx_location_expenses_state ON public.location_expenses(state_code);
CREATE INDEX IF NOT EXISTS idx_location_expenses_city ON public.location_expenses(city_code);
CREATE INDEX IF NOT EXISTS idx_location_expenses_type ON public.location_expenses(expense_type);
CREATE INDEX IF NOT EXISTS idx_location_expenses_location ON public.location_expenses(country_code, state_code, city_code); 