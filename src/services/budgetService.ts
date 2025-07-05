import { supabase } from '@/integrations/supabase/client';
import type { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export interface Budget {
  id: string;
  user_id: string;
  category_id: number | null;
  amount: number;
  period: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  category?: {
    id: number;
    name: string;
    icon: string | null;
    color: string | null;
  };
}

export interface CreateBudgetData {
  category_id?: number | null;
  amount: number;
  period: string;
  start_date?: string;
  end_date?: string;
}

export interface BudgetProgress {
  budget_id: string;
  category_id: number | null;
  category_name: string;
  budget_amount: number;
  spent_amount: number;
  remaining_amount: number;
  percentage_used: number;
  is_over_budget: boolean;
}

export class BudgetService {
  // Get user's budgets
  static async getBudgets(userId: string): Promise<Budget[]> {
    const { data, error } = await supabase
      .from('budgets')
      .select(`
        *,
        category:expense_categories(id, name, icon, color)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching budgets:', error);
      throw error;
    }

    return data || [];
  }

  // Get budgets for a specific period
  static async getBudgetsByPeriod(
    userId: string,
    period: string,
    startDate?: string,
    endDate?: string
  ): Promise<Budget[]> {
    let query = supabase
      .from('budgets')
      .select(`
        *,
        category:expense_categories(id, name, icon, color)
      `)
      .eq('user_id', userId)
      .eq('period', period);

    if (startDate) {
      query = query.gte('start_date', startDate);
    }
    if (endDate) {
      query = query.lte('end_date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching budgets by period:', error);
      throw error;
    }

    return data || [];
  }

  // Create a new budget
  static async createBudget(
    userId: string,
    budgetData: CreateBudgetData
  ): Promise<Budget> {
    const { data, error } = await supabase
      .from('budgets')
      .insert({
        user_id: userId,
        ...budgetData,
      })
      .select(`
        *,
        category:expense_categories(id, name, icon, color)
      `)
      .single();

    if (error) {
      console.error('Error creating budget:', error);
      throw error;
    }

    return data;
  }

  // Update a budget
  static async updateBudget(
    budgetId: string,
    updates: Partial<CreateBudgetData>
  ): Promise<Budget> {
    const { data, error } = await supabase
      .from('budgets')
      .update(updates)
      .eq('id', budgetId)
      .select(`
        *,
        category:expense_categories(id, name, icon, color)
      `)
      .single();

    if (error) {
      console.error('Error updating budget:', error);
      throw error;
    }

    return data;
  }

  // Delete a budget
  static async deleteBudget(budgetId: string): Promise<void> {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', budgetId);

    if (error) {
      console.error('Error deleting budget:', error);
      throw error;
    }
  }

  // Get budget progress (how much spent vs budget)
  static async getBudgetProgress(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<BudgetProgress[]> {
    // Get all budgets
    const budgets = await this.getBudgets(userId);
    
    // Get expenses for the period
    const { data: expenses, error } = await supabase
      .from('expenses')
      .select(`
        category_id,
        amount,
        category:expense_categories(name)
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching expenses for budget progress:', error);
      throw error;
    }

    // Calculate progress for each budget
    const progress: BudgetProgress[] = [];

    for (const budget of budgets) {
      const categoryExpenses = expenses?.filter(
        expense => expense.category_id === budget.category_id
      ) || [];

      const spentAmount = categoryExpenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );

      const remainingAmount = budget.amount - spentAmount;
      const percentageUsed = (spentAmount / budget.amount) * 100;

      progress.push({
        budget_id: budget.id,
        category_id: budget.category_id,
        category_name: (budget.category as Partial<import('./expenseService').ExpenseCategory>)?.name || 'Uncategorized',
        budget_amount: budget.amount,
        spent_amount: spentAmount,
        remaining_amount: remainingAmount,
        percentage_used: percentageUsed,
        is_over_budget: spentAmount > budget.amount,
      });
    }

    return progress;
  }

  // Create monthly budget template
  static async createMonthlyBudgetTemplate(
    userId: string,
    month: number,
    year: number,
    categoryBudgets: Array<{ category_id: number; amount: number }>
  ): Promise<Budget[]> {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;

    const budgets: Budget[] = [];

    for (const categoryBudget of categoryBudgets) {
      const budget = await this.createBudget(userId, {
        category_id: categoryBudget.category_id,
        amount: categoryBudget.amount,
        period: 'monthly',
        start_date: startDate,
        end_date: endDate,
      });
      budgets.push(budget);
    }

    return budgets;
  }

  // Get budget alerts (budgets that are close to or over limit)
  static async getBudgetAlerts(
    userId: string,
    threshold: number = 80 // Alert when 80% of budget is used
  ): Promise<BudgetProgress[]> {
    const progress = await this.getBudgetProgress(userId);
    
    return progress.filter(
      budget => budget.percentage_used >= threshold || budget.is_over_budget
    );
  }

  // Copy budget from previous month
  static async copyBudgetFromPreviousMonth(
    userId: string,
    targetMonth: number,
    targetYear: number
  ): Promise<Budget[]> {
    // Calculate previous month
    let prevMonth = targetMonth - 1;
    let prevYear = targetYear;
    
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = targetYear - 1;
    }

    // Get previous month's budgets
    const prevBudgets = await this.getBudgetsByPeriod(
      userId,
      'monthly',
      `${prevYear}-${prevMonth.toString().padStart(2, '0')}-01`,
      `${prevYear}-${prevMonth.toString().padStart(2, '0')}-31`
    );

    // Create new budgets for target month
    const newBudgets: Budget[] = [];
    const targetStartDate = `${targetYear}-${targetMonth.toString().padStart(2, '0')}-01`;
    const targetEndDate = `${targetYear}-${targetMonth.toString().padStart(2, '0')}-31`;

    for (const prevBudget of prevBudgets) {
      const newBudget = await this.createBudget(userId, {
        category_id: prevBudget.category_id,
        amount: prevBudget.amount,
        period: 'monthly',
        start_date: targetStartDate,
        end_date: targetEndDate,
      });
      newBudgets.push(newBudget);
    }

    return newBudgets;
  }
} 