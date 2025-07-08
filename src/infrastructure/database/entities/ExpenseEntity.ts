import { Expense } from '@/core/domain/entities/Expense';
import { ExpenseValidationError } from '@/core/domain/value-objects/ExpenseValidationError';
import { ExpenseCategory } from '@/core/domain/enums/ExpenseCategory';
import { Money } from '@/core/domain/value-objects/Money';

/**
 * Database entity for Expense domain object
 * Handles mapping between domain entities and database records
 */
export class ExpenseEntity {
  /**
   * Maps a database record to an Expense domain entity
   * @param dbRecord - Raw database record from Supabase
   * @returns Expense domain entity
   * @throws ExpenseValidationError if data is invalid
   */
  static fromDatabase(dbRecord: unknown): Expense {
    const record = dbRecord as Record<string, unknown>;
    try {
      if (!record?.id) {
        throw new ExpenseValidationError('Expense ID is required');
      }

      if (!record?.user_id) {
        throw new ExpenseValidationError('User ID is required');
      }

      const expense = new Expense({
        id: record.id as string,
        userId: record.user_id as string,
        amount: typeof record.amount === 'object' && record.amount !== null
          ? record.amount as Money
          : new Money(Number(record.amount), (record.currency as string) || 'USD'),
        currency: (record.currency as string) || 'USD',
        category: record.category as ExpenseCategory,
        description: (record.description as string) || '',
        date: new Date(record.date as string),
        createdAt: new Date(record.created_at as string),
        updatedAt: new Date(record.updated_at as string),
        tags: (record.tags as string[]) || [],
        isRecurring: record.is_recurring ?? false,
        recurringInterval: (record.recurring_interval as string) || null,
        location: (record.location as string) || null,
        receiptUrl: (record.receipt_url as string) || null,
        notes: (record.notes as string) || null,
      });

      return expense;
    } catch (error) {
      if (error instanceof ExpenseValidationError) {
        throw error;
      }
      throw new ExpenseValidationError(`Failed to create expense from database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Maps an Expense domain entity to a database record
   * @param expense - Expense domain entity
   * @returns Database record for Supabase
   */
  static toDatabase(expense: Expense): Record<string, unknown> {
    return {
      id: expense.id,
      user_id: expense.userId,
      amount: expense.amount.value,
      currency: expense.amount.currency,
      category: expense.category,
      description: expense.description,
      date: expense.date.toISOString(),
      created_at: expense.createdAt.toISOString(),
      updated_at: expense.updatedAt.toISOString(),
      tags: expense.tags,
      is_recurring: expense.isRecurring,
      recurring_interval: expense.recurringInterval,
      location: expense.location,
      receipt_url: expense.receiptUrl,
      notes: expense.notes,
    };
  }

  /**
   * Creates a partial database record for updates
   * @param expense - Expense domain entity with partial updates
   * @returns Partial database record
   */
  static toPartialDatabase(expense: Partial<Expense>): Record<string, unknown> {
    const record: Record<string, unknown> = {};

    if (expense.userId !== undefined) record.user_id = expense.userId;
    if (expense.amount !== undefined) {
      record.amount = expense.amount.value;
      record.currency = expense.amount.currency;
    }
    if (expense.category !== undefined) record.category = expense.category;
    if (expense.description !== undefined) record.description = expense.description;
    if (expense.date !== undefined) record.date = expense.date.toISOString();
    if (expense.updatedAt !== undefined) record.updated_at = expense.updatedAt.toISOString();
    if (expense.tags !== undefined) record.tags = expense.tags;
    if (expense.isRecurring !== undefined) record.is_recurring = expense.isRecurring;
    if (expense.recurringInterval !== undefined) record.recurring_interval = expense.recurringInterval;
    if (expense.location !== undefined) record.location = expense.location;
    if (expense.receiptUrl !== undefined) record.receipt_url = expense.receiptUrl;
    if (expense.notes !== undefined) record.notes = expense.notes;

    return record;
  }
} 