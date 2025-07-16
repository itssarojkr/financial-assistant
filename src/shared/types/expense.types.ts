export interface LocationExpense {
  id: string;
  country_code: string;
  state_code: string | null;
  city_code: string | null;
  expense_type: 'housing' | 'food' | 'transport' | 'utilities' | 'healthcare' | 'entertainment' | 'other';
  estimated_amount: number;
  currency: string;
  is_flexible: boolean;
  reduction_potential: number; // 0.0 to 1.0 (0% to 100%)
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface SpendingHabit {
  name: string;
  type: 'conservative' | 'moderate' | 'liberal' | 'custom';
  fixed_expense_reduction: number; // 0.05 = 5% reduction
  flexible_expense_reduction: number; // 0.40 = 40% reduction
  flexible_expense_increase: number; // 0.20 = 20% increase (for liberal)
  description: string;
}

export interface CalculatedExpense {
  type: 'housing' | 'food' | 'transport' | 'utilities' | 'healthcare' | 'entertainment' | 'other';
  base_amount: number;
  adjusted_amount: number;
  currency: string;
  is_flexible: boolean;
  reduction_potential: number;
  savings_potential: number;
  description: string;
}

export interface ExpenseBreakdown {
  housing: number;
  food: number;
  transport: number;
  utilities: number;
  healthcare: number;
  entertainment: number;
  other: number;
  total: number;
  currency: string;
  savings_potential: number;
  breakdown: CalculatedExpense[];
}

export interface SpendingHabitResult {
  habit: SpendingHabit;
  expenses: ExpenseBreakdown;
  total_savings: number;
  monthly_savings: number;
  annual_savings: number;
  savings_rate: number; // Percentage of income saved
} 