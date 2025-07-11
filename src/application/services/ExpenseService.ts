import { supabase } from '@/integrations/supabase/client';
import { Expense, CreateExpenseParams, UpdateExpenseParams } from '@/core/domain/entities/Expense';

export interface ExpenseWithCategory {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  description: string;
  category: string;
  date: string;
  calculationId?: string | null;
  created_at: string;
  updated_at: string;
  expense_categories?: {
    id: string;
    name: string;
    color: string;
  } | null;
}

export class ExpenseService {
  static async createExpense(params: CreateExpenseParams): Promise<{ data: Expense | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          ...params,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error creating expense:', error);
      return { data: null, error };
    }
  }

  static async getExpenseById(id: string): Promise<{ data: Expense | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('id', id)
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error fetching expense by ID:', error);
      return { data: null, error };
    }
  }

  static async getExpensesByUserId(userId: string): Promise<{ data: Expense[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error fetching expenses by user ID:', error);
      return { data: null, error };
    }
  }

  static async getExpensesSummary(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          expense_categories (
            id,
            name,
            color
          )
        `)
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;

      return data?.map(expense => ({
        ...expense,
        period: expense.period || 'monthly' as const,
        currency: expense.currency || 'USD',
      })) || [];
    } catch (error) {
      console.error('Error fetching expenses summary:', error);
      throw error;
    }
  }

  static async deleteExpense(id: string): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      return { data, error };
    } catch (error) {
      console.error('Error deleting expense:', error);
      return { data: null, error };
    }
  }

  static validateExpenseDescription(description: string): boolean {
    return description.length > 0 && description.length <= 255;
  }

  static validateExpenseAmount(amount: number, maxAmount: number = 1000000): boolean {
    return amount > 0 && amount <= maxAmount;
  }

  static async updateExpense(id: string, updates: Partial<Expense>): Promise<{ data: any; error: any }> {
    try {
      const updateData: any = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      // Only include calculationId if it's provided and not undefined
      if (updates.calculationId !== undefined) {
        updateData.calculation_id = updates.calculationId;
      }

      const { data, error } = await supabase
        .from('expenses')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating expense:', error);
      return { data: null, error };
    }
  }
}
