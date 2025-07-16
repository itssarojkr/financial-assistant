
import { supabase } from '@/integrations/supabase/client';
import { UserPreferences } from '@/core/domain/entities/UserPreferences';
import { PostgrestError } from '@supabase/supabase-js';

export interface UserPreferencesData {
  user_id: string;
  theme: string | null;
  language: string | null;
  default_currency: string | null;
  notifications: unknown;
  sms_scanning_enabled: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface PreferencesServiceError {
  message: string;
  code?: string | undefined;
  details?: string | undefined;
}

export interface PreferencesServiceResponse<T> {
  data: T | null;
  error: PreferencesServiceError | PostgrestError | null;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
}

export class PreferencesService {
  static async getUserPreferences(userId: string): Promise<PreferencesServiceResponse<UserPreferences>> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const preferences: UserPreferences = data ? 
        UserPreferences.create({
          userId: data.user_id,
          theme: (data.theme || 'light') as 'light' | 'dark' | 'system',
          language: data.language || 'en',
          currency: data.default_currency || 'USD',
          notifications: this.parseNotifications(data.notifications),
          smsScanning: data.sms_scanning_enabled || false,
        }) : 
        UserPreferences.create({
          userId,
          theme: 'light',
          language: 'en',
          currency: 'USD',
          notifications: { email: true, push: true, sms: false },
          smsScanning: false,
        });

      return { data: preferences, error: null };
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      const serviceError: PreferencesServiceError = {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: error instanceof PostgrestError ? error.code : undefined,
        details: error instanceof PostgrestError ? error.details : undefined,
      };
      return { data: null, error: serviceError };
    }
  }

  static async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<PreferencesServiceResponse<UserPreferences>> {
    try {
      const upsertData = {
        user_id: userId,
        updated_at: new Date().toISOString(),
        theme: preferences.theme,
        language: preferences.language,
        default_currency: preferences.currency,
        notifications: preferences.notifications,
        sms_scanning_enabled: preferences.smsScanning,
      };

      const { data, error } = await supabase
        .from('user_preferences')
        .upsert(upsertData)
        .select()
        .single();

      if (error) throw error;

      const updatedPreferences: UserPreferences = UserPreferences.create({
        userId: data.user_id,
        theme: (data.theme || 'light') as 'light' | 'dark' | 'system',
        language: data.language || 'en',
        currency: data.default_currency || 'USD',
        notifications: this.parseNotifications(data.notifications),
        smsScanning: Boolean(data.sms_scanning_enabled),
      });

      return { data: updatedPreferences, error: null };
    } catch (error) {
      console.error('Error updating user preferences:', error);
      const serviceError: PreferencesServiceError = {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: error instanceof PostgrestError ? error.code : undefined,
        details: error instanceof PostgrestError ? error.details : undefined,
      };
      return { data: null, error: serviceError };
    }
  }

  private static parseNotifications(notifications: unknown): NotificationSettings {
    if (notifications && typeof notifications === 'object' && !Array.isArray(notifications)) {
      const notif = notifications as Record<string, unknown>;
      return {
        email: Boolean(notif.email),
        push: Boolean(notif.push),
        sms: Boolean(notif.sms)
      };
    }
    return { email: true, push: true, sms: false };
  }
}
