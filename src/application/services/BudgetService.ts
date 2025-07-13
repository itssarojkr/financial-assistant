
import { supabase } from '@/integrations/supabase/client';
import { Budget, CreateBudgetParams, UpdateBudgetParams } from '@/core/domain/entities/Budget';
import { PostgrestError } from '@supabase/supabase-js';

export interface BudgetData {
  id: string;
  user_id: string;
  amount: number;
  currency: string | null;
  period: string;
  start_date?: string | null;
  end_date?: string | null;
  category_id?: number | null;
  calculation_id?: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CreateBudgetData {
  userId: string;
  amount: number;
  currency: string;
  period: string;
  startDate?: string | null;
  endDate?: string | null;
  categoryId?: number | null;
  calculationId?: string | null;
}

export interface ExpenseCategory {
  id: number;
  name: string;
  color?: string | null;
  icon?: string | null;
}

export interface BudgetServiceError {
  message: string;
  code?: string | undefined;
  details?: string | undefined;
}

export interface BudgetServiceResponse<T> {
  data: T | null;
  error: BudgetServiceError | PostgrestError | null;
}

export interface BudgetAnalysis {
  budget: Budget;
  totalSpent: number;
  remaining: number;
  percentageUsed: number;
  isOverBudget: boolean;
}

export class BudgetService {
  static async createBudget(data: CreateBudgetData): Promise<BudgetServiceResponse<Budget>> {
    try {
      const { data: budget, error } = await supabase
        .from('budgets')
        .insert({
          user_id: data.userId,
          amount: data.amount,
          currency: data.currency,
          period: data.period,
          start_date: data.startDate ?? null,
          end_date: data.endDate ?? null,
          category_id: data.categoryId ?? null,
          calculation_id: data.calculationId ?? null,
        })
        .select()
        .single();

      if (error) throw error;

      return { 
        data: budget ? this.mapToBudget(budget) : null, 
        error: null 
      };
    } catch (error) {
      console.error('Error creating budget:', error);
      const serviceError: BudgetServiceError = {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: error instanceof PostgrestError ? error.code : undefined,
        details: error instanceof PostgrestError ? error.details : undefined,
      };
      return { data: null, error: serviceError };
    }
  }

  static async getUserBudgets(userId: string): Promise<BudgetServiceResponse<Budget[]>> {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const budgets = data?.map(item => this.mapToBudget(item)) || [];
      return { data: budgets, error: null };
    } catch (error) {
      console.error('Error fetching budgets:', error);
      const serviceError: BudgetServiceError = {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: error instanceof PostgrestError ? error.code : undefined,
        details: error instanceof PostgrestError ? error.details : undefined,
      };
      return { data: null, error: serviceError };
    }
  }

  static async updateBudget(id: string, updates: UpdateBudgetParams): Promise<BudgetServiceResponse<Budget>> {
    try {
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (updates.amount !== undefined) updateData.amount = updates.amount;
      if (updates.currency !== undefined) updateData.currency = updates.currency;
      if (updates.startDate !== undefined) updateData.start_date = updates.startDate;
      if (updates.endDate !== undefined) updateData.end_date = updates.endDate;
      if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId;
      if (updates.calculationId !== undefined) updateData.calculation_id = updates.calculationId;

      const { data, error } = await supabase
        .from('budgets')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { 
        data: data ? this.mapToBudget(data) : null, 
        error: null 
      };
    } catch (error) {
      console.error('Error updating budget:', error);
      const serviceError: BudgetServiceError = {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: error instanceof PostgrestError ? error.code : undefined,
        details: error instanceof PostgrestError ? error.details : undefined,
      };
      return { data: null, error: serviceError };
    }
  }

  static async deleteBudget(id: string): Promise<BudgetServiceResponse<{ success: boolean }>> {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { data: { success: true }, error: null };
    } catch (error) {
      console.error('Error deleting budget:', error);
      const serviceError: BudgetServiceError = {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: error instanceof PostgrestError ? error.code : undefined,
        details: error instanceof PostgrestError ? error.details : undefined,
      };
      return { data: null, error: serviceError };
    }
  }

  static async getExpenseCategories(): Promise<BudgetServiceResponse<ExpenseCategory[]>> {
    try {
      const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .order('name');

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching expense categories:', error);
      const serviceError: BudgetServiceError = {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: error instanceof PostgrestError ? error.code : undefined,
        details: error instanceof PostgrestError ? error.details : undefined,
      };
      return { data: null, error: serviceError };
    }
  }

  static async getBudgetVsActual(userId: string, period: string = 'monthly'): Promise<BudgetServiceResponse<BudgetAnalysis[]>> {
    try {
      // Get budgets for the user
      const { data: budgets, error: budgetError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId);

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
          budget: this.mapToBudget(budget),
          totalSpent,
          remaining,
          percentageUsed,
          isOverBudget: totalSpent > budget.amount
        };
      }) || [];

      return { data: budgetAnalysis, error: null };
    } catch (error) {
      console.error('Error calculating budget vs actual:', error);
      const serviceError: BudgetServiceError = {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: error instanceof PostgrestError ? error.code : undefined,
        details: error instanceof PostgrestError ? error.details : undefined,
      };
      return { data: null, error: serviceError };
    }
  }

  private static mapToBudget(data: BudgetData): Budget {
    const budget: Budget = {
      id: data.id,
      userId: data.user_id,
      name: `Budget ${data.id.slice(0, 8)}`, // Generate a name since it doesn't exist in DB
      amount: data.amount,
      currency: data.currency || 'USD',
      startDate: data.start_date ? new Date(data.start_date) : new Date(),
      endDate: data.end_date ? new Date(data.end_date) : new Date(),
      calculationId: data.calculation_id || null,
      createdAt: data.created_at ? new Date(data.created_at) : new Date(),
      updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
    };
    
    if (data.category_id) {
      budget.categoryId = data.category_id.toString();
    }
    
    return budget;
  }
}
