import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (error) {
    // Fallback formatting if currency is not supported
    return `${currency} ${amount.toLocaleString()}`;
  }
}

// Static exchange rates (for demonstration; in production, fetch from an API)
export const EXCHANGE_RATES: Record<string, number> = {
  'USD': 1,
  'EUR': 1.08,
  'INR': 0.012,
  'GBP': 1.27,
  'CAD': 0.73,
  'AUD': 0.66,
  'BRL': 0.19,
  'ZAR': 0.054,
  'JPY': 0.0064,
  'CNY': 0.14,
  'FRF': 0.16, // French Franc (historic)
};

/**
 * Convert an amount from one currency to another using static rates.
 * @param amount The amount to convert
 * @param from The currency code of the amount
 * @param to The target currency code
 * @returns The converted amount
 */
export function convertCurrency(amount: number, from: string, to: string): number {
  if (from === to) return amount;
  const usdAmount = amount * (EXCHANGE_RATES[from] || 1);
  return usdAmount / (EXCHANGE_RATES[to] || 1);
}
