/**
 * Money - Value object representing monetary amounts with currency
 * 
 * This encapsulates monetary values with validation, formatting,
 * and currency conversion capabilities.
 */

export interface MoneyProps {
  value: number;
  currency: string;
}

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
}

/**
 * Money value object with validation and currency operations
 */
export class Money {
  private readonly _value: number;
  private readonly _currency: string;

  constructor(props: MoneyProps) {
    this.validateMoneyProps(props);
    
    this._value = props.value;
    this._currency = props.currency.toUpperCase();
  }

  /**
   * Creates a new Money instance
   */
  static create(value: number, currency: string): Money {
    return new Money({ value, currency });
  }

  /**
   * Creates a zero amount in the specified currency
   */
  static zero(currency: string): Money {
    return new Money({ value: 0, currency });
  }

  /**
   * Adds another money amount (must be same currency)
   */
  add(other: Money): Money {
    if (this._currency !== other._currency) {
      throw new Error('Cannot add amounts with different currencies');
    }

    return new Money({
      value: this._value + other._value,
      currency: this._currency,
    });
  }

  /**
   * Subtracts another money amount (must be same currency)
   */
  subtract(other: Money): Money {
    if (this._currency !== other._currency) {
      throw new Error('Cannot subtract amounts with different currencies');
    }

    return new Money({
      value: this._value - other._value,
      currency: this._currency,
    });
  }

  /**
   * Multiplies by a factor
   */
  multiply(factor: number): Money {
    return new Money({
      value: this._value * factor,
      currency: this._currency,
    });
  }

  /**
   * Divides by a factor
   */
  divide(factor: number): Money {
    if (factor === 0) {
      throw new Error('Cannot divide by zero');
    }

    return new Money({
      value: this._value / factor,
      currency: this._currency,
    });
  }

  /**
   * Converts to another currency using exchange rate
   */
  convertTo(targetCurrency: string, exchangeRate?: number): Money {
    if (this._currency === targetCurrency.toUpperCase()) {
      return this;
    }

    if (!exchangeRate) {
      // For now, return the same amount - in a real app, you'd fetch exchange rates
      throw new Error(`Exchange rate required to convert from ${this._currency} to ${targetCurrency}`);
    }

    return new Money({
      value: this._value * exchangeRate,
      currency: targetCurrency.toUpperCase(),
    });
  }

  /**
   * Checks if amount is zero
   */
  isZero(): boolean {
    return this._value === 0;
  }

  /**
   * Checks if amount is positive
   */
  isPositive(): boolean {
    return this._value > 0;
  }

  /**
   * Checks if amount is negative
   */
  isNegative(): boolean {
    return this._value < 0;
  }

  /**
   * Compares with another money amount (must be same currency)
   */
  compare(other: Money): number {
    if (this._currency !== other._currency) {
      throw new Error('Cannot compare amounts with different currencies');
    }

    if (this._value < other._value) return -1;
    if (this._value > other._value) return 1;
    return 0;
  }

  /**
   * Checks if this amount equals another
   */
  equals(other: Money): boolean {
    return this._currency === other._currency && this._value === other._value;
  }

  /**
   * Checks if this amount is greater than another
   */
  greaterThan(other: Money): boolean {
    return this.compare(other) > 0;
  }

  /**
   * Checks if this amount is less than another
   */
  lessThan(other: Money): boolean {
    return this.compare(other) < 0;
  }

  /**
   * Formats the amount for display
   */
  format(locale?: string): string {
    const formatter = new Intl.NumberFormat(locale || 'en-US', {
      style: 'currency',
      currency: this._currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return formatter.format(this._value);
  }

  /**
   * Gets the absolute value
   */
  abs(): Money {
    return new Money({
      value: Math.abs(this._value),
      currency: this._currency,
    });
  }

  // Validation methods
  private validateMoneyProps(props: MoneyProps): void {
    if (typeof props.value !== 'number' || isNaN(props.value)) {
      throw new Error('Value must be a valid number');
    }

    if (!props.currency || props.currency.trim().length === 0) {
      throw new Error('Currency is required');
    }

    if (props.currency.length !== 3) {
      throw new Error('Currency must be a 3-letter code');
    }

    // Check for valid currency codes (basic validation)
    const validCurrencies = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'BRL', 'ZAR'];
    if (!validCurrencies.includes(props.currency.toUpperCase())) {
      throw new Error('Invalid currency code');
    }
  }

  // Getters
  get value(): number { return this._value; }
  get currency(): string { return this._currency; }

  /**
   * Converts to plain object for serialization
   */
  toJSON(): MoneyProps {
    return {
      value: this._value,
      currency: this._currency,
    };
  }
} 