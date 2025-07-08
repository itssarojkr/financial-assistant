import { Expense } from '@/core/domain/entities/Expense';
import { ExpenseRepository } from '@/infrastructure/database/repositories/ExpenseRepository';
import { ExpenseValidationError } from '@/core/domain/value-objects/ExpenseValidationError';
import { ExpenseCategory } from '@/core/domain/enums/ExpenseCategory';
import { PaginationParams, PaginatedResult } from '@/infrastructure/database/repositories/BaseRepository';

/**
 * Expense service for orchestrating expense-related business logic
 * 
 * This service coordinates between repositories and implements
 * application-level expense management operations.
 */
export class ExpenseService {
  private readonly expenseRepository: ExpenseRepository;

  constructor(expenseRepository: ExpenseRepository) {
    this.expenseRepository = expenseRepository;
  }

  /**
   * Creates a new expense with validation and business rules
   */
  async createExpense(
    userId: string,
    amount: number,
    currency: string,
    category: ExpenseCategory,
    description: string,
    date: Date,
    tags?: string[],
    isRecurring?: boolean,
    recurringInterval?: string,
    location?: string,
    receiptUrl?: string,
    notes?: string
  ): Promise<Expense> {
    try {
      // Validate required fields
      if (!userId || !amount || !currency || !category || !description || !date) {
        throw new ExpenseValidationError('Missing required fields for expense creation');
      }

      if (amount <= 0) {
        throw new ExpenseValidationError('Expense amount must be greater than zero');
      }

      if (date > new Date()) {
        throw new ExpenseValidationError('Expense date cannot be in the future');
      }

      // Generate unique ID
      const expenseId = this.generateExpenseId();

      // Create expense with domain logic
      const expense = Expense.create(
        {
          userId,
          amount,
          currency,
          category,
          description,
          date,
          tags: tags || [],
          isRecurring: isRecurring || false,
          recurringInterval: recurringInterval || null,
          location: location || null,
          receiptUrl: receiptUrl || null,
          notes: notes || null,
        },
        expenseId
      );

      // Save to database
      return await this.expenseRepository.create(expense);
    } catch (error) {
      if (error instanceof ExpenseValidationError) {
        throw error;
      }
      throw new ExpenseValidationError(`Failed to create expense: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets an expense by ID with proper error handling
   */
  async getExpenseById(expenseId: string): Promise<Expense | null> {
    try {
      return await this.expenseRepository.findById(expenseId);
    } catch (error) {
      throw new ExpenseValidationError(`Failed to get expense: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets expenses for a specific user with pagination
   */
  async getUserExpenses(userId: string, pagination?: PaginationParams): Promise<PaginatedResult<Expense>> {
    try {
      return await this.expenseRepository.findByUserId(userId, pagination);
    } catch (error) {
      throw new ExpenseValidationError(`Failed to get user expenses: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets expenses by category for a specific user
   */
  async getExpensesByCategory(userId: string, category: ExpenseCategory, pagination?: PaginationParams): Promise<PaginatedResult<Expense>> {
    try {
      return await this.expenseRepository.findByCategory(userId, category, pagination);
    } catch (error) {
      throw new ExpenseValidationError(`Failed to get expenses by category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets expenses within a date range for a specific user
   */
  async getExpensesByDateRange(userId: string, startDate: Date, endDate: Date, pagination?: PaginationParams): Promise<PaginatedResult<Expense>> {
    try {
      if (startDate > endDate) {
        throw new ExpenseValidationError('Start date cannot be after end date');
      }

      return await this.expenseRepository.findByDateRange(userId, startDate, endDate, pagination);
    } catch (error) {
      if (error instanceof ExpenseValidationError) {
        throw error;
      }
      throw new ExpenseValidationError(`Failed to get expenses by date range: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets expenses by amount range for a specific user
   */
  async getExpensesByAmountRange(
    userId: string,
    minAmount: number,
    maxAmount: number,
    currency: string,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<Expense>> {
    try {
      if (minAmount < 0 || maxAmount < 0) {
        throw new ExpenseValidationError('Amount values cannot be negative');
      }

      if (minAmount > maxAmount) {
        throw new ExpenseValidationError('Minimum amount cannot be greater than maximum amount');
      }

      return await this.expenseRepository.findByAmountRange(userId, minAmount, maxAmount, currency, pagination);
    } catch (error) {
      if (error instanceof ExpenseValidationError) {
        throw error;
      }
      throw new ExpenseValidationError(`Failed to get expenses by amount range: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets recurring expenses for a specific user
   */
  async getRecurringExpenses(userId: string, pagination?: PaginationParams): Promise<PaginatedResult<Expense>> {
    try {
      return await this.expenseRepository.findRecurringExpenses(userId, pagination);
    } catch (error) {
      throw new ExpenseValidationError(`Failed to get recurring expenses: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets expenses by tags for a specific user
   */
  async getExpensesByTags(userId: string, tags: string[], pagination?: PaginationParams): Promise<PaginatedResult<Expense>> {
    try {
      if (!tags || tags.length === 0) {
        throw new ExpenseValidationError('At least one tag must be provided');
      }

      return await this.expenseRepository.findByTags(userId, tags, pagination);
    } catch (error) {
      if (error instanceof ExpenseValidationError) {
        throw error;
      }
      throw new ExpenseValidationError(`Failed to get expenses by tags: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Searches expenses by description for a specific user
   */
  async searchExpensesByDescription(userId: string, searchTerm: string, pagination?: PaginationParams): Promise<PaginatedResult<Expense>> {
    try {
      if (!searchTerm || searchTerm.trim().length === 0) {
        throw new ExpenseValidationError('Search term cannot be empty');
      }

      return await this.expenseRepository.searchByDescription(userId, searchTerm.trim(), pagination);
    } catch (error) {
      if (error instanceof ExpenseValidationError) {
        throw error;
      }
      throw new ExpenseValidationError(`Failed to search expenses: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Updates an expense with validation
   */
  async updateExpense(expenseId: string, updates: Partial<Expense>): Promise<Expense> {
    try {
      const expense = await this.getExpenseById(expenseId);
      if (!expense) {
        throw new ExpenseValidationError('Expense not found');
      }

      // Validate updates
      if (updates.amount !== undefined && updates.amount <= 0) {
        throw new ExpenseValidationError('Expense amount must be greater than zero');
      }

      if (updates.date !== undefined && updates.date > new Date()) {
        throw new ExpenseValidationError('Expense date cannot be in the future');
      }

      // Update expense using domain logic
      expense.update(updates);

      // Save to database
      return await this.expenseRepository.update(expenseId, expense);
    } catch (error) {
      if (error instanceof ExpenseValidationError) {
        throw error;
      }
      throw new ExpenseValidationError(`Failed to update expense: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Deletes an expense with business validation
   */
  async deleteExpense(expenseId: string): Promise<boolean> {
    try {
      const expense = await this.getExpenseById(expenseId);
      if (!expense) {
        throw new ExpenseValidationError('Expense not found');
      }

      // Additional business validation could go here
      // For example, check if expense is part of a recurring series, etc.

      return await this.expenseRepository.delete(expenseId);
    } catch (error) {
      if (error instanceof ExpenseValidationError) {
        throw error;
      }
      throw new ExpenseValidationError(`Failed to delete expense: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets category totals for a specific user
   */
  async getCategoryTotals(userId: string, startDate?: Date, endDate?: Date): Promise<Record<ExpenseCategory, number>> {
    try {
      if (startDate && endDate && startDate > endDate) {
        throw new ExpenseValidationError('Start date cannot be after end date');
      }

      return await this.expenseRepository.getCategoryTotals(userId, startDate, endDate);
    } catch (error) {
      if (error instanceof ExpenseValidationError) {
        throw error;
      }
      throw new ExpenseValidationError(`Failed to get category totals: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets monthly totals for a specific user
   */
  async getMonthlyTotals(userId: string, year: number): Promise<Record<number, number>> {
    try {
      const currentYear = new Date().getFullYear();
      if (year < 2020 || year > currentYear + 1) {
        throw new ExpenseValidationError(`Year must be between 2020 and ${currentYear + 1}`);
      }

      return await this.expenseRepository.getMonthlyTotals(userId, year);
    } catch (error) {
      if (error instanceof ExpenseValidationError) {
        throw error;
      }
      throw new ExpenseValidationError(`Failed to get monthly totals: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets the most expensive expenses for a specific user
   */
  async getMostExpensiveExpenses(userId: string, limit: number, startDate?: Date, endDate?: Date): Promise<Expense[]> {
    try {
      if (limit <= 0 || limit > 100) {
        throw new ExpenseValidationError('Limit must be between 1 and 100');
      }

      if (startDate && endDate && startDate > endDate) {
        throw new ExpenseValidationError('Start date cannot be after end date');
      }

      return await this.expenseRepository.getMostExpensive(userId, limit, startDate, endDate);
    } catch (error) {
      if (error instanceof ExpenseValidationError) {
        throw error;
      }
      throw new ExpenseValidationError(`Failed to get most expensive expenses: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets unique tags used by a specific user
   */
  async getUserTags(userId: string): Promise<string[]> {
    try {
      return await this.expenseRepository.getUniqueTags(userId);
    } catch (error) {
      throw new ExpenseValidationError(`Failed to get user tags: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets expense statistics for a specific user
   */
  async getUserExpenseStatistics(userId: string, startDate?: Date, endDate?: Date): Promise<{
    totalExpenses: number;
    totalAmount: number;
    averageAmount: number;
    categoryCounts: Record<ExpenseCategory, number>;
    categoryTotals: Record<ExpenseCategory, number>;
  }> {
    try {
      const [categoryCounts, categoryTotals] = await Promise.all([
        this.expenseRepository.countByCategory(userId, startDate, endDate),
        this.expenseRepository.getCategoryTotals(userId, startDate, endDate),
      ]);

      const totalExpenses = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0);
      const totalAmount = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
      const averageAmount = totalExpenses > 0 ? totalAmount / totalExpenses : 0;

      return {
        totalExpenses,
        totalAmount,
        averageAmount,
        categoryCounts,
        categoryTotals,
      };
    } catch (error) {
      throw new ExpenseValidationError(`Failed to get expense statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generates a unique expense ID
   */
  private generateExpenseId(): string {
    return `expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
} 