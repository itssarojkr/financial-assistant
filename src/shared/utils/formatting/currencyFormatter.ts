/**
 * Currency Formatting Utilities
 * 
 * This module provides comprehensive currency formatting functions with support
 * for multiple currencies, locales, and formatting options.
 */

/**
 * Currency formatting options
 */
export interface CurrencyFormatOptions {
  locale?: string;
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  useGrouping?: boolean;
  style?: 'decimal' | 'currency';
  currencyDisplay?: 'symbol' | 'narrowSymbol' | 'code' | 'name';
  notation?: 'standard' | 'scientific' | 'engineering' | 'compact';
  compactDisplay?: 'short' | 'long';
  signDisplay?: 'auto' | 'never' | 'always' | 'exceptZero';
}

/**
 * Currency information interface
 */
export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  decimalPlaces: number;
  symbolPosition: 'before' | 'after';
  thousandsSeparator: string;
  decimalSeparator: string;
}

/**
 * Supported currencies configuration
 */
export const SUPPORTED_CURRENCIES: Record<string, CurrencyInfo> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    decimalPlaces: 2,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    decimalPlaces: 2,
    symbolPosition: 'before',
    thousandsSeparator: '.',
    decimalSeparator: ',',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    decimalPlaces: 2,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    decimalPlaces: 2,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    decimalPlaces: 2,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    decimalPlaces: 0,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  CHF: {
    code: 'CHF',
    symbol: 'CHF',
    name: 'Swiss Franc',
    decimalPlaces: 2,
    symbolPosition: 'before',
    thousandsSeparator: "'",
    decimalSeparator: '.',
  },
  CNY: {
    code: 'CNY',
    symbol: '¥',
    name: 'Chinese Yuan',
    decimalPlaces: 2,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    decimalPlaces: 2,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  BRL: {
    code: 'BRL',
    symbol: 'R$',
    name: 'Brazilian Real',
    decimalPlaces: 2,
    symbolPosition: 'before',
    thousandsSeparator: '.',
    decimalSeparator: ',',
  },
  ZAR: {
    code: 'ZAR',
    symbol: 'R',
    name: 'South African Rand',
    decimalPlaces: 2,
    symbolPosition: 'before',
    thousandsSeparator: ' ',
    decimalSeparator: '.',
  },
};

/**
 * Default formatting options
 */
export const DEFAULT_CURRENCY_OPTIONS: CurrencyFormatOptions = {
  locale: 'en-US',
  style: 'currency',
  currencyDisplay: 'symbol',
  useGrouping: true,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  notation: 'standard',
  signDisplay: 'auto',
};

/**
 * Helper to validate enum values
 */
function validNotation(value: unknown): 'standard' | 'scientific' | 'engineering' | 'compact' | undefined {
  return ['standard', 'scientific', 'engineering', 'compact'].includes(value as string) ? value as 'standard' | 'scientific' | 'engineering' | 'compact' : undefined;
}
function validStyle(value: unknown): 'decimal' | 'currency' | undefined {
  return ['decimal', 'currency'].includes(value as string) ? value as 'decimal' | 'currency' : undefined;
}
function validSignDisplay(value: unknown): 'auto' | 'never' | 'always' | 'exceptZero' | undefined {
  return typeof value === 'string' && ['auto', 'never', 'always', 'exceptZero'].includes(value as string)
    ? value as 'auto' | 'never' | 'always' | 'exceptZero'
    : undefined;
}

/**
 * Formats a number as currency using Intl.NumberFormat
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  options: CurrencyFormatOptions = {}
): string {
  const mergedOptions = { ...DEFAULT_CURRENCY_OPTIONS, ...options, currency };
  
  try {
    return new Intl.NumberFormat(mergedOptions.locale, {
      style: mergedOptions.style as 'decimal' | 'currency',
      currency: mergedOptions.currency,
      minimumFractionDigits: mergedOptions.minimumFractionDigits,
      maximumFractionDigits: mergedOptions.maximumFractionDigits,
      useGrouping: mergedOptions.useGrouping,
      currencyDisplay: mergedOptions.currencyDisplay,
      notation: mergedOptions.notation as 'standard' | 'scientific' | 'engineering' | 'compact' || 'standard',
      compactDisplay: mergedOptions.compactDisplay,
      signDisplay: mergedOptions.signDisplay as 'auto' | 'never' | 'always' | 'exceptZero' || 'auto',
    }).format(amount);
  } catch (error) {
    // Fallback to basic formatting if Intl.NumberFormat fails
    return fallbackCurrencyFormat(amount, currency, mergedOptions);
  }
}

/**
 * Fallback currency formatting when Intl.NumberFormat is not available
 */
