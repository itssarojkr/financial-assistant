import { TaxData } from '@/shared/types/domain.types';

/**
 * Strategy interface for tax calculation algorithms
 * 
 * This interface defines the contract that all tax calculation
 * strategies must implement for different countries.
 */
export interface TaxCalculationStrategy {
  /**
   * Calculates tax for a given salary and country-specific parameters
   */
  calculateTax(
    salary: number,
    currency: string,
    additionalParams?: Record<string, unknown>
  ): Promise<TaxData>;

  /**
   * Gets the country code this strategy handles
   */
  getCountryCode(): string;

  /**
   * Gets the country name this strategy handles
   */
  getCountryName(): string;

  /**
   * Validates the input parameters for this strategy
   */
  validateInput(
    salary: number,
    currency: string,
    additionalParams?: Record<string, unknown>
  ): boolean;

  /**
   * Gets the tax brackets for this country
   */
  getTaxBrackets(): Array<{
    minIncome: number;
    maxIncome: number;
    rate: number;
    description: string;
  }>;

  /**
   * Gets additional deductions available in this country
   */
  getAvailableDeductions(): Array<{
    name: string;
    description: string;
    maxAmount: number;
    type: 'percentage' | 'fixed';
  }>;
} 