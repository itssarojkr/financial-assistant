import { Alert } from '@/core/domain/entities/Alert';
import { AlertRepository } from './AlertRepository';
import { PaginationParams, PaginatedResult } from './BaseRepository';
import { supabase } from '../supabase/client';

/**
 * Supabase implementation of AlertRepository
 */
export class SupabaseAlertRepository implements AlertRepository {
  private readonly tableName = 'alerts';

  /**
   * Creates a new alert
   */
  async create(alert: Alert): Promise<Alert> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(alert.toJSON())
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create alert: ${error.message}`);
    }

    return Alert.fromJSON(data);
  }

  /**
   * Finds an alert by ID
   */
  async findById(id: string): Promise<Alert | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select()
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to find alert: ${error.message}`);
    }

    return Alert.fromJSON(data);
  }

  /**
   * Updates an alert
   */
  async update(id: string, updates: Partial<Alert>): Promise<Alert> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update alert: ${error.message}`);
    }

    return Alert.fromJSON(data);
  }

  /**
   * Deletes an alert
   */
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete alert: ${error.message}`);
    }

    return true;
  }

  /**
   * Finds alerts by user ID with pagination
   */
  async findByUserId(userId: string, pagination?: PaginationParams): Promise<PaginatedResult<Alert>> {
    let query = supabase
      .from(this.tableName)
      .select('*', { count: 'exact' })
      .eq('userId', userId)
      .order('createdAt', { ascending: false });

    if (pagination) {
      const { page, limit } = pagination;
      const from = page * limit;
      const to = from + limit - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to find alerts by user: ${error.message}`);
    }

    const alerts = data?.map(alert => Alert.fromJSON(alert)) || [];
    const total = count || 0;

    return {
      data: alerts,
      pagination: {
        page: pagination?.page || 0,
        limit: pagination?.limit || 10,
        total,
        totalPages: Math.ceil(total / (pagination?.limit || 10)),
      },
    };
  }

  /**
   * Finds unread alerts for a user
   */
  async findUnread(userId: string): Promise<Alert[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select()
      .eq('userId', userId)
      .eq('isRead', false)
      .order('createdAt', { ascending: false });

    if (error) {
      throw new Error(`Failed to find unread alerts: ${error.message}`);
    }

    return data?.map(alert => Alert.fromJSON(alert)) || [];
  }

  /**
   * Finds alerts by type
   */
  async findByType(userId: string, type: Alert['props']['type']): Promise<Alert[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select()
      .eq('userId', userId)
      .eq('type', type)
      .order('createdAt', { ascending: false });

    if (error) {
      throw new Error(`Failed to find alerts by type: ${error.message}`);
    }

    return data?.map(alert => Alert.fromJSON(alert)) || [];
  }

  /**
   * Finds alerts by severity
   */
  async findBySeverity(userId: string, severity: Alert['props']['severity']): Promise<Alert[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select()
      .eq('userId', userId)
      .eq('severity', severity)
      .order('createdAt', { ascending: false });

    if (error) {
      throw new Error(`Failed to find alerts by severity: ${error.message}`);
    }

    return data?.map(alert => Alert.fromJSON(alert)) || [];
  }

  /**
   * Finds active alerts (not dismissed and scheduled for now or past)
   */
  async findActive(userId: string): Promise<Alert[]> {
    const now = new Date();
    const { data, error } = await supabase
      .from(this.tableName)
      .select()
      .eq('userId', userId)
      .eq('isDismissed', false)
      .lte('scheduledFor', now.toISOString())
      .order('createdAt', { ascending: false });

    if (error) {
      throw new Error(`Failed to find active alerts: ${error.message}`);
    }

    return data?.map(alert => Alert.fromJSON(alert)) || [];
  }

  /**
   * Finds scheduled alerts (scheduled for future)
   */
  async findScheduled(userId: string): Promise<Alert[]> {
    const now = new Date();
    const { data, error } = await supabase
      .from(this.tableName)
      .select()
      .eq('userId', userId)
      .gt('scheduledFor', now.toISOString())
      .order('scheduledFor', { ascending: true });

    if (error) {
      throw new Error(`Failed to find scheduled alerts: ${error.message}`);
    }

    return data?.map(alert => Alert.fromJSON(alert)) || [];
  }

  /**
   * Finds overdue alerts (scheduled for past but not dismissed)
   */
  async findOverdue(userId: string): Promise<Alert[]> {
    const now = new Date();
    const { data, error } = await supabase
      .from(this.tableName)
      .select()
      .eq('userId', userId)
      .eq('isDismissed', false)
      .lt('scheduledFor', now.toISOString())
      .order('scheduledFor', { ascending: false });

    if (error) {
      throw new Error(`Failed to find overdue alerts: ${error.message}`);
    }

    return data?.map(alert => Alert.fromJSON(alert)) || [];
  }

  /**
   * Finds alerts within a date range
   */
  async findByDateRange(userId: string, startDate: Date, endDate: Date, pagination?: PaginationParams): Promise<PaginatedResult<Alert>> {
    let query = supabase
      .from(this.tableName)
      .select('*', { count: 'exact' })
      .eq('userId', userId)
      .gte('scheduledFor', startDate.toISOString())
      .lte('scheduledFor', endDate.toISOString())
      .order('scheduledFor', { ascending: false });

    if (pagination) {
      const { page, limit } = pagination;
      const from = page * limit;
      const to = from + limit - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to find alerts by date range: ${error.message}`);
    }

    const alerts = data?.map(alert => Alert.fromJSON(alert)) || [];
    const total = count || 0;

    return {
      data: alerts,
      pagination: {
        page: pagination?.page || 0,
        limit: pagination?.limit || 10,
        total,
        totalPages: Math.ceil(total / (pagination?.limit || 10)),
      },
    };
  }

  /**
   * Marks multiple alerts as read
   */
  async markMultipleAsRead(alertIds: string[]): Promise<Alert[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({ isRead: true, updatedAt: new Date().toISOString() })
      .in('id', alertIds)
      .select();

    if (error) {
      throw new Error(`Failed to mark alerts as read: ${error.message}`);
    }

    return data?.map(alert => Alert.fromJSON(alert)) || [];
  }

  /**
   * Marks multiple alerts as dismissed
   */
  async markMultipleAsDismissed(alertIds: string[]): Promise<Alert[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({ isDismissed: true, updatedAt: new Date().toISOString() })
      .in('id', alertIds)
      .select();

    if (error) {
      throw new Error(`Failed to mark alerts as dismissed: ${error.message}`);
    }

    return data?.map(alert => Alert.fromJSON(alert)) || [];
  }

  /**
   * Gets alert statistics for a user
   */
  async getStatistics(userId: string): Promise<{
    totalAlerts: number;
    unreadCount: number;
    dismissedCount: number;
    activeCount: number;
    scheduledCount: number;
    overdueCount: number;
    byType: Record<Alert['props']['type'], number>;
    bySeverity: Record<Alert['props']['severity'], number>;
  }> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('userId', userId);

    if (error) {
      throw new Error(`Failed to get alert statistics: ${error.message}`);
    }

    const alerts = data?.map(alert => Alert.fromJSON(alert)) || [];
    const now = new Date();

    const totalAlerts = alerts.length;
    const unreadCount = alerts.filter(alert => !alert.props.isRead).length;
    const dismissedCount = alerts.filter(alert => alert.props.isDismissed).length;
    const activeCount = alerts.filter(alert => alert.isActive()).length;
    const scheduledCount = alerts.filter(alert => alert.isScheduled()).length;
    const overdueCount = alerts.filter(alert => alert.isOverdue()).length;

    const byType: Record<Alert['props']['type'], number> = {
      expense_threshold: 0,
      budget_overspend: 0,
      unusual_spending: 0,
      bill_reminder: 0,
      goal_milestone: 0,
    };

    const bySeverity: Record<Alert['props']['severity'], number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    alerts.forEach(alert => {
      byType[alert.props.type]++;
      bySeverity[alert.props.severity]++;
    });

    return {
      totalAlerts,
      unreadCount,
      dismissedCount,
      activeCount,
      scheduledCount,
      overdueCount,
      byType,
      bySeverity,
    };
  }
} 