/**
 * ExpenseValidationError - Domain-specific validation error for Expense entity
 * 
 * This value object represents validation errors that occur during
 * expense creation, updates, or business rule enforcement.
 */

export class ExpenseValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpenseValidationError';
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ExpenseValidationError);
    }
  }
} 