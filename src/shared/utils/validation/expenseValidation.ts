/**
 * Expense Validation Utilities
 * 
 * This module provides comprehensive validation functions for expense-related data.
 * All validation functions follow consistent patterns and return detailed error information.
 */

import { ValidationResult, ValidationError, ValidationWarning } from '@/shared/types/domain.types';
import { ExpenseCategory } from '@/core/domain/enums/ExpenseCategory';

/**
 * Validation error codes for expenses
 */
export enum ExpenseValidationErrorCode {
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  INVALID_CURRENCY = 'INVALID_CURRENCY',
  INVALID_CATEGORY = 'INVALID_CATEGORY',
  INVALID_DATE = 'INVALID_DATE',
  INVALID_DESCRIPTION = 'INVALID_DESCRIPTION',
  INVALID_TAGS = 'INVALID_TAGS',
  INVALID_LOCATION = 'INVALID_LOCATION',
  INVALID_RECEIPT_URL = 'INVALID_RECEIPT_URL',
  INVALID_RECURRING_INTERVAL = 'INVALID_RECURRING_INTERVAL',
  AMOUNT_TOO_HIGH = 'AMOUNT_TOO_HIGH',
  AMOUNT_TOO_LOW = 'AMOUNT_TOO_LOW',
  FUTURE_DATE = 'FUTURE_DATE',
  PAST_DATE_TOO_OLD = 'PAST_DATE_TOO_OLD',
  DUPLICATE_EXPENSE = 'DUPLICATE_EXPENSE',
}

/**
 * Validation warning codes for expenses
 */
export enum ExpenseValidationWarningCode {
  HIGH_AMOUNT = 'HIGH_AMOUNT',
  UNUSUAL_CATEGORY = 'UNUSUAL_CATEGORY',
  MISSING_RECEIPT = 'MISSING_RECEIPT',
  MISSING_LOCATION = 'MISSING_LOCATION',
  MISSING_TAGS = 'MISSING_TAGS',
  POTENTIAL_DUPLICATE = 'POTENTIAL_DUPLICATE',
}

/**
 * Expense validation configuration
 */
export interface ExpenseValidationConfig {
  maxAmount: number;
  minAmount: number;
  maxDescriptionLength: number;
  maxTagsCount: number;
  maxTagLength: number;
  maxLocationLength: number;
  maxReceiptUrlLength: number;
  maxDaysInPast: number;
  maxDaysInFuture: number;
  highAmountThreshold: number;
  supportedCurrencies: string[];
}

/**
 * Default expense validation configuration
 */
export const DEFAULT_EXPENSE_VALIDATION_CONFIG: ExpenseValidationConfig = {
  maxAmount: 1000000, // $1M
  minAmount: 0.01, // $0.01
  maxDescriptionLength: 500,
  maxTagsCount: 10,
  maxTagLength: 50,
  maxLocationLength: 200,
  maxReceiptUrlLength: 1000,
  maxDaysInPast: 365 * 5, // 5 years
  maxDaysInFuture: 30, // 30 days
  highAmountThreshold: 10000, // $10K
  supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY', 'INR', 'BRL', 'ZAR'],
};

/**
 * Expense data interface for validation
 */
export interface ExpenseValidationData {
  amount: number;
  currency: string;
  category: string;
  description: string;
  date: Date | string;
  tags?: string[];
  location?: string;
  receiptUrl?: string;
  isRecurring?: boolean;
  recurringInterval?: string;
  notes?: string;
}

/**
 * Validates expense amount
 */
