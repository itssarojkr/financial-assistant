import { ExpenseService } from './ExpenseService';
import { BudgetService } from './BudgetService';
import { ExpenseCategory } from '@/core/domain/enums/ExpenseCategory';

/**
 * Analytics service for orchestrating analytics-related business logic
 * 
 * This service coordinates between other services and implements
 * application-level analytics operations.
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
    categoryBreakdown: Record<ExpenseCategory, number>;
    categoryPercentages: Record<ExpenseCategory, number>;
    topExpenses: Array<{
      id: string;
      amount: number;
      description: string;
      category: ExpenseCategory;
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
      const expenses = await this.expenseService.getExpensesByDateRange(userId, startDate, endDate);

      const totalSpent = expenses.data.reduce((sum, expense) => sum + expense.amount, 0);
      const daysInPeriod = Math.max(1, Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
      const monthsInPeriod = Math.max(1, (endDate.getFullYear() - startDate.getFullYear()) * 12 + endDate.getMonth() - startDate.getMonth());

      const averageDailySpending = totalSpent / daysInPeriod;
      const averageMonthlySpending = totalSpent / monthsInPeriod;

      // Category breakdown
      const categoryBreakdown: Record<ExpenseCategory, number> = {} as Record<ExpenseCategory, number>;
      const categoryPercentages: Record<ExpenseCategory, number> = {} as Record<ExpenseCategory, number>;

      expenses.data.forEach(expense => {
        categoryBreakdown[expense.category] = (categoryBreakdown[expense.category] || 0) + expense.amount;
      });

      // Calculate percentages
      Object.keys(categoryBreakdown).forEach(category => {
        categoryPercentages[category as ExpenseCategory] = (categoryBreakdown[category as ExpenseCategory] / totalSpent) * 100;
      });

      // Top expenses
      const topExpenses = expenses.data
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 10)
        .map(expense => ({
          id: expense.id,
          amount: expense.amount,
          description: expense.description,
          category: expense.category,
          date: expense.date,
        }));

      // Spending trend (daily)
      const spendingTrend: Array<{ date: string; amount: number }> = [];
      const dailySpending: Record<string, number> = {};

      expenses.data.forEach(expense => {
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

      expenses.data.forEach(expense => {
        const dayOfWeek = expense.date.toLocaleDateString('en-US', { weekday: 'long' });
        spendingByDayOfWeek[dayOfWeek] += expense.amount;
      });

      // Spending by month
      const spendingByMonth: Record<string, number> = {};
      expenses.data.forEach(expense => {
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
  async getBudgetAnalytics(userId: string): Promise<{
    totalBudgets: number;
    activeBudgets: number;
    completedBudgets: number;
    averageBudgetUtilization: number;
    budgetPerformance: Array<{
      budgetId: string;
      budgetName: string;
      plannedAmount: number;
      actualSpent: number;
      utilizationPercentage: number;
      status: 'under_budget' | 'on_budget' | 'over_budget';
    }>;
  }> {
    try {
      const budgets = await this.budgetService.getUserBudgets(userId);
      const now = new Date();

      const totalBudgets = budgets.data.length;
      const activeBudgets = budgets.data.filter(budget => 
        budget.startDate <= now && budget.endDate >= now
      ).length;
      const completedBudgets = budgets.data.filter(budget => budget.endDate < now).length;

      const budgetPerformance = await Promise.all(
        budgets.data.map(async (budget) => {
          const progress = await this.budgetService.getBudgetProgress(budget.id);
          const utilizationPercentage = (progress.totalSpent / budget.amount) * 100;

          let status: 'under_budget' | 'on_budget' | 'over_budget';
          if (utilizationPercentage < 90) {
            status = 'under_budget';
          } else if (utilizationPercentage <= 110) {
            status = 'on_budget';
          } else {
            status = 'over_budget';
          }

          return {
            budgetId: budget.id,
            budgetName: budget.name,
            plannedAmount: budget.amount,
            actualSpent: progress.totalSpent,
            utilizationPercentage,
            status,
          };
        })
      );

      const averageBudgetUtilization = budgetPerformance.length > 0
        ? budgetPerformance.reduce((sum, budget) => sum + budget.utilizationPercentage, 0) / budgetPerformance.length
        : 0;

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
  async getFinancialHealthScore(userId: string): Promise<{
    overallScore: number;
    spendingScore: number;
    budgetScore: number;
    savingsScore: number;
    recommendations: string[];
  }> {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

      // Get spending analytics
      const spendingAnalytics = await this.getSpendingAnalytics(userId, ninetyDaysAgo, now);
      
      // Get budget analytics
      const budgetAnalytics = await this.getBudgetAnalytics(userId);

      // Calculate spending score (0-100)
      const averageDailySpending = spendingAnalytics.averageDailySpending;
      const spendingScore = Math.max(0, 100 - (averageDailySpending / 100)); // Assuming $100/day is baseline

      // Calculate budget score (0-100)
      const budgetScore = Math.max(0, 100 - budgetAnalytics.averageBudgetUtilization);

      // Calculate savings score (placeholder - would need income data)
      const savingsScore = 70; // Placeholder

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

      if (spendingAnalytics.categoryBreakdown[ExpenseCategory.ENTERTAINMENT] > spendingAnalytics.totalSpent * 0.3) {
        recommendations.push('Entertainment spending is high - consider setting limits');
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
  async getSpendingInsights(userId: string): Promise<{
    unusualSpending: Array<{
      date: Date;
      amount: number;
      description: string;
      reason: 'high_amount' | 'unusual_category' | 'unusual_timing';
    }>;
    spendingPatterns: Array<{
      pattern: string;
      description: string;
      frequency: number;
      averageAmount: number;
    }>;
    recommendations: Array<{
      type: 'reduce_spending' | 'set_budget' | 'optimize_category' | 'save_more';
      title: string;
      description: string;
      potentialSavings: number;
    }>;
  }> {
    try {
      const now = new Date();
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      const expenses = await this.expenseService.getExpensesByDateRange(userId, ninetyDaysAgo, now);

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
      const averageAmount = expenses.data.reduce((sum, exp) => sum + exp.amount, 0) / expenses.data.length;
      const highAmountThreshold = averageAmount * 2;

      expenses.data.forEach(expense => {
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
      const categoryFrequency: Record<ExpenseCategory, number> = {} as Record<ExpenseCategory, number>;
      const categoryTotals: Record<ExpenseCategory, number> = {} as Record<ExpenseCategory, number>;

      expenses.data.forEach(expense => {
        categoryFrequency[expense.category] = (categoryFrequency[expense.category] || 0) + 1;
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
      });

      Object.keys(categoryFrequency).forEach(category => {
        const freq = categoryFrequency[category as ExpenseCategory];
        const total = categoryTotals[category as ExpenseCategory];
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
      const totalSpent = expenses.data.reduce((sum, exp) => sum + exp.amount, 0);
      const entertainmentSpending = categoryTotals[ExpenseCategory.ENTERTAINMENT] || 0;

      if (entertainmentSpending > totalSpent * 0.3) {
        recommendations.push({
          type: 'reduce_spending',
          title: 'Reduce Entertainment Spending',
          description: 'Entertainment accounts for over 30% of your spending',
          potentialSavings: entertainmentSpending * 0.2,
        });
      }

      if (spendingPatterns.length > 5) {
        recommendations.push({
          type: 'set_budget',
          title: 'Set Category Budgets',
          description: 'You have many spending patterns - setting budgets could help control costs',
          potentialSavings: totalSpent * 0.1,
        });
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