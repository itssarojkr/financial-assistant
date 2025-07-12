
export interface Alert {
  id: string;
  userId: string;
  type: 'spending' | 'budget' | 'tax' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  isRead: boolean;
  isDismissed: boolean;
  threshold?: number;
  period?: string;
  active?: boolean;
  currency?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export type CreateAlertParams = Omit<Alert, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateAlertParams = Partial<Omit<Alert, 'id' | 'userId' | 'createdAt'>>;
