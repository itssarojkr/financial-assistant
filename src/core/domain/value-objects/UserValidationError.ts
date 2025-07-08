/**
 * UserValidationError - Domain-specific validation error for User entity
 * 
 * This value object represents validation errors that occur during
 * user creation, updates, or business rule enforcement.
 */

export class UserValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserValidationError';
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UserValidationError);
    }
  }
} 