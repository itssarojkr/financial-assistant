import { Budget } from '@/core/domain/entities/Budget';
import { BudgetRepository } from '@/infrastructure/database/repositories/BudgetRepository';
import { ExpenseService } from './ExpenseService';
import { PaginationParams, PaginatedResult } from '@/infrastructure/database/repositories/BaseRepository';

/**
 * Budget service for orchestrating budget-related business logic
 * 
 * This service coordinates between repositories and implements
 * application-level budget management operations.
 */
export class BudgetService {
  private readonly budgetRepository: BudgetRepository;
  private readonly expenseService: ExpenseService;

  constructor(budgetRepository: BudgetRepository, expenseService: ExpenseService) {
    this.budgetRepository = budgetRepository;
    this.expenseService = expenseService;
  }

  /**
   * Creates a new budget with validation and business rules
   */
  async createBudget(
    userId: string,
    name: string,
    amount: number,
    currency: string,
    startDate: Date,
    endDate: Date,
    categories?: string[],
    description?: string,
    isRecurring?: boolean,
    recurringInterval?: string
  ): Promise<Budget> {
    try {
      // Validate required fields
      if (!userId || !name || !amount || !currency || !startDate || !endDate) {
        throw new Error('Missing required fields for budget creation');
      }

      if (amount <= 0) {
        throw new Error('Budget amount must be greater than zero');
      }

      if (startDate >= endDate) {
        throw new Error('Start date must be before end date');
      }

      if (startDate < new Date()) {
        throw new Error('Budget start date cannot be in the past');
      }

      // Generate unique ID
      const budgetId = this.generateBudgetId();

      // Create budget with domain logic
      const budget = Budget.create(
        {
          userId,
          name,
          amount,
          currency,
          startDate,
          endDate,
          categories: categories || [],
          description: description || null,
          isRecurring: isRecurring || false,
          recurringInterval: recurringInterval || null,
        },
        budgetId
      );

      // Save to database
      return await this.budgetRepository.create(budget);
    } catch (error) {
      throw new Error(`Failed to create budget: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets a budget by ID with proper error handling
   */
  async getBudgetById(budgetId: string): Promise<Budget | null> {
    try {
      return await this.budgetRepository.findById(budgetId);
    } catch (error) {
      throw new Error(`Failed to get budget: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets budgets for a specific user with pagination
   */
  async getUserBudgets(userId: string, pagination?: PaginationParams): Promise<PaginatedResult<Budget>> {
    try {
      return await this.budgetRepository.findByUserId(userId, pagination);
    } catch (error) {
      throw new Error(`Failed to get user budgets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets active budgets for a specific user
   */
  async getActiveBudgets(userId: string): Promise<Budget[]> {
    try {
      const now = new Date();
      return await this.budgetRepository.findActive(userId, now);
    } catch (error) {
      throw new Error(`Failed to get active budgets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Updates a budget with validation
   */
  async updateBudget(budgetId: string, updates: Partial<Budget>): Promise<Budget> {
    try {
      const existingBudget = await this.budgetRepository.findById(budgetId);
      if (!existingBudget) {
        throw new Error('Budget not found');
      }

      // Validate updates
      if (updates.amount !== undefined && updates.amount <= 0) {
        throw new Error('Budget amount must be greater than zero');
      }

      if (updates.startDate && updates.endDate && updates.startDate >= updates.endDate) {
        throw new Error('Start date must be before end date');
      }

      return await this.budgetRepository.update(budgetId, updates);
    } catch (error) {
      throw new Error(`Failed to update budget: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Deletes a budget
   */
  async deleteBudget(budgetId: string): Promise<boolean> {
    try {
      return await this.budgetRepository.delete(budgetId);
    } catch (error) {
      throw new Error(`Failed to delete budget: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets budget progress and spending analysis
   */
  async getBudgetProgress(budgetId: string): Promise<{
    budget: Budget;
    totalSpent: number;
    remainingAmount: number;
    progressPercentage: number;
    dailyAverage: number;
    projectedOverspend: boolean;
    categoryBreakdown: Record<string, number>;
  }> {
    try {
      const budget = await this.budgetRepository.findById(budgetId);
      if (!budget) {
        throw new Error('Budget not found');
      }

      // Get expenses for the budget period
      const expenses = await this.expenseService.getExpensesByDateRange(
        budget.userId,
        budget.startDate,
        budget.endDate
      );

      const totalSpent = expenses.data.reduce((sum, expense) => sum + expense.amount, 0);
      const remainingAmount = budget.amount - totalSpent;
      const progressPercentage = (totalSpent / budget.amount) * 100;

      // Calculate daily average
      const daysElapsed = Math.max(1, Math.floor((new Date().getTime() - budget.startDate.getTime()) / (1000 * 60 * 60 * 24)));
      const dailyAverage = totalSpent / daysElapsed;

      // Check if projected to overspend
      const totalDays = Math.floor((budget.endDate.getTime() - budget.startDate.getTime()) / (1000 * 60 * 60 * 24));
      const projectedTotal = dailyAverage * totalDays;
      const projectedOverspend = projectedTotal > budget.amount;

      // Category breakdown
      const categoryBreakdown: Record<string, number> = {};
      expenses.data.forEach(expense => {
        const category = expense.category;
        categoryBreakdown[category] = (categoryBreakdown[category] || 0) + expense.amount;
      });

      return {
        budget,
        totalSpent,
        remainingAmount,
        progressPercentage,
        dailyAverage,
        projectedOverspend,
        categoryBreakdown,
      };
    } catch (error) {
      throw new Error(`Failed to get budget progress: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets budget alerts for overspending
   */
  async getBudgetAlerts(userId: string): Promise<Array<{
    budget: Budget;
    alertType: 'overspent' | 'nearing_limit' | 'projected_overspend';
    message: string;
    severity: 'low' | 'medium' | 'high';
  }>> {
    try {
      const activeBudgets = await this.getActiveBudgets(userId);
      const alerts: Array<{
        budget: Budget;
        alertType: 'overspent' | 'nearing_limit' | 'projected_overspend';
        message: string;
        severity: 'low' | 'medium' | 'high';
      }> = [];

      for (const budget of activeBudgets) {
        const progress = await this.getBudgetProgress(budget.id);

        if (progress.totalSpent > budget.amount) {
          alerts.push({
            budget,
            alertType: 'overspent',
            message: `Budget "${budget.name}" has been exceeded by ${Math.abs(progress.remainingAmount).toFixed(2)} ${budget.currency}`,
            severity: 'high',
          });
        } else if (progress.progressPercentage >= 90) {
          alerts.push({
            budget,
            alertType: 'nearing_limit',
            message: `Budget "${budget.name}" is at ${progress.progressPercentage.toFixed(1)}% of limit`,
            severity: 'medium',
          });
        } else if (progress.projectedOverspend) {
          alerts.push({
            budget,
            alertType: 'projected_overspend',
            message: `Budget "${budget.name}" is projected to be exceeded based on current spending`,
            severity: 'low',
          });
        }
      }

      return alerts;
    } catch (error) {
      throw new Error(`Failed to get budget alerts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generates a unique budget ID
   */
  private generateBudgetId(): string {
    return `budget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
} 