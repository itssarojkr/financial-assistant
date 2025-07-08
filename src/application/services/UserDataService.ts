import { supabase } from '@/integrations/supabase/client';

export interface ExpenseItem {
  id: string;
  user_id: string;
  category_id: number;
  amount: number;
  currency: string;
  date: string;
  description?: string;
  location?: string;
  source?: string;
  created_at?: string;
}

export interface BudgetItem {
  id: string;
  user_id: string;
  category_id: number;
  amount: number;
  period: string;
  start_date?: string;
  end_date?: string;
  created_at?: string;
}

export interface AlertItem {
  id: string;
  user_id: string;
  category_id: number;
  threshold: number;
  period: string;
  active: boolean;
  created_at?: string;
}

export interface TaxCalculationData {
  country: string;
  salary: number;
  currency: string;
  taxAmount: number;
  netSalary: number;
  effectiveTaxRate: number;
  deductions: number;
  rebates: number;
  additionalTaxes: number;
  calculationDate: string;
  notes?: string;
  expenseData?: {
    rent: number;
    utilities: number;
    food: number;
    transport: number;
    healthcare: number;
    other: number;
    total: number;
  };
  expenses?: ExpenseItem[];
  budgets?: BudgetItem[];
  alerts?: AlertItem[];
  [key: string]: unknown;
}

export interface UserPreferences {
  defaultCountry: string;
  defaultCurrency: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    browser: boolean;
  };
  [key: string]: unknown; // Add index signature for Json compatibility
}

export interface SavedData {
  id: string;
  data_type: string;
  data_name: string;
  data_content: TaxCalculationData | UserPreferences | Record<string, unknown>;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

interface SessionData {
  [key: string]: unknown;
}

interface ImportData {
  exportDate: string;
  userData: SavedData[];
}

// Add a Json type for compatibility
export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

/**
 * UserDataService for managing user data, preferences, and saved calculations
 * 
 * This service handles all user data operations including tax calculations,
 * user preferences, session data, and data import/export functionality.
 */
export class UserDataService {
  /**
   * Save a tax calculation for a user
   */
  static async saveTaxCalculation(
    userId: string,
    data: TaxCalculationData,
    name: string
  ) {
    const { data: savedData, error } = await supabase
      .from('user_data')
      .insert({
        user_id: userId,
        data_type: 'tax_calculation',
        data_name: name,
        data_content: data as Json,
        is_favorite: false,
      })
      .select()
      .single();

    return { data: savedData, error };
  }

  /**
   * Update an existing tax calculation
   */
  static async updateTaxCalculation(
    userId: string,
    calculationId: string,
    data: TaxCalculationData
  ) {
    const { data: updatedData, error } = await supabase
      .from('user_data')
      .update({
        data_content: data as Json,
        updated_at: new Date().toISOString(),
      })
      .eq('id', calculationId)
      .eq('user_id', userId)
      .select()
      .single();

    return { data: updatedData, error };
  }

  /**
   * Get all tax calculations for a user
   */
  static async getTaxCalculations(userId: string) {
    const { data, error } = await supabase
      .from('user_data')
      .select('*')
      .eq('user_id', userId)
      .eq('data_type', 'tax_calculation')
      .order('created_at', { ascending: false });

    return { data: data as SavedData[], error };
  }

  /**
   * Save user preferences
   */
  static async saveUserPreferences(
    userId: string,
    preferences: UserPreferences
  ) {
    const { data, error } = await supabase
      .from('user_data')
      .upsert({
        user_id: userId,
        data_type: 'preferences',
        data_name: 'user_preferences',
        data_content: preferences as Json,
        is_favorite: false,
      })
      .select()
      .single();

    return { data, error };
  }

  /**
   * Get user preferences
   */
  static async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    const { data, error } = await supabase
      .from('user_data')
      .select('data_content')
      .eq('user_id', userId)
      .eq('data_type', 'preferences')
      .eq('data_name', 'user_preferences')
      .single();

    if (error || !data) {
      return null;
    }

    return data.data_content as unknown as UserPreferences;
  }

  /**
   * Save session data
   */
  static async saveSessionData(
    userId: string,
    sessionData: unknown
  ) {
    const { data, error } = await supabase
      .from('user_sessions')
      .upsert({
        user_id: userId,
        session_data: sessionData as Json,
      })
      .select()
      .single();

    return { data, error };
  }

  /**
   * Get session data
   */
  static async getSessionData(userId: string) {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('session_data')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return data.session_data;
  }

  /**
   * Update favorite status of saved data
   */
  static async updateFavoriteStatus(
    dataId: string,
    isFavorite: boolean
  ) {
    const { data, error } = await supabase
      .from('user_data')
      .update({ is_favorite: isFavorite })
      .eq('id', dataId)
      .select()
      .single();

    return { data, error };
  }

  /**
   * Delete saved data
   */
  static async deleteSavedData(dataId: string) {
    const { error } = await supabase
      .from('user_data')
      .delete()
      .eq('id', dataId);

    return { error };
  }

  /**
   * Get favorite items for a user
   */
  static async getFavorites(userId: string) {
    const { data, error } = await supabase
      .from('user_data')
      .select('*')
      .eq('user_id', userId)
      .eq('is_favorite', true)
      .order('created_at', { ascending: false });

    return { data: data as SavedData[], error };
  }

