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

/**
 * PreferencesService for managing user preferences and settings
 * 
 * This service handles user preferences including theme, language,
 * currency, notifications, and other app settings.
 */
export class PreferencesService {
  private static instance: PreferencesService;

  /**
   * Gets the singleton instance of PreferencesService
   */
  static getInstance(): PreferencesService {
    if (!PreferencesService.instance) {
      PreferencesService.instance = new PreferencesService();
    }
    return PreferencesService.instance;
  }

  /**
   * Get user preferences
   */
  async getPreferences(userId: string): Promise<UserPreferences | null> {
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

    return data as UserPreferences;
  }

  /**
   * Create or update user preferences
   */
  async upsertPreferences(
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

    return data as UserPreferences;
  }

  /**
   * Update specific preference fields
   */
  async updatePreferences(
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

    return data as UserPreferences;
  }

  /**
   * Get default preferences (for new users)
   */
  getDefaultPreferences(userId: string): UserPreferences {
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

  /**
   * Initialize preferences for new user
   */
  async initializePreferences(userId: string): Promise<UserPreferences> {
    const defaultPrefs = this.getDefaultPreferences(userId);
    return this.upsertPreferences(userId, {
      default_currency: defaultPrefs.default_currency,
      theme: defaultPrefs.theme,
      language: defaultPrefs.language,
      notifications: defaultPrefs.notifications,
      sms_scanning_enabled: defaultPrefs.sms_scanning_enabled
    });
  }

  /**
   * Update currency preference
   */
  async updateCurrency(
    userId: string,
    currency: string
  ): Promise<UserPreferences> {
    return this.updatePreferences(userId, { default_currency: currency });
  }

  /**
   * Update theme preference
   */
  async updateTheme(
    userId: string,
    theme: 'light' | 'dark' | 'system'
  ): Promise<UserPreferences> {
    return this.updatePreferences(userId, { theme });
  }

  /**
   * Update language preference
   */
  async updateLanguage(
    userId: string,
    language: string
  ): Promise<UserPreferences> {
    return this.updatePreferences(userId, { language });
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(
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

  /**
   * Toggle SMS scanning
   */
  async toggleSmsScanning(
    userId: string,
    enabled: boolean
  ): Promise<UserPreferences> {
    return this.updatePreferences(userId, { sms_scanning_enabled: enabled });
  }

  /**
   * Get user's preferred currency
   */
  async getPreferredCurrency(userId: string): Promise<string> {
    const prefs = await this.getPreferences(userId);
    return prefs?.default_currency || 'USD';
  }

  /**
   * Get user's preferred theme
   */
  async getPreferredTheme(userId: string): Promise<'light' | 'dark' | 'system'> {
    const prefs = await this.getPreferences(userId);
    return prefs?.theme || 'system';
  }

  /**
   * Get user's preferred language
   */
  async getPreferredLanguage(userId: string): Promise<string> {
    const prefs = await this.getPreferences(userId);
    return prefs?.language || 'en';
  }

  /**
   * Check if a specific notification is enabled
   */
  async hasNotificationEnabled(
    userId: string,
    notificationType: keyof UserPreferences['notifications']
  ): Promise<boolean> {
    const prefs = await this.getPreferences(userId);
    return prefs?.notifications?.[notificationType] ?? false;
  }

  /**
   * Check if SMS scanning is enabled
   */
  async isSmsScanningEnabled(userId: string): Promise<boolean> {
    const prefs = await this.getPreferences(userId);
    return prefs?.sms_scanning_enabled ?? false;
  }

  /**
   * Export user preferences
   */
  async exportPreferences(userId: string): Promise<UserPreferences> {
    const prefs = await this.getPreferences(userId);
    if (!prefs) {
      throw new Error('No preferences found for user');
    }
    return prefs;
  }

  /**
   * Import user preferences
   */
  async importPreferences(
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    return this.upsertPreferences(userId, preferences);
  }
} 