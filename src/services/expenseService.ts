import { supabase } from '@/integrations/supabase/client';
import type { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export interface Expense {
  id: string;
  user_id: string;
  category_id: number | null;
  amount: number;
  currency: string;
  date: string;
  description: string | null;
  location: string | null;
  source: string | null;
  created_at: string;
  category?: {
    id: number;
    name: string;
    icon: string | null;
    color: string | null;
  };
}

export interface ExpenseCategory {
  id: number;
  name: string;
  icon: string | null;
  color: string | null;
  is_default: boolean;
}

export interface CreateExpenseData {
  category_id?: number | null;
  amount: number;
  currency: string;
  date: string;
  description?: string;
  location?: string;
  source?: string;
}

export interface ExpenseFilters {
  startDate?: string;
  endDate?: string;
  categoryId?: number;
  minAmount?: number;
  maxAmount?: number;
  source?: string;
}

export class ExpenseService {
  // Get all expense categories
  static async getCategories(): Promise<ExpenseCategory[]> {
    const { data, error } = await supabase
      .from('expense_categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    return data || [];
  }

  // Get user's expenses with optional filters
  static async getExpenses(
    userId: string,
    filters?: ExpenseFilters
  ): Promise<Expense[]> {
    let query = supabase
      .from('expenses')
      .select(`
        *,
        category:expense_categories(id, name, icon, color)
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false });

    // Apply filters
    if (filters?.startDate) {
      query = query.gte('date', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('date', filters.endDate);
    }
    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }
    if (filters?.minAmount) {
      query = query.gte('amount', filters.minAmount);
    }
    if (filters?.maxAmount) {
      query = query.lte('amount', filters.maxAmount);
    }
    if (filters?.source) {
      query = query.eq('source', filters.source);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }

    return data || [];
  }

  // Get expenses for a specific month
  static async getExpensesByMonth(
    userId: string,
    year: number,
    month: number
  ): Promise<Expense[]> {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;

    return this.getExpenses(userId, { startDate, endDate });
  }

  // Create a new expense
  static async createExpense(
    userId: string,
    expenseData: CreateExpenseData
  ): Promise<Expense> {
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        user_id: userId,
        ...expenseData,
      })
      .select(`
        *,
        category:expense_categories(id, name, icon, color)
      `)
      .single();

    if (error) {
      console.error('Error creating expense:', error);
      throw error;
    }

    return data;
  }

  // Update an expense
  static async updateExpense(
    expenseId: string,
    updates: Partial<CreateExpenseData>
  ): Promise<Expense> {
    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', expenseId)
      .select(`
        *,
        category:expense_categories(id, name, icon, color)
      `)
      .single();

    if (error) {
      console.error('Error updating expense:', error);
      throw error;
    }

    return data;
  }

  // Delete an expense
  static async deleteExpense(expenseId: string): Promise<void> {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId);

    if (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }

  // Get expense summary by category
  static async getExpenseSummary(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<Array<{
    category_id: number | null;
    category_name: string;
    total_amount: number;
    count: number;
  }>> {
    let query = supabase
      .from('expenses')
      .select(`
        category_id,
        amount,
        category:expense_categories(name)
      `)
      .eq('user_id', userId);

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching expense summary:', error);
      throw error;
    }

    // Group by category and calculate totals
    const summary = new Map<number | null, { amount: number; count: number; name: string }>();
    
    data?.forEach(expense => {
      const categoryId = expense.category_id;
      const categoryName = (expense.category as Partial<ExpenseCategory>)?.name || 'Uncategorized';
      
      if (!summary.has(categoryId)) {
        summary.set(categoryId, { amount: 0, count: 0, name: categoryName });
      }
      
      const current = summary.get(categoryId)!;
      current.amount += expense.amount;
      current.count += 1;
    });

    return Array.from(summary.entries()).map(([categoryId, data]) => ({
      category_id: categoryId,
      category_name: data.name,
      total_amount: data.amount,
      count: data.count,
    }));
  }

  // Bulk import expenses (for SMS scanning, CSV import, etc.)
  static async bulkImportExpenses(
    userId: string,
    expenses: CreateExpenseData[]
  ): Promise<Expense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .insert(
        expenses.map(expense => ({
          user_id: userId,
          ...expense,
        }))
      )
      .select(`
        *,
        category:expense_categories(id, name, icon, color)
      `);

    if (error) {
      console.error('Error bulk importing expenses:', error);
      throw error;
    }

    return data || [];
  }

  // Search expenses
  static async searchExpenses(
    userId: string,
    searchTerm: string
  ): Promise<Expense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select(`
        *,
        category:expense_categories(id, name, icon, color)
      `)
      .eq('user_id', userId)
      .or(`description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error searching expenses:', error);
      throw error;
    }

    return data || [];
  }

  // Get total expenses for a period
  static async getTotalExpenses(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<number> {
    let query = supabase
      .from('expenses')
      .select('amount')
      .eq('user_id', userId);

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching total expenses:', error);
      throw error;
    }

    return data?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
  }
} 