
import { Money } from '../value-objects/Money';

export interface Budget {
  id: string;
  userId: string;
  name: string;
  amount: number;
  currency: string;
  startDate: Date;
  endDate: Date;
  categoryId?: string;
  calculationId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateBudgetParams = Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateBudgetParams = Partial<Omit<Budget, 'id' | 'userId' | 'createdAt'>> & {
  calculationId?: string | null;
};
