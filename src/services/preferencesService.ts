import { supabase } from '@/integrations/supabase/client';
import type { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export interface UserPreferences {
  user_id: string;
  default_currency: string | null;
  theme: 'light' | 'dark' | 'system' | null;
  language: string | null;
  notifications: {
    email: boolean;
    push: boolean;
    budget_alerts: boolean;
    spending_alerts: boolean;
    weekly_summary: boolean;
    monthly_summary: boolean;
  } | null;
  sms_scanning_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdatePreferencesData {
  default_currency?: string;
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
    budget_alerts?: boolean;
    spending_alerts?: boolean;
    weekly_summary?: boolean;
    monthly_summary?: boolean;
  };
  sms_scanning_enabled?: boolean;
}

export class PreferencesService {
  // Get user preferences
  static async getPreferences(userId: string): Promise<UserPreferences | null> {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No preferences found, return null
        return null;
      }
      console.error('Error fetching user preferences:', error);
      throw error;
    }

    return data;
  }

  // Create or update user preferences
  static async upsertPreferences(
    userId: string,
    preferences: UpdatePreferencesData
  ): Promise<UserPreferences> {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting user preferences:', error);
      throw error;
    }

    return data;
  }

  // Update specific preference fields
  static async updatePreferences(
    userId: string,
    updates: UpdatePreferencesData
  ): Promise<UserPreferences> {
    const { data, error } = await supabase
      .from('user_preferences')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }

    return data;
  }

  // Get default preferences (for new users)
  static getDefaultPreferences(userId: string): UserPreferences {
    return {
      user_id: userId,
      default_currency: 'USD',
      theme: 'system',
      language: 'en',
      notifications: {
        email: true,
        push: true,
        budget_alerts: true,
        spending_alerts: true,
        weekly_summary: false,
        monthly_summary: true,
      },
      sms_scanning_enabled: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  // Initialize preferences for new user
  static async initializePreferences(userId: string): Promise<UserPreferences> {
    const defaultPrefs = this.getDefaultPreferences(userId);
    return this.upsertPreferences(userId, defaultPrefs);
  }

  // Update currency preference
  static async updateCurrency(
    userId: string,
    currency: string
  ): Promise<UserPreferences> {
    return this.updatePreferences(userId, { default_currency: currency });
  }

  // Update theme preference
  static async updateTheme(
    userId: string,
    theme: 'light' | 'dark' | 'system'
  ): Promise<UserPreferences> {
    return this.updatePreferences(userId, { theme });
  }

  // Update language preference
  static async updateLanguage(
    userId: string,
    language: string
  ): Promise<UserPreferences> {
    return this.updatePreferences(userId, { language });
  }

  // Update notification settings
  static async updateNotificationSettings(
    userId: string,
    notificationSettings: {
      email?: boolean;
      push?: boolean;
      budget_alerts?: boolean;
      spending_alerts?: boolean;
      weekly_summary?: boolean;
      monthly_summary?: boolean;
    }
  ): Promise<UserPreferences> {
    const currentPrefs = await this.getPreferences(userId);
    const currentNotifications = currentPrefs?.notifications || {
      email: true,
      push: true,
      budget_alerts: true,
      spending_alerts: true,
      weekly_summary: false,
      monthly_summary: true,
    };

    const updatedNotifications = {
      ...currentNotifications,
      ...notificationSettings,
    };

    return this.updatePreferences(userId, { notifications: updatedNotifications });
  }

  // Toggle SMS scanning
  static async toggleSmsScanning(
    userId: string,
    enabled: boolean
  ): Promise<UserPreferences> {
    return this.updatePreferences(userId, { sms_scanning_enabled: enabled });
  }

  // Get user's preferred currency
  static async getPreferredCurrency(userId: string): Promise<string> {
    const prefs = await this.getPreferences(userId);
    return prefs?.default_currency || 'USD';
  }

  // Get user's preferred theme
  static async getPreferredTheme(userId: string): Promise<'light' | 'dark' | 'system'> {
    const prefs = await this.getPreferences(userId);
    return (prefs?.theme as 'light' | 'dark' | 'system') || 'system';
  }

  // Check if user has specific notification enabled
  static async hasNotificationEnabled(
    userId: string,
    notificationType: keyof UserPreferences['notifications']
  ): Promise<boolean> {
    const prefs = await this.getPreferences(userId);
    return prefs?.notifications?.[notificationType] || false;
  }

  // Check if SMS scanning is enabled
  static async isSmsScanningEnabled(userId: string): Promise<boolean> {
    const prefs = await this.getPreferences(userId);
    return prefs?.sms_scanning_enabled || false;
  }

  // Export user preferences
  static async exportPreferences(userId: string): Promise<UserPreferences> {
    const prefs = await this.getPreferences(userId);
    if (!prefs) {
      throw new Error('No preferences found for user');
    }
    return prefs;
  }

  // Import user preferences
  static async importPreferences(
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    // Remove user_id and timestamps from import data
    const { user_id, created_at, updated_at, ...importData } = preferences;
    
    return this.upsertPreferences(userId, importData as UpdatePreferencesData);
  }
} 