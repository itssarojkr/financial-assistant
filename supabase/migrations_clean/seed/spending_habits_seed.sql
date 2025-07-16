-- Seed default spending habits (country, state, and city level)
-- Example for US, IN, CA, GB, AU, DE, FR, JP, SG
INSERT INTO public.spending_habits (user_id, name, country_code, state_code, city_code, habit_type, expense_multiplier, description, is_default) VALUES
-- United States (country level)
('default', 'Conservative', 'US', NULL, NULL, 'conservative', 0.85, 'Save more, spend less - 15% reduction in expenses', TRUE),
('default', 'Moderate', 'US', NULL, NULL, 'moderate', 1.00, 'Balanced approach - standard expense levels', TRUE),
('default', 'Liberal', 'US', NULL, NULL, 'liberal', 1.25, 'Enjoy life, spend more - 25% increase in expenses', TRUE),
-- California (state level)
('default', 'Conservative', 'US', 'CA', NULL, 'conservative', 0.80, 'California conservative - 20% reduction due to high cost of living', TRUE),
('default', 'Moderate', 'US', 'CA', NULL, 'moderate', 1.10, 'California moderate - 10% increase due to high cost of living', TRUE),
('default', 'Liberal', 'US', 'CA', NULL, 'liberal', 1.35, 'California liberal - 35% increase due to high cost of living', TRUE),
-- Texas (state level)
('default', 'Conservative', 'US', 'TX', NULL, 'conservative', 0.90, 'Texas conservative - 10% reduction due to lower cost of living', TRUE),
('default', 'Moderate', 'US', 'TX', NULL, 'moderate', 0.95, 'Texas moderate - 5% reduction due to lower cost of living', TRUE),
('default', 'Liberal', 'US', 'TX', NULL, 'liberal', 1.15, 'Texas liberal - 15% increase due to lower cost of living', TRUE),
-- India (country level)
('default', 'Conservative', 'IN', NULL, NULL, 'conservative', 0.85, 'Save more, spend less - 15% reduction in expenses', TRUE),
('default', 'Moderate', 'IN', NULL, NULL, 'moderate', 1.00, 'Balanced approach - standard expense levels', TRUE),
('default', 'Liberal', 'IN', NULL, NULL, 'liberal', 1.25, 'Enjoy life, spend more - 25% increase in expenses', TRUE),
-- Maharashtra (state level)
('default', 'Conservative', 'IN', '16', NULL, 'conservative', 0.80, 'Maharashtra conservative - 20% reduction due to high cost of living', TRUE),
('default', 'Moderate', 'IN', '16', NULL, 'moderate', 1.10, 'Maharashtra moderate - 10% increase due to high cost of living', TRUE),
('default', 'Liberal', 'IN', '16', NULL, 'liberal', 1.35, 'Maharashtra liberal - 35% increase due to high cost of living', TRUE),
-- Delhi (state level)
('default', 'Conservative', 'IN', '07', NULL, 'conservative', 0.75, 'Delhi conservative - 25% reduction due to very high cost of living', TRUE),
('default', 'Moderate', 'IN', '07', NULL, 'moderate', 1.15, 'Delhi moderate - 15% increase due to very high cost of living', TRUE),
('default', 'Liberal', 'IN', '07', NULL, 'liberal', 1.40, 'Delhi liberal - 40% increase due to very high cost of living', TRUE)
ON CONFLICT DO NOTHING; 