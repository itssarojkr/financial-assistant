import { Alert } from '@/core/domain/entities/Alert';
import { AlertRepository } from '@/infrastructure/database/repositories/AlertRepository';
import { PaginationParams, PaginatedResult } from '@/infrastructure/database/repositories/BaseRepository';

/**
 * Alert service for orchestrating alert-related business logic
 * 
 * This service coordinates between repositories and implements
 * application-level alert management operations.
 */
export class AlertService {
  private readonly alertRepository: AlertRepository;

  constructor(alertRepository: AlertRepository) {
    this.alertRepository = alertRepository;
  }

  /**
   * Creates a new alert with validation and business rules
   */
  async createAlert(
    userId: string,
    type: 'expense_threshold' | 'budget_overspend' | 'unusual_spending' | 'bill_reminder' | 'goal_milestone',
    title: string,
    message: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    metadata?: Record<string, unknown>,
    scheduledFor?: Date,
    isRecurring?: boolean,
    recurringInterval?: string
  ): Promise<Alert> {
    try {
      // Validate required fields
      if (!userId || !type || !title || !message || !severity) {
        throw new Error('Missing required fields for alert creation');
      }

      if (title.trim().length === 0) {
        throw new Error('Alert title cannot be empty');
      }

      if (message.trim().length === 0) {
        throw new Error('Alert message cannot be empty');
      }

      // Generate unique ID
      const alertId = this.generateAlertId();

      // Create alert with domain logic
      const alert = Alert.create(
        {
          userId,
          type,
          title,
          message,
          severity,
          metadata: metadata || {},
          scheduledFor: scheduledFor || new Date(),
          isRecurring: isRecurring || false,
          recurringInterval: recurringInterval || null,
          isRead: false,
          isDismissed: false,
        },
        alertId
      );

      // Save to database
      return await this.alertRepository.create(alert);
    } catch (error) {
      throw new Error(`Failed to create alert: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets an alert by ID with proper error handling
   */
  async getAlertById(alertId: string): Promise<Alert | null> {
    try {
      return await this.alertRepository.findById(alertId);
    } catch (error) {
      throw new Error(`Failed to get alert: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets alerts for a specific user with pagination
   */
  async getUserAlerts(userId: string, pagination?: PaginationParams): Promise<PaginatedResult<Alert>> {
    try {
      return await this.alertRepository.findByUserId(userId, pagination);
    } catch (error) {
      throw new Error(`Failed to get user alerts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets unread alerts for a specific user
   */
  async getUnreadAlerts(userId: string): Promise<Alert[]> {
    try {
      return await this.alertRepository.findUnread(userId);
    } catch (error) {
      throw new Error(`Failed to get unread alerts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets alerts by type for a specific user
   */
  async getAlertsByType(userId: string, type: Alert['type']): Promise<Alert[]> {
    try {
      return await this.alertRepository.findByType(userId, type);
    } catch (error) {
      throw new Error(`Failed to get alerts by type: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets alerts by severity for a specific user
   */
  async getAlertsBySeverity(userId: string, severity: Alert['severity']): Promise<Alert[]> {
    try {
      return await this.alertRepository.findBySeverity(userId, severity);
    } catch (error) {
      throw new Error(`Failed to get alerts by severity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Marks an alert as read
   */
  async markAsRead(alertId: string): Promise<Alert> {
    try {
      return await this.alertRepository.update(alertId, { isRead: true });
    } catch (error) {
      throw new Error(`Failed to mark alert as read: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Marks multiple alerts as read
   */
  async markMultipleAsRead(alertIds: string[]): Promise<Alert[]> {
    try {
      const updatedAlerts: Alert[] = [];
      for (const alertId of alertIds) {
        const updatedAlert = await this.alertRepository.update(alertId, { isRead: true });
        updatedAlerts.push(updatedAlert);
      }
      return updatedAlerts;
    } catch (error) {
      throw new Error(`Failed to mark alerts as read: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Dismisses an alert
   */
  async dismissAlert(alertId: string): Promise<Alert> {
    try {
      return await this.alertRepository.update(alertId, { isDismissed: true });
    } catch (error) {
      throw new Error(`Failed to dismiss alert: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Updates an alert
   */
  async updateAlert(alertId: string, updates: Partial<Alert>): Promise<Alert> {
    try {
      const existingAlert = await this.alertRepository.findById(alertId);
      if (!existingAlert) {
        throw new Error('Alert not found');
      }

      // Validate updates
      if (updates.title !== undefined && updates.title.trim().length === 0) {
        throw new Error('Alert title cannot be empty');
      }

      if (updates.message !== undefined && updates.message.trim().length === 0) {
        throw new Error('Alert message cannot be empty');
      }

      return await this.alertRepository.update(alertId, updates);
    } catch (error) {
      throw new Error(`Failed to update alert: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Deletes an alert
   */
  async deleteAlert(alertId: string): Promise<boolean> {
    try {
      return await this.alertRepository.delete(alertId);
    } catch (error) {
      throw new Error(`Failed to delete alert: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets alert statistics for a user
   */
  async getAlertStatistics(userId: string): Promise<{
    totalAlerts: number;
    unreadCount: number;
    dismissedCount: number;
    byType: Record<Alert['type'], number>;
    bySeverity: Record<Alert['severity'], number>;
  }> {
    try {
      const alerts = await this.alertRepository.findByUserId(userId);
      
      const totalAlerts = alerts.data.length;
      const unreadCount = alerts.data.filter(alert => !alert.isRead).length;
      const dismissedCount = alerts.data.filter(alert => alert.isDismissed).length;

      const byType: Record<Alert['type'], number> = {
        expense_threshold: 0,
        budget_overspend: 0,
        unusual_spending: 0,
        bill_reminder: 0,
        goal_milestone: 0,
      };

      const bySeverity: Record<Alert['severity'], number> = {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      };

      alerts.data.forEach(alert => {
        byType[alert.type]++;
        bySeverity[alert.severity]++;
      });

      return {
        totalAlerts,
        unreadCount,
        dismissedCount,
        byType,
        bySeverity,
      };
    } catch (error) {
      throw new Error(`Failed to get alert statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Creates an expense threshold alert
   */
  async createExpenseThresholdAlert(
    userId: string,
    threshold: number,
    currentAmount: number,
    currency: string,
    category?: string
  ): Promise<Alert> {
    const title = 'Expense Threshold Reached';
    const message = category
      ? `You've spent ${currentAmount} ${currency} on ${category}, exceeding your threshold of ${threshold} ${currency}`
      : `You've spent ${currentAmount} ${currency}, exceeding your threshold of ${threshold} ${currency}`;

    const severity: Alert['severity'] = currentAmount > threshold * 1.5 ? 'high' : 'medium';

    return this.createAlert(
      userId,
      'expense_threshold',
      title,
      message,
      severity,
      { threshold, currentAmount, currency, category }
    );
  }

  /**
   * Creates a budget overspend alert
   */
  async createBudgetOverspendAlert(
    userId: string,
    budgetName: string,
    budgetAmount: number,
    spentAmount: number,
    currency: string
  ): Promise<Alert> {
    const title = 'Budget Overspent';
    const message = `You've exceeded your "${budgetName}" budget by ${spentAmount - budgetAmount} ${currency}`;
    const severity: Alert['severity'] = spentAmount > budgetAmount * 1.2 ? 'high' : 'medium';

    return this.createAlert(
      userId,
      'budget_overspend',
      title,
      message,
      severity,
      { budgetName, budgetAmount, spentAmount, currency }
    );
  }

  /**
   * Generates a unique alert ID
   */
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
} 