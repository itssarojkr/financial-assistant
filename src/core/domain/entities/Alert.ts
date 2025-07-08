/**
 * Alert entity representing a user's alert
 */
export interface AlertProps {
  userId: string;
  calculationId?: string | undefined;
  type: 'expense_threshold' | 'budget_overspend' | 'unusual_spending' | 'bill_reminder' | 'goal_milestone';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata: Record<string, unknown>;
  scheduledFor: Date;
  isRecurring: boolean;
  recurringInterval: string | null;
  isRead: boolean;
  isDismissed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Alert {
  public readonly id: string;
  public readonly props: AlertProps;

  private constructor(id: string, props: AlertProps) {
    this.id = id;
    this.props = props;
  }

  /**
   * Creates a new Alert instance
   */
  public static create(props: Omit<AlertProps, 'createdAt' | 'updatedAt'>, id?: string): Alert {
    const now = new Date();
    const alertId = id || `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return new Alert(alertId, {
      ...props,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Creates an Alert instance from existing data
   */
  public static fromJSON(data: unknown): Alert {
    const d = data as Record<string, unknown>;
    return new Alert(d.id as string, {
      userId: d.userId as string,
      calculationId: d.calculationId as string | undefined,
      type: d.type as AlertProps['type'],
      title: d.title as string,
      message: d.message as string,
      severity: d.severity as AlertProps['severity'],
      metadata: (d.metadata as Record<string, unknown>) || {},
      scheduledFor: new Date(d.scheduledFor as string),
      isRecurring: (d.isRecurring as boolean) || false,
      recurringInterval: d.recurringInterval as string | null,
      isRead: (d.isRead as boolean) || false,
      isDismissed: (d.isDismissed as boolean) || false,
      createdAt: new Date(d.createdAt as string),
      updatedAt: new Date(d.updatedAt as string),
    });
  }

  /**
   * Converts the alert to JSON
   */
  public toJSON(): Record<string, unknown> {
    const result: Record<string, unknown> = {
      id: this.id,
      userId: this.props.userId,
      type: this.props.type,
      title: this.props.title,
      message: this.props.message,
      severity: this.props.severity,
      metadata: this.props.metadata,
      scheduledFor: this.props.scheduledFor.toISOString(),
      isRecurring: this.props.isRecurring,
      recurringInterval: this.props.recurringInterval,
      isRead: this.props.isRead,
      isDismissed: this.props.isDismissed,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };

    // Only include calculationId if it has a value
    if (this.props.calculationId) {
      result.calculationId = this.props.calculationId;
    }

    return result;
  }

  /**
   * Checks if the alert is currently active (not dismissed and scheduled for now or past)
   */
  public isActive(): boolean {
    const now = new Date();
    return !this.props.isDismissed && this.props.scheduledFor <= now;
  }

  /**
   * Checks if the alert is scheduled for the future
   */
  public isScheduled(): boolean {
    return this.props.scheduledFor > new Date();
  }

  /**
   * Checks if the alert is overdue (scheduled for past but not dismissed)
   */
  public isOverdue(): boolean {
    const now = new Date();
    return !this.props.isDismissed && this.props.scheduledFor < now;
  }

  /**
   * Marks the alert as read
   */
  public markAsRead(): Alert {
    if (this.props.isRead) {
      return this;
    }
    return new Alert(this.id, {
      ...this.props,
      isRead: true,
      updatedAt: new Date(),
    });
  }

  /**
   * Marks the alert as unread
   */
  public markAsUnread(): Alert {
    if (!this.props.isRead) {
      return this;
    }
    return new Alert(this.id, {
      ...this.props,
      isRead: false,
      updatedAt: new Date(),
    });
  }

  /**
   * Dismisses the alert
   */
  public dismiss(): Alert {
    if (this.props.isDismissed) {
      return this;
    }
    return new Alert(this.id, {
      ...this.props,
      isDismissed: true,
      updatedAt: new Date(),
    });
  }

  /**
   * Undismisses the alert
   */
  public undismiss(): Alert {
    if (!this.props.isDismissed) {
      return this;
    }
    return new Alert(this.id, {
      ...this.props,
      isDismissed: false,
      updatedAt: new Date(),
    });
  }

  /**
   * Updates the alert with new data
   */
  public update(updates: Partial<Omit<AlertProps, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Alert {
    return new Alert(this.id, {
      ...this.props,
      ...updates,
      updatedAt: new Date(),
    });
  }

  /**
   * Gets the alert priority based on severity
   */
  public getPriority(): number {
    const severityPriority = {
      'low': 1,
      'medium': 2,
      'high': 3,
      'critical': 4,
    };
    return severityPriority[this.props.severity];
  }

  /**
   * Checks if the alert is high priority
   */
  public isHighPriority(): boolean {
    return this.props.severity === 'high' || this.props.severity === 'critical';
  }

  /**
   * Gets the time until the alert is scheduled
   */
  public getTimeUntilScheduled(): number {
    const now = new Date();
    return Math.max(0, this.props.scheduledFor.getTime() - now.getTime());
  }

  /**
   * Checks if the alert should be shown to the user
   */
  public shouldShow(): boolean {
    return this.isActive() && !this.props.isRead;
  }

  /**
   * Gets a summary of the alert for display
   */
  public getSummary(): {
    title: string;
    message: string;
    severity: AlertProps['severity'];
    isRead: boolean;
    isDismissed: boolean;
    scheduledFor: Date;
  } {
    return {
      title: this.props.title,
      message: this.props.message,
      severity: this.props.severity,
      isRead: this.props.isRead,
      isDismissed: this.props.isDismissed,
      scheduledFor: this.props.scheduledFor,
    };
  }
} 