function fallbackCurrencyFormat(
  amount: number,
  currency: string,
  options: CurrencyFormatOptions
): string {
  const currencyInfo = SUPPORTED_CURRENCIES[currency.toUpperCase()] || SUPPORTED_CURRENCIES.USD;
  
  // Format the number
  let formatted = Math.abs(amount).toFixed(currencyInfo.decimalPlaces);
  
  // Add thousands separators
  if (options.useGrouping !== false) {
    const parts = formatted.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, currencyInfo.thousandsSeparator);
    formatted = parts.join(currencyInfo.decimalSeparator);
  }
  
  // Add currency symbol
  const symbol = currencyInfo.symbol;
  const sign = amount < 0 ? '-' : '';
  
  if (currencyInfo.symbolPosition === 'before') {
    return `${sign}${symbol}${formatted}`;
  } else {
    return `${sign}${formatted}${symbol}`;
  }
}

/**
 * Formats currency with compact notation (e.g., 1.2K, 1.5M)
 */
export function formatCompactCurrency(
  amount: number,
  currency: string = 'USD',
  options: CurrencyFormatOptions = {}
): string {
  const mergedOptions: CurrencyFormatOptions = {
    ...DEFAULT_CURRENCY_OPTIONS,
    ...options,
    currency,
    compactDisplay: 'short',
  };
  const notation = validNotation('compact');
  if (notation) mergedOptions.notation = notation;
  return formatCurrency(amount, currency, mergedOptions);
}

/**
 * Formats currency with long compact notation (e.g., 1.2 thousand, 1.5 million)
 */
export function formatLongCompactCurrency(
  amount: number,
  currency: string = 'USD',
  options: CurrencyFormatOptions = {}
): string {
  const mergedOptions: CurrencyFormatOptions = {
    ...DEFAULT_CURRENCY_OPTIONS,
    ...options,
    currency,
    compactDisplay: 'long',
  };
  const notation = validNotation('compact');
  if (notation) mergedOptions.notation = notation;
  return formatCurrency(amount, currency, mergedOptions);
}

/**
 * Formats currency range (e.g., $100 - $200)
 */
export function formatCurrencyRange(
  minAmount: number,
  maxAmount: number,
  currency: string = 'USD',
  options: CurrencyFormatOptions = {}
): string {
  const minFormatted = formatCurrency(minAmount, currency, options);
  const maxFormatted = formatCurrency(maxAmount, currency, options);
  
  return `${minFormatted} - ${maxFormatted}`;
}

/**
 * Formats currency with custom precision
 */
export function formatCurrencyWithPrecision(
  amount: number,
  currency: string = 'USD',
  precision: number = 2,
  options: CurrencyFormatOptions = {}
): string {
  const mergedOptions: CurrencyFormatOptions = {
    ...DEFAULT_CURRENCY_OPTIONS,
    ...options,
    currency,
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  };
  return formatCurrency(amount, currency, mergedOptions);
}

/**
 * Formats currency for display in tables (aligned)
 */
export function formatCurrencyForTable(
  amount: number,
  currency: string = 'USD',
  options: CurrencyFormatOptions = {}
): string {
  const formatted = formatCurrency(amount, currency, options);
  
  // Add right padding for alignment
  return formatted.padStart(12);
}

/**
 * Formats currency for input fields (no symbol)
 */
export function formatCurrencyForInput(
  amount: number,
  currency: string = 'USD',
  options: CurrencyFormatOptions = {}
): string {
  const mergedOptions: CurrencyFormatOptions = {
    ...DEFAULT_CURRENCY_OPTIONS,
    ...options,
    currency,
    useGrouping: false,
  };
  const style = validStyle('decimal');
  if (style) mergedOptions.style = style;
  return formatCurrency(amount, currency, mergedOptions);
}

/**
 * Parses currency string back to number
 */
