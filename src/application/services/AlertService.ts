
import { supabase } from '@/integrations/supabase/client';
import { Alert } from '@/core/domain/entities/Alert';
import { PostgrestError } from '@supabase/supabase-js';

export interface CreateAlertData {
  userId: string;
  type: string;
  title: string;
  message: string;
  threshold?: number;
  period?: string;
  active?: boolean;
  severity?: string;
  currency?: string;
}

export interface SpendingAlert {
  id: string;
  user_id: string;
  type: string | null;
  threshold: number;
  period: string;
  active: boolean | null;
  severity: string | null;
  currency: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface AlertServiceError {
  message: string;
  code?: string | undefined;
  details?: string | undefined;
}

export interface AlertServiceResponse<T> {
  data: T | null;
  error: AlertServiceError | PostgrestError | null;
}

export class AlertService {
  static async createAlert(params: CreateAlertData): Promise<AlertServiceResponse<Alert>> {
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
      const serviceError: AlertServiceError = {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: error instanceof PostgrestError ? error.code : undefined,
        details: error instanceof PostgrestError ? error.details : undefined,
      };
      return { data: null, error: serviceError };
    }
  }

  static async getUserAlerts(userId: string): Promise<AlertServiceResponse<Alert[]>> {
    try {
      const { data, error } = await supabase
        .from('spending_alerts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const alerts = data?.map(item => this.mapToAlert(
        item,
        `Spending Alert - ${item.type || 'unknown'}`,
        `You have exceeded your ${item.type || 'unknown'} threshold`
      )) || [];

      return { data: alerts, error: null };
    } catch (error) {
      console.error('Error fetching alerts:', error);
      const serviceError: AlertServiceError = {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: error instanceof PostgrestError ? error.code : undefined,
        details: error instanceof PostgrestError ? error.details : undefined,
      };
      return { data: null, error: serviceError };
    }
  }

  static async updateAlert(id: string, updates: Partial<CreateAlertData>): Promise<AlertServiceResponse<Alert>> {
    try {
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (updates.type !== undefined) updateData.type = updates.type;
      if (updates.threshold !== undefined) updateData.threshold = updates.threshold;
      if (updates.period !== undefined) updateData.period = updates.period;
      if (updates.active !== undefined) updateData.active = updates.active;
      if (updates.severity !== undefined) updateData.severity = updates.severity;
      if (updates.currency !== undefined) updateData.currency = updates.currency;

      const { data, error } = await supabase
        .from('spending_alerts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { 
        data: data ? this.mapToAlert(
          data,
          updates.title || `Alert - ${data.type || 'unknown'}`,
          updates.message || `Alert updated`
        ) : null, 
        error: null 
      };
    } catch (error) {
      console.error('Error updating alert:', error);
      const serviceError: AlertServiceError = {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: error instanceof PostgrestError ? error.code : undefined,
        details: error instanceof PostgrestError ? error.details : undefined,
      };
      return { data: null, error: serviceError };
    }
  }

  static async deleteAlert(id: string): Promise<AlertServiceResponse<{ success: boolean }>> {
    try {
      const { data, error } = await supabase
        .from('spending_alerts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { data: { success: true }, error: null };
    } catch (error) {
      console.error('Error deleting alert:', error);
      const serviceError: AlertServiceError = {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: error instanceof PostgrestError ? error.code : undefined,
        details: error instanceof PostgrestError ? error.details : undefined,
      };
      return { data: null, error: serviceError };
    }
  }

  private static mapToAlert(data: SpendingAlert, title: string, message: string): Alert {
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