  /**
   * Search saved data
   */
  static async searchSavedData(
    userId: string,
    query: string,
    dataType?: string
  ) {
    let queryBuilder = supabase
      .from('user_data')
      .select('*')
      .eq('user_id', userId)
      .ilike('data_name', `%${query}%`);

    if (dataType) {
      queryBuilder = queryBuilder.eq('data_type', dataType);
    }

    const { data, error } = await queryBuilder.order('created_at', { ascending: false });

    return { data: data as SavedData[], error };
  }

  /**
   * Export user data
   */
  static async exportUserData(userId: string) {
    const { data, error } = await supabase
      .from('user_data')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      return { data: null, error };
    }

    const exportData: ImportData = {
      exportDate: new Date().toISOString(),
      userData: data as SavedData[],
    };

    return { data: exportData, error: null };
  }

  /**
   * Import user data
   */
  static async importUserData(userId: string, importData: unknown) {
    const dataObj = importData as Record<string, unknown>;
    if (!dataObj.userData || !Array.isArray(dataObj.userData)) {
      return { data: null, error: new Error('Invalid import data format') };
    }

    const { data, error } = await supabase
      .from('user_data')
      .insert(
        dataObj.userData.map((item: SavedData) => {
          const obj: Record<string, unknown> = {
            ...item,
            data_content: item.data_content as Json,
            user_id: userId,
          };
          if (item.id) obj.id = item.id;
          return obj;
        })
      )
      .select();

    return { data, error };
  }

  /**
   * Sync all expenses in a calculation with the DB
   */
  static async syncCalculationExpenses(userId: string, expenses: ExpenseItem[] = [], calculationId?: string) {
    if (!calculationId) {
      console.warn('No calculationId provided for expense sync');
      return;
    }

    // Upsert all expenses with calculation_id
    for (const expense of expenses) {
      await supabase.from('expenses').upsert({ 
        ...expense, 
        user_id: userId,
        calculation_id: calculationId 
      });
    }

    // Delete expenses that belong to this calculation but are not in the current list
    const { data: existingExpenses } = await supabase
      .from('expenses')
      .select('id')
      .eq('user_id', userId)
      .eq('calculation_id', calculationId);

    if (existingExpenses) {
      const currentExpenseIds = expenses.map(e => e.id);
      const expensesToDelete = existingExpenses
        .filter(e => !currentExpenseIds.includes(e.id))
        .map(e => e.id);

      if (expensesToDelete.length > 0) {
        await supabase
          .from('expenses')
          .delete()
          .in('id', expensesToDelete);
      }
    }
  }

  /**
   * Sync all budgets in a calculation with the DB
   */
  static async syncCalculationBudgets(userId: string, budgets: BudgetItem[] = [], calculationId?: string) {
    if (!calculationId) {
      console.warn('No calculationId provided for budget sync');
      return;
    }

    for (const budget of budgets) {
      await supabase.from('budgets').upsert({ 
        ...budget, 
        user_id: userId,
        calculation_id: calculationId 
      });
    }

    // Delete budgets that belong to this calculation but are not in the current list
    const { data: existingBudgets } = await supabase
      .from('budgets')
      .select('id')
      .eq('user_id', userId)
      .eq('calculation_id', calculationId);

    if (existingBudgets) {
      const currentBudgetIds = budgets.map(b => b.id);
      const budgetsToDelete = existingBudgets
        .filter(b => !currentBudgetIds.includes(b.id))
        .map(b => b.id);

      if (budgetsToDelete.length > 0) {
        await supabase
          .from('budgets')
          .delete()
          .in('id', budgetsToDelete);
      }
    }
  }

  /**
   * Sync all alerts in a calculation with the DB
   */
  static async syncCalculationAlerts(userId: string, alerts: AlertItem[] = [], calculationId?: string) {
    if (!calculationId) {
      console.warn('No calculationId provided for alert sync');
      return;
    }

    for (const alert of alerts) {
      await supabase.from('spending_alerts').upsert({ 
        ...alert, 
        user_id: userId,
        calculation_id: calculationId 
      });
    }

    // Delete alerts that belong to this calculation but are not in the current list
    const { data: existingAlerts } = await supabase
      .from('spending_alerts')
      .select('id')
      .eq('user_id', userId)
      .eq('calculation_id', calculationId);

    if (existingAlerts) {
      const currentAlertIds = alerts.map(a => a.id);
      const alertsToDelete = existingAlerts
        .filter(a => !currentAlertIds.includes(a.id))
        .map(a => a.id);

      if (alertsToDelete.length > 0) {
        await supabase
          .from('spending_alerts')
          .delete()
          .in('id', alertsToDelete);
      }
    }
  }

  /**
   * Get expenses for a specific calculation
   */
  static async getCalculationExpenses(calculationId: string) {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('calculation_id', calculationId)
      .order('date', { ascending: false });

    return { data: data as ExpenseItem[], error };
  }

  /**
   * Get budgets for a specific calculation
   */
  static async getCalculationBudgets(calculationId: string) {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('calculation_id', calculationId)
      .order('created_at', { ascending: false });

    return { data: data as BudgetItem[], error };
  }

  /**
   * Get alerts for a specific calculation
   */
  static async getCalculationAlerts(calculationId: string) {
    const { data, error } = await supabase
      .from('spending_alerts')
      .select('*')
      .eq('calculation_id', calculationId)
      .order('created_at', { ascending: false });

    return { data: data as AlertItem[], error };
  }
} 