/**
 * Expense domain entity representing a financial expense in the application.
 * 
 * This entity encapsulates all business logic related to expense management,
 * including validation rules, categorization, and financial calculations.
 */

import { Money } from '../value-objects/Money';
import { ExpenseCategory } from '../enums/ExpenseCategory';
import { ExpenseValidationError } from '../value-objects/ExpenseValidationError';

export interface ExpenseProps {
  id: string;
  userId: string;
  calculationId?: string; // Optional link to a specific calculation
  amount: Money;
  category: ExpenseCategory;
  description: string;
  date: Date;
  location?: string;
  tags?: string[];
  isRecurring: boolean;
  recurringInterval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateExpenseParams {
  userId: string;
  calculationId?: string; // Optional link to a specific calculation
  amount: number;
  currency: string;
  category: ExpenseCategory;
  description: string;
  date: Date;
  location?: string;
  tags?: string[];
  isRecurring?: boolean;
  recurringInterval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface UpdateExpenseParams {
  calculationId?: string; // Optional link to a specific calculation
  amount?: number;
  currency?: string;
  category?: ExpenseCategory;
  description?: string;
  date?: Date;
  location?: string;
  tags?: string[];
  isRecurring?: boolean;
  recurringInterval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

/**
 * Expense domain entity with business logic and validation
 */
export class Expense {
  private readonly _id: string;
  private readonly _userId: string;
  private _calculationId?: string; // Optional link to a specific calculation
  private _amount: Money;
  private _category: ExpenseCategory;
  private _description: string;
  private _date: Date;
  private _location?: string;
  private _tags: string[];
  private _isRecurring: boolean;
  private _recurringInterval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: ExpenseProps) {
    this.validateExpenseProps(props);
    
    this._id = props.id;
    this._userId = props.userId;
    this._calculationId = props.calculationId;
    this._amount = props.amount;
    this._category = props.category;
    this._description = props.description;
    this._date = props.date;
    this._location = props.location;
    this._tags = props.tags || [];
    this._isRecurring = props.isRecurring;
    this._recurringInterval = props.recurringInterval;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  /**
   * Creates a new Expense instance with validation
   */
  static create(params: CreateExpenseParams, id: string): Expense {
    const now = new Date();
    const amount = Money.create(params.amount, params.currency);
    
    return new Expense({
      id,
      userId: params.userId,
      calculationId: params.calculationId,
      amount,
      category: params.category,
      description: params.description,
      date: params.date,
      location: params.location,
      tags: params.tags,
      isRecurring: params.isRecurring || false,
      recurringInterval: params.recurringInterval,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Updates expense properties with validation
   */
  update(params: UpdateExpenseParams): void {
    if (params.calculationId !== undefined) {
      this._calculationId = params.calculationId;
    }

    if (params.amount !== undefined || params.currency !== undefined) {
      const newAmount = params.amount ?? this._amount.value;
      const newCurrency = params.currency ?? this._amount.currency;
      this._amount = Money.create(newAmount, newCurrency);
    }

    if (params.category !== undefined) {
      this._category = params.category;
    }

    if (params.description !== undefined) {
      this.validateDescription(params.description);
      this._description = params.description;
    }

    if (params.date !== undefined) {
      this.validateDate(params.date);
      this._date = params.date;
    }

    if (params.location !== undefined) {
      this._location = params.location;
    }

    if (params.tags !== undefined) {
      this.validateTags(params.tags);
      this._tags = params.tags;
    }

    if (params.isRecurring !== undefined) {
      this._isRecurring = params.isRecurring;
    }

    if (params.recurringInterval !== undefined) {
      this.validateRecurringInterval(params.recurringInterval);
      this._recurringInterval = params.recurringInterval;
    }

    this._updatedAt = new Date();
  }

  /**
   * Adds a tag to the expense
   */
  addTag(tag: string): void {
    if (!this._tags.includes(tag)) {
      this.validateTag(tag);
      this._tags.push(tag);
      this._updatedAt = new Date();
    }
  }

  /**
   * Removes a tag from the expense
   */
  removeTag(tag: string): void {
    const index = this._tags.indexOf(tag);
    if (index > -1) {
      this._tags.splice(index, 1);
      this._updatedAt = new Date();
    }
  }

  /**
   * Checks if expense has a specific tag
   */
  hasTag(tag: string): boolean {
    return this._tags.includes(tag);
  }

  /**
   * Gets the expense amount in the specified currency
   */
  getAmountInCurrency(currency: string): number {
    return this._amount.convertTo(currency).value;
  }

  /**
   * Checks if expense is in a specific category
   */
  isInCategory(category: ExpenseCategory): boolean {
    return this._category === category;
  }

  /**
   * Checks if expense is recurring
   */
  isRecurringExpense(): boolean {
    return this._isRecurring;
  }

  /**
   * Gets the next occurrence date for recurring expenses
   */
  getNextOccurrence(): Date | null {
    if (!this._isRecurring || !this._recurringInterval) {
      return null;
    }

    const nextDate = new Date(this._date);
    const today = new Date();

    while (nextDate <= today) {
      switch (this._recurringInterval) {
        case 'daily':
          nextDate.setDate(nextDate.getDate() + 1);
          break;
        case 'weekly':
          nextDate.setDate(nextDate.getDate() + 7);
          break;
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
        case 'yearly':
          nextDate.setFullYear(nextDate.getFullYear() + 1);
          break;
      }
    }

    return nextDate;
  }

  /**
   * Checks if expense is overdue (for recurring expenses)
   */
  isOverdue(): boolean {
    if (!this._isRecurring) return false;
    
    const nextOccurrence = this.getNextOccurrence();
    return nextOccurrence ? nextOccurrence < new Date() : false;
  }

  // Validation methods
  private validateExpenseProps(props: ExpenseProps): void {
    if (!props.id || props.id.trim().length === 0) {
      throw new ExpenseValidationError('Expense ID is required');
    }

    if (!props.userId || props.userId.trim().length === 0) {
      throw new ExpenseValidationError('User ID is required');
    }

    this.validateDescription(props.description);
    this.validateDate(props.date);
    this.validateTags(props.tags || []);

    if (props.isRecurring && props.recurringInterval) {
      this.validateRecurringInterval(props.recurringInterval);
    }

    if (props.createdAt > props.updatedAt) {
      throw new ExpenseValidationError('Created date cannot be after updated date');
    }
  }

  private validateDescription(description: string): void {
    if (!description || description.trim().length === 0) {
      throw new ExpenseValidationError('Description is required');
    }
    if (description.length > 500) {
      throw new ExpenseValidationError('Description must be less than 500 characters');
    }
  }

  private validateDate(date: Date): void {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      throw new ExpenseValidationError('Valid date is required');
    }
  }

  private validateTags(tags: string[]): void {
    if (tags.length > 10) {
      throw new ExpenseValidationError('Maximum 10 tags allowed');
    }
    tags.forEach(tag => this.validateTag(tag));
  }

  private validateTag(tag: string): void {
    if (!tag || tag.trim().length === 0) {
      throw new ExpenseValidationError('Tag cannot be empty');
    }
    if (tag.length > 50) {
      throw new ExpenseValidationError('Tag must be less than 50 characters');
    }
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(tag)) {
      throw new ExpenseValidationError('Tag contains invalid characters');
    }
  }

  private validateRecurringInterval(interval: string): void {
    const validIntervals = ['daily', 'weekly', 'monthly', 'yearly'];
    if (!validIntervals.includes(interval)) {
      throw new ExpenseValidationError('Invalid recurring interval');
    }
  }

  // Getters (immutable access to properties)
  get id(): string { return this._id; }
  get userId(): string { return this._userId; }
  get calculationId(): string | undefined { return this._calculationId; }
  get amount(): Money { return this._amount; }
  get category(): ExpenseCategory { return this._category; }
  get description(): string { return this._description; }
  get date(): Date { return new Date(this._date); }
  get location(): string | undefined { return this._location; }
  get tags(): string[] { return [...this._tags]; }
  get isRecurring(): boolean { return this._isRecurring; }
  get recurringInterval(): 'daily' | 'weekly' | 'monthly' | 'yearly' | undefined { 
    return this._recurringInterval; 
  }
  get createdAt(): Date { return new Date(this._createdAt); }
  get updatedAt(): Date { return new Date(this._updatedAt); }

  /**
   * Converts expense to JSON representation
   */
  toJSON(): ExpenseProps {
    const result: ExpenseProps = {
      id: this._id,
      userId: this._userId,
      amount: this._amount,
      category: this._category,
      description: this._description,
      date: this._date,
      tags: [...this._tags],
      isRecurring: this._isRecurring,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };

    // Only include optional properties if they have values
    if (this._calculationId) {
      result.calculationId = this._calculationId;
    }
    if (this._location) {
      result.location = this._location;
    }
    if (this._recurringInterval) {
      result.recurringInterval = this._recurringInterval;
    }

    return result;
  }
} 