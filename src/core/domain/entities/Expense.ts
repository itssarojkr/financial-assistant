
export interface Expense {
  id: string;
  userId: string;
  amount: number; // Changed from Money to number for consistency
  currency: string;
  description: string;
  category: string;
  date: Date;
  calculationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateExpenseParams = Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateExpenseParams = Partial<Omit<Expense, 'id' | 'userId' | 'createdAt'>> & {
  calculationId?: string;
};
