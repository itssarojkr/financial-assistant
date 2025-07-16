-- Canonical location tables
-- countries, states, cities, localities, location_expenses

CREATE TABLE IF NOT EXISTS countries (
  id SERIAL PRIMARY KEY,
  code VARCHAR(4) NOT NULL UNIQUE,
  name VARCHAR(64) NOT NULL UNIQUE,
  currency VARCHAR(8) NOT NULL,
  region VARCHAR(32) NOT NULL,
  population BIGINT,
  gdp_per_capita DECIMAL(12,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS states (
  id SERIAL PRIMARY KEY,
  country_id INTEGER NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  name VARCHAR(64) NOT NULL,
  code VARCHAR(8),
  population BIGINT,
  area_km2 DECIMAL(10,2),
  capital VARCHAR(64),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(country_id, name)
);

CREATE TABLE IF NOT EXISTS cities (
  id SERIAL PRIMARY KEY,
  state_id INTEGER NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  name VARCHAR(64) NOT NULL,
  population BIGINT,
  area_km2 DECIMAL(10,2),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  timezone VARCHAR(32),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(state_id, name)
);

CREATE TABLE IF NOT EXISTS localities (
  id SERIAL PRIMARY KEY,
  city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  name VARCHAR(64) NOT NULL,
  population BIGINT,
  area_km2 DECIMAL(8,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(city_id, name)
);

CREATE TABLE IF NOT EXISTS public.location_expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    country_code TEXT NOT NULL,
    state_code TEXT,
    city_code TEXT,
    expense_type TEXT NOT NULL CHECK (expense_type IN ('housing', 'food', 'transport', 'utilities', 'healthcare', 'entertainment', 'other')),
    estimated_amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL,
    is_flexible BOOLEAN DEFAULT FALSE,
    reduction_potential DECIMAL(3,2) DEFAULT 0.0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(country_code, state_code, city_code, expense_type)
); 