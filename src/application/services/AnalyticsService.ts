
import { ExpenseService } from './ExpenseService';
import { BudgetService } from './BudgetService';
import { ExpenseCategory } from '@/core/domain/enums/ExpenseCategory';
import { Expense } from '@/core/domain/entities/Expense';

/**
 * Analytics service for orchestrating analytics-related business logic
 */
export class AnalyticsService {
  private readonly expenseService: ExpenseService;
  private readonly budgetService: BudgetService;

  constructor(expenseService: ExpenseService, budgetService: BudgetService) {
    this.expenseService = expenseService;
    this.budgetService = budgetService;
  }

  /**
   * Gets comprehensive spending analytics for a user
   */
  async getSpendingAnalytics(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalSpent: number;
    averageDailySpending: number;
    averageMonthlySpending: number;
    categoryBreakdown: Record<string, number>;
    categoryPercentages: Record<string, number>;
    topExpenses: Array<{
      id: string;
      amount: number;
      description: string;
      category: string;
      date: Date;
    }>;
    spendingTrend: Array<{
      date: string;
      amount: number;
    }>;
    spendingByDayOfWeek: Record<string, number>;
    spendingByMonth: Record<string, number>;
  }> {
    try {
      // Get expenses for the period
      const expensesResult = await ExpenseService.getExpensesByUserId(userId);
      const expenses = expensesResult.data || [];

      // Filter expenses by date range
      const filteredExpenses = expenses.filter((expense: Expense) => 
        expense.date >= startDate && expense.date <= endDate
      );

      const totalSpent = filteredExpenses.reduce((sum: number, expense: Expense) => sum + expense.amount, 0);
      const daysInPeriod = Math.max(1, Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
      const monthsInPeriod = Math.max(1, (endDate.getFullYear() - startDate.getFullYear()) * 12 + endDate.getMonth() - startDate.getMonth());

      const averageDailySpending = totalSpent / daysInPeriod;
      const averageMonthlySpending = totalSpent / monthsInPeriod;

      // Category breakdown
      const categoryBreakdown: Record<string, number> = {};
      const categoryPercentages: Record<string, number> = {};

      filteredExpenses.forEach((expense: Expense) => {
        const category = expense.category;
        categoryBreakdown[category] = (categoryBreakdown[category] || 0) + expense.amount;
      });

      // Calculate percentages
      Object.keys(categoryBreakdown).forEach(category => {
        categoryPercentages[category] = totalSpent > 0 ? (categoryBreakdown[category] / totalSpent) * 100 : 0;
      });

      // Top expenses
      const topExpenses = filteredExpenses
        .sort((a: Expense, b: Expense) => b.amount - a.amount)
        .slice(0, 10)
        .map((expense: Expense) => ({
          id: expense.id,
          amount: expense.amount,
          description: expense.description,
          category: expense.category,
          date: expense.date,
        }));

      // Spending trend (daily)
      const spendingTrend: Array<{ date: string; amount: number }> = [];
      const dailySpending: Record<string, number> = {};

      filteredExpenses.forEach((expense: Expense) => {
        const dateKey = expense.date.toISOString().split('T')[0];
        dailySpending[dateKey] = (dailySpending[dateKey] || 0) + expense.amount;
      });

      Object.keys(dailySpending)
        .sort()
        .forEach(date => {
          spendingTrend.push({
            date,
            amount: dailySpending[date],
          });
        });

      // Spending by day of week
      const spendingByDayOfWeek: Record<string, number> = {
        'Sunday': 0,
        'Monday': 0,
        'Tuesday': 0,
        'Wednesday': 0,
        'Thursday': 0,
        'Friday': 0,
        'Saturday': 0,
      };

      filteredExpenses.forEach((expense: Expense) => {
        const dayOfWeek = expense.date.toLocaleDateString('en-US', { weekday: 'long' });
        spendingByDayOfWeek[dayOfWeek] += expense.amount;
      });

      // Spending by month
      const spendingByMonth: Record<string, number> = {};
      filteredExpenses.forEach((expense: Expense) => {
        const monthKey = expense.date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        spendingByMonth[monthKey] = (spendingByMonth[monthKey] || 0) + expense.amount;
      });

      return {
        totalSpent,
        averageDailySpending,
        averageMonthlySpending,
        categoryBreakdown,
        categoryPercentages,
        topExpenses,
        spendingTrend,
        spendingByDayOfWeek,
        spendingByMonth,
      };
    } catch (error) {
      throw new Error(`Failed to get spending analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets budget performance analytics
   */
  async getBudgetAnalytics(userId: string) {
    try {
      const budgets = await this.budgetService.getUserBudgets(userId);
      const now = new Date();

      const totalBudgets = budgets.data.length;
      const activeBudgets = budgets.data.filter(budget => 
        budget.startDate <= now && budget.endDate >= now
      ).length;
      const completedBudgets = budgets.data.filter(budget => budget.endDate < now).length;

      // Simplified budget performance for now
      const budgetPerformance = budgets.data.map((budget) => ({
        budgetId: budget.id,
        budgetName: budget.name,
        plannedAmount: budget.amount,
        actualSpent: 0, // Would need to calculate from expenses
        utilizationPercentage: 0,
        status: 'under_budget' as const,
      }));

      const averageBudgetUtilization = 0;

      return {
        totalBudgets,
        activeBudgets,
        completedBudgets,
        averageBudgetUtilization,
        budgetPerformance,
      };
    } catch (error) {
      throw new Error(`Failed to get budget analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets financial health score
   */
  async getFinancialHealthScore(userId: string) {
    try {
      const now = new Date();
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

      // Get spending analytics
      const spendingAnalytics = await this.getSpendingAnalytics(userId, ninetyDaysAgo, now);
      
      // Get budget analytics
      const budgetAnalytics = await this.getBudgetAnalytics(userId);

      // Calculate spending score (0-100)
      const averageDailySpending = spendingAnalytics.averageDailySpending;
      const spendingScore = Math.max(0, 100 - (averageDailySpending / 100));

      // Calculate budget score (0-100)
      const budgetScore = Math.max(0, 100 - budgetAnalytics.averageBudgetUtilization);

      // Calculate savings score (placeholder)
      const savingsScore = 70;

      // Overall score
      const overallScore = Math.round((spendingScore + budgetScore + savingsScore) / 3);

      // Generate recommendations
      const recommendations: string[] = [];

      if (spendingScore < 50) {
        recommendations.push('Consider reducing daily spending to improve financial health');
      }

      if (budgetScore < 50) {
        recommendations.push('Review and adjust your budgets to better align with actual spending');
      }

      if (budgetAnalytics.activeBudgets === 0) {
        recommendations.push('Create budgets to better track and control your spending');
      }

      return {
        overallScore,
        spendingScore,
        budgetScore,
        savingsScore,
        recommendations,
      };
    } catch (error) {
      throw new Error(`Failed to get financial health score: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets spending insights and patterns
   */
  async getSpendingInsights(userId: string) {
    try {
      const now = new Date();
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      const expensesResult = await ExpenseService.getExpensesByUserId(userId);
      const expenses = expensesResult.data || [];

      // Filter expenses by date range
      const filteredExpenses = expenses.filter((expense: Expense) => 
        expense.date >= ninetyDaysAgo && expense.date <= now
      );

      const unusualSpending: Array<{
        date: Date;
        amount: number;
        description: string;
        reason: 'high_amount' | 'unusual_category' | 'unusual_timing';
      }> = [];

      const spendingPatterns: Array<{
        pattern: string;
        description: string;
        frequency: number;
        averageAmount: number;
      }> = [];

      const recommendations: Array<{
        type: 'reduce_spending' | 'set_budget' | 'optimize_category' | 'save_more';
        title: string;
        description: string;
        potentialSavings: number;
      }> = [];

      // Analyze unusual spending
      if (filteredExpenses.length > 0) {
        const averageAmount = filteredExpenses.reduce((sum: number, exp: Expense) => sum + exp.amount, 0) / filteredExpenses.length;
        const highAmountThreshold = averageAmount * 2;

        filteredExpenses.forEach((expense: Expense) => {
          if (expense.amount > highAmountThreshold) {
            unusualSpending.push({
              date: expense.date,
              amount: expense.amount,
              description: expense.description,
              reason: 'high_amount',
            });
          }
        });

        // Analyze spending patterns
        const categoryFrequency: Record<string, number> = {};
        const categoryTotals: Record<string, number> = {};

        filteredExpenses.forEach((expense: Expense) => {
          const category = expense.category;
          categoryFrequency[category] = (categoryFrequency[category] || 0) + 1;
          categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount;
        });

        Object.keys(categoryFrequency).forEach(category => {
          const freq = categoryFrequency[category];
          const total = categoryTotals[category];
          const avg = total / freq;

          if (freq > 5) {
            spendingPatterns.push({
              pattern: `Frequent ${category} spending`,
              description: `You spend on ${category} ${freq} times in the last 90 days`,
              frequency: freq,
              averageAmount: avg,
            });
          }
        });

        // Generate recommendations
        const totalSpent = filteredExpenses.reduce((sum: number, exp: Expense) => sum + exp.amount, 0);
        
        if (spendingPatterns.length > 5) {
          recommendations.push({
            type: 'set_budget',
            title: 'Set Category Budgets',
            description: 'You have many spending patterns - setting budgets could help control costs',
            potentialSavings: totalSpent * 0.1,
          });
        }
      }

      return {
        unusualSpending,
        spendingPatterns,
        recommendations,
      };
    } catch (error) {
      throw new Error(`Failed to get spending insights: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
