-- Canonical spending_habits table (with city_code)
CREATE TABLE IF NOT EXISTS public.spending_habits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    country_code TEXT NOT NULL,
    state_code TEXT,
    city_code TEXT,
    habit_type TEXT NOT NULL CHECK (habit_type IN ('conservative', 'moderate', 'liberal', 'custom')),
    expense_multiplier DECIMAL(3,2) NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, country_code, state_code, city_code, name)
);

CREATE INDEX IF NOT EXISTS idx_spending_habits_user_id ON public.spending_habits(user_id);
CREATE INDEX IF NOT EXISTS idx_spending_habits_country_code ON public.spending_habits(country_code);
CREATE INDEX IF NOT EXISTS idx_spending_habits_state_code ON public.spending_habits(state_code);
CREATE INDEX IF NOT EXISTS idx_spending_habits_city_code ON public.spending_habits(city_code);
CREATE INDEX IF NOT EXISTS idx_spending_habits_habit_type ON public.spending_habits(habit_type);
CREATE INDEX IF NOT EXISTS idx_spending_habits_user_country ON public.spending_habits(user_id, country_code);
CREATE INDEX IF NOT EXISTS idx_spending_habits_user_country_state ON public.spending_habits(user_id, country_code, state_code);
CREATE INDEX IF NOT EXISTS idx_spending_habits_user_country_state_city ON public.spending_habits(user_id, country_code, state_code, city_code);

ALTER TABLE public.spending_habits ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own spending habits" ON public.spending_habits
    FOR SELECT USING ((SELECT auth.uid())::text = user_id OR user_id = 'default');
CREATE POLICY "Users can insert own spending habits" ON public.spending_habits
    FOR INSERT WITH CHECK ((SELECT auth.uid())::text = user_id);
CREATE POLICY "Users can update own spending habits" ON public.spending_habits
    FOR UPDATE USING ((SELECT auth.uid())::text = user_id);
CREATE POLICY "Users can delete own spending habits" ON public.spending_habits
    FOR DELETE USING ((SELECT auth.uid())::text = user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_spending_habits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_spending_habits_updated_at ON public.spending_habits;
CREATE TRIGGER update_spending_habits_updated_at
    BEFORE UPDATE ON public.spending_habits
    FOR EACH ROW EXECUTE FUNCTION public.update_spending_habits_updated_at();

-- Comments
COMMENT ON TABLE public.spending_habits IS 'Stores user spending habits and default values for different countries, states, and cities';
COMMENT ON COLUMN public.spending_habits.city_code IS 'City code this habit applies to (NULL for state/country-level defaults)'; 