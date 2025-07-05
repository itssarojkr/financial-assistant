import { supabase } from '@/integrations/supabase/client';
import { ExpenseService } from './expenseService';
import { BudgetService } from './budgetService';
import { AlertService } from './alertService';
import { PreferencesService } from './preferencesService';

export interface SpendingInsights {
  total_spent: number;
  average_daily_spending: number;
  top_categories: Array<{
    category_id: number | null;
    category_name: string;
    amount: number;
    percentage: number;
    count: number;
  }>;
  spending_trend: Array<{
    date: string;
    amount: number;
  }>;
  budget_performance: Array<{
    category_id: number | null;
    category_name: string;
    budget_amount: number;
    spent_amount: number;
    remaining_amount: number;
    percentage_used: number;
    status: 'under' | 'over' | 'on_track';
  }>;
  alerts_summary: {
    total_alerts: number;
    active_alerts: number;
    triggered_alerts: number;
    near_threshold_alerts: number;
  };
}

export interface MonthlyReport {
  month: string;
  year: number;
  total_expenses: number;
  total_budget: number;
  savings: number;
  category_breakdown: Array<{
    category_id: number | null;
    category_name: string;
    budget_amount: number;
    spent_amount: number;
    remaining_amount: number;
    percentage_used: number;
  }>;
  top_expenses: Array<{
    id: string;
    amount: number;
    description: string;
    date: string;
    category_name: string;
  }>;
  alerts_triggered: Array<{
    alert_id: string;
    category_name: string;
    threshold: number;
    actual_amount: number;
  }>;
}

export interface SavingsAnalysis {
  current_month_savings: number;
  previous_month_savings: number;
  savings_change_percentage: number;
  projected_yearly_savings: number;
  savings_goals: Array<{
    goal_name: string;
    target_amount: number;
    current_amount: number;
    percentage_complete: number;
  }>;
  spending_patterns: {
    essential_spending: number;
    discretionary_spending: number;
    luxury_spending: number;
  };
}