export function parseCurrency(
  value: string,
  currency: string = 'USD'
): number {
  if (!value || typeof value !== 'string') {
    return 0;
  }
  
  const currencyInfo = SUPPORTED_CURRENCIES[currency.toUpperCase()] || SUPPORTED_CURRENCIES.USD;
  
  // Remove currency symbol and other non-numeric characters except separators
  let cleaned = value.replace(/[^\d.,-]/g, '');
  
  // Handle negative numbers
  const isNegative = cleaned.includes('-');
  cleaned = cleaned.replace(/-/g, '');
  
  // Replace thousands separator with empty string
  cleaned = cleaned.replace(new RegExp(`\\${currencyInfo.thousandsSeparator}`, 'g'), '');
  
  // Replace decimal separator with dot for parsing
  cleaned = cleaned.replace(new RegExp(`\\${currencyInfo.decimalSeparator}`, 'g'), '.');
  
  const parsed = parseFloat(cleaned);
  
  if (isNaN(parsed)) {
    return 0;
  }
  
  return isNegative ? -parsed : parsed;
}

/**
 * Gets currency information
 */
export function getCurrencyInfo(currency: string): CurrencyInfo | null {
  return SUPPORTED_CURRENCIES[currency.toUpperCase()] || null;
}

/**
 * Checks if currency is supported
 */
export function isSupportedCurrency(currency: string): boolean {
  return currency.toUpperCase() in SUPPORTED_CURRENCIES;
}

/**
 * Gets all supported currencies
 */
export function getSupportedCurrencies(): string[] {
  return Object.keys(SUPPORTED_CURRENCIES);
}

/**
 * Formats currency for different locales
 */
export function formatCurrencyForLocale(
  amount: number,
  currency: string,
  locale: string,
  options: CurrencyFormatOptions = {}
): string {
  const mergedOptions = { ...DEFAULT_CURRENCY_OPTIONS, ...options, currency, locale };
  return formatCurrency(amount, currency, mergedOptions);
}

/**
 * Formats currency with custom symbol
 */
export function formatCurrencyWithCustomSymbol(
  amount: number,
  symbol: string,
  options: CurrencyFormatOptions = {}
): string {
  const mergedOptions: CurrencyFormatOptions = {
    ...options,
  };
  const style = validStyle('decimal');
  if (style) mergedOptions.style = style;
  const formatted = formatCurrency(amount, 'USD', mergedOptions);
  return `${symbol}${formatted}`;
}

/**
 * Formats currency for different display styles
 */
export function formatCurrencyForDisplay(
  amount: number,
  currency: string = 'USD',
  displayStyle: 'symbol' | 'code' | 'name' = 'symbol',
  options: CurrencyFormatOptions = {}
): string {
  const mergedOptions: CurrencyFormatOptions = {
    ...DEFAULT_CURRENCY_OPTIONS,
    ...options,
    currency,
  };
  return formatCurrency(amount, currency, mergedOptions);
}

/**
 * Formats currency with sign display options
 */
export function formatCurrencyWithSign(
  amount: number,
  currency: string = 'USD',
  signDisplay: 'auto' | 'never' | 'always' | 'exceptZero' = 'auto',
  options: CurrencyFormatOptions = {}
): string {
  const mergedOptions: CurrencyFormatOptions = {
    ...DEFAULT_CURRENCY_OPTIONS,
    ...options,
    currency,
  };
  const validSign = validSignDisplay(signDisplay);
  if (validSign) mergedOptions.signDisplay = validSign;
  return formatCurrency(amount, currency, mergedOptions);
}

/**
 * Formats currency for accounting (negative numbers in parentheses)
 */
export function formatCurrencyForAccounting(
  amount: number,
  currency: string = 'USD',
  options: CurrencyFormatOptions = {}
): string {
  const mergedOptions: CurrencyFormatOptions = {
    ...DEFAULT_CURRENCY_OPTIONS,
    ...options,
    currency,
  };
  const validSign = validSignDisplay('auto');
  if (validSign) mergedOptions.signDisplay = validSign;
  return formatCurrency(amount, currency, mergedOptions);
}

/**
 * Fetches exchange rates from exchangerate.host
 * @param base Base currency code (e.g., 'USD')
 * @returns Record of rates or null on error
 */
export async function fetchExchangeRates(base: string = 'USD'): Promise<Record<string, number> | null> {
  try {
    const res = await fetch(`https://api.exchangerate.host/latest?base=${base}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.rates || null;
  } catch {
    return null;
  }
}

/**
 * Converts an amount from one currency to another using provided rates
 * @param amount Amount in base currency
 * @param from Base currency code
 * @param to Target currency code
 * @param rates Record of exchange rates (to currency)
 * @returns Converted amount
 */
export function convertCurrency(amount: number, from: string, to: string, rates: Record<string, number>): number {
  if (from === to) return amount;
  const rate = rates[to.toUpperCase()];
  if (!rate) return amount;
  return amount * rate;
} 