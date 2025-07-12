
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
    title: string;
    message: string;
    threshold?: number;
    period?: string;
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
          threshold: params.threshold || 0,
          period: params.period || 'monthly',
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
        data: data ? this.mapToAlert(data, params.title, params.message) : null, 
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

      const alerts = data?.map(item => this.mapToAlert(
        item,
        `Spending Alert - ${item.type}`,
        `You have exceeded your ${item.type} threshold`
      )) || [];

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
          type: updates.type || null,
          threshold: updates.threshold,
          period: updates.period,
          active: updates.active ?? null,
          severity: updates.severity || null,
          currency: updates.currency || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { 
        data: data ? this.mapToAlert(
          data,
          updates.title || `Alert - ${data.type}`,
          updates.message || `Alert updated`
        ) : null, 
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

  private static mapToAlert(data: any, title: string, message: string): Alert {
    return Alert.create({
      userId: data.user_id,
      type: (data.type || 'system') as 'spending' | 'budget' | 'tax' | 'system',
      title,
      message,
      severity: (data.severity || 'medium') as 'low' | 'medium' | 'high' | 'critical',
      isRead: false,
      isDismissed: false,
      threshold: data.threshold,
      period: data.period,
      active: data.active || true,
      currency: data.currency || 'USD',
    }, data.id);
  }
}