export class AnalyticsService {
  // Get comprehensive spending insights
  static async getSpendingInsights(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<SpendingInsights> {
    const [expenses, budgetProgress, alertStats] = await Promise.all([
      ExpenseService.getExpenses(userId, { startDate, endDate }),
      BudgetService.getBudgetProgress(userId, startDate, endDate),
      AlertService.getAlertStats(userId),
    ]);

    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const daysInPeriod = this.calculateDaysInPeriod(startDate, endDate);
    const averageDailySpending = daysInPeriod > 0 ? totalSpent / daysInPeriod : 0;

    // Calculate top categories
    const categoryTotals = new Map<number | null, { amount: number; count: number; name: string }>();
    
    expenses.forEach(expense => {
      const categoryId = expense.category_id;
      const categoryName = (expense.category as Partial<import("./expenseService").ExpenseCategory>)?.name || 'Uncategorized';
      
      if (!categoryTotals.has(categoryId)) {
        categoryTotals.set(categoryId, { amount: 0, count: 0, name: categoryName });
      }
      
      const current = categoryTotals.get(categoryId)!;
      current.amount += expense.amount;
      current.count += 1;
    });

    const topCategories = Array.from(categoryTotals.entries())
      .map(([categoryId, data]) => ({
        category_id: categoryId,
        category_name: data.name,
        amount: data.amount,
        percentage: totalSpent > 0 ? (data.amount / totalSpent) * 100 : 0,
        count: data.count,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Calculate spending trend (daily)
    const spendingTrend = this.calculateSpendingTrend(expenses, startDate, endDate);

    // Format budget performance
    const budgetPerformance = budgetProgress.map(budget => ({
      category_id: budget.category_id,
      category_name: budget.category_name,
      budget_amount: budget.budget_amount,
      spent_amount: budget.spent_amount,
      remaining_amount: budget.remaining_amount,
      percentage_used: budget.percentage_used,
      status: (budget.is_over_budget ? 'over' : 
              budget.percentage_used >= 80 ? 'on_track' : 'under') as 'under' | 'over' | 'on_track',
    }));

    // Get near threshold alerts
    const nearThresholdAlerts = await AlertService.getNearThresholdAlerts(userId);

    return {
      total_spent: totalSpent,
      average_daily_spending: averageDailySpending,
      top_categories: topCategories,
      spending_trend: spendingTrend,
      budget_performance: budgetPerformance,
      alerts_summary: {
        ...alertStats,
        near_threshold_alerts: nearThresholdAlerts.length,
      },
    };
  }

  // Generate monthly report
  static async generateMonthlyReport(
    userId: string,
    month: number,
    year: number
  ): Promise<MonthlyReport> {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;

    const [expenses, budgetProgress, alerts] = await Promise.all([
      ExpenseService.getExpenses(userId, { startDate, endDate }),
      BudgetService.getBudgetProgress(userId, startDate, endDate),
      AlertService.checkAlerts(userId),
    ]);

    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalBudget = budgetProgress.reduce((sum, budget) => sum + budget.budget_amount, 0);
    const savings = totalBudget - totalExpenses;

    // Get top 10 expenses
    const topExpenses = expenses
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10)
      .map(expense => ({
        id: expense.id,
        amount: expense.amount,
        description: expense.description || 'No description',
        date: expense.date,
        category_name: (expense.category as Partial<import("./expenseService").ExpenseCategory>)?.name || 'Uncategorized',
      }));

    // Get triggered alerts
    const triggeredAlerts = alerts
      .filter(alert => alert.is_over_threshold)
      .map(alert => ({
        alert_id: alert.alert_id,
        category_name: alert.category_name,
        threshold: alert.threshold,
        actual_amount: alert.current_amount,
      }));

    return {
      month: new Date(year, month - 1).toLocaleString('default', { month: 'long' }),
      year,
      total_expenses: totalExpenses,
      total_budget: totalBudget,
      savings,
      category_breakdown: budgetProgress.map(budget => ({
        category_id: budget.category_id,
        category_name: budget.category_name,
        budget_amount: budget.budget_amount,
        spent_amount: budget.spent_amount,
        remaining_amount: budget.remaining_amount,
        percentage_used: budget.percentage_used,
      })),
      top_expenses: topExpenses,
      alerts_triggered: triggeredAlerts,
    };
  }

  // Analyze savings patterns
  static async getSavingsAnalysis(userId: string): Promise<SavingsAnalysis> {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    // Calculate previous month
    let prevMonth = currentMonth - 1;
    let prevYear = currentYear;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = currentYear - 1;
    }

    const [currentReport, previousReport] = await Promise.all([
      this.generateMonthlyReport(userId, currentMonth, currentYear),
      this.generateMonthlyReport(userId, prevMonth, prevYear),
    ]);

    const currentSavings = currentReport.savings;
    const previousSavings = previousReport.savings;
    const savingsChangePercentage = previousSavings !== 0 
      ? ((currentSavings - previousSavings) / previousSavings) * 100 
      : 0;

    // Project yearly savings (assuming current month's savings rate)
    const projectedYearlySavings = currentSavings * 12;

    // Analyze spending patterns (this would need category classification)
    const spendingPatterns = await this.analyzeSpendingPatterns(userId);

    return {
      current_month_savings: currentSavings,
      previous_month_savings: previousSavings,
      savings_change_percentage: savingsChangePercentage,
      projected_yearly_savings: projectedYearlySavings,
      savings_goals: [], // Would be populated from user-defined goals
      spending_patterns: spendingPatterns,
    };
  }

  // Get spending recommendations
  static async getSpendingRecommendations(userId: string): Promise<Array<{
    type: 'reduce' | 'increase' | 'maintain';
    category_name: string;
    current_amount: number;
    recommended_amount: number;
    reasoning: string;
  }>> {
    const insights = await this.getSpendingInsights(userId);
    const recommendations = [];

    for (const budget of insights.budget_performance) {
      if (budget.status === 'over') {
        recommendations.push({
          type: 'reduce',
          category_name: budget.category_name,
          current_amount: budget.spent_amount,
          recommended_amount: budget.budget_amount,
          reasoning: `You've exceeded your budget for ${budget.category_name} by ${((budget.spent_amount - budget.budget_amount) / budget.budget_amount * 100).toFixed(1)}%`,
        });
      } else if (budget.percentage_used >= 80) {
        recommendations.push({
          type: 'maintain',
          category_name: budget.category_name,
          current_amount: budget.spent_amount,
          recommended_amount: budget.budget_amount,
          reasoning: `You're close to your budget limit for ${budget.category_name}. Consider reducing spending to stay within budget.`,
        });
      }
    }

    return recommendations;
  }

  // Private helper methods
  private static calculateDaysInPeriod(startDate?: string, endDate?: string): number {
    if (!startDate || !endDate) {
      return 30; // Default to 30 days
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private static calculateSpendingTrend(
    expenses: any[],
    startDate?: string,
    endDate?: string
  ): Array<{ date: string; amount: number }> {
    const dailyTotals = new Map<string, number>();
    
    expenses.forEach(expense => {
      const date = expense.date.split('T')[0];
      dailyTotals.set(date, (dailyTotals.get(date) || 0) + expense.amount);
    });

    return Array.from(dailyTotals.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private static async analyzeSpendingPatterns(userId: string): Promise<{
    essential_spending: number;
    discretionary_spending: number;
    luxury_spending: number;
  }> {
    // This would require category classification
    // For now, return placeholder values
    return {
      essential_spending: 0,
      discretionary_spending: 0,
      luxury_spending: 0,
    };
  }

  // Export data for backup or analysis
  static async exportUserData(userId: string): Promise<{
    expenses: any[];
    budgets: any[];
    alerts: any[];
    preferences: any;
    insights: SpendingInsights;
  }> {
    const [expenses, budgets, alerts, preferences, insights] = await Promise.all([
      ExpenseService.getExpenses(userId),
      BudgetService.getBudgets(userId),
      AlertService.getAlerts(userId),
      PreferencesService.getPreferences(userId),
      this.getSpendingInsights(userId),
    ]);

    return {
      expenses,
      budgets,
      alerts,
      preferences,
      insights,
    };
  }
} 