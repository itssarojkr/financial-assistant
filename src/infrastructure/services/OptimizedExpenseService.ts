import { supabase } from '@/integrations/supabase/client';
import { ExpenseItem } from '../../application/services/UserDataService';

export interface ExpenseFilter {
  categoryIds?: number[];
  dateRange?: { start: Date; end: Date };
  amountRange?: { min: number; max: number };
  currency?: string;
  searchTerm?: string;
  [key: string]: unknown;
}

export interface ExpenseStats {
  totalAmount: number;
  averageAmount: number;
  count: number;
  byCategory: Record<number, { amount: number; count: number }>;
  byMonth: Record<string, { amount: number; count: number }>;
  byCurrency: Record<string, { amount: number; count: number }>;
}

export interface ExpenseTrend {
  period: string;
  amount: number;
  count: number;
  change: number;
}

/**
 * OptimizedExpenseService for handling expense operations with performance optimizations
 * 
 * This service provides optimized expense management functionality including
 * pagination, caching, and efficient database queries.
 */
export class OptimizedExpenseService {
  private static instance: OptimizedExpenseService;
  private cache = new Map<string, unknown>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  /**
   * Gets the singleton instance of OptimizedExpenseService
   */
  static getInstance(): OptimizedExpenseService {
    if (!OptimizedExpenseService.instance) {
      OptimizedExpenseService.instance = new OptimizedExpenseService();
    }
    return OptimizedExpenseService.instance;
  }

  /**
   * Get expenses with caching and optimization
   */
  async getExpenses(userId: string, filter?: ExpenseFilter): Promise<ExpenseItem[]> {
    const cacheKey = this.generateCacheKey('expenses', userId, filter);
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached as ExpenseItem[];
    }

    const expenses = await this.fetchExpenses(userId, filter);
    this.setCache(cacheKey, expenses);
    
