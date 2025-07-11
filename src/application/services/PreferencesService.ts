
import { supabase } from '@/integrations/supabase/client';
import { UserPreferences } from '@/core/domain/entities/UserPreferences';

export class PreferencesService {
  static async getUserPreferences(userId: string): Promise<{ data: UserPreferences | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const preferences: UserPreferences = data ? {
        userId: data.user_id,
        theme: data.theme || 'light',
        language: data.language || 'en',
        currency: data.default_currency || 'USD',
        notifications: {
          email: true,
          push: true,
          sms: false,
          ...(typeof data.notifications === 'object' ? data.notifications : {})
        },
        smsScanning: data.sms_scanning_enabled || false,
        createdAt: new Date(data.created_at || new Date()),
        updatedAt: new Date(data.updated_at || new Date()),
      } : {
        userId,
        theme: 'light',
        language: 'en',
        currency: 'USD',
        notifications: { email: true, push: true, sms: false },
        smsScanning: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return { data: preferences, error: null };
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return { data: null, error };
    }
  }

  static async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<{ data: UserPreferences | null; error: any }> {
    try {
      const updateData: any = {
        user_id: userId,
        theme: preferences.theme,
        language: preferences.language,
        default_currency: preferences.currency,
        notifications: preferences.notifications,
        sms_scanning_enabled: preferences.smsScanning,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('user_preferences')
        .upsert(updateData)
        .select()
        .single();

      if (error) throw error;

      const updatedPreferences: UserPreferences = {
        userId: data.user_id,
        theme: data.theme || 'light',
        language: data.language || 'en',
        currency: data.default_currency || 'USD',
        notifications: {
          email: true,
          push: true,
          sms: false,
          ...(typeof data.notifications === 'object' ? data.notifications : {})
        },
        smsScanning: data.sms_scanning_enabled || false,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      return { data: updatedPreferences, error: null };
    } catch (error) {
      console.error('Error updating user preferences:', error);
      return { data: null, error };
    }
  }
}
