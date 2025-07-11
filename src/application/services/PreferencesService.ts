import { supabase } from '@/integrations/supabase/client';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  currency: string;
  notifications: {
    email: boolean;
    push: boolean;
    budgetAlerts: boolean;
    taxReminders: boolean;
  };
  privacy: {
    dataSharing: boolean;
    analytics: boolean;
  };
  accessibility: {
    reducedMotion: boolean;
    highContrast: boolean;
    fontSize: 'small' | 'medium' | 'large';
  };
}

export class PreferencesService {
  static async getPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user preferences:', error);
        return null;
      }

      return data as UserPreferences;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return null;
    }
  }

  static async updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .update(preferences)
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating user preferences:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      return false;
    }
  }

  static async createPreferences(userId: string, preferences: UserPreferences): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .insert({ user_id: userId, ...preferences });

      if (error) {
        console.error('Error creating user preferences:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error creating user preferences:', error);
      return false;
    }
  }

  static async ensurePreferencesExist(userId: string): Promise<boolean> {
    const existingPreferences = await PreferencesService.getPreferences(userId);

    if (!existingPreferences) {
      const defaultPreferences: UserPreferences = {
        theme: 'system',
        currency: 'USD',
        notifications: {
          email: true,
          push: false,
          budgetAlerts: true,
          taxReminders: true,
        },
        privacy: {
          dataSharing: false,
          analytics: true,
        },
        accessibility: {
          reducedMotion: false,
          highContrast: false,
          fontSize: 'medium',
        },
      };

      return PreferencesService.createPreferences(userId, defaultPreferences);
    }

    return true;
  }
}
