import { Expense } from '@/core/domain/entities/Expense';
import { ExpenseCategory } from '@/core/domain/enums/ExpenseCategory';
import { BaseRepository, PaginatedRepository, PaginationParams, PaginatedResult } from './BaseRepository';

/**
 * Expense repository interface defining expense-specific operations
 * 
 * This interface extends the base repository with expense-specific queries
 * and operations that are commonly needed for expense management.
 */
export interface ExpenseRepository extends PaginatedRepository<Expense, string> {
  /**
   * Finds expenses for a specific user
   * @param userId - The user ID to find expenses for
   * @param pagination - Optional pagination parameters
   * @returns Promise resolving to paginated results
   */
  findByUserId(userId: string, pagination?: PaginationParams): Promise<PaginatedResult<Expense>>;

  /**
   * Finds expenses by category for a specific user
   * @param userId - The user ID to find expenses for
   * @param category - The expense category to filter by
   * @param pagination - Optional pagination parameters
   * @returns Promise resolving to paginated results
   */
  findByCategory(userId: string, category: ExpenseCategory, pagination?: PaginationParams): Promise<PaginatedResult<Expense>>;

  /**
   * Finds expenses within a date range for a specific user
   * @param userId - The user ID to find expenses for
   * @param startDate - The start date of the range
   * @param endDate - The end date of the range
   * @param pagination - Optional pagination parameters
   * @returns Promise resolving to paginated results
   */
  findByDateRange(userId: string, startDate: Date, endDate: Date, pagination?: PaginationParams): Promise<PaginatedResult<Expense>>;

  /**
   * Finds expenses by amount range for a specific user
   * @param userId - The user ID to find expenses for
   * @param minAmount - The minimum amount
   * @param maxAmount - The maximum amount
   * @param currency - The currency for the amounts
   * @param pagination - Optional pagination parameters
   * @returns Promise resolving to paginated results
   */
  findByAmountRange(userId: string, minAmount: number, maxAmount: number, currency: string, pagination?: PaginationParams): Promise<PaginatedResult<Expense>>;

  /**
   * Finds recurring expenses for a specific user
   * @param userId - The user ID to find expenses for
   * @param pagination - Optional pagination parameters
   * @returns Promise resolving to paginated results
   */
  findRecurringExpenses(userId: string, pagination?: PaginationParams): Promise<PaginatedResult<Expense>>;

  /**
   * Finds expenses by tags for a specific user
   * @param userId - The user ID to find expenses for
   * @param tags - Array of tags to filter by
   * @param pagination - Optional pagination parameters
   * @returns Promise resolving to paginated results
   */
  findByTags(userId: string, tags: string[], pagination?: PaginationParams): Promise<PaginatedResult<Expense>>;

  /**
   * Searches expenses by description for a specific user
   * @param userId - The user ID to find expenses for
   * @param searchTerm - The search term to match against description
   * @param pagination - Optional pagination parameters
   * @returns Promise resolving to paginated results
   */
  searchByDescription(userId: string, searchTerm: string, pagination?: PaginationParams): Promise<PaginatedResult<Expense>>;

  /**
   * Gets total expenses by category for a specific user
   * @param userId - The user ID to get totals for
   * @param startDate - Optional start date for filtering
   * @param endDate - Optional end date for filtering
   * @returns Promise resolving to category totals
   */
  getCategoryTotals(userId: string, startDate?: Date, endDate?: Date): Promise<Record<ExpenseCategory, number>>;

  /**
   * Gets monthly expense totals for a specific user
   * @param userId - The user ID to get totals for
   * @param year - The year to get totals for
   * @returns Promise resolving to monthly totals
   */
  getMonthlyTotals(userId: string, year: number): Promise<Record<number, number>>;

  /**
   * Gets the most expensive expenses for a specific user
   * @param userId - The user ID to find expenses for
   * @param limit - The number of expenses to return
   * @param startDate - Optional start date for filtering
   * @param endDate - Optional end date for filtering
   * @returns Promise resolving to the most expensive expenses
   */
  getMostExpensive(userId: string, limit: number, startDate?: Date, endDate?: Date): Promise<Expense[]>;

  /**
   * Counts expenses by category for a specific user
   * @param userId - The user ID to count expenses for
   * @param startDate - Optional start date for filtering
   * @param endDate - Optional end date for filtering
   * @returns Promise resolving to category counts
   */
  countByCategory(userId: string, startDate?: Date, endDate?: Date): Promise<Record<ExpenseCategory, number>>;

  /**
   * Gets all unique tags used by a specific user
   * @param userId - The user ID to get tags for
   * @returns Promise resolving to array of unique tags
   */
  getUniqueTags(userId: string): Promise<string[]>;
} 