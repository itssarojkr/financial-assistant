import { useState, useCallback } from 'react';
import { Expense } from '@/core/domain/entities/Expense';
import { ExpenseCategory } from '@/core/domain/enums/ExpenseCategory';
import { ExpenseValidationError } from '@/core/domain/value-objects/ExpenseValidationError';
import { ServiceFactory } from '@/application/services/ServiceFactory';
import { PaginationParams, PaginatedResult } from '@/infrastructure/database/repositories/BaseRepository';

/**
 * Expense manager hook result interface
 */
export interface UseExpenseManagerResult {
  // Expense operations
  createExpense: (
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
  ) => Promise<Expense>;
  getExpenseById: (expenseId: string) => Promise<Expense | null>;
  updateExpense: (expenseId: string, updates: Partial<Expense>) => Promise<Expense>;
  deleteExpense: (expenseId: string) => Promise<boolean>;
  
  // Expense queries
  getUserExpenses: (userId: string, pagination?: PaginationParams) => Promise<PaginatedResult<Expense>>;
  getExpensesByCategory: (userId: string, category: ExpenseCategory, pagination?: PaginationParams) => Promise<PaginatedResult<Expense>>;
  getExpensesByDateRange: (userId: string, startDate: Date, endDate: Date, pagination?: PaginationParams) => Promise<PaginatedResult<Expense>>;
  getExpensesByAmountRange: (userId: string, minAmount: number, maxAmount: number, currency: string, pagination?: PaginationParams) => Promise<PaginatedResult<Expense>>;
  getRecurringExpenses: (userId: string, pagination?: PaginationParams) => Promise<PaginatedResult<Expense>>;
  getExpensesByTags: (userId: string, tags: string[], pagination?: PaginationParams) => Promise<PaginatedResult<Expense>>;
  searchExpensesByDescription: (userId: string, searchTerm: string, pagination?: PaginationParams) => Promise<PaginatedResult<Expense>>;
  
  // Expense analytics
  getCategoryTotals: (userId: string, startDate?: Date, endDate?: Date) => Promise<Record<ExpenseCategory, number>>;
  getMonthlyTotals: (userId: string, year: number) => Promise<Record<number, number>>;
  getMostExpensiveExpenses: (userId: string, limit: number, startDate?: Date, endDate?: Date) => Promise<Expense[]>;
  getUserTags: (userId: string) => Promise<string[]>;
  getUserExpenseStatistics: (userId: string, startDate?: Date, endDate?: Date) => Promise<{
    totalExpenses: number;
    totalAmount: number;
    averageAmount: number;
    categoryCounts: Record<ExpenseCategory, number>;
    categoryTotals: Record<ExpenseCategory, number>;
  }>;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Clear error
  clearError: () => void;
}

/**
 * Custom hook for expense management operations
 * 
 * This hook provides access to expense-related business logic through
 * the application services layer with proper loading states and error handling.
 */
