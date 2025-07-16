-- Location-related functions

-- Function to get locations by country
CREATE OR REPLACE FUNCTION get_locations_by_country(country_code VARCHAR)
RETURNS TABLE (
    country_id INTEGER,
    country_name VARCHAR,
    state_id INTEGER,
    state_name VARCHAR,
    state_code VARCHAR,
    city_id INTEGER,
    city_name VARCHAR
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as country_id,
        c.name as country_name,
        s.id as state_id,
        s.name as state_name,
        s.code as state_code,
        ci.id as city_id,
        ci.name as city_name
    FROM countries c
    LEFT JOIN states s ON c.id = s.country_id
    LEFT JOIN cities ci ON s.id = ci.state_id
    WHERE c.code = country_code
    ORDER BY s.name, ci.name;
END;
$$;

-- Function to search locations
CREATE OR REPLACE FUNCTION search_locations(search_term VARCHAR)
RETURNS TABLE (
    country_id INTEGER,
    country_name VARCHAR,
    state_id INTEGER,
    state_name VARCHAR,
    state_code VARCHAR,
    city_id INTEGER,
    city_name VARCHAR,
    match_type VARCHAR
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as country_id,
        c.name as country_name,
        s.id as state_id,
        s.name as state_name,
        s.code as state_code,
        ci.id as city_id,
        ci.name as city_name,
        CASE 
            WHEN c.name ILIKE '%' || search_term || '%' THEN 'country'
            WHEN s.name ILIKE '%' || search_term || '%' THEN 'state'
            WHEN ci.name ILIKE '%' || search_term || '%' THEN 'city'
            ELSE 'other'
        END as match_type
    FROM countries c
    LEFT JOIN states s ON c.id = s.country_id
    LEFT JOIN cities ci ON s.id = ci.state_id
    WHERE c.name ILIKE '%' || search_term || '%'
        OR s.name ILIKE '%' || search_term || '%'
        OR ci.name ILIKE '%' || search_term || '%'
    ORDER BY 
        CASE 
            WHEN c.name ILIKE '%' || search_term || '%' THEN 1
            WHEN s.name ILIKE '%' || search_term || '%' THEN 2
            WHEN ci.name ILIKE '%' || search_term || '%' THEN 3
            ELSE 4
        END,
        c.name, s.name, ci.name
    LIMIT 50;
END;
$$; 