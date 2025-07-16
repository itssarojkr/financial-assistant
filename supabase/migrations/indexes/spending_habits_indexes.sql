-- Indexes for spending habits table

-- Basic indexes
CREATE INDEX IF NOT EXISTS idx_spending_habits_user_id ON public.spending_habits(user_id);
CREATE INDEX IF NOT EXISTS idx_spending_habits_country_code ON public.spending_habits(country_code);
CREATE INDEX IF NOT EXISTS idx_spending_habits_state_code ON public.spending_habits(state_code);
CREATE INDEX IF NOT EXISTS idx_spending_habits_city_code ON public.spending_habits(city_code);
CREATE INDEX IF NOT EXISTS idx_spending_habits_habit_type ON public.spending_habits(habit_type);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_spending_habits_user_country ON public.spending_habits(user_id, country_code);
CREATE INDEX IF NOT EXISTS idx_spending_habits_user_country_state ON public.spending_habits(user_id, country_code, state_code);
CREATE INDEX IF NOT EXISTS idx_spending_habits_user_country_state_city ON public.spending_habits(user_id, country_code, state_code, city_code); 