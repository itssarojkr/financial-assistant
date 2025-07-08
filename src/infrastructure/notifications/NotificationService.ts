import { supabase } from '@/infrastructure/database/supabase/client';

export interface NotificationData {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  priority: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  isDismissed: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Notification service for handling user notifications
 * 
 * This service provides notification management capabilities
 * including creating, reading, and managing notifications.
 */
export class NotificationService {
  private static instance: NotificationService;
  private readonly tableName = 'notifications';

  private constructor() {}

  /**
   * Gets the singleton instance of NotificationService
   */
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Creates a new notification
   */
  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationData['type'] = 'info',
    priority: NotificationData['priority'] = 'medium',
    metadata?: Record<string, unknown>
  ): Promise<NotificationData> {
    try {
      const notificationId = this.generateNotificationId();
      const now = new Date();

      const { data, error } = await supabase
        .from(this.tableName)
        .insert({
          id: notificationId,
          user_id: userId,
          title,
          message,
          type,
          priority,
          is_read: false,
          is_dismissed: false,
          metadata: metadata || {},
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create notification: ${error.message}`);
      }

      return this.mapToNotificationData(data);
    } catch (error) {
      throw new Error(`Failed to create notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets notifications for a user
   */
  async getUserNotifications(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<NotificationData[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`Failed to get notifications: ${error.message}`);
      }

      return data?.map(this.mapToNotificationData) || [];
    } catch (error) {
      throw new Error(`Failed to get notifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets unread notifications for a user
   */
  async getUnreadNotifications(userId: string): Promise<NotificationData[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .eq('is_read', false)
        .eq('is_dismissed', false)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to get unread notifications: ${error.message}`);
      }

      return data?.map(this.mapToNotificationData) || [];
    } catch (error) {
      throw new Error(`Failed to get unread notifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Marks a notification as read
   */
  async markAsRead(notificationId: string): Promise<NotificationData> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          is_read: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', notificationId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to mark notification as read: ${error.message}`);
      }

      return this.mapToNotificationData(data);
    } catch (error) {
      throw new Error(`Failed to mark notification as read: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Marks multiple notifications as read
   */
  async markMultipleAsRead(notificationIds: string[]): Promise<NotificationData[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          is_read: true,
          updated_at: new Date().toISOString(),
        })
        .in('id', notificationIds)
        .select();

      if (error) {
        throw new Error(`Failed to mark notifications as read: ${error.message}`);
      }

      return data?.map(this.mapToNotificationData) || [];
    } catch (error) {
      throw new Error(`Failed to mark notifications as read: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Dismisses a notification
   */
  async dismissNotification(notificationId: string): Promise<NotificationData> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          is_dismissed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', notificationId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to dismiss notification: ${error.message}`);
      }

      return this.mapToNotificationData(data);
    } catch (error) {
      throw new Error(`Failed to dismiss notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Deletes a notification
   */
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', notificationId);

      if (error) {
        throw new Error(`Failed to delete notification: ${error.message}`);
      }

      return true;
    } catch (error) {
      throw new Error(`Failed to delete notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets notification statistics for a user
   */
  async getNotificationStats(userId: string): Promise<{
    total: number;
    unread: number;
    dismissed: number;
    byType: Record<NotificationData['type'], number>;
    byPriority: Record<NotificationData['priority'], number>;
  }> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Failed to get notification stats: ${error.message}`);
      }

      const notifications = data?.map(this.mapToNotificationData) || [];

      const total = notifications.length;
      const unread = notifications.filter(n => !n.isRead && !n.isDismissed).length;
      const dismissed = notifications.filter(n => n.isDismissed).length;

      const byType: Record<NotificationData['type'], number> = {
        info: 0,
        success: 0,
        warning: 0,
        error: 0,
      };

      const byPriority: Record<NotificationData['priority'], number> = {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      };

      notifications.forEach(notification => {
        byType[notification.type]++;
        byPriority[notification.priority]++;
      });

      return {
        total,
        unread,
        dismissed,
        byType,
        byPriority,
      };
    } catch (error) {
      throw new Error(`Failed to get notification stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Sends a push notification (placeholder for mobile integration)
   */
  async sendPushNotification(
    userId: string,
    title: string,
    message: string,
    data?: Record<string, unknown>
  ): Promise<boolean> {
    try {
      // In a real implementation, this would integrate with push notification services
      // like Firebase Cloud Messaging, Apple Push Notification Service, etc.
      console.log('Push notification sent:', { userId, title, message, data });
      return true;
    } catch (error) {
      console.error('Failed to send push notification:', error);
      return false;
    }
  }

  /**
   * Maps database record to NotificationData
   */
  private mapToNotificationData(record: Record<string, unknown>): NotificationData {
    return {
      id: record.id as string,
      userId: record.user_id as string,
      title: record.title as string,
      message: record.message as string,
      type: record.type as NotificationData['type'],
      priority: record.priority as NotificationData['priority'],
      isRead: record.is_read as boolean,
      isDismissed: record.is_dismissed as boolean,
      metadata: record.metadata as Record<string, unknown>,
      createdAt: new Date(record.created_at as string),
      updatedAt: new Date(record.updated_at as string),
    };
  }

  /**
   * Generates a unique notification ID
   */
  private generateNotificationId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
} 