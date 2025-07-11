
import { supabase } from '@/integrations/supabase/client';
import { Alert } from '@/core/domain/entities/Alert';

export interface AlertWithDetails {
  id: string;
  user_id: string;
  type: string;
  threshold: number;
  period: string;
  active: boolean;
  severity: string | null;
  currency: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export class AlertService {
  static async createAlert(params: {
    userId: string;
    type: string;
    threshold: number;
    period: string;
    active?: boolean;
    severity?: string;
    currency?: string;
  }): Promise<{ data: Alert | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('spending_alerts')
        .insert({
          user_id: params.userId,
          type: params.type,
          threshold: params.threshold,
          period: params.period,
          active: params.active ?? true,
          severity: params.severity ?? 'medium',
          currency: params.currency ?? 'USD',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return { 
        data: data ? {
          id: data.id,
          userId: data.user_id,
          type: data.type,
          threshold: data.threshold,
          period: data.period,
          active: data.active,
          severity: data.severity || 'medium',
          currency: data.currency || 'USD',
          createdAt: new Date(data.created_at || ''),
          updatedAt: new Date(data.updated_at || ''),
        } : null, 
        error: null 
      };
    } catch (error) {
      console.error('Error creating alert:', error);
      return { data: null, error };
    }
  }

  static async getUserAlerts(userId: string): Promise<{ data: Alert[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('spending_alerts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const alerts = data?.map(item => ({
        id: item.id,
        userId: item.user_id,
        type: item.type,
        threshold: item.threshold,
        period: item.period,
        active: item.active,
        severity: item.severity || 'medium',
        currency: item.currency || 'USD',
        createdAt: new Date(item.created_at || ''),
        updatedAt: new Date(item.updated_at || ''),
      })) || [];

      return { data: alerts, error: null };
    } catch (error) {
      console.error('Error fetching alerts:', error);
      return { data: null, error };
    }
  }

  static async updateAlert(id: string, updates: Partial<Alert>): Promise<{ data: Alert | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('spending_alerts')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { 
        data: data ? {
          id: data.id,
          userId: data.user_id,
          type: data.type,
          threshold: data.threshold,
          period: data.period,
          active: data.active,
          severity: data.severity || 'medium',
          currency: data.currency || 'USD',
          createdAt: new Date(data.created_at || ''),
          updatedAt: new Date(data.updated_at || ''),
        } : null, 
        error: null 
      };
    } catch (error) {
      console.error('Error updating alert:', error);
      return { data: null, error };
    }
  }

  static async deleteAlert(id: string): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabase
        .from('spending_alerts')
        .delete()
        .eq('id', id);

      return { data, error };
    } catch (error) {
      console.error('Error deleting alert:', error);
      return { data: null, error };
    }
  }
}
