-- Indexes for expense-related tables

-- Basic expense tracking indexes
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_expense_categories_name ON public.expense_categories(name);
CREATE INDEX IF NOT EXISTS idx_spending_alerts_user_id ON public.spending_alerts(user_id);

-- Performance optimization indexes
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON public.expenses(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_user_category ON public.expenses(user_id, category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_amount ON public.expenses(user_id, amount DESC);
CREATE INDEX IF NOT EXISTS idx_budgets_user_period ON public.budgets(user_id, period);
CREATE INDEX IF NOT EXISTS idx_budgets_user_category ON public.budgets(user_id, category_id);
CREATE INDEX IF NOT EXISTS idx_budgets_date_range ON public.budgets(start_date, end_date) WHERE start_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_spending_alerts_user_active ON public.spending_alerts(user_id, active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_spending_alerts_user_category ON public.spending_alerts(user_id, category_id);

-- Partial indexes for filtered queries
CREATE INDEX IF NOT EXISTS idx_spending_alerts_active_only ON public.spending_alerts(user_id, category_id, threshold) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_expenses_recent ON public.expenses(user_id, amount, date) WHERE date >= '2023-01-01'::date;

-- Calculation_id indexes
CREATE INDEX IF NOT EXISTS idx_expenses_calculation_id ON public.expenses(calculation_id);
CREATE INDEX IF NOT EXISTS idx_budgets_calculation_id ON public.budgets(calculation_id);
CREATE INDEX IF NOT EXISTS idx_spending_alerts_calculation_id ON public.spending_alerts(calculation_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_calculation ON public.expenses(user_id, calculation_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_calculation ON public.budgets(user_id, calculation_id);
CREATE INDEX IF NOT EXISTS idx_spending_alerts_user_calculation ON public.spending_alerts(user_id, calculation_id);

-- Updated_at indexes
CREATE INDEX IF NOT EXISTS idx_expenses_updated_at ON public.expenses(updated_at);
CREATE INDEX IF NOT EXISTS idx_budgets_updated_at ON public.budgets(updated_at);
CREATE INDEX IF NOT EXISTS idx_spending_alerts_updated_at ON public.spending_alerts(updated_at); 