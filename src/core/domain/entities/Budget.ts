import { Money } from '@/core/domain/value-objects/Money';

/**
 * Budget entity representing a user's budget
 */
export interface BudgetProps {
  userId: string;
  calculationId?: string | undefined;
  name: string;
  amount: number;
  currency: string;
  startDate: Date;
  endDate: Date;
  categories: string[];
  description: string | null;
  isRecurring: boolean;
  recurringInterval: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Budget {
  public readonly id: string;
  public readonly props: BudgetProps;

  private constructor(id: string, props: BudgetProps) {
    this.id = id;
    this.props = props;
  }

  /**
   * Creates a new Budget instance
   */
  public static create(props: Omit<BudgetProps, 'createdAt' | 'updatedAt'>, id?: string): Budget {
    const now = new Date();
    const budgetId = id || `budget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return new Budget(budgetId, {
      ...props,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Creates a Budget instance from existing data
   */
  public static fromJSON(data: unknown): Budget {
    const d = data as Record<string, unknown>;
    return new Budget(d.id as string, {
      userId: d.userId as string,
      calculationId: d.calculationId as string | undefined,
      name: d.name as string,
      amount: d.amount as number,
      currency: d.currency as string,
      startDate: new Date(d.startDate as string),
      endDate: new Date(d.endDate as string),
      categories: (d.categories as string[]) || [],
      description: d.description as string | null,
      isRecurring: (d.isRecurring as boolean) || false,
      recurringInterval: d.recurringInterval as string | null,
      createdAt: new Date(d.createdAt as string),
      updatedAt: new Date(d.updatedAt as string),
    });
  }

  /**
   * Converts the budget to JSON
   */
  public toJSON(): Record<string, unknown> {
    const result: Record<string, unknown> = {
      id: this.id,
      userId: this.props.userId,
      name: this.props.name,
      amount: this.props.amount,
      currency: this.props.currency,
      startDate: this.props.startDate.toISOString(),
      endDate: this.props.endDate.toISOString(),
      categories: this.props.categories,
      description: this.props.description,
      isRecurring: this.props.isRecurring,
      recurringInterval: this.props.recurringInterval,
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
   * Gets the budget amount as a Money value object
   */
  public getAmount(): Money {
    return Money.create(this.props.amount, this.props.currency);
  }

  /**
   * Checks if the budget is currently active
   */
  public isActive(): boolean {
    const now = new Date();
    return this.props.startDate <= now && this.props.endDate >= now;
  }

  /**
   * Checks if the budget is expired
   */
  public isExpired(): boolean {
    return this.props.endDate < new Date();
  }

  /**
   * Gets the remaining days in the budget
   */
  public getRemainingDays(): number {
    const now = new Date();
    if (this.isExpired()) {
      return 0;
    }
    return Math.ceil((this.props.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * Gets the budget duration in days
   */
  public getDurationDays(): number {
    return Math.ceil((this.props.endDate.getTime() - this.props.startDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * Gets the daily budget amount
   */
  public getDailyBudget(): number {
    const durationDays = this.getDurationDays();
    return durationDays > 0 ? this.props.amount / durationDays : 0;
  }

  /**
   * Updates the budget with new data
   */
  public update(updates: Partial<Omit<BudgetProps, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Budget {
    return new Budget(this.id, {
      ...this.props,
      ...updates,
      updatedAt: new Date(),
    });
  }

  /**
   * Checks if the budget contains a specific category
   */
  public hasCategory(category: string): boolean {
    return this.props.categories.includes(category);
  }

  /**
   * Adds a category to the budget
   */
  public addCategory(category: string): Budget {
    if (this.hasCategory(category)) {
      return this;
    }
    return this.update({
      categories: [...this.props.categories, category],
    });
  }

  /**
   * Removes a category from the budget
   */
  public removeCategory(category: string): Budget {
    if (!this.hasCategory(category)) {
      return this;
    }
    return this.update({
      categories: this.props.categories.filter(c => c !== category),
    });
  }
} 