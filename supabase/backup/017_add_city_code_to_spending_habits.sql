-- Migration: Add city_code to spending_habits for city-level defaults
-- ===========================================
-- 1. Add city_code column
ALTER TABLE public.spending_habits ADD COLUMN IF NOT EXISTS city_code TEXT;

-- 2. Update unique constraint to include city_code
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'spending_habits' AND constraint_type = 'UNIQUE' AND constraint_name = 'spending_habits_user_id_country_code_state_code_name_key'
  ) THEN
    ALTER TABLE public.spending_habits DROP CONSTRAINT spending_habits_user_id_country_code_state_code_name_key;
  END IF;
END$$;
ALTER TABLE public.spending_habits ADD CONSTRAINT spending_habits_user_id_country_code_state_code_city_code_name_key UNIQUE (user_id, country_code, state_code, city_code, name);

-- 3. Add index for city_code
CREATE INDEX IF NOT EXISTS idx_spending_habits_city_code ON public.spending_habits(city_code);
CREATE INDEX IF NOT EXISTS idx_spending_habits_user_country_state_city ON public.spending_habits(user_id, country_code, state_code, city_code);

-- 4. Add documentation comment
COMMENT ON COLUMN public.spending_habits.city_code IS 'City code this habit applies to (NULL for state/country-level defaults)'; 