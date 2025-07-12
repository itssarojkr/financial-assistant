
import { supabase } from '@/integrations/supabase/client';

export interface Budget {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  period: string;
  category_id?: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBudgetData {
  userId: string;
  amount: number;
  currency: string;
  period: string;
  categoryId?: number;
  startDate?: string;
  endDate?: string;
}

export interface ExpenseCategory {
  id: number;
  name: string;
  color?: string;
  icon?: string;
}

export class BudgetService {
  static async createBudget(data: CreateBudgetData): Promise<{ data: Budget | null; error: any }> {
    try {
      const { data: budget, error } = await supabase
        .from('budgets')
        .insert({
          user_id: data.userId,
          amount: data.amount,
          currency: data.currency,
          period: data.period,
          category_id: data.categoryId,
          start_date: data.startDate,
          end_date: data.endDate,
        })
        .select()
        .single();

      return { data: budget, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getUserBudgets(userId: string): Promise<{ data: Budget[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async updateBudget(id: string, updates: Partial<CreateBudgetData>): Promise<{ data: Budget | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .update({
          amount: updates.amount,
          currency: updates.currency,
          period: updates.period,
          category_id: updates.categoryId,
          start_date: updates.startDate,
          end_date: updates.endDate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async deleteBudget(id: string): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getExpenseCategories(): Promise<{ data: ExpenseCategory[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .order('name');

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getBudgetVsActual(userId: string, period: string = 'monthly'): Promise<{ data: any; error: any }> {
    try {
      // Get budgets for the user
      const { data: budgets, error: budgetError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .eq('period', period);

      if (budgetError) throw budgetError;

      // Get actual expenses
      const { data: expenses, error: expenseError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId);

      if (expenseError) throw expenseError;

      // Calculate budget vs actual
      const budgetAnalysis = budgets?.map(budget => {
        const categoryExpenses = expenses?.filter(expense => 
          expense.category_id === budget.category_id
        ) || [];

        const totalSpent = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const remaining = budget.amount - totalSpent;
        const percentageUsed = (totalSpent / budget.amount) * 100;

        return {
          budget,
          totalSpent,
          remaining,
          percentageUsed,
          isOverBudget: totalSpent > budget.amount
        };
      });

      return { data: budgetAnalysis, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}
