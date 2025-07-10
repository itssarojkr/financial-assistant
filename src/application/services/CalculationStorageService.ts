export interface SavedCalculationData {
  salaryData: {
    country: string;
    countryCode: string;
    state: string;
    stateId: string;
    city: string;
    cityId: string;
    locality: string;
    localityId: string;
    isNative: boolean;
    grossSalary: number;
    currency: string;
  };
  taxData: {
    federalTax: number;
    stateTax: number;
    socialSecurity: number;
    medicare: number;
    totalTax: number;
    takeHomeSalary: number;
    taxableIncome: number;
    effectiveTaxRate?: number;
    marginalTaxRate?: number;
    brackets?: Array<{
      min: number;
      max: number | null;
      rate: number;
      taxPaid: number;
    }>;
  };
  expenseData: {
    rent: number;
    utilities: number;
    food: number;
    transport: number;
    healthcare: number;
    other: number;
    total: number;
  };
  countrySpecificData: {
    indiaRegime?: 'new' | 'old';
    usFilingStatus?: 'single' | 'married' | 'head';
    usState?: string;
  };
  timestamp: number;
}

const STORAGE_KEY = 'financial_calculator_draft';

/**
 * CalculationStorageService for managing temporary calculation data
 * 
 * This service handles local storage of calculation drafts and temporary data
 * that persists across browser sessions for up to 24 hours.
 */
export class CalculationStorageService {
  /**
   * Save calculation data to localStorage
   */
  static saveCalculation(data: Omit<SavedCalculationData, 'timestamp'>): void {
    try {
      const savedData: SavedCalculationData = {
        ...data,
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));
    } catch (error) {
      console.error('Error saving calculation to localStorage:', error);
    }
  }

  /**
   * Get saved calculation data from localStorage
   */
  static getSavedCalculation(): SavedCalculationData | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return null;
      
      const data = JSON.parse(saved) as SavedCalculationData;
      
      // Check if the saved data is less than 24 hours old
      const isExpired = Date.now() - data.timestamp > 24 * 60 * 60 * 1000;
      if (isExpired) {
        this.clearSavedCalculation();
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error reading calculation from localStorage:', error);
      return null;
    }
  }

  /**
   * Clear saved calculation data
   */
  static clearSavedCalculation(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing saved calculation:', error);
    }
  }

  /**
   * Check if there's saved calculation data
   */
  static hasSavedCalculation(): boolean {
    return this.getSavedCalculation() !== null;
  }
} 