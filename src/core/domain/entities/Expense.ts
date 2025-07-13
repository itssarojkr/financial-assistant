
export interface Expense {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  description: string;
  categoryId: string | null;
  date: Date;
  location: string | null;
  source: string | null;
  calculationId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateExpenseParams = Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateExpenseParams = Partial<Omit<Expense, 'id' | 'userId' | 'createdAt'>> & {
  calculationId?: string | null;
};
