import { supabase } from '@/integrations/supabase/client';
import { Expense, CreateExpenseParams } from '@/core/domain/entities/Expense';
import { PostgrestError } from '@supabase/supabase-js';

export interface ExpenseWithCategory {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  description: string;
  category: string;
  date: string;
  calculation_id?: string | null;
  created_at: string;
  updated_at: string;
  expense_categories?: {
    id: string;
    name: string;
    color: string;
  } | null;
}

export interface ExpenseData {
  id: string;
  user_id: string;
  amount: number;
  currency: string | null;
  description: string | null;
  category_id: number | null;
  date: string;
  location: string | null;
  source: string | null;
  calculation_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ExpenseServiceError {
  message: string;
  code?: string | undefined;
  details?: string | undefined;
}

export interface ExpenseServiceResponse<T> {
  data: T | null;
  error: ExpenseServiceError | PostgrestError | null;
}

export interface ExpenseSummary {
  id: string;
  user_id: string;
  amount: number;
  currency: string | null;
  description: string | null;
  date: string;
  expense_categories?: {
    id: number;
    name: string;
    color: string | null;
  } | null;
}

export class ExpenseService {
  static async createExpense(params: CreateExpenseParams): Promise<ExpenseServiceResponse<Expense>> {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          user_id: params.userId,
          amount: params.amount,
          currency: params.currency,
          description: params.description,
          date: params.date.toISOString(),
          calculation_id: params.calculationId ?? null,
        })
        .select()
        .single();

      if (error) throw error;

      return { 
        data: data ? this.mapToExpense(data) : null, 
        error: null 
      };
    } catch (error) {
      console.error('Error creating expense:', error);
      const serviceError: ExpenseServiceError = {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: error instanceof PostgrestError ? error.code : undefined,
        details: error instanceof PostgrestError ? error.details : undefined,
      };
      return { data: null, error: serviceError };
    }
  }

  static async getExpenseById(id: string): Promise<ExpenseServiceResponse<Expense>> {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return { 
        data: data ? this.mapToExpense(data) : null, 
        error: null 
      };
    } catch (error) {
      console.error('Error fetching expense by ID:', error);
      const serviceError: ExpenseServiceError = {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: error instanceof PostgrestError ? error.code : undefined,
        details: error instanceof PostgrestError ? error.details : undefined,
      };
      return { data: null, error: serviceError };
    }
  }

  static async getExpensesByUserId(userId: string): Promise<ExpenseServiceResponse<Expense[]>> {
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

      return { 
        data: data ? data.map(this.mapToExpense) : null, 
        error: null 
      };
    } catch (error) {
      console.error('Error fetching expenses by user ID:', error);
      const serviceError: ExpenseServiceError = {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: error instanceof PostgrestError ? error.code : undefined,
        details: error instanceof PostgrestError ? error.details : undefined,
      };
      return { data: null, error: serviceError };
    }
  }

  static async getExpensesSummary(userId: string): Promise<ExpenseSummary[]> {
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
        id: expense.id,
        user_id: expense.user_id,
        amount: expense.amount,
        currency: expense.currency,
        description: expense.description,
        date: expense.date,
        expense_categories: expense.expense_categories,
      })) || [];
    } catch (error) {
      console.error('Error fetching expenses summary:', error);
      throw error;
    }
  }

  static async deleteExpense(id: string): Promise<ExpenseServiceResponse<{ success: boolean }>> {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { data: { success: true }, error: null };
    } catch (error) {
      console.error('Error deleting expense:', error);
      const serviceError: ExpenseServiceError = {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: error instanceof PostgrestError ? error.code : undefined,
        details: error instanceof PostgrestError ? error.details : undefined,
      };
      return { data: null, error: serviceError };
    }
  }

  static async updateExpense(id: string, updates: Partial<Expense>): Promise<ExpenseServiceResponse<Expense>> {
    try {
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (updates.amount !== undefined) updateData.amount = updates.amount;
      if (updates.currency !== undefined) updateData.currency = updates.currency;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.category_id !== undefined) updateData.category_id = updates.category_id;
      if (updates.date !== undefined) updateData.date = updates.date;
      if (updates.location !== undefined) updateData.location = updates.location;
      if (updates.source !== undefined) updateData.source = updates.source;
      if (updates.calculation_id !== undefined) updateData.calculation_id = updates.calculation_id;

      const { data, error } = await supabase
        .from('expenses')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { 
        data: data ? this.mapToExpense(data) : null, 
        error: null 
      };
    } catch (error) {
      console.error('Error updating expense:', error);
      const serviceError: ExpenseServiceError = {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: error instanceof PostgrestError ? error.code : undefined,
        details: error instanceof PostgrestError ? error.details : undefined,
      };
      return { data: null, error: serviceError };
    }
  }

  // Validation methods
  static validateExpenseDescription(description: string): boolean {
    return description.length <= 500;
  }

  static validateExpenseAmount(amount: number, maxAmount: number = 1000000): boolean {
    return amount > 0 && amount <= maxAmount;
  }

  private static mapToExpense(data: ExpenseData): Expense {
    return {
      id: data.id,
      userId: data.user_id,
      amount: data.amount,
      currency: data.currency || 'USD',
      description: data.description || '',
      categoryId: data.category_id,
      date: new Date(data.date),
      location: data.location,
      source: data.source,
      calculationId: data.calculation_id,
      createdAt: data.created_at ? new Date(data.created_at) : new Date(),
      updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
    };
  }
}
