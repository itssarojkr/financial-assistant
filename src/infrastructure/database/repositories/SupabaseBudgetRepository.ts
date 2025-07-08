import { Budget } from '@/core/domain/entities/Budget';
import { BudgetRepository } from './BudgetRepository';
import { PaginationParams, PaginatedResult } from './BaseRepository';
import { supabase } from '../supabase/client';

/**
 * Supabase implementation of BudgetRepository
 */
export class SupabaseBudgetRepository implements BudgetRepository {
  private readonly tableName = 'budgets';

  /**
   * Creates a new budget
   */
  async create(budget: Budget): Promise<Budget> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(budget.toJSON())
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create budget: ${error.message}`);
    }

    return Budget.fromJSON(data);
  }

  /**
   * Finds a budget by ID
   */
  async findById(id: string): Promise<Budget | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select()
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to find budget: ${error.message}`);
    }

    return Budget.fromJSON(data);
  }

  /**
   * Updates a budget
   */
  async update(id: string, updates: Partial<Budget>): Promise<Budget> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update budget: ${error.message}`);
    }

    return Budget.fromJSON(data);
  }

  /**
   * Deletes a budget
   */
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete budget: ${error.message}`);
    }

    return true;
  }

  /**
   * Finds budgets by user ID with pagination
   */
  async findByUserId(userId: string, pagination?: PaginationParams): Promise<PaginatedResult<Budget>> {
    let query = supabase
      .from(this.tableName)
      .select('*', { count: 'exact' })
      .eq('userId', userId)
      .order('createdAt', { ascending: false });

    if (pagination) {
      const { page, limit } = pagination;
      const from = page * limit;
      const to = from + limit - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to find budgets by user: ${error.message}`);
    }

    const budgets = data?.map(budget => Budget.fromJSON(budget)) || [];
    const total = count || 0;

    return {
      data: budgets,
      pagination: {
        page: pagination?.page || 0,
        limit: pagination?.limit || 10,
        total,
        totalPages: Math.ceil(total / (pagination?.limit || 10)),
      },
    };
  }

  /**
   * Finds active budgets for a user at a specific date
   */
  async findActive(userId: string, date: Date): Promise<Budget[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select()
      .eq('userId', userId)
      .lte('startDate', date.toISOString())
      .gte('endDate', date.toISOString())
      .order('createdAt', { ascending: false });

    if (error) {
      throw new Error(`Failed to find active budgets: ${error.message}`);
    }

    return data?.map(budget => Budget.fromJSON(budget)) || [];
  }

  /**
   * Finds budgets by category
   */
  async findByCategory(userId: string, category: string, pagination?: PaginationParams): Promise<PaginatedResult<Budget>> {
    let query = supabase
      .from(this.tableName)
      .select('*', { count: 'exact' })
      .eq('userId', userId)
      .contains('categories', [category])
      .order('createdAt', { ascending: false });

    if (pagination) {
      const { page, limit } = pagination;
      const from = page * limit;
      const to = from + limit - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to find budgets by category: ${error.message}`);
    }

    const budgets = data?.map(budget => Budget.fromJSON(budget)) || [];
    const total = count || 0;

    return {
      data: budgets,
      pagination: {
        page: pagination?.page || 0,
        limit: pagination?.limit || 10,
        total,
        totalPages: Math.ceil(total / (pagination?.limit || 10)),
      },
    };
  }

  /**
   * Finds recurring budgets for a user
   */
  async findRecurring(userId: string, pagination?: PaginationParams): Promise<PaginatedResult<Budget>> {
    let query = supabase
      .from(this.tableName)
      .select('*', { count: 'exact' })
      .eq('userId', userId)
      .eq('isRecurring', true)
      .order('createdAt', { ascending: false });

    if (pagination) {
      const { page, limit } = pagination;
      const from = page * limit;
      const to = from + limit - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to find recurring budgets: ${error.message}`);
    }

    const budgets = data?.map(budget => Budget.fromJSON(budget)) || [];
    const total = count || 0;

    return {
      data: budgets,
      pagination: {
        page: pagination?.page || 0,
        limit: pagination?.limit || 10,
        total,
        totalPages: Math.ceil(total / (pagination?.limit || 10)),
      },
    };
  }

  /**
   * Finds budgets within a date range
   */
  async findByDateRange(userId: string, startDate: Date, endDate: Date, pagination?: PaginationParams): Promise<PaginatedResult<Budget>> {
    let query = supabase
      .from(this.tableName)
      .select('*', { count: 'exact' })
      .eq('userId', userId)
      .gte('startDate', startDate.toISOString())
      .lte('endDate', endDate.toISOString())
      .order('createdAt', { ascending: false });

    if (pagination) {
      const { page, limit } = pagination;
      const from = page * limit;
      const to = from + limit - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to find budgets by date range: ${error.message}`);
    }

    const budgets = data?.map(budget => Budget.fromJSON(budget)) || [];
    const total = count || 0;

    return {
      data: budgets,
      pagination: {
        page: pagination?.page || 0,
        limit: pagination?.limit || 10,
        total,
        totalPages: Math.ceil(total / (pagination?.limit || 10)),
      },
    };
  }

  /**
   * Finds budgets by amount range
   */
  async findByAmountRange(userId: string, minAmount: number, maxAmount: number, currency: string, pagination?: PaginationParams): Promise<PaginatedResult<Budget>> {
    let query = supabase
      .from(this.tableName)
      .select('*', { count: 'exact' })
      .eq('userId', userId)
      .eq('currency', currency)
      .gte('amount', minAmount)
      .lte('amount', maxAmount)
      .order('createdAt', { ascending: false });

    if (pagination) {
      const { page, limit } = pagination;
      const from = page * limit;
      const to = from + limit - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to find budgets by amount range: ${error.message}`);
    }

    const budgets = data?.map(budget => Budget.fromJSON(budget)) || [];
    const total = count || 0;

    return {
      data: budgets,
      pagination: {
        page: pagination?.page || 0,
        limit: pagination?.limit || 10,
        total,
        totalPages: Math.ceil(total / (pagination?.limit || 10)),
      },
    };
  }

  /**
   * Gets budget statistics for a user
   */
  async getStatistics(userId: string): Promise<{
    totalBudgets: number;
    activeBudgets: number;
    completedBudgets: number;
    totalBudgetAmount: number;
    averageBudgetAmount: number;
  }> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('userId', userId);

    if (error) {
      throw new Error(`Failed to get budget statistics: ${error.message}`);
    }

    const budgets = data?.map(budget => Budget.fromJSON(budget)) || [];
    const now = new Date();

    const totalBudgets = budgets.length;
    const activeBudgets = budgets.filter(budget => budget.isActive()).length;
    const completedBudgets = budgets.filter(budget => budget.isExpired()).length;
    const totalBudgetAmount = budgets.reduce((sum, budget) => sum + budget.props.amount, 0);
    const averageBudgetAmount = totalBudgets > 0 ? totalBudgetAmount / totalBudgets : 0;

    return {
      totalBudgets,
      activeBudgets,
      completedBudgets,
      totalBudgetAmount,
      averageBudgetAmount,
    };
  }
} 