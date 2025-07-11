
import { Budget } from '@/core/domain/entities/Budget';
import { BudgetRepository } from '@/infrastructure/database/repositories/BudgetRepository';
import { ExpenseService } from './ExpenseService';
import { PaginationParams, PaginatedResult } from '@/infrastructure/database/repositories/BaseRepository';

/**
 * Budget service for orchestrating budget-related business logic
 */
export class BudgetService {
  private readonly budgetRepository: BudgetRepository;

  constructor(budgetRepository: BudgetRepository) {
    this.budgetRepository = budgetRepository;
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

      // Generate unique ID
      const budgetId = this.generateBudgetId();

      // Create budget data
      const budgetData = {
        id: budgetId,
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
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save to database
      return await this.budgetRepository.create(budgetData);
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

      // Mock data for now - in real implementation, get from ExpenseService
      const totalSpent = 0;
      const remainingAmount = budget.amount - totalSpent;
      const progressPercentage = (totalSpent / budget.amount) * 100;
      const dailyAverage = 0;
      const projectedOverspend = false;
      const categoryBreakdown: Record<string, number> = {};

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
   * Generates a unique budget ID
   */
  private generateBudgetId(): string {
    return `budget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
