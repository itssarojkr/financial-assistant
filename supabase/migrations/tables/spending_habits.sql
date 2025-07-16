-- Spending Habits Table
-- Stores user spending habits and default values for different countries and states

CREATE TABLE IF NOT EXISTS public.spending_habits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Changed from UUID to TEXT to allow default user ID
    name TEXT NOT NULL,
    country_code TEXT NOT NULL,
    state_code TEXT, -- NULL for country-level defaults
    city_code TEXT, -- NULL for state-level defaults
    habit_type TEXT NOT NULL CHECK (habit_type IN ('conservative', 'moderate', 'liberal', 'custom')),
    expense_multiplier DECIMAL(3,2) NOT NULL, -- e.g., 0.85 for conservative, 1.0 for moderate, 1.25 for liberal
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, country_code, state_code, city_code, name)
);

-- Add comments for documentation
COMMENT ON TABLE public.spending_habits IS 'Stores user spending habits and default values for different countries and states';
COMMENT ON COLUMN public.spending_habits.user_id IS 'User who owns this spending habit (or "default" for system defaults)';
COMMENT ON COLUMN public.spending_habits.name IS 'Name of the spending habit (e.g., Conservative, Moderate, Liberal, Custom Name)';
COMMENT ON COLUMN public.spending_habits.country_code IS 'Country code this habit applies to';
COMMENT ON COLUMN public.spending_habits.state_code IS 'State code this habit applies to (NULL for country-level defaults)';
COMMENT ON COLUMN public.spending_habits.city_code IS 'City code this habit applies to (NULL for state-level defaults)';
COMMENT ON COLUMN public.spending_habits.habit_type IS 'Type of spending habit: conservative, moderate, liberal, or custom';
COMMENT ON COLUMN public.spending_habits.expense_multiplier IS 'Multiplier applied to expenses (e.g., 0.85 for 15% reduction)';
COMMENT ON COLUMN public.spending_habits.description IS 'Description of the spending habit';
COMMENT ON COLUMN public.spending_habits.is_default IS 'Whether this is a default habit (TRUE) or custom user habit (FALSE)'; 