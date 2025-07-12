
import { supabase } from '@/integrations/supabase/client';

export interface ExpenseData {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  description: string | null;
  category_id: number | null;
  date: string;
  location: string | null;
  source: string | null;
  calculation_id: string | null;
  created_at: string | null;
}

export interface AnalyticsResult {
  totalExpenses: number;
  totalAmount: number;
  avgExpense: number;
  categoryBreakdown: Record<string, number>;
  monthlyTrend: Record<string, number>;
}

export class AnalyticsService {
  static async getExpenseAnalytics(userId: string, timeRange: 'week' | 'month' | 'year' = 'month'): Promise<AnalyticsResult | null> {
    console.log('Getting expense analytics for user:', userId, 'timeRange:', timeRange);
    
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      return {
        totalExpenses: data?.length || 0,
        totalAmount: data?.reduce((sum, expense) => sum + expense.amount, 0) || 0,
        avgExpense: data?.length ? (data.reduce((sum, expense) => sum + expense.amount, 0) / data.length) : 0,
        categoryBreakdown: this.getCategoryBreakdown(data || []),
        monthlyTrend: this.getMonthlyTrend(data || [])
      };
    } catch (error) {
      console.error('Error fetching expense analytics:', error);
      return null;
    }
  }

  private static getCategoryBreakdown(expenses: ExpenseData[]): Record<string, number> {
    const breakdown: Record<string, number> = {};
    expenses.forEach(expense => {
      const category = expense.category_id?.toString() || 'other';
      breakdown[category] = (breakdown[category] || 0) + expense.amount;
    });
    return breakdown;
  }

  private static getMonthlyTrend(expenses: ExpenseData[]): Record<string, number> {
    const trend: Record<string, number> = {};
    expenses.forEach(expense => {
      const month = new Date(expense.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      trend[month] = (trend[month] || 0) + expense.amount;
    });
    return trend;
  }
}
