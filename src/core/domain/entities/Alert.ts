
export class Alert {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly type: 'spending' | 'budget' | 'tax' | 'system',
    public readonly severity: 'low' | 'medium' | 'high' | 'critical',
    public readonly title: string,
    public readonly message: string,
    public readonly isRead: boolean,
    public readonly isDismissed: boolean,
    public readonly threshold?: number,
    public readonly period?: string,
    public readonly active?: boolean,
    public readonly currency?: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
    public readonly metadata?: Record<string, any>
  ) {}

  static create(params: {
    userId: string;
    type: 'spending' | 'budget' | 'tax' | 'system';
    title: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    isRead: boolean;
    isDismissed: boolean;
    threshold?: number;
    period?: string;
    active?: boolean;
    currency?: string;
    metadata?: Record<string, any>;
  }, id?: string): Alert {
    return new Alert(
      id || crypto.randomUUID(),
      params.userId,
      params.type,
      params.severity,
      params.title,
      params.message,
      params.isRead,
      params.isDismissed,
      params.threshold,
      params.period,
      params.active,
      params.currency,
      new Date(),
      new Date(),
      params.metadata
    );
  }

  markAsRead(): Alert {
    return new Alert(
      this.id,
      this.userId,
      this.type,
      this.severity,
      this.title,
      this.message,
      true,
      this.isDismissed,
      this.threshold,
      this.period,
      this.active,
      this.currency,
      this.createdAt,
      new Date(),
      this.metadata
    );
  }

  dismiss(): Alert {
    return new Alert(
      this.id,
      this.userId,
      this.type,
      this.severity,
      this.title,
      this.message,
      this.isRead,
      true,
      this.threshold,
      this.period,
      this.active,
      this.currency,
      this.createdAt,
      new Date(),
      this.metadata
    );
  }
}

export type CreateAlertParams = Omit<Alert, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateAlertParams = Partial<Omit<Alert, 'id' | 'userId' | 'createdAt'>>;