export function validateExpenseAmount(
  amount: number,
  currency: string,
  config: ExpenseValidationConfig = DEFAULT_EXPENSE_VALIDATION_CONFIG
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check if amount is a valid number
  if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount)) {
    errors.push({
      field: 'amount',
      message: 'Amount must be a valid number',
      code: ExpenseValidationErrorCode.INVALID_AMOUNT,
      value: amount,
    });
    return { isValid: false, errors, warnings };
  }

  // Check minimum amount
  if (amount < config.minAmount) {
    errors.push({
      field: 'amount',
      message: `Amount must be at least ${config.minAmount} ${currency}`,
      code: ExpenseValidationErrorCode.AMOUNT_TOO_LOW,
      value: amount,
    });
  }

  // Check maximum amount
  if (amount > config.maxAmount) {
    errors.push({
      field: 'amount',
      message: `Amount cannot exceed ${config.maxAmount} ${currency}`,
      code: ExpenseValidationErrorCode.AMOUNT_TOO_HIGH,
      value: amount,
    });
  }

  // Check for high amount warning
  if (amount > config.highAmountThreshold) {
    warnings.push({
      field: 'amount',
      message: `This is a high amount expense (${amount} ${currency}). Please verify the amount.`,
      code: ExpenseValidationWarningCode.HIGH_AMOUNT,
      value: amount,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates expense currency
 */
export function validateExpenseCurrency(
  currency: string,
  config: ExpenseValidationConfig = DEFAULT_EXPENSE_VALIDATION_CONFIG
): ValidationResult {
  const errors: ValidationError[] = [];

  if (!currency || typeof currency !== 'string') {
    errors.push({
      field: 'currency',
      message: 'Currency is required',
      code: ExpenseValidationErrorCode.INVALID_CURRENCY,
      value: currency,
    });
  } else if (!config.supportedCurrencies.includes(currency.toUpperCase())) {
    errors.push({
      field: 'currency',
      message: `Currency ${currency} is not supported. Supported currencies: ${config.supportedCurrencies.join(', ')}`,
      code: ExpenseValidationErrorCode.INVALID_CURRENCY,
      value: currency,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: [],
  };
}

/**
 * Validates expense category
 */
export function validateExpenseCategory(category: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!category || typeof category !== 'string') {
    errors.push({
      field: 'category',
      message: 'Category is required',
      code: ExpenseValidationErrorCode.INVALID_CATEGORY,
      value: category,
    });
  } else {
    const validCategories = Object.values(ExpenseCategory);
    if (!validCategories.includes(category as ExpenseCategory)) {
      errors.push({
        field: 'category',
        message: `Invalid category. Valid categories: ${validCategories.join(', ')}`,
        code: ExpenseValidationErrorCode.INVALID_CATEGORY,
        value: category,
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates expense description
 */
export function validateExpenseDescription(
  description: string,
  config: ExpenseValidationConfig = DEFAULT_EXPENSE_VALIDATION_CONFIG
): ValidationResult {
  const errors: ValidationError[] = [];

  if (!description || typeof description !== 'string') {
    errors.push({
      field: 'description',
      message: 'Description is required',
      code: ExpenseValidationErrorCode.INVALID_DESCRIPTION,
      value: description,
    });
  } else if (description.trim().length === 0) {
    errors.push({
      field: 'description',
      message: 'Description cannot be empty',
      code: ExpenseValidationErrorCode.INVALID_DESCRIPTION,
      value: description,
    });
  } else if (description.length > config.maxDescriptionLength) {
    errors.push({
      field: 'description',
      message: `Description cannot exceed ${config.maxDescriptionLength} characters`,
      code: ExpenseValidationErrorCode.INVALID_DESCRIPTION,
      value: description,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: [],
  };
}

/**
 * Validates expense date
 */
export function validateExpenseDate(
  date: Date | string,
  config: ExpenseValidationConfig = DEFAULT_EXPENSE_VALIDATION_CONFIG
): ValidationResult {
  const errors: ValidationError[] = [];

  let dateObj: Date;

  try {
    dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      errors.push({
        field: 'date',
        message: 'Invalid date format',
        code: ExpenseValidationErrorCode.INVALID_DATE,
        value: date,
      });
    } else {
      const now = new Date();
      const diffInDays = Math.abs((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24));

      // Check if date is too far in the past
      if (dateObj < now && diffInDays > config.maxDaysInPast) {
        errors.push({
          field: 'date',
          message: `Date cannot be more than ${config.maxDaysInPast} days in the past`,
          code: ExpenseValidationErrorCode.PAST_DATE_TOO_OLD,
          value: date,
        });
      }

      // Check if date is in the future
      if (dateObj > now && diffInDays > config.maxDaysInFuture) {
        errors.push({
          field: 'date',
          message: `Date cannot be more than ${config.maxDaysInFuture} days in the future`,
          code: ExpenseValidationErrorCode.FUTURE_DATE,
          value: date,
        });
      }
    }
  } catch (error) {
    errors.push({
      field: 'date',
      message: 'Invalid date format',
      code: ExpenseValidationErrorCode.INVALID_DATE,
      value: date,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: [],
  };
}

/**
 * Validates expense tags
 */
export function validateExpenseTags(
  tags: string[] | undefined,
  config: ExpenseValidationConfig = DEFAULT_EXPENSE_VALIDATION_CONFIG
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (tags) {
    if (!Array.isArray(tags)) {
      errors.push({
        field: 'tags',
        message: 'Tags must be an array',
        code: ExpenseValidationErrorCode.INVALID_TAGS,
        value: tags,
      });
    } else {
      if (tags.length > config.maxTagsCount) {
        errors.push({
          field: 'tags',
          message: `Cannot have more than ${config.maxTagsCount} tags`,
          code: ExpenseValidationErrorCode.INVALID_TAGS,
          value: tags,
        });
      }

      // Check individual tags
      for (let i = 0; i < tags.length; i++) {
        const tag = tags[i];
        if (typeof tag !== 'string' || tag.trim().length === 0) {
          errors.push({
            field: `tags[${i}]`,
            message: 'Tag cannot be empty',
            code: ExpenseValidationErrorCode.INVALID_TAGS,
            value: tag,
          });
        } else if (tag.length > config.maxTagLength) {
          errors.push({
            field: `tags[${i}]`,
            message: `Tag cannot exceed ${config.maxTagLength} characters`,
            code: ExpenseValidationErrorCode.INVALID_TAGS,
            value: tag,
          });
        }
      }

      // Check for duplicate tags
      const uniqueTags = new Set(tags.map(tag => tag.toLowerCase()));
      if (uniqueTags.size !== tags.length) {
        errors.push({
          field: 'tags',
          message: 'Duplicate tags are not allowed',
          code: ExpenseValidationErrorCode.INVALID_TAGS,
          value: tags,
        });
      }
    }
  } else {
    warnings.push({
      field: 'tags',
      message: 'Consider adding tags to better categorize this expense',
      code: ExpenseValidationWarningCode.MISSING_TAGS,
      value: tags,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates expense location
 */
export function validateExpenseLocation(
  location: string | undefined,
  config: ExpenseValidationConfig = DEFAULT_EXPENSE_VALIDATION_CONFIG
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (location !== undefined) {
    if (typeof location !== 'string') {
      errors.push({
        field: 'location',
        message: 'Location must be a string',
        code: ExpenseValidationErrorCode.INVALID_LOCATION,
        value: location,
      });
    } else if (location.length > config.maxLocationLength) {
      errors.push({
        field: 'location',
        message: `Location cannot exceed ${config.maxLocationLength} characters`,
        code: ExpenseValidationErrorCode.INVALID_LOCATION,
        value: location,
      });
    }
  } else {
    warnings.push({
      field: 'location',
      message: 'Consider adding location information for better tracking',
      code: ExpenseValidationWarningCode.MISSING_LOCATION,
      value: location,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates expense receipt URL
 */
export function validateExpenseReceiptUrl(
  receiptUrl: string | undefined,
  config: ExpenseValidationConfig = DEFAULT_EXPENSE_VALIDATION_CONFIG
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (receiptUrl !== undefined) {
    if (typeof receiptUrl !== 'string') {
      errors.push({
        field: 'receiptUrl',
        message: 'Receipt URL must be a string',
        code: ExpenseValidationErrorCode.INVALID_RECEIPT_URL,
        value: receiptUrl,
      });
    } else if (receiptUrl.length > config.maxReceiptUrlLength) {
      errors.push({
        field: 'receiptUrl',
        message: `Receipt URL cannot exceed ${config.maxReceiptUrlLength} characters`,
        code: ExpenseValidationErrorCode.INVALID_RECEIPT_URL,
        value: receiptUrl,
      });
    } else {
      try {
        new URL(receiptUrl);
      } catch {
        errors.push({
          field: 'receiptUrl',
          message: 'Invalid URL format',
          code: ExpenseValidationErrorCode.INVALID_RECEIPT_URL,
          value: receiptUrl,
        });
      }
    }
  } else {
    warnings.push({
      field: 'receiptUrl',
      message: 'Consider adding a receipt for better expense tracking',
      code: ExpenseValidationWarningCode.MISSING_RECEIPT,
      value: receiptUrl,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates expense recurring interval
 */
export function validateExpenseRecurringInterval(
  isRecurring: boolean | undefined,
  recurringInterval: string | undefined
): ValidationResult {
  const errors: ValidationError[] = [];

  if (isRecurring === true && (!recurringInterval || typeof recurringInterval !== 'string')) {
    errors.push({
      field: 'recurringInterval',
      message: 'Recurring interval is required when expense is recurring',
      code: ExpenseValidationErrorCode.INVALID_RECURRING_INTERVAL,
      value: recurringInterval,
    });
  } else if (recurringInterval && !isRecurring) {
    errors.push({
      field: 'recurringInterval',
      message: 'Recurring interval should not be set for non-recurring expenses',
      code: ExpenseValidationErrorCode.INVALID_RECURRING_INTERVAL,
      value: recurringInterval,
    });
  } else if (recurringInterval) {
    const validIntervals = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'];
    if (!validIntervals.includes(recurringInterval.toLowerCase())) {
      errors.push({
        field: 'recurringInterval',
        message: `Invalid recurring interval. Valid intervals: ${validIntervals.join(', ')}`,
        code: ExpenseValidationErrorCode.INVALID_RECURRING_INTERVAL,
        value: recurringInterval,
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: [],
  };
}

/**
 * Validates complete expense data
 */
export function validateExpense(
  data: ExpenseValidationData,
  config: ExpenseValidationConfig = DEFAULT_EXPENSE_VALIDATION_CONFIG
): ValidationResult {
  const allErrors: ValidationError[] = [];
  const allWarnings: ValidationWarning[] = [];

  // Validate each field
  const validations = [
    validateExpenseAmount(data.amount, data.currency, config),
    validateExpenseCurrency(data.currency, config),
    validateExpenseCategory(data.category),
    validateExpenseDescription(data.description, config),
    validateExpenseDate(data.date, config),
    validateExpenseTags(data.tags, config),
    validateExpenseLocation(data.location, config),
    validateExpenseReceiptUrl(data.receiptUrl, config),
    validateExpenseRecurringInterval(data.isRecurring, data.recurringInterval),
  ];

  // Collect all errors and warnings
  for (const validation of validations) {
    allErrors.push(...validation.errors);
    allWarnings.push(...validation.warnings);
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}

/**
 * Creates a custom expense validation rule
 */
export function createExpenseValidationRule(
  field: string,
  validator: (value: any) => boolean | string,
  message: string
): (value: any) => ValidationResult {
  return (value: any): ValidationResult => {
    const result = validator(value);
    const isValid = typeof result === 'boolean' ? result : false;
    const errorMessage = typeof result === 'string' ? result : message;

    return {
      isValid,
      errors: isValid ? [] : [{
        field,
        message: errorMessage,
        code: ExpenseValidationErrorCode.INVALID_AMOUNT, // Generic code
        value,
      }],
      warnings: [],
    };
  };
} 