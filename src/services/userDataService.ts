import { supabase } from '@/integrations/supabase/client';

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
}

export interface SavedData {
  id: string;
  data_type: string;
  data_name: string;
  data_content: any;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export class UserDataService {
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
        data_content: data,
        is_favorite: false,
      })
      .select()
      .single();

    return { data: savedData, error };
  }

  static async updateTaxCalculation(
    userId: string,
    calculationId: string,
    data: TaxCalculationData
  ) {
    const { data: updatedData, error } = await supabase
      .from('user_data')
      .update({
        data_content: data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', calculationId)
      .eq('user_id', userId)
      .select()
      .single();

    return { data: updatedData, error };
  }

  static async getTaxCalculations(userId: string) {
    const { data, error } = await supabase
      .from('user_data')
      .select('*')
      .eq('user_id', userId)
      .eq('data_type', 'tax_calculation')
      .order('created_at', { ascending: false });

    return { data: data as SavedData[], error };
  }

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
        data_content: preferences,
        is_favorite: false,
      })
      .select()
      .single();

    return { data, error };
  }

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

    return data.data_content as UserPreferences;
  }

  static async saveSessionData(
    userId: string,
    sessionData: any
  ) {
    const { data, error } = await supabase
      .from('user_sessions')
      .upsert({
        user_id: userId,
        session_data: sessionData,
      })
      .select()
      .single();

    return { data, error };
  }

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

  static async deleteSavedData(dataId: string) {
    const { error } = await supabase
      .from('user_data')
      .delete()
      .eq('id', dataId);

    return { error };
  }

  static async getFavorites(userId: string) {
    const { data, error } = await supabase
      .from('user_data')
      .select('*')
      .eq('user_id', userId)
      .eq('is_favorite', true)
      .order('updated_at', { ascending: false });

    return { data: data as SavedData[], error };
  }

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

    const { data, error } = await queryBuilder.order('updated_at', { ascending: false });

    return { data: data as SavedData[], error };
  }

  static async exportUserData(userId: string) {
    const { data, error } = await supabase
      .from('user_data')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      return { data: null, error };
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      userData: data,
    };

    return { data: exportData, error: null };
  }

  static async importUserData(userId: string, importData: any) {
    // Validate import data structure
    if (!importData.userData || !Array.isArray(importData.userData)) {
      return { error: { message: 'Invalid import data format' } };
    }

    // Prepare data for import
    const dataToImport = importData.userData.map((item: any) => ({
      user_id: userId,
      data_type: item.data_type,
      data_name: item.data_name,
      data_content: item.data_content,
      is_favorite: item.is_favorite || false,
    }));

    const { data, error } = await supabase
      .from('user_data')
      .insert(dataToImport)
      .select();

    return { data, error };
  }
} 