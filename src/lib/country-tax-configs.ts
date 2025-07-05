import { TaxBracket } from './tax-utils';

// Base bracket interface without taxPaid (for configuration)
export interface TaxBracketConfig {
  min: number;
  max: number | null;
  rate: number;
}

// Base interface for country tax configuration
export interface CountryTaxConfig {
  name: string;
  currency: string;
  brackets: TaxBracketConfig[];
  deductions: DeductionConfig[];
  additionalTaxes: AdditionalTaxConfig[];
  calculationFn: (params: CountryCalculationParams) => TaxCalculationResult;
}

export interface DeductionConfig {
  key: string;
  label: string;
  maxValue?: number;
  tooltip?: string;
  applicableRegimes?: string[];
}

export interface AdditionalTaxConfig {
  key: string;
  label: string;
  calculationFn: (income: number, baseTax: number) => number;
  tooltip?: string;
}

export interface CountryCalculationParams {
  grossSalary: number;
  deductions: Record<string, number>;
  regime?: string;
  additionalParams?: Record<string, any>;
}

export interface TaxCalculationResult {
  brackets: TaxBracket[];
  totalTax: number;
  takeHomeSalary: number;
  taxableIncome: number;
  additionalTaxes: Record<string, number>;
  breakdown: Record<string, number>;
}

// India Tax Configuration
export const INDIA_TAX_CONFIG: CountryTaxConfig = {
  name: 'India',
  currency: '₹',
  brackets: [
    { min: 0, max: 250000, rate: 0 },
    { min: 250000, max: 500000, rate: 0.05 },
    { min: 500000, max: 1000000, rate: 0.20 },
    { min: 1000000, max: null, rate: 0.30 },
  ],
  deductions: [
    {
      key: 'ded80C',
      label: 'Section 80C (EPF, ELSS, etc.)',
      maxValue: 150000,
      tooltip: 'Maximum deduction of ₹1.5 lakhs under Section 80C',
      applicableRegimes: ['old']
    },
    {
      key: 'ded80D',
      label: 'Section 80D (Health Insurance)',
      maxValue: 50000,
      tooltip: 'Maximum deduction of ₹50,000 for health insurance',
      applicableRegimes: ['old']
    },
    {
      key: 'dedOther',
      label: 'Other Deductions',
      tooltip: 'Other eligible deductions',
      applicableRegimes: ['old']
    }
  ],
  additionalTaxes: [
    {
      key: 'surcharge',
      label: 'Surcharge',
      calculationFn: (income: number, baseTax: number) => {
        if (baseTax > 10000000) return baseTax * 0.15;
        if (baseTax > 5000000) return baseTax * 0.10;
        if (baseTax > 1000000) return baseTax * 0.05;
        return 0;
      },
      tooltip: 'Surcharge for high earners'
    },
    {
      key: 'cess',
      label: 'Health & Education Cess',
      calculationFn: (income: number, baseTax: number) => baseTax * 0.04,
      tooltip: '4% of income tax after rebate'
    }
  ],
  calculationFn: (params) => {
    const { grossSalary, deductions, regime = 'new' } = params;
    
    // Use new regime brackets if specified
    const brackets = regime === 'new' ? [
      { min: 0, max: 300000, rate: 0 },
      { min: 300000, max: 600000, rate: 0.05 },
      { min: 600000, max: 900000, rate: 0.10 },
      { min: 900000, max: 1200000, rate: 0.15 },
      { min: 1200000, max: 1500000, rate: 0.20 },
      { min: 1500000, max: null, rate: 0.30 },
    ] : INDIA_TAX_CONFIG.brackets;

    // Calculate total deductions (only for old regime)
    const totalDeductions = regime === 'old' 
      ? Object.values(deductions).reduce((sum, val) => sum + Math.max(0, val), 0)
      : 0;

    const taxableIncome = Math.max(0, grossSalary - totalDeductions);
    
    // Calculate bracket tax
    const calculatedBrackets = brackets.map(bracket => {
      if (taxableIncome <= bracket.min) return { ...bracket, taxPaid: 0 };
      const upper = bracket.max === null ? taxableIncome : Math.min(taxableIncome, bracket.max);
      const band = Math.max(0, upper - bracket.min);
      const tax = band * bracket.rate;
      return { ...bracket, taxPaid: tax };
    });

    const baseTax = calculatedBrackets.reduce((sum, b) => sum + b.taxPaid, 0);

    // Apply Section 87A rebate
    const section87aLimit = regime === 'old' ? 500000 : 700000;
    const section87aRebate = regime === 'old' ? 12500 : 25000;
    let finalTax = baseTax;
    
    if (taxableIncome <= section87aLimit) {
      finalTax = Math.max(0, baseTax - Math.min(baseTax, section87aRebate));
    }

    // Calculate additional taxes
    const additionalTaxes: Record<string, number> = {};
    INDIA_TAX_CONFIG.additionalTaxes.forEach(tax => {
      additionalTaxes[tax.key] = tax.calculationFn(taxableIncome, finalTax);
    });

    const totalTax = finalTax + Object.values(additionalTaxes).reduce((sum, val) => sum + val, 0);
    const takeHomeSalary = grossSalary - totalTax;

    return {
      brackets: calculatedBrackets,
      totalTax,
      takeHomeSalary,
      taxableIncome,
      additionalTaxes,
      breakdown: {
        incomeTax: finalTax,
        ...additionalTaxes,
        rebate: baseTax - finalTax
      }
    };
  }
};

