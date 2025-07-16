import { supabase } from '@/integrations/supabase/client';

export interface SpendingHabit {
  id: string;
  user_id: string; // Changed from UUID to string
  name: string;
  country_code: string;
  state_code: string | null;
  habit_type: 'conservative' | 'moderate' | 'liberal' | 'custom';
  expense_multiplier: number;
  description: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSpendingHabitParams {
  name: string;
  country_code: string;
  state_code?: string | null;
  habit_type: 'conservative' | 'moderate' | 'liberal' | 'custom';
  expense_multiplier: number;
  description?: string;
}

export interface UpdateSpendingHabitParams {
  name?: string;
  expense_multiplier?: number;
  description?: string;
}

// Helper to map DB row to SpendingHabit
function mapDbHabit(row: any): SpendingHabit {
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    country_code: row.country_code,
    state_code: row.state_code,
    habit_type: row.habit_type || row.type, // fallback for DB column
    expense_multiplier: row.expense_multiplier,
    description: row.description ?? null,
    is_default: row.is_default ?? false,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export class SpendingHabitService {
  /**
   * Get spending habits for a user and country/state combination
   */
  static async getSpendingHabits(
    userId: string,
    countryCode: string,
    stateCode?: string | null
  ): Promise<SpendingHabit[]> {
    try {
      console.log('Getting user spending habits for:', { userId, countryCode, stateCode });
      
      const query = supabase
        .from('spending_habits')
        .select('*')
        .eq('user_id', userId)
        .eq('country_code', countryCode);

      if (stateCode) {
        console.log('Looking for state-specific user habits...');
        // First try to get state-specific habits
        const { data: stateHabits, error: stateError } = await query
          .eq('state_code', stateCode)
          .order('habit_type', { ascending: true });

        if (stateError) {
          console.error('State user habits query error:', stateError);
          throw stateError;
        }

        console.log('State-specific user habits found:', stateHabits);

        if (stateHabits && stateHabits.length > 0) {
          return stateHabits as SpendingHabit[];
        }

        console.log('No state-specific user habits, looking for country-level user habits...');
        // If no state-specific habits, get country-level habits
        const { data: countryHabits, error: countryError } = await supabase
          .from('spending_habits')
          .select('*')
          .eq('user_id', userId)
          .eq('country_code', countryCode)
          .is('state_code', null)
          .order('habit_type', { ascending: true });

        if (countryError) {
          console.error('Country user habits query error:', countryError);
          throw countryError;
        }
        
        console.log('Country-level user habits found:', countryHabits);
        return countryHabits as SpendingHabit[];
      } else {
        console.log('No state code, looking for country-level user habits...');
        // No state code, get country-level habits
        const { data, error } = await query
          .is('state_code', null)
          .order('habit_type', { ascending: true });

        if (error) {
          console.error('Country user habits query error:', error);
          throw error;
        }
        
        console.log('Country-level user habits found:', data);
        return data as SpendingHabit[];
      }
    } catch (error) {
      console.error('Error fetching spending habits:', error);
      throw error;
    }
  }

  /**
   * Get default spending habits for a country/state combination, with fallback to country and global
   */
  static async getDefaultSpendingHabits(
    countryCode: string,
    stateCode?: string | null
  ): Promise<SpendingHabit[]> {
    try {
      // 1. Try state-level
      if (stateCode) {
        const { data: stateDefaults, error: stateError } = await supabase
          .from('spending_habits')
          .select('*')
          .eq('user_id', 'default')
          .eq('country_code', countryCode)
          .eq('is_default', true)
          .eq('state_code', stateCode)
          .order('type', { ascending: true });
        if (stateError) throw stateError;
        if (stateDefaults && stateDefaults.length > 0) return stateDefaults.map(mapDbHabit);
      }
      // 2. Try country-level
      const { data: countryDefaults, error: countryError } = await supabase
        .from('spending_habits')
        .select('*')
        .eq('user_id', 'default')
        .eq('country_code', countryCode)
        .eq('is_default', true)
        .is('state_code', null)
        .order('type', { ascending: true });
      if (countryError) throw countryError;
      if (countryDefaults && countryDefaults.length > 0) return countryDefaults.map(mapDbHabit);
      // 3. Try global-level
      const { data: globalDefaults, error: globalError } = await supabase
        .from('spending_habits')
        .select('*')
        .eq('user_id', 'default')
        .eq('country_code', 'GLOBAL')
        .eq('is_default', true)
        .is('state_code', null)
        .order('type', { ascending: true });
      if (globalError) throw globalError;
      return (globalDefaults || []).map(mapDbHabit);
    } catch (error) {
      console.error('Error fetching default spending habits:', error);
      throw error;
    }
  }

  /**
   * Create a custom spending habit
   */
  static async createSpendingHabit(
    userId: string,
    params: CreateSpendingHabitParams
  ): Promise<SpendingHabit> {
    try {
      const { data, error } = await supabase
        .from('spending_habits')
        .insert({
          user_id: userId,
          name: params.name,
          country_code: params.country_code,
          state_code: params.state_code || null,
          habit_type: params.habit_type,
          expense_multiplier: params.expense_multiplier,
          description: params.description || null,
          is_default: false
        })
        .select()
        .single();

      if (error) throw error;
      return data as SpendingHabit;
    } catch (error) {
      console.error('Error creating spending habit:', error);
      throw error;
    }
  }

  /**
   * Update a spending habit
   */
  static async updateSpendingHabit(
    habitId: string,
    params: UpdateSpendingHabitParams
  ): Promise<SpendingHabit> {
    try {
      const { data, error } = await supabase
        .from('spending_habits')
        .update({
          ...(params.name && { name: params.name }),
          ...(params.expense_multiplier && { expense_multiplier: params.expense_multiplier }),
          ...(params.description !== undefined && { description: params.description })
        })
        .eq('id', habitId)
        .select()
        .single();

      if (error) throw error;
      return data as SpendingHabit;
    } catch (error) {
      console.error('Error updating spending habit:', error);
      throw error;
    }
  }

  /**
   * Delete a spending habit
   */
  static async deleteSpendingHabit(habitId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('spending_habits')
        .delete()
        .eq('id', habitId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting spending habit:', error);
      throw error;
    }
  }

  /**
   * Get all spending habits for a user (including custom ones)
   */
  static async getAllUserSpendingHabits(userId: string): Promise<SpendingHabit[]> {
    try {
      const { data, error } = await supabase
        .from('spending_habits')
        .select('*')
        .eq('user_id', userId)
        .order('country_code', { ascending: true })
        .order('state_code', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      return data as SpendingHabit[];
    } catch (error) {
      console.error('Error fetching all user spending habits:', error);
      throw error;
    }
  }

  /**
   * Get spending habits for dropdown selection (combines default and user-specific, with fallback)
   */
  static async getSpendingHabitsForDropdown(
    userId: string,
    countryCode: string,
    stateCode?: string | null
  ): Promise<SpendingHabit[]> {
    try {
      // Get default habits with fallback
      const defaultHabits = await this.getDefaultSpendingHabits(countryCode, stateCode);
      // Get user-specific custom habits (state, then country, then global)
      let userHabits: SpendingHabit[] = [];
      // 1. State-level custom
      if (stateCode) {
        const { data: stateCustom, error: stateError } = await supabase
          .from('spending_habits')
          .select('*')
          .eq('user_id', userId)
          .eq('country_code', countryCode)
          .eq('type', 'custom')
          .eq('state_code', stateCode)
          .order('name', { ascending: true });
        if (stateError) throw stateError;
        if (stateCustom && stateCustom.length > 0) userHabits = userHabits.concat(stateCustom.map(mapDbHabit));
      }
      // 2. Country-level custom
      const { data: countryCustom, error: countryError } = await supabase
        .from('spending_habits')
        .select('*')
        .eq('user_id', userId)
        .eq('country_code', countryCode)
        .eq('type', 'custom')
        .is('state_code', null)
        .order('name', { ascending: true });
      if (countryError) throw countryError;
      if (countryCustom && countryCustom.length > 0) userHabits = userHabits.concat(countryCustom.map(mapDbHabit));
      // 3. Global-level custom
      const { data: globalCustom, error: globalError } = await supabase
        .from('spending_habits')
        .select('*')
        .eq('user_id', userId)
        .eq('country_code', 'GLOBAL')
        .eq('type', 'custom')
        .is('state_code', null)
        .order('name', { ascending: true });
      if (globalError) throw globalError;
      if (globalCustom && globalCustom.length > 0) userHabits = userHabits.concat(globalCustom.map(mapDbHabit));
      // Combine and sort
      const allHabits = [...defaultHabits, ...userHabits];
      const sortedHabits = allHabits.sort((a, b) => {
        const typeOrder = { conservative: 0, moderate: 1, liberal: 2, custom: 3 };
        const aOrder = typeOrder[a.habit_type] || 4;
        const bOrder = typeOrder[b.habit_type] || 4;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return a.name.localeCompare(b.name);
      });
      return sortedHabits;
    } catch (error) {
      console.error('Error fetching spending habits for dropdown:', error);
      throw error;
    }
  }
} 