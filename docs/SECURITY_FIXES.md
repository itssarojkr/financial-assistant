# Supabase Security Fixes

## Issue
The `location_hierarchy` view was created with `SECURITY DEFINER` property, which is a security vulnerability. This means the view runs with the privileges of the view creator rather than the querying user.

## Solution

### Option 1: Apply via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the following SQL commands:

```sql
-- Fix the location_hierarchy view
DROP VIEW IF EXISTS location_hierarchy;

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
LEFT JOIN cities ci ON s.id = ci.state_id
WITH SECURITY INVOKER;

-- Add RLS policies for location tables
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE states ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE localities ENABLE ROW LEVEL SECURITY;

-- Create read-only policies for authenticated users
CREATE POLICY "Allow authenticated users to read countries" ON countries
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read states" ON states
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read cities" ON cities
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read localities" ON localities
    FOR SELECT TO authenticated USING (true);

-- Grant access to the view
GRANT SELECT ON location_hierarchy TO authenticated;
GRANT SELECT ON location_hierarchy TO anon;
```

### Option 2: Apply via Supabase CLI

If you have Supabase CLI installed:

```bash
# Apply the migrations
supabase db push

# Or apply specific migrations
supabase migration up --include-all
```

### Option 3: Apply via Node.js Script

```bash
# Install dependencies if needed
npm install @supabase/supabase-js dotenv

# Run the security fixes script
node scripts/apply-security-fixes.js
```

## What This Fixes

1. **SECURITY DEFINER Issue**: The `location_hierarchy` view now uses `SECURITY INVOKER` (default)
2. **Access Control**: Added proper RLS policies for location tables
3. **Security Model**: Documented the security approach for views vs functions

## Security Model

- **Views**: Use `SECURITY INVOKER` (runs with caller privileges)
- **Analytics Functions**: Use `SECURITY DEFINER` (bypass RLS for performance)
- **RLS Policies**: Control access to underlying tables
- **Function Parameters**: Additional access control layer

## Verification

After applying the fixes, you can verify the security model:

```sql
-- Check view security
SELECT schemaname, viewname, security_invoker 
FROM pg_views 
WHERE viewname = 'location_hierarchy';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('countries', 'states', 'cities', 'localities');
```

## Notes

- Functions using `SECURITY DEFINER` are intentionally designed for performance
- These functions have proper access controls via user_id parameters
- The security model is documented in the migration files
- All views now use `SECURITY INVOKER` by default 