import { Alert } from '@/core/domain/entities/Alert';
import { BaseRepository, PaginationParams, PaginatedResult } from './BaseRepository';

/**
 * Repository interface for alert data access operations
 */
export interface AlertRepository extends BaseRepository<Alert> {
  /**
   * Finds alerts by user ID with pagination
   */
  findByUserId(userId: string, pagination?: PaginationParams): Promise<PaginatedResult<Alert>>;

  /**
   * Finds unread alerts for a user
   */
  findUnread(userId: string): Promise<Alert[]>;

  /**
   * Finds alerts by type
   */
  findByType(userId: string, type: Alert['props']['type']): Promise<Alert[]>;

  /**
   * Finds alerts by severity
   */
  findBySeverity(userId: string, severity: Alert['props']['severity']): Promise<Alert[]>;

  /**
   * Finds active alerts (not dismissed and scheduled for now or past)
   */
  findActive(userId: string): Promise<Alert[]>;

  /**
   * Finds scheduled alerts (scheduled for future)
   */
  findScheduled(userId: string): Promise<Alert[]>;

  /**
   * Finds overdue alerts (scheduled for past but not dismissed)
   */
  findOverdue(userId: string): Promise<Alert[]>;

  /**
   * Finds alerts within a date range
   */
  findByDateRange(userId: string, startDate: Date, endDate: Date, pagination?: PaginationParams): Promise<PaginatedResult<Alert>>;

  /**
   * Marks multiple alerts as read
   */
  markMultipleAsRead(alertIds: string[]): Promise<Alert[]>;

  /**
   * Marks multiple alerts as dismissed
   */
  markMultipleAsDismissed(alertIds: string[]): Promise<Alert[]>;

  /**
   * Gets alert statistics for a user
   */
  getStatistics(userId: string): Promise<{
    totalAlerts: number;
    unreadCount: number;
    dismissedCount: number;
    activeCount: number;
    scheduledCount: number;
    overdueCount: number;
    byType: Record<Alert['props']['type'], number>;
    bySeverity: Record<Alert['props']['severity'], number>;
  }>;
} 