// US Tax Configuration
export const US_TAX_CONFIG: CountryTaxConfig = {
  name: 'United States',
  currency: '$',
  brackets: [
    { min: 0, max: 11000, rate: 0.10 },
    { min: 11000, max: 44725, rate: 0.12 },
    { min: 44725, max: 95375, rate: 0.22 },
    { min: 95375, max: 182100, rate: 0.24 },
    { min: 182100, max: 231250, rate: 0.32 },
    { min: 231250, max: 578125, rate: 0.35 },
    { min: 578125, max: null, rate: 0.37 },
  ],
  deductions: [
    {
      key: 'ded401k',
      label: '401(k)/IRA Contributions',
      tooltip: 'Pre-tax retirement contributions'
    },
    {
      key: 'dedOther',
      label: 'Other Deductions',
      tooltip: 'Other eligible deductions'
    }
  ],
  additionalTaxes: [
    {
      key: 'socialSecurity',
      label: 'Social Security',
      calculationFn: (income: number) => Math.min(income, 160200) * 0.062,
      tooltip: '6.2% up to wage cap of $160,200'
    },
    {
      key: 'medicare',
      label: 'Medicare',
      calculationFn: (income: number) => income * 0.0145,
      tooltip: '1.45% of gross income'
    }
  ],
  calculationFn: (params) => {
    const { grossSalary, deductions, additionalParams = {} } = params;
    const { filingStatus = 'single', state = 'CA' } = additionalParams;

    // Standard deduction based on filing status
    const standardDeductions = {
      single: 13850,
      married: 27700,
      head: 20800
    };

    const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + Math.max(0, val), 0);
    const grossAfterDeductions = Math.max(0, grossSalary - totalDeductions);
    const standardDeduction = standardDeductions[filingStatus as keyof typeof standardDeductions] || 13850;
    const taxableIncome = Math.max(0, grossAfterDeductions - standardDeduction);

    // Calculate bracket tax
    const calculatedBrackets = US_TAX_CONFIG.brackets.map(bracket => {
      if (taxableIncome <= bracket.min) return { ...bracket, taxPaid: 0 };
      const upper = bracket.max === null ? taxableIncome : Math.min(taxableIncome, bracket.max);
      const band = Math.max(0, upper - bracket.min);
      const tax = band * bracket.rate;
      return { ...bracket, taxPaid: tax };
    });

    const federalTax = calculatedBrackets.reduce((sum, b) => sum + b.taxPaid, 0);

    // Calculate additional taxes
    const additionalTaxes: Record<string, number> = {};
    US_TAX_CONFIG.additionalTaxes.forEach(tax => {
      additionalTaxes[tax.key] = tax.calculationFn(grossAfterDeductions);
    });

    // State tax (simplified)
    const stateRates: Record<string, number> = {
      'CA': 0.05, 'NY': 0.06, 'TX': 0, 'FL': 0, 'IL': 0.0495
    };
    const stateTax = grossAfterDeductions * (stateRates[state] || 0.05);
    additionalTaxes.stateTax = stateTax;

    const totalTax = federalTax + Object.values(additionalTaxes).reduce((sum, val) => sum + val, 0);
    const takeHomeSalary = grossSalary - totalTax;

    return {
      brackets: calculatedBrackets,
      totalTax,
      takeHomeSalary,
      taxableIncome,
      additionalTaxes,
      breakdown: {
        federalTax,
        ...additionalTaxes
      }
    };
  }
};

// Export all configurations
export const COUNTRY_CONFIGS: Record<string, CountryTaxConfig> = {
  'India': INDIA_TAX_CONFIG,
  'United States': US_TAX_CONFIG,
  // Add other countries here...
};

// Helper function to get country config
export const getCountryConfig = (countryName: string): CountryTaxConfig | null => {
  return COUNTRY_CONFIGS[countryName] || null;
}; 