export function useExpenseManager(): UseExpenseManagerResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get expense service instance
  const getExpenseService = useCallback(() => {
    try {
      const serviceFactory = ServiceFactory.getInstance();
      return serviceFactory.getExpenseService();
    } catch (err) {
      throw new Error(`Failed to get expense service: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Wrapper for async operations with loading and error handling
  const executeOperation = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await operation();
      return result;
    } catch (err) {
      const errorMessage = err instanceof ExpenseValidationError 
        ? err.message 
        : err instanceof Error 
          ? err.message 
          : 'An unexpected error occurred';
      
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create expense
  const createExpense = useCallback(async (
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
  ): Promise<Expense> => {
    return executeOperation(async () => {
      const expenseService = getExpenseService();
      return await expenseService.createExpense(
        userId,
        amount,
        currency,
        category,
        description,
        date,
        tags,
        isRecurring,
        recurringInterval,
        location,
        receiptUrl,
        notes
      );
    });
  }, [executeOperation, getExpenseService]);

  // Get expense by ID
  const getExpenseById = useCallback(async (expenseId: string): Promise<Expense | null> => {
    return executeOperation(async () => {
      const expenseService = getExpenseService();
      return await expenseService.getExpenseById(expenseId);
    });
  }, [executeOperation, getExpenseService]);

  // Update expense
  const updateExpense = useCallback(async (expenseId: string, updates: Partial<Expense>): Promise<Expense> => {
    return executeOperation(async () => {
      const expenseService = getExpenseService();
      return await expenseService.updateExpense(expenseId, updates);
    });
  }, [executeOperation, getExpenseService]);

  // Delete expense
  const deleteExpense = useCallback(async (expenseId: string): Promise<boolean> => {
    return executeOperation(async () => {
      const expenseService = getExpenseService();
      return await expenseService.deleteExpense(expenseId);
    });
  }, [executeOperation, getExpenseService]);

  // Get user expenses
  const getUserExpenses = useCallback(async (userId: string, pagination?: PaginationParams): Promise<PaginatedResult<Expense>> => {
    return executeOperation(async () => {
      const expenseService = getExpenseService();
      return await expenseService.getUserExpenses(userId, pagination);
    });
  }, [executeOperation, getExpenseService]);

  // Get expenses by category
  const getExpensesByCategory = useCallback(async (
    userId: string, 
    category: ExpenseCategory, 
    pagination?: PaginationParams
  ): Promise<PaginatedResult<Expense>> => {
    return executeOperation(async () => {
      const expenseService = getExpenseService();
      return await expenseService.getExpensesByCategory(userId, category, pagination);
    });
  }, [executeOperation, getExpenseService]);

  // Get expenses by date range
  const getExpensesByDateRange = useCallback(async (
    userId: string, 
    startDate: Date, 
    endDate: Date, 
    pagination?: PaginationParams
  ): Promise<PaginatedResult<Expense>> => {
    return executeOperation(async () => {
      const expenseService = getExpenseService();
      return await expenseService.getExpensesByDateRange(userId, startDate, endDate, pagination);
    });
  }, [executeOperation, getExpenseService]);

  // Get expenses by amount range
  const getExpensesByAmountRange = useCallback(async (
    userId: string, 
    minAmount: number, 
    maxAmount: number, 
    currency: string, 
    pagination?: PaginationParams
  ): Promise<PaginatedResult<Expense>> => {
    return executeOperation(async () => {
      const expenseService = getExpenseService();
      return await expenseService.getExpensesByAmountRange(userId, minAmount, maxAmount, currency, pagination);
    });
  }, [executeOperation, getExpenseService]);

  // Get recurring expenses
  const getRecurringExpenses = useCallback(async (userId: string, pagination?: PaginationParams): Promise<PaginatedResult<Expense>> => {
    return executeOperation(async () => {
      const expenseService = getExpenseService();
      return await expenseService.getRecurringExpenses(userId, pagination);
    });
  }, [executeOperation, getExpenseService]);

  // Get expenses by tags
  const getExpensesByTags = useCallback(async (
    userId: string, 
    tags: string[], 
    pagination?: PaginationParams
  ): Promise<PaginatedResult<Expense>> => {
    return executeOperation(async () => {
      const expenseService = getExpenseService();
      return await expenseService.getExpensesByTags(userId, tags, pagination);
    });
  }, [executeOperation, getExpenseService]);

  // Search expenses by description
  const searchExpensesByDescription = useCallback(async (
    userId: string, 
    searchTerm: string, 
    pagination?: PaginationParams
  ): Promise<PaginatedResult<Expense>> => {
    return executeOperation(async () => {
      const expenseService = getExpenseService();
      return await expenseService.searchExpensesByDescription(userId, searchTerm, pagination);
    });
  }, [executeOperation, getExpenseService]);

  // Get category totals
  const getCategoryTotals = useCallback(async (
    userId: string, 
    startDate?: Date, 
    endDate?: Date
  ): Promise<Record<ExpenseCategory, number>> => {
    return executeOperation(async () => {
      const expenseService = getExpenseService();
      return await expenseService.getCategoryTotals(userId, startDate, endDate);
    });
  }, [executeOperation, getExpenseService]);

  // Get monthly totals
  const getMonthlyTotals = useCallback(async (userId: string, year: number): Promise<Record<number, number>> => {
    return executeOperation(async () => {
      const expenseService = getExpenseService();
      return await expenseService.getMonthlyTotals(userId, year);
    });
  }, [executeOperation, getExpenseService]);

  // Get most expensive expenses
  const getMostExpensiveExpenses = useCallback(async (
    userId: string, 
    limit: number, 
    startDate?: Date, 
    endDate?: Date
  ): Promise<Expense[]> => {
    return executeOperation(async () => {
      const expenseService = getExpenseService();
      return await expenseService.getMostExpensiveExpenses(userId, limit, startDate, endDate);
    });
  }, [executeOperation, getExpenseService]);

  // Get user tags
  const getUserTags = useCallback(async (userId: string): Promise<string[]> => {
    return executeOperation(async () => {
      const expenseService = getExpenseService();
      return await expenseService.getUserTags(userId);
    });
  }, [executeOperation, getExpenseService]);

  // Get user expense statistics
  const getUserExpenseStatistics = useCallback(async (
    userId: string, 
    startDate?: Date, 
    endDate?: Date
  ): Promise<{
    totalExpenses: number;
    totalAmount: number;
    averageAmount: number;
    categoryCounts: Record<ExpenseCategory, number>;
    categoryTotals: Record<ExpenseCategory, number>;
  }> => {
    return executeOperation(async () => {
      const expenseService = getExpenseService();
      return await expenseService.getUserExpenseStatistics(userId, startDate, endDate);
    });
  }, [executeOperation, getExpenseService]);

  return {
    // Expense operations
    createExpense,
    getExpenseById,
    updateExpense,
    deleteExpense,
    
    // Expense queries
    getUserExpenses,
    getExpensesByCategory,
    getExpensesByDateRange,
    getExpensesByAmountRange,
    getRecurringExpenses,
    getExpensesByTags,
    searchExpensesByDescription,
    
    // Expense analytics
    getCategoryTotals,
    getMonthlyTotals,
    getMostExpensiveExpenses,
    getUserTags,
    getUserExpenseStatistics,
    
    // Loading states
    isLoading,
    error,
    
    // Clear error
    clearError,
  };
} 