    return expenses;
  }

  /**
   * Get expense statistics
   */
  async getExpenseStats(userId: string, filter?: ExpenseFilter): Promise<ExpenseStats> {
    const cacheKey = this.generateCacheKey('stats', userId, filter);
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached as ExpenseStats;
    }

    const expenses = await this.getExpenses(userId, filter);
    const stats = this.calculateStats(expenses);
    this.setCache(cacheKey, stats);
    
    return stats;
  }

  /**
   * Get expense trends
   */
  async getExpenseTrends(userId: string, period: 'month' | 'quarter' | 'year' = 'month'): Promise<ExpenseTrend[]> {
    const cacheKey = this.generateCacheKey('trends', userId, { period });
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached as ExpenseTrend[];
    }

    const expenses = await this.getExpenses(userId);
    const trends = this.calculateTrends(expenses, period);
    this.setCache(cacheKey, trends);
    
    return trends;
  }

  /**
   * Search expenses with full-text search
   */
  async searchExpenses(userId: string, query: string, filter?: ExpenseFilter): Promise<ExpenseItem[]> {
    const cacheKey = this.generateCacheKey('search', userId, { query, filter });
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached as ExpenseItem[];
    }

    const expenses = await this.getExpenses(userId, filter);
    const results = this.performSearch(expenses, query);
    this.setCache(cacheKey, results);
    
    return results;
  }

  /**
   * Get expenses by category
   */
  async getExpensesByCategory(userId: string, categoryId: number): Promise<ExpenseItem[]> {
    const cacheKey = this.generateCacheKey('category', userId, { categoryId });
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached as ExpenseItem[];
    }

    const expenses = await this.getExpenses(userId, { categoryIds: [categoryId] });
    this.setCache(cacheKey, expenses);
    
    return expenses;
  }

  /**
   * Get expenses by date range
   */
  async getExpensesByDateRange(userId: string, startDate: Date, endDate: Date): Promise<ExpenseItem[]> {
    const cacheKey = this.generateCacheKey('daterange', userId, { startDate, endDate });
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached as ExpenseItem[];
    }

    const expenses = await this.getExpenses(userId, { dateRange: { start: startDate, end: endDate } });
    this.setCache(cacheKey, expenses);
    
    return expenses;
  }

  /**
   * Get expense categories
   */
  async getCategories(): Promise<Array<{ id: number; name: string; icon: string; color: string }>> {
    const cacheKey = 'expense_categories';
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached as Array<{ id: number; name: string; icon: string; color: string }>;
    }

    try {
      const { data, error } = await supabase
        .from('expense_categories')
        .select('id, name, icon, color')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        return [];
      }

      const categories = (data || []).map(category => ({
        id: category.id,
        name: category.name,
        icon: category.icon || 'tag',
        color: category.color || '#6B7280'
      }));
      
      this.setCache(cacheKey, categories);
      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  /**
   * Fetch expenses from API (placeholder)
   */
  private async fetchExpenses(userId: string, filter?: ExpenseFilter): Promise<ExpenseItem[]> {
    // This should be implemented with your actual API
    // For now, return empty array
    return [];
  }

  /**
   * Calculate expense statistics
   */
  private calculateStats(expenses: ExpenseItem[]): ExpenseStats {
    const stats: ExpenseStats = {
      totalAmount: 0,
      averageAmount: 0,
      count: expenses.length,
      byCategory: {},
      byMonth: {},
      byCurrency: {}
    };

    if (expenses.length === 0) {
      return stats;
    }

    expenses.forEach(expense => {
      // Total and average
      stats.totalAmount += expense.amount;
      
      // By category
      if (!stats.byCategory[expense.category_id]) {
        stats.byCategory[expense.category_id] = { amount: 0, count: 0 };
      }
      stats.byCategory[expense.category_id].amount += expense.amount;
      stats.byCategory[expense.category_id].count += 1;
      
      // By month
      const monthKey = new Date(expense.date).toISOString().substring(0, 7);
      if (!stats.byMonth[monthKey]) {
        stats.byMonth[monthKey] = { amount: 0, count: 0 };
      }
      stats.byMonth[monthKey].amount += expense.amount;
      stats.byMonth[monthKey].count += 1;
      
      // By currency
      if (!stats.byCurrency[expense.currency]) {
        stats.byCurrency[expense.currency] = { amount: 0, count: 0 };
      }
      stats.byCurrency[expense.currency].amount += expense.amount;
      stats.byCurrency[expense.currency].count += 1;
    });

    stats.averageAmount = stats.totalAmount / stats.count;
    
    return stats;
  }

  /**
   * Calculate expense trends
   */
  private calculateTrends(expenses: ExpenseItem[], period: 'month' | 'quarter' | 'year'): ExpenseTrend[] {
    const trends: ExpenseTrend[] = [];
    const groupedExpenses = this.groupExpensesByPeriod(expenses, period);
    
    const periods = Object.keys(groupedExpenses).sort();
    
    periods.forEach((periodKey, index) => {
      const periodExpenses = groupedExpenses[periodKey];
      const amount = periodExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const count = periodExpenses.length;
      
      let change = 0;
      if (index > 0) {
        const prevPeriod = periods[index - 1];
        const prevAmount = groupedExpenses[prevPeriod].reduce((sum, expense) => sum + expense.amount, 0);
        change = prevAmount > 0 ? ((amount - prevAmount) / prevAmount) * 100 : 0;
      }
      
      trends.push({
        period: periodKey,
        amount,
        count,
        change
      });
    });
    
    return trends;
  }

  /**
   * Group expenses by time period
   */
  private groupExpensesByPeriod(expenses: ExpenseItem[], period: 'month' | 'quarter' | 'year'): Record<string, ExpenseItem[]> {
    const grouped: Record<string, ExpenseItem[]> = {};
    
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      let periodKey: string;
      
      switch (period) {
        case 'month': {
          periodKey = date.toISOString().substring(0, 7);
          break;
        }
        case 'quarter': {
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          periodKey = `${date.getFullYear()}-Q${quarter}`;
          break;
        }
        case 'year': {
          periodKey = date.getFullYear().toString();
          break;
        }
        default: {
          periodKey = date.toISOString().substring(0, 7);
        }
      }
      
      if (!grouped[periodKey]) {
        grouped[periodKey] = [];
      }
      grouped[periodKey].push(expense);
    });
    
    return grouped;
  }

  /**
   * Perform full-text search on expenses
   */
  private performSearch(expenses: ExpenseItem[], query: string): ExpenseItem[] {
    const normalizedQuery = query.toLowerCase().trim();
    
    return expenses.filter(expense => {
      const description = expense.description?.toLowerCase() || '';
      const location = expense.location?.toLowerCase() || '';
      
      return description.includes(normalizedQuery) || 
             location.includes(normalizedQuery) ||
             expense.amount.toString().includes(normalizedQuery) ||
             expense.currency.toLowerCase().includes(normalizedQuery);
    });
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(prefix: string, userId: string, params?: Record<string, unknown>): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${prefix}:${userId}:${paramString}`;
  }

  /**
   * Get item from cache
   */
  private getFromCache(key: string): unknown | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const { data, timestamp } = cached as { data: unknown; timestamp: number };
    if (Date.now() - timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }
    
    return data;
  }

  /**
   * Set item in cache
   */
  private setCache(key: string, data: unknown): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
} 