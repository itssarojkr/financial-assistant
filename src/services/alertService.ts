import { supabase } from '@/integrations/supabase/client';
import type { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export interface SpendingAlert {
  id: string;
  user_id: string;
  category_id: number | null;
  threshold: number;
  period: string;
  active: boolean;
  created_at: string;
  category?: {
    id: number;
    name: string;
    icon: string | null;
    color: string | null;
  };
}

export interface CreateAlertData {
  category_id?: number | null;
  threshold: number;
  period: string;
  active?: boolean;
}

export interface AlertTrigger {
  alert_id: string;
  category_id: number | null;
  category_name: string;
  threshold: number;
  current_amount: number;
  period: string;
  triggered_at: string;
  is_over_threshold: boolean;
}

export class AlertService {
  // Get user's spending alerts
  static async getAlerts(userId: string): Promise<SpendingAlert[]> {
    const { data, error } = await supabase
      .from('spending_alerts')
      .select(`
        *,
        category:expense_categories(id, name, icon, color)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching spending alerts:', error);
      throw error;
    }

    return data || [];
  }

  // Get active alerts only
  static async getActiveAlerts(userId: string): Promise<SpendingAlert[]> {
    const { data, error } = await supabase
      .from('spending_alerts')
      .select(`
        *,
        category:expense_categories(id, name, icon, color)
      `)
      .eq('user_id', userId)
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active alerts:', error);
      throw error;
    }

    return data || [];
  }

  // Create a new spending alert
  static async createAlert(
    userId: string,
    alertData: CreateAlertData
  ): Promise<SpendingAlert> {
    const { data, error } = await supabase
      .from('spending_alerts')
      .insert({
        user_id: userId,
        ...alertData,
      })
      .select(`
        *,
        category:expense_categories(id, name, icon, color)
      `)
      .single();

    if (error) {
      console.error('Error creating spending alert:', error);
      throw error;
    }

    return data;
  }

  // Update a spending alert
  static async updateAlert(
    alertId: string,
    updates: Partial<CreateAlertData>
  ): Promise<SpendingAlert> {
    const { data, error } = await supabase
      .from('spending_alerts')
      .update(updates)
      .eq('id', alertId)
      .select(`
        *,
        category:expense_categories(id, name, icon, color)
      `)
      .single();

    if (error) {
      console.error('Error updating spending alert:', error);
      throw error;
    }

    return data;
  }

  // Delete a spending alert
  static async deleteAlert(alertId: string): Promise<void> {
    const { error } = await supabase
      .from('spending_alerts')
      .delete()
      .eq('id', alertId);

    if (error) {
      console.error('Error deleting spending alert:', error);
      throw error;
    }
  }

  // Toggle alert active status
  static async toggleAlert(alertId: string, active: boolean): Promise<SpendingAlert> {
    return this.updateAlert(alertId, { active });
  }

  // Check for triggered alerts
  static async checkAlerts(userId: string): Promise<AlertTrigger[]> {
    const activeAlerts = await this.getActiveAlerts(userId);
    const triggers: AlertTrigger[] = [];

    for (const alert of activeAlerts) {
      // Get expenses for the alert period
      const expenses = await this.getExpensesForPeriod(
        userId,
        alert.period,
        alert.category_id
      );

      const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      const isOverThreshold = totalAmount >= alert.threshold;

      if (isOverThreshold) {
        triggers.push({
          alert_id: alert.id,
          category_id: alert.category_id,
          category_name: (alert.category as Partial<import("./expenseService").ExpenseCategory>)?.name || 'Uncategorized',
          threshold: alert.threshold,
          current_amount: totalAmount,
          period: alert.period,
          triggered_at: new Date().toISOString(),
          is_over_threshold: isOverThreshold,
        });
      }
    }

    return triggers;
  }

  // Get expenses for a specific period and category
  private static async getExpensesForPeriod(
    userId: string,
    period: string,
    categoryId?: number | null
  ): Promise<Array<{ amount: number }>> {
    const now = new Date();
    let startDate: string;

    switch (period) {
      case 'daily': {
        startDate = now.toISOString().split('T')[0];
        break;
      }
      case 'weekly': {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        startDate = weekAgo.toISOString().split('T')[0];
        break;
      }
      case 'monthly': {
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        startDate = monthAgo.toISOString().split('T')[0];
        break;
      }
      default: {
        startDate = now.toISOString().split('T')[0];
      }
    }

    let query = supabase
      .from('expenses')
      .select('amount')
      .eq('user_id', userId)
      .gte('date', startDate);

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching expenses for alert check:', error);
      throw error;
    }

    return data || [];
  }

  // Create alert for specific category
  static async createCategoryAlert(
    userId: string,
    categoryId: number,
    threshold: number,
    period: string = 'monthly'
  ): Promise<SpendingAlert> {
    return this.createAlert(userId, {
      category_id: categoryId,
      threshold,
      period,
      active: true,
    });
  }

  // Create general spending alert (no specific category)
  static async createGeneralAlert(
    userId: string,
    threshold: number,
    period: string = 'monthly'
  ): Promise<SpendingAlert> {
    return this.createAlert(userId, {
      category_id: null,
      threshold,
      period,
      active: true,
    });
  }

  // Get alert statistics
  static async getAlertStats(userId: string): Promise<{
    total_alerts: number;
    active_alerts: number;
    triggered_alerts: number;
  }> {
    const allAlerts = await this.getAlerts(userId);
    const activeAlerts = allAlerts.filter(alert => alert.active);
    const triggers = await this.checkAlerts(userId);

    return {
      total_alerts: allAlerts.length,
      active_alerts: activeAlerts.length,
      triggered_alerts: triggers.length,
    };
  }

  // Bulk create alerts for multiple categories
  static async createBulkAlerts(
    userId: string,
    alerts: Array<{ category_id: number; threshold: number; period?: string }>
  ): Promise<SpendingAlert[]> {
    const createdAlerts: SpendingAlert[] = [];

    for (const alertData of alerts) {
      const alert = await this.createAlert(userId, {
        category_id: alertData.category_id,
        threshold: alertData.threshold,
        period: alertData.period || 'monthly',
        active: true,
      });
      createdAlerts.push(alert);
    }

    return createdAlerts;
  }

  // Deactivate all alerts for a user
  static async deactivateAllAlerts(userId: string): Promise<void> {
    const { error } = await supabase
      .from('spending_alerts')
      .update({ active: false })
      .eq('user_id', userId);

    if (error) {
      console.error('Error deactivating all alerts:', error);
      throw error;
    }
  }

  // Get alerts that are close to being triggered (within 10% of threshold)
  static async getNearThresholdAlerts(userId: string): Promise<AlertTrigger[]> {
    const activeAlerts = await this.getActiveAlerts(userId);
    const nearThreshold: AlertTrigger[] = [];

    for (const alert of activeAlerts) {
      const expenses = await this.getExpensesForPeriod(
        userId,
        alert.period,
        alert.category_id
      );

      const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      const percentageUsed = (totalAmount / alert.threshold) * 100;

      // Alert if within 10% of threshold
      if (percentageUsed >= 90 && percentageUsed < 100) {
        nearThreshold.push({
          alert_id: alert.id,
          category_id: alert.category_id,
          category_name: (alert.category as Partial<import("./expenseService").ExpenseCategory>)?.name || 'Uncategorized',
          threshold: alert.threshold,
          current_amount: totalAmount,
          period: alert.period,
          triggered_at: new Date().toISOString(),
          is_over_threshold: false,
        });
      }
    }

    return nearThreshold;
  }
} 