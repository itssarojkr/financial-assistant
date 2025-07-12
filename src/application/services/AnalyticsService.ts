
import { supabase } from '@/integrations/supabase/client';

export class AnalyticsService {
  static async getExpenseAnalytics(userId: string, timeRange: 'week' | 'month' | 'year' = 'month') {
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

  private static getCategoryBreakdown(expenses: any[]) {
    const breakdown: Record<string, number> = {};
    expenses.forEach(expense => {
      const category = expense.category || 'other';
      breakdown[category] = (breakdown[category] || 0) + expense.amount;
    });
    return breakdown;
  }

  private static getMonthlyTrend(expenses: any[]) {
    const trend: Record<string, number> = {};
    expenses.forEach(expense => {
      const month = new Date(expense.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      trend[month] = (trend[month] || 0) + expense.amount;
    });
    return trend;
  }
}
