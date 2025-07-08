-- Migration: Add calculation_id linkage to expenses, budgets, and spending_alerts
-- This enables proper association between calculations and their related data

-- Add calculation_id column to expenses table
ALTER TABLE expenses 
ADD COLUMN calculation_id UUID REFERENCES saved_data(id) ON DELETE CASCADE;

-- Add calculation_id column to budgets table  
ALTER TABLE budgets 
ADD COLUMN calculation_id UUID REFERENCES saved_data(id) ON DELETE CASCADE;

-- Add calculation_id column to spending_alerts table
ALTER TABLE spending_alerts 
ADD COLUMN calculation_id UUID REFERENCES saved_data(id) ON DELETE CASCADE;

-- Create indexes for better query performance
CREATE INDEX idx_expenses_calculation_id ON expenses(calculation_id);
CREATE INDEX idx_budgets_calculation_id ON budgets(calculation_id);
CREATE INDEX idx_spending_alerts_calculation_id ON spending_alerts(calculation_id);

-- Add comments for documentation
COMMENT ON COLUMN expenses.calculation_id IS 'Links expense to a specific calculation';
COMMENT ON COLUMN budgets.calculation_id IS 'Links budget to a specific calculation';
COMMENT ON COLUMN spending_alerts.calculation_id IS 'Links alert to a specific calculation';

-- Update RLS policies to include calculation_id in checks
-- This ensures users can only access data linked to their calculations

-- Expenses RLS policy update
DROP POLICY IF EXISTS "Users can view own expenses" ON expenses;
CREATE POLICY "Users can view own expenses" ON expenses
  FOR SELECT USING (
    auth.uid() = user_id AND 
    (calculation_id IS NULL OR calculation_id IN (
      SELECT id FROM saved_data WHERE user_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "Users can insert own expenses" ON expenses;
CREATE POLICY "Users can insert own expenses" ON expenses
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    (calculation_id IS NULL OR calculation_id IN (
      SELECT id FROM saved_data WHERE user_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "Users can update own expenses" ON expenses;
CREATE POLICY "Users can update own expenses" ON expenses
  FOR UPDATE USING (
    auth.uid() = user_id AND 
    (calculation_id IS NULL OR calculation_id IN (
      SELECT id FROM saved_data WHERE user_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "Users can delete own expenses" ON expenses;
CREATE POLICY "Users can delete own expenses" ON expenses
  FOR DELETE USING (
    auth.uid() = user_id AND 
    (calculation_id IS NULL OR calculation_id IN (
      SELECT id FROM saved_data WHERE user_id = auth.uid()
    ))
  );

-- Budgets RLS policy update
DROP POLICY IF EXISTS "Users can view own budgets" ON budgets;
CREATE POLICY "Users can view own budgets" ON budgets
  FOR SELECT USING (
    auth.uid() = user_id AND 
    (calculation_id IS NULL OR calculation_id IN (
      SELECT id FROM saved_data WHERE user_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "Users can insert own budgets" ON budgets;
CREATE POLICY "Users can insert own budgets" ON budgets
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    (calculation_id IS NULL OR calculation_id IN (
      SELECT id FROM saved_data WHERE user_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "Users can update own budgets" ON budgets;
CREATE POLICY "Users can update own budgets" ON budgets
  FOR UPDATE USING (
    auth.uid() = user_id AND 
    (calculation_id IS NULL OR calculation_id IN (
      SELECT id FROM saved_data WHERE user_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "Users can delete own budgets" ON budgets;
CREATE POLICY "Users can delete own budgets" ON budgets
  FOR DELETE USING (
    auth.uid() = user_id AND 
    (calculation_id IS NULL OR calculation_id IN (
      SELECT id FROM saved_data WHERE user_id = auth.uid()
    ))
  );

-- Spending alerts RLS policy update
DROP POLICY IF EXISTS "Users can view own spending_alerts" ON spending_alerts;
CREATE POLICY "Users can view own spending_alerts" ON spending_alerts
  FOR SELECT USING (
    auth.uid() = user_id AND 
    (calculation_id IS NULL OR calculation_id IN (
      SELECT id FROM saved_data WHERE user_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "Users can insert own spending_alerts" ON spending_alerts;
CREATE POLICY "Users can insert own spending_alerts" ON spending_alerts
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    (calculation_id IS NULL OR calculation_id IN (
      SELECT id FROM saved_data WHERE user_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "Users can update own spending_alerts" ON spending_alerts;
CREATE POLICY "Users can update own spending_alerts" ON spending_alerts
  FOR UPDATE USING (
    auth.uid() = user_id AND 
    (calculation_id IS NULL OR calculation_id IN (
      SELECT id FROM saved_data WHERE user_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "Users can delete own spending_alerts" ON spending_alerts;
CREATE POLICY "Users can delete own spending_alerts" ON spending_alerts
  FOR DELETE USING (
    auth.uid() = user_id AND 
    (calculation_id IS NULL OR calculation_id IN (
      SELECT id FROM saved_data WHERE user_id = auth.uid()
    ))
  ); 