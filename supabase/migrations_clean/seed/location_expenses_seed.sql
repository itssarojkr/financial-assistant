-- Seed location_expenses (country and state level)
INSERT INTO public.location_expenses (country_code, state_code, city_code, expense_type, estimated_amount, currency, is_flexible, reduction_potential, description) VALUES
-- US country level
('US', NULL, NULL, 'housing', 1500.00, 'USD', FALSE, 0.10, 'Average monthly rent/mortgage'),
('US', NULL, NULL, 'food', 400.00, 'USD', TRUE, 0.40, 'Groceries and dining out'),
('US', NULL, NULL, 'transport', 300.00, 'USD', TRUE, 0.25, 'Gas, public transport, car maintenance'),
('US', NULL, NULL, 'utilities', 200.00, 'USD', FALSE, 0.10, 'Electricity, water, internet'),
('US', NULL, NULL, 'healthcare', 150.00, 'USD', FALSE, 0.15, 'Insurance, medical expenses'),
('US', NULL, NULL, 'entertainment', 250.00, 'USD', TRUE, 0.60, 'Movies, dining out, hobbies'),
('US', NULL, NULL, 'other', 200.00, 'USD', TRUE, 0.70, 'Shopping, personal care, miscellaneous'),
-- California state level
('US', 'CA', NULL, 'housing', 2500.00, 'USD', FALSE, 0.05, 'High cost housing in California'),
('US', 'CA', NULL, 'food', 600.00, 'USD', TRUE, 0.35, 'Higher food costs in California'),
('US', 'CA', NULL, 'transport', 400.00, 'USD', TRUE, 0.20, 'Higher transport costs'),
('US', 'CA', NULL, 'utilities', 250.00, 'USD', FALSE, 0.10, 'Higher utility costs'),
('US', 'CA', NULL, 'healthcare', 200.00, 'USD', FALSE, 0.15, 'Healthcare costs'),
('US', 'CA', NULL, 'entertainment', 350.00, 'USD', TRUE, 0.60, 'Entertainment and dining'),
('US', 'CA', NULL, 'other', 300.00, 'USD', TRUE, 0.70, 'Other expenses'),
-- Texas state level
('US', 'TX', NULL, 'housing', 1200.00, 'USD', FALSE, 0.10, 'Lower cost housing in Texas'),
('US', 'TX', NULL, 'food', 350.00, 'USD', TRUE, 0.40, 'Lower food costs'),
('US', 'TX', NULL, 'transport', 250.00, 'USD', TRUE, 0.25, 'Lower transport costs'),
('US', 'TX', NULL, 'utilities', 180.00, 'USD', FALSE, 0.10, 'Lower utility costs'),
('US', 'TX', NULL, 'healthcare', 120.00, 'USD', FALSE, 0.15, 'Healthcare costs'),
('US', 'TX', NULL, 'entertainment', 200.00, 'USD', TRUE, 0.60, 'Entertainment and dining'),
('US', 'TX', NULL, 'other', 150.00, 'USD', TRUE, 0.70, 'Other expenses'),
-- India country level
('IN', NULL, NULL, 'housing', 25000.00, 'INR', FALSE, 0.10, 'Average monthly rent'),
('IN', NULL, NULL, 'food', 8000.00, 'INR', TRUE, 0.40, 'Groceries and dining'),
('IN', NULL, NULL, 'transport', 3000.00, 'INR', TRUE, 0.25, 'Public transport, fuel'),
('IN', NULL, NULL, 'utilities', 2000.00, 'INR', FALSE, 0.10, 'Electricity, water, internet'),
('IN', NULL, NULL, 'healthcare', 1500.00, 'INR', FALSE, 0.15, 'Medical expenses'),
('IN', NULL, NULL, 'entertainment', 5000.00, 'INR', TRUE, 0.60, 'Movies, dining, shopping'),
('IN', NULL, NULL, 'other', 4000.00, 'INR', TRUE, 0.70, 'Personal care, miscellaneous'),
-- Maharashtra state level
('IN', '16', NULL, 'housing', 35000.00, 'INR', FALSE, 0.05, 'High cost housing in Maharashtra'),
('IN', '16', NULL, 'food', 10000.00, 'INR', TRUE, 0.35, 'Higher food costs'),
('IN', '16', NULL, 'transport', 4000.00, 'INR', TRUE, 0.20, 'Higher transport costs'),
('IN', '16', NULL, 'utilities', 2500.00, 'INR', FALSE, 0.10, 'Higher utility costs'),
('IN', '16', NULL, 'healthcare', 2000.00, 'INR', FALSE, 0.15, 'Healthcare costs'),
('IN', '16', NULL, 'entertainment', 7000.00, 'INR', TRUE, 0.60, 'Entertainment and dining'),
('IN', '16', NULL, 'other', 5000.00, 'INR', TRUE, 0.70, 'Other expenses'),
-- Delhi state level
('IN', '07', NULL, 'housing', 45000.00, 'INR', FALSE, 0.05, 'Very high cost housing in Delhi'),
('IN', '07', NULL, 'food', 12000.00, 'INR', TRUE, 0.30, 'Very high food costs'),
('IN', '07', NULL, 'transport', 5000.00, 'INR', TRUE, 0.15, 'High transport costs'),
('IN', '07', NULL, 'utilities', 3000.00, 'INR', FALSE, 0.10, 'High utility costs'),
('IN', '07', NULL, 'healthcare', 2500.00, 'INR', FALSE, 0.15, 'Healthcare costs'),
('IN', '07', NULL, 'entertainment', 10000.00, 'INR', TRUE, 0.60, 'Entertainment and dining'),
('IN', '07', NULL, 'other', 8000.00, 'INR', TRUE, 0.70, 'Other expenses')
ON CONFLICT DO NOTHING; 