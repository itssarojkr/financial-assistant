import { useState, useCallback } from 'react';
import { ServiceFactory } from '@/application/services/ServiceFactory';
import { TaxCalculationResult, TaxCalculationParams } from '@/application/services/TaxCalculationService';

/**
 * Tax calculator hook result interface
 */
export interface UseTaxCalculatorResult {
  // Tax calculation operations
  calculateTax: (params: TaxCalculationParams) => Promise<TaxCalculationResult>;
  calculateTaxForUser: (userId: string, grossIncome: number, additionalParams?: Partial<TaxCalculationParams>) => Promise<TaxCalculationResult>;
  
  // Tax scenario comparison
  compareTaxScenarios: (
    baseParams: TaxCalculationParams,
    scenarios: Array<{
      name: string;
      params: Partial<TaxCalculationParams>;
    }>
  ) => Promise<{
    baseScenario: TaxCalculationResult;
    scenarios: Array<{
      name: string;
      result: TaxCalculationResult;
      difference: {
        netIncome: number;
        totalTax: number;
        effectiveTaxRate: number;
      };
    }>;
  }>;
  
  // Tax optimization
  getTaxOptimizationSuggestions: (userId: string, grossIncome: number) => Promise<Array<{
    category: string;
    suggestion: string;
    potentialSavings: number;
    priority: 'high' | 'medium' | 'low';
  }>>;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Clear error
  clearError: () => void;
}

/**
 * Custom hook for tax calculation operations
 * 
 * This hook provides access to tax calculation business logic through
 * the application services layer with proper loading states and error handling.
 */
export function useTaxCalculator(): UseTaxCalculatorResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get tax calculation service instance
  const getTaxCalculationService = useCallback(() => {
    try {
      const serviceFactory = ServiceFactory.getInstance();
      return serviceFactory.getTaxCalculationService();
    } catch (err) {
      throw new Error(`Failed to get tax calculation service: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Wrapper for async operations with loading and error handling
  const executeOperation = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await operation();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'An unexpected error occurred';
      
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Calculate tax for given parameters
  const calculateTax = useCallback(async (params: TaxCalculationParams): Promise<TaxCalculationResult> => {
    return executeOperation(async () => {
      const taxService = getTaxCalculationService();
      return await taxService.calculateTax(params);
    });
  }, [executeOperation, getTaxCalculationService]);

  // Calculate tax for a specific user
  const calculateTaxForUser = useCallback(async (
    userId: string, 
    grossIncome: number, 
    additionalParams?: Partial<TaxCalculationParams>
  ): Promise<TaxCalculationResult> => {
    return executeOperation(async () => {
      const taxService = getTaxCalculationService();
      return await taxService.calculateTaxForUser(userId, grossIncome, additionalParams);
    });
  }, [executeOperation, getTaxCalculationService]);

  // Compare tax scenarios
  const compareTaxScenarios = useCallback(async (
    baseParams: TaxCalculationParams,
    scenarios: Array<{
      name: string;
      params: Partial<TaxCalculationParams>;
    }>
  ): Promise<{
    baseScenario: TaxCalculationResult;
    scenarios: Array<{
      name: string;
      result: TaxCalculationResult;
      difference: {
        netIncome: number;
        totalTax: number;
        effectiveTaxRate: number;
      };
    }>;
  }> => {
    return executeOperation(async () => {
      const taxService = getTaxCalculationService();
      return await taxService.compareTaxScenarios(baseParams, scenarios);
    });
  }, [executeOperation, getTaxCalculationService]);

  // Get tax optimization suggestions
  const getTaxOptimizationSuggestions = useCallback(async (
    userId: string, 
    grossIncome: number
  ): Promise<Array<{
    category: string;
    suggestion: string;
    potentialSavings: number;
    priority: 'high' | 'medium' | 'low';
  }>> => {
    return executeOperation(async () => {
      const taxService = getTaxCalculationService();
      return await taxService.getTaxOptimizationSuggestions(userId, grossIncome);
    });
  }, [executeOperation, getTaxCalculationService]);

  return {
    // Tax calculation operations
    calculateTax,
    calculateTaxForUser,
    
    // Tax scenario comparison
    compareTaxScenarios,
    
    // Tax optimization
    getTaxOptimizationSuggestions,
    
    // Loading states
    isLoading,
    error,
    
    // Clear error
    clearError,
  };
} 