-- Fix SECURITY DEFINER issue in location_hierarchy view
-- Drop the existing view
DROP VIEW IF EXISTS location_hierarchy;

-- Recreate the view (SECURITY INVOKER is the default for views)
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

-- Explicitly set security_invoker property for clarity
ALTER VIEW location_hierarchy SET (security_invoker = true);

-- Create a comment explaining the security model
COMMENT ON VIEW location_hierarchy IS 'Location hierarchy view with SECURITY INVOKER - runs with caller privileges for proper RLS enforcement'; 