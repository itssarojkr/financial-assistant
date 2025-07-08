import { Budget } from '@/core/domain/entities/Budget';
import { BaseRepository, PaginationParams, PaginatedResult } from './BaseRepository';

/**
 * Repository interface for budget data access operations
 */
export interface BudgetRepository extends BaseRepository<Budget> {
  /**
   * Finds budgets by user ID with pagination
   */
  findByUserId(userId: string, pagination?: PaginationParams): Promise<PaginatedResult<Budget>>;

  /**
   * Finds active budgets for a user at a specific date
   */
  findActive(userId: string, date: Date): Promise<Budget[]>;

  /**
   * Finds budgets by category
   */
  findByCategory(userId: string, category: string, pagination?: PaginationParams): Promise<PaginatedResult<Budget>>;

  /**
   * Finds recurring budgets for a user
   */
  findRecurring(userId: string, pagination?: PaginationParams): Promise<PaginatedResult<Budget>>;

  /**
   * Finds budgets within a date range
   */
  findByDateRange(userId: string, startDate: Date, endDate: Date, pagination?: PaginationParams): Promise<PaginatedResult<Budget>>;

  /**
   * Finds budgets by amount range
   */
  findByAmountRange(userId: string, minAmount: number, maxAmount: number, currency: string, pagination?: PaginationParams): Promise<PaginatedResult<Budget>>;

  /**
   * Gets budget statistics for a user
   */
  getStatistics(userId: string): Promise<{
    totalBudgets: number;
    activeBudgets: number;
    completedBudgets: number;
    totalBudgetAmount: number;
    averageBudgetAmount: number;
  }>;
} 