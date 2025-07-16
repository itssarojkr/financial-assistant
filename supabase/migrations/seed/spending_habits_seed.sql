-- Spending Habits Seed Data
-- Default spending habits for different countries and states

-- ===========================================
-- COUNTRY-LEVEL DEFAULTS
-- ===========================================

-- United States defaults
INSERT INTO public.spending_habits (user_id, name, country_code, state_code, city_code, habit_type, expense_multiplier, description, is_default) VALUES
-- Conservative: 15% less spending
('default', 'Conservative', 'US', NULL, NULL, 'conservative', 0.85, 'Save more, spend less - 15% reduction in expenses', TRUE),
-- Moderate: No adjustment
('default', 'Moderate', 'US', NULL, NULL, 'moderate', 1.00, 'Balanced approach - standard expense levels', TRUE),
-- Liberal: 25% more spending
('default', 'Liberal', 'US', NULL, NULL, 'liberal', 1.25, 'Enjoy life, spend more - 25% increase in expenses', TRUE);

-- India defaults
INSERT INTO public.spending_habits (user_id, name, country_code, state_code, city_code, habit_type, expense_multiplier, description, is_default) VALUES
('default', 'Conservative', 'IN', NULL, NULL, 'conservative', 0.85, 'Save more, spend less - 15% reduction in expenses', TRUE),
('default', 'Moderate', 'IN', NULL, NULL, 'moderate', 1.00, 'Balanced approach - standard expense levels', TRUE),
('default', 'Liberal', 'IN', NULL, NULL, 'liberal', 1.25, 'Enjoy life, spend more - 25% increase in expenses', TRUE);

-- Canada defaults
INSERT INTO public.spending_habits (user_id, name, country_code, state_code, city_code, habit_type, expense_multiplier, description, is_default) VALUES
('default', 'Conservative', 'CA', NULL, NULL, 'conservative', 0.85, 'Save more, spend less - 15% reduction in expenses', TRUE),
('default', 'Moderate', 'CA', NULL, NULL, 'moderate', 1.00, 'Balanced approach - standard expense levels', TRUE),
('default', 'Liberal', 'CA', NULL, NULL, 'liberal', 1.25, 'Enjoy life, spend more - 25% increase in expenses', TRUE);

-- United Kingdom defaults
INSERT INTO public.spending_habits (user_id, name, country_code, state_code, city_code, habit_type, expense_multiplier, description, is_default) VALUES
('default', 'Conservative', 'GB', NULL, NULL, 'conservative', 0.85, 'Save more, spend less - 15% reduction in expenses', TRUE),
('default', 'Moderate', 'GB', NULL, NULL, 'moderate', 1.00, 'Balanced approach - standard expense levels', TRUE),
('default', 'Liberal', 'GB', NULL, NULL, 'liberal', 1.25, 'Enjoy life, spend more - 25% increase in expenses', TRUE);

-- Australia defaults
INSERT INTO public.spending_habits (user_id, name, country_code, state_code, city_code, habit_type, expense_multiplier, description, is_default) VALUES
('default', 'Conservative', 'AU', NULL, NULL, 'conservative', 0.85, 'Save more, spend less - 15% reduction in expenses', TRUE),
('default', 'Moderate', 'AU', NULL, NULL, 'moderate', 1.00, 'Balanced approach - standard expense levels', TRUE),
('default', 'Liberal', 'AU', NULL, NULL, 'liberal', 1.25, 'Enjoy life, spend more - 25% increase in expenses', TRUE);

-- Germany defaults
INSERT INTO public.spending_habits (user_id, name, country_code, state_code, city_code, habit_type, expense_multiplier, description, is_default) VALUES
('default', 'Conservative', 'DE', NULL, NULL, 'conservative', 0.85, 'Save more, spend less - 15% reduction in expenses', TRUE),
('default', 'Moderate', 'DE', NULL, NULL, 'moderate', 1.00, 'Balanced approach - standard expense levels', TRUE),
('default', 'Liberal', 'DE', NULL, NULL, 'liberal', 1.25, 'Enjoy life, spend more - 25% increase in expenses', TRUE);

-- France defaults
INSERT INTO public.spending_habits (user_id, name, country_code, state_code, city_code, habit_type, expense_multiplier, description, is_default) VALUES
('default', 'Conservative', 'FR', NULL, NULL, 'conservative', 0.85, 'Save more, spend less - 15% reduction in expenses', TRUE),
('default', 'Moderate', 'FR', NULL, NULL, 'moderate', 1.00, 'Balanced approach - standard expense levels', TRUE),
('default', 'Liberal', 'FR', NULL, NULL, 'liberal', 1.25, 'Enjoy life, spend more - 25% increase in expenses', TRUE);

-- Japan defaults
INSERT INTO public.spending_habits (user_id, name, country_code, state_code, city_code, habit_type, expense_multiplier, description, is_default) VALUES
('default', 'Conservative', 'JP', NULL, NULL, 'conservative', 0.85, 'Save more, spend less - 15% reduction in expenses', TRUE),
('default', 'Moderate', 'JP', NULL, NULL, 'moderate', 1.00, 'Balanced approach - standard expense levels', TRUE),
('default', 'Liberal', 'JP', NULL, NULL, 'liberal', 1.25, 'Enjoy life, spend more - 25% increase in expenses', TRUE);

-- Singapore defaults
INSERT INTO public.spending_habits (user_id, name, country_code, state_code, city_code, habit_type, expense_multiplier, description, is_default) VALUES
('default', 'Conservative', 'SG', NULL, NULL, 'conservative', 0.85, 'Save more, spend less - 15% reduction in expenses', TRUE),
('default', 'Moderate', 'SG', NULL, NULL, 'moderate', 1.00, 'Balanced approach - standard expense levels', TRUE),
('default', 'Liberal', 'SG', NULL, NULL, 'liberal', 1.25, 'Enjoy life, spend more - 25% increase in expenses', TRUE);

-- ===========================================
-- STATE-SPECIFIC DEFAULTS (for countries with significant state-level variations)
-- ===========================================

-- US State-specific defaults (example for California - higher cost of living)
INSERT INTO public.spending_habits (user_id, name, country_code, state_code, city_code, habit_type, expense_multiplier, description, is_default) VALUES
('default', 'Conservative', 'US', 'CA', NULL, 'conservative', 0.80, 'California conservative - 20% reduction due to high cost of living', TRUE),
('default', 'Moderate', 'US', 'CA', NULL, 'moderate', 1.10, 'California moderate - 10% increase due to high cost of living', TRUE),
('default', 'Liberal', 'US', 'CA', NULL, 'liberal', 1.35, 'California liberal - 35% increase due to high cost of living', TRUE);

-- US State-specific defaults (example for Texas - lower cost of living)
INSERT INTO public.spending_habits (user_id, name, country_code, state_code, city_code, habit_type, expense_multiplier, description, is_default) VALUES
('default', 'Conservative', 'US', 'TX', NULL, 'conservative', 0.90, 'Texas conservative - 10% reduction due to lower cost of living', TRUE),
('default', 'Moderate', 'US', 'TX', NULL, 'moderate', 0.95, 'Texas moderate - 5% reduction due to lower cost of living', TRUE),
('default', 'Liberal', 'US', 'TX', NULL, 'liberal', 1.15, 'Texas liberal - 15% increase due to lower cost of living', TRUE);

-- India State-specific defaults (example for Maharashtra - higher cost of living)
INSERT INTO public.spending_habits (user_id, name, country_code, state_code, city_code, habit_type, expense_multiplier, description, is_default) VALUES
('default', 'Conservative', 'IN', '16', NULL, 'conservative', 0.80, 'Maharashtra conservative - 20% reduction due to high cost of living', TRUE),
('default', 'Moderate', 'IN', '16', NULL, 'moderate', 1.10, 'Maharashtra moderate - 10% increase due to high cost of living', TRUE),
('default', 'Liberal', 'IN', '16', NULL, 'liberal', 1.35, 'Maharashtra liberal - 35% increase due to high cost of living', TRUE);

-- India State-specific defaults (example for Delhi - high cost of living)
INSERT INTO public.spending_habits (user_id, name, country_code, state_code, city_code, habit_type, expense_multiplier, description, is_default) VALUES
('default', 'Conservative', 'IN', '07', NULL, 'conservative', 0.75, 'Delhi conservative - 25% reduction due to very high cost of living', TRUE),
('default', 'Moderate', 'IN', '07', NULL, 'moderate', 1.15, 'Delhi moderate - 15% increase due to very high cost of living', TRUE),
('default', 'Liberal', 'IN', '07', NULL, 'liberal', 1.40, 'Delhi liberal - 40% increase due to very high cost of living', TRUE); 