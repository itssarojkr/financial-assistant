-- Spending Habits Database Migration
-- This migration creates the spending_habits table and populates default values

-- ===========================================
-- 1. CREATE SPENDING HABITS TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS public.spending_habits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Changed from UUID to TEXT to allow default user ID
    name TEXT NOT NULL,
    country_code TEXT NOT NULL,
    state_code TEXT, -- NULL for country-level defaults
    habit_type TEXT NOT NULL CHECK (habit_type IN ('conservative', 'moderate', 'liberal', 'custom')),
    expense_multiplier DECIMAL(3,2) NOT NULL, -- e.g., 0.85 for conservative, 1.0 for moderate, 1.25 for liberal
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, country_code, state_code, name)
);

-- ===========================================
-- 2. CREATE INDEXES
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_spending_habits_user_id ON public.spending_habits(user_id);
CREATE INDEX IF NOT EXISTS idx_spending_habits_country_code ON public.spending_habits(country_code);
CREATE INDEX IF NOT EXISTS idx_spending_habits_state_code ON public.spending_habits(state_code);
CREATE INDEX IF NOT EXISTS idx_spending_habits_habit_type ON public.spending_habits(habit_type);
CREATE INDEX IF NOT EXISTS idx_spending_habits_user_country ON public.spending_habits(user_id, country_code);
CREATE INDEX IF NOT EXISTS idx_spending_habits_user_country_state ON public.spending_habits(user_id, country_code, state_code);

-- ===========================================
-- 3. ENABLE RLS
-- ===========================================

ALTER TABLE public.spending_habits ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- 4. RLS POLICIES
-- ===========================================

-- Users can view their own spending habits and default habits
CREATE POLICY "Users can view own spending habits" ON public.spending_habits
    FOR SELECT USING (
        (SELECT auth.uid())::text = user_id OR 
        user_id = 'default'
    );

-- Users can insert their own spending habits
CREATE POLICY "Users can insert own spending habits" ON public.spending_habits
    FOR INSERT WITH CHECK ((SELECT auth.uid())::text = user_id);

-- Users can update their own spending habits
CREATE POLICY "Users can update own spending habits" ON public.spending_habits
    FOR UPDATE USING ((SELECT auth.uid())::text = user_id);

-- Users can delete their own spending habits
CREATE POLICY "Users can delete own spending habits" ON public.spending_habits
    FOR DELETE USING ((SELECT auth.uid())::text = user_id);

-- ===========================================
-- 5. INSERT DEFAULT SPENDING HABITS
-- ===========================================

-- Insert default spending habits for different countries
-- These are country-level defaults (state_code is NULL)

-- United States defaults
INSERT INTO public.spending_habits (user_id, name, country_code, state_code, habit_type, expense_multiplier, description, is_default) VALUES
-- Conservative: 15% less spending
('default', 'Conservative', 'US', NULL, 'conservative', 0.85, 'Save more, spend less - 15% reduction in expenses', TRUE),
-- Moderate: No adjustment
('default', 'Moderate', 'US', NULL, 'moderate', 1.00, 'Balanced approach - standard expense levels', TRUE),
-- Liberal: 25% more spending
('default', 'Liberal', 'US', NULL, 'liberal', 1.25, 'Enjoy life, spend more - 25% increase in expenses', TRUE);

-- India defaults
INSERT INTO public.spending_habits (user_id, name, country_code, state_code, habit_type, expense_multiplier, description, is_default) VALUES
('default', 'Conservative', 'IN', NULL, 'conservative', 0.85, 'Save more, spend less - 15% reduction in expenses', TRUE),
('default', 'Moderate', 'IN', NULL, 'moderate', 1.00, 'Balanced approach - standard expense levels', TRUE),
('default', 'Liberal', 'IN', NULL, 'liberal', 1.25, 'Enjoy life, spend more - 25% increase in expenses', TRUE);

-- Canada defaults
INSERT INTO public.spending_habits (user_id, name, country_code, state_code, habit_type, expense_multiplier, description, is_default) VALUES
('default', 'Conservative', 'CA', NULL, 'conservative', 0.85, 'Save more, spend less - 15% reduction in expenses', TRUE),
('default', 'Moderate', 'CA', NULL, 'moderate', 1.00, 'Balanced approach - standard expense levels', TRUE),
('default', 'Liberal', 'CA', NULL, 'liberal', 1.25, 'Enjoy life, spend more - 25% increase in expenses', TRUE);

-- United Kingdom defaults
INSERT INTO public.spending_habits (user_id, name, country_code, state_code, habit_type, expense_multiplier, description, is_default) VALUES
('default', 'Conservative', 'GB', NULL, 'conservative', 0.85, 'Save more, spend less - 15% reduction in expenses', TRUE),
('default', 'Moderate', 'GB', NULL, 'moderate', 1.00, 'Balanced approach - standard expense levels', TRUE),
('default', 'Liberal', 'GB', NULL, 'liberal', 1.25, 'Enjoy life, spend more - 25% increase in expenses', TRUE);

-- Australia defaults
INSERT INTO public.spending_habits (user_id, name, country_code, state_code, habit_type, expense_multiplier, description, is_default) VALUES
('default', 'Conservative', 'AU', NULL, 'conservative', 0.85, 'Save more, spend less - 15% reduction in expenses', TRUE),
('default', 'Moderate', 'AU', NULL, 'moderate', 1.00, 'Balanced approach - standard expense levels', TRUE),
('default', 'Liberal', 'AU', NULL, 'liberal', 1.25, 'Enjoy life, spend more - 25% increase in expenses', TRUE);

-- Germany defaults
INSERT INTO public.spending_habits (user_id, name, country_code, state_code, habit_type, expense_multiplier, description, is_default) VALUES
('default', 'Conservative', 'DE', NULL, 'conservative', 0.85, 'Save more, spend less - 15% reduction in expenses', TRUE),
('default', 'Moderate', 'DE', NULL, 'moderate', 1.00, 'Balanced approach - standard expense levels', TRUE),
('default', 'Liberal', 'DE', NULL, 'liberal', 1.25, 'Enjoy life, spend more - 25% increase in expenses', TRUE);

-- France defaults
INSERT INTO public.spending_habits (user_id, name, country_code, state_code, habit_type, expense_multiplier, description, is_default) VALUES
('default', 'Conservative', 'FR', NULL, 'conservative', 0.85, 'Save more, spend less - 15% reduction in expenses', TRUE),
('default', 'Moderate', 'FR', NULL, 'moderate', 1.00, 'Balanced approach - standard expense levels', TRUE),
('default', 'Liberal', 'FR', NULL, 'liberal', 1.25, 'Enjoy life, spend more - 25% increase in expenses', TRUE);

-- Japan defaults
INSERT INTO public.spending_habits (user_id, name, country_code, state_code, habit_type, expense_multiplier, description, is_default) VALUES
('default', 'Conservative', 'JP', NULL, 'conservative', 0.85, 'Save more, spend less - 15% reduction in expenses', TRUE),
('default', 'Moderate', 'JP', NULL, 'moderate', 1.00, 'Balanced approach - standard expense levels', TRUE),
('default', 'Liberal', 'JP', NULL, 'liberal', 1.25, 'Enjoy life, spend more - 25% increase in expenses', TRUE);

-- Singapore defaults
INSERT INTO public.spending_habits (user_id, name, country_code, state_code, habit_type, expense_multiplier, description, is_default) VALUES
('default', 'Conservative', 'SG', NULL, 'conservative', 0.85, 'Save more, spend less - 15% reduction in expenses', TRUE),
('default', 'Moderate', 'SG', NULL, 'moderate', 1.00, 'Balanced approach - standard expense levels', TRUE),
('default', 'Liberal', 'SG', NULL, 'liberal', 1.25, 'Enjoy life, spend more - 25% increase in expenses', TRUE);

-- ===========================================
-- 6. STATE-SPECIFIC DEFAULTS (for countries with significant state-level variations)
-- ===========================================

-- US State-specific defaults (example for California - higher cost of living)
INSERT INTO public.spending_habits (user_id, name, country_code, state_code, habit_type, expense_multiplier, description, is_default) VALUES
('default', 'Conservative', 'US', 'CA', 'conservative', 0.80, 'California conservative - 20% reduction due to high cost of living', TRUE),
('default', 'Moderate', 'US', 'CA', 'moderate', 1.10, 'California moderate - 10% increase due to high cost of living', TRUE),
('default', 'Liberal', 'US', 'CA', 'liberal', 1.35, 'California liberal - 35% increase due to high cost of living', TRUE);

-- US State-specific defaults (example for Texas - lower cost of living)
INSERT INTO public.spending_habits (user_id, name, country_code, state_code, habit_type, expense_multiplier, description, is_default) VALUES
('default', 'Conservative', 'US', 'TX', 'conservative', 0.90, 'Texas conservative - 10% reduction due to lower cost of living', TRUE),
('default', 'Moderate', 'US', 'TX', 'moderate', 0.95, 'Texas moderate - 5% reduction due to lower cost of living', TRUE),
('default', 'Liberal', 'US', 'TX', 'liberal', 1.15, 'Texas liberal - 15% increase due to lower cost of living', TRUE);

-- India State-specific defaults (example for Maharashtra - higher cost of living)
INSERT INTO public.spending_habits (user_id, name, country_code, state_code, habit_type, expense_multiplier, description, is_default) VALUES
('default', 'Conservative', 'IN', '16', 'conservative', 0.80, 'Maharashtra conservative - 20% reduction due to high cost of living', TRUE),
('default', 'Moderate', 'IN', '16', 'moderate', 1.10, 'Maharashtra moderate - 10% increase due to high cost of living', TRUE),
('default', 'Liberal', 'IN', '16', 'liberal', 1.35, 'Maharashtra liberal - 35% increase due to high cost of living', TRUE);

-- India State-specific defaults (example for Delhi - high cost of living)
INSERT INTO public.spending_habits (user_id, name, country_code, state_code, habit_type, expense_multiplier, description, is_default) VALUES
('default', 'Conservative', 'IN', '07', 'conservative', 0.75, 'Delhi conservative - 25% reduction due to very high cost of living', TRUE),
('default', 'Moderate', 'IN', '07', 'moderate', 1.15, 'Delhi moderate - 15% increase due to very high cost of living', TRUE),
('default', 'Liberal', 'IN', '07', 'liberal', 1.40, 'Delhi liberal - 40% increase due to very high cost of living', TRUE);

-- ===========================================
-- 7. CREATE TRIGGER FOR UPDATED_AT
-- ===========================================

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

-- ===========================================
-- 8. GRANT PERMISSIONS
-- ===========================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.spending_habits TO authenticated;

-- ===========================================
-- 9. ADD COMMENTS FOR DOCUMENTATION
-- ===========================================

COMMENT ON TABLE public.spending_habits IS 'Stores user spending habits and default values for different countries and states';
COMMENT ON COLUMN public.spending_habits.user_id IS 'User who owns this spending habit (or "default" for system defaults)';
COMMENT ON COLUMN public.spending_habits.name IS 'Name of the spending habit (e.g., Conservative, Moderate, Liberal, Custom Name)';
COMMENT ON COLUMN public.spending_habits.country_code IS 'Country code this habit applies to';
COMMENT ON COLUMN public.spending_habits.state_code IS 'State code this habit applies to (NULL for country-level defaults)';
COMMENT ON COLUMN public.spending_habits.habit_type IS 'Type of spending habit: conservative, moderate, liberal, or custom';
COMMENT ON COLUMN public.spending_habits.expense_multiplier IS 'Multiplier applied to expenses (e.g., 0.85 for 15% reduction)';
COMMENT ON COLUMN public.spending_habits.description IS 'Description of the spending habit';
COMMENT ON COLUMN public.spending_habits.is_default IS 'Whether this is a default habit (TRUE) or custom user habit (FALSE)'; 