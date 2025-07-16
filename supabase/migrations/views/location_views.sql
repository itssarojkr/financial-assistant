-- Location Views
-- Views for location data and hierarchy

-- ===========================================
-- LOCATION HIERARCHY VIEW
-- ===========================================

-- Drop existing view if it exists
DROP VIEW IF EXISTS location_hierarchy;

-- Create location hierarchy view
CREATE VIEW location_hierarchy AS
SELECT 
  c.id as country_id,
  c.code as country_code,
  c.name as country_name,
  c.currency,
  c.region,
  s.id as state_id,
  s.name as state_name,
  s.code as state_code,
  s.capital as state_capital,
  ci.id as city_id,
  ci.name as city_name,
  ci.population as city_population,
  ci.latitude,
  ci.longitude,
  ci.timezone
FROM countries c
LEFT JOIN states s ON c.id = s.country_id
LEFT JOIN cities ci ON s.id = ci.state_id;

-- Grant permissions
GRANT SELECT ON location_hierarchy TO authenticated;
GRANT SELECT ON location_hierarchy TO anon; 