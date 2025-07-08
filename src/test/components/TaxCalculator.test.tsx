import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/utils/test-utils'
import TaxCalculator from '@/components/TaxCalculator'

// Mock the tax calculators
vi.mock('@/components/tax/TaxCalculatorUS', () => ({
  default: ({ salaryData, taxData }: any) => (
    <div data-testid="us-calculator">
      US Calculator - Salary: {salaryData.grossSalary}
    </div>
  )
}))

vi.mock('@/components/tax/TaxCalculatorIndia', () => ({
  default: ({ salaryData, taxData }: any) => (
    <div data-testid="india-calculator">
      India Calculator - Salary: {salaryData.grossSalary}
    </div>
  )
}))

vi.mock('@/components/tax/StrategyBasedTaxCalculator', () => ({
  default: ({ salaryData, taxData }: any) => (
    <div data-testid="strategy-calculator">
      Strategy Calculator - Salary: {salaryData.grossSalary}
    </div>
  )
}))

// Mock the WhatIfCalculator to prevent undefined data errors
vi.mock('@/components/tax/WhatIfCalculator', () => ({
  default: () => <div data-testid="what-if-calculator">What If Calculator</div>
}))

// Mock the utils with all necessary exports
vi.mock('@/lib/utils', () => ({
  convertCurrency: vi.fn((amount: number, from: string, to: string) => amount),
  cn: vi.fn((...classes: (string | undefined | null | false)[]) => 
    classes.filter(Boolean).join(' ')
  ),
  formatCurrency: vi.fn((amount: number, currency: string) => `${currency}${amount}`),
  formatNumber: vi.fn((num: number) => num.toLocaleString()),
  debounce: vi.fn((func: Function, delay: number) => func),
  throttle: vi.fn((func: Function, delay: number) => func),
  generateId: vi.fn(() => 'test-id'),
  isValidEmail: vi.fn((email: string) => email.includes('@')),
  isValidPhone: vi.fn((phone: string) => phone.length >= 10),
  isValidUrl: vi.fn((url: string) => url.startsWith('http')),
  capitalize: vi.fn((str: string) => str.charAt(0).toUpperCase() + str.slice(1)),
  truncate: vi.fn((str: string, length: number) => str.slice(0, length) + '...'),
  sleep: vi.fn((ms: number) => Promise.resolve()),
  retry: vi.fn((fn: Function, retries: number) => fn()),
  memoize: vi.fn((fn: Function) => fn),
  deepClone: vi.fn((obj: any) => JSON.parse(JSON.stringify(obj))),
  isEmpty: vi.fn((value: any) => !value || (Array.isArray(value) && value.length === 0)),
  isEqual: vi.fn((a: any, b: any) => JSON.stringify(a) === JSON.stringify(b)),
  pick: vi.fn((obj: any, keys: string[]) => {
    const result: any = {};
    keys.forEach(key => {
      if (key in obj) result[key] = obj[key];
    });
    return result;
  }),
  omit: vi.fn((obj: any, keys: string[]) => {
    const result: any = {};
    Object.keys(obj).forEach(key => {
      if (!keys.includes(key)) result[key] = obj[key];
    });
    return result;
  }),
}))

describe('TaxCalculator', () => {
  const defaultTaxData = {
    federalTax: 10000,
    stateTax: 2000,
    socialSecurity: 3000,
    medicare: 1000,
    totalTax: 16000,
    takeHomeSalary: 59000,
    taxableIncome: 75000
  }

  const defaultProps = {
    salaryData: {
      country: 'United States',
      countryCode: 'US',
      state: '',
      stateId: '',
      city: '',
      cityId: '',
      locality: '',
      localityId: '',
      isNative: true,
      grossSalary: 75000,
      currency: 'USD'
    },
    taxData: defaultTaxData,
    setTaxData: vi.fn(),
    onNext: vi.fn(),
    indiaRegime: 'new' as const,
    setIndiaRegime: vi.fn(),
    usFilingStatus: 'single' as const,
    setUsFilingStatus: vi.fn(),
    usState: 'CA',
    setUsState: vi.fn(),
    caProvince: 'ON',
    setCaProvince: vi.fn(),
    ukCountry: 'England',
    setUkCountry: vi.fn(),
    ukStudentLoanPlan: 'Plan 1',
    setUkStudentLoanPlan: vi.fn(),
    includeSuper: true,
    setIncludeSuper: vi.fn(),
    churchTaxRate: 9,
    setChurchTaxRate: vi.fn(),
    age: 30,
    setAge: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders US tax calculator for United States', () => {
    render(<TaxCalculator {...defaultProps} />)
    
    expect(screen.getByTestId('us-calculator')).toBeInTheDocument()
    expect(screen.getByText('US Calculator - Salary: 75000')).toBeInTheDocument()
  })

  it('renders India tax calculator for India', () => {
    const indiaProps = {
      ...defaultProps,
      salaryData: { 
        ...defaultProps.salaryData, 
        country: 'India',
        countryCode: 'IN'
      }
    }
    
    render(<TaxCalculator {...indiaProps} />)
    
    expect(screen.getByTestId('india-calculator')).toBeInTheDocument()
    expect(screen.getByText('India Calculator - Salary: 75000')).toBeInTheDocument()
  })

  it('renders Canada tax calculator for Canada', () => {
    const canadaProps = {
      ...defaultProps,
      salaryData: { 
        ...defaultProps.salaryData, 
        country: 'Canada',
        countryCode: 'CA'
      }
    }
    
    render(<TaxCalculator {...canadaProps} />)
    
    expect(screen.getByTestId('strategy-calculator')).toBeInTheDocument()
    expect(screen.getByText('Strategy Calculator - Salary: 75000')).toBeInTheDocument()
  })

  it('renders fallback for unsupported country', () => {
    const unsupportedProps = {
      ...defaultProps,
      salaryData: { 
        ...defaultProps.salaryData, 
        country: 'Unsupported Country',
        countryCode: 'XX'
      }
    }
    
    render(<TaxCalculator {...unsupportedProps} />)
    
    expect(screen.getByText(/tax calculation for country code XX coming soon/i)).toBeInTheDocument()
  })

  it('passes correct props to country calculators', () => {
    render(<TaxCalculator {...defaultProps} />)
    
    expect(screen.getByTestId('us-calculator')).toBeInTheDocument()
  })

  it('handles empty country code', () => {
    const emptyCountryProps = {
      ...defaultProps,
      salaryData: { 
        ...defaultProps.salaryData, 
        country: '',
        countryCode: ''
      }
    }
    
    render(<TaxCalculator {...emptyCountryProps} />)
    
    expect(screen.getByText(/tax calculation for country code coming soon/i)).toBeInTheDocument()
  })

  it('handles zero salary', () => {
    const zeroSalaryProps = {
      ...defaultProps,
      salaryData: { ...defaultProps.salaryData, grossSalary: 0 }
    }
    
    render(<TaxCalculator {...zeroSalaryProps} />)
    
    expect(screen.getByTestId('us-calculator')).toBeInTheDocument()
    expect(screen.getByText('US Calculator - Salary: 0')).toBeInTheDocument()
  })

  it('handles negative salary', () => {
    const negativeSalaryProps = {
      ...defaultProps,
      salaryData: { ...defaultProps.salaryData, grossSalary: -1000 }
    }
    
    render(<TaxCalculator {...negativeSalaryProps} />)
    
    expect(screen.getByTestId('us-calculator')).toBeInTheDocument()
    expect(screen.getByText('US Calculator - Salary: -1000')).toBeInTheDocument()
  })

  it('renders UK tax calculator for United Kingdom', () => {
    const ukProps = {
      ...defaultProps,
      salaryData: { 
        ...defaultProps.salaryData, 
        country: 'United Kingdom',
        countryCode: 'GB'
      }
    }
    
    render(<TaxCalculator {...ukProps} />)
    
    expect(screen.getByTestId('strategy-calculator')).toBeInTheDocument()
    expect(screen.getByText('Strategy Calculator - Salary: 75000')).toBeInTheDocument()
  })

  it('renders Australia tax calculator for Australia', () => {
    const australiaProps = {
      ...defaultProps,
      salaryData: { 
        ...defaultProps.salaryData, 
        country: 'Australia',
        countryCode: 'AU'
      }
    }
    
    render(<TaxCalculator {...australiaProps} />)
    
    expect(screen.getByTestId('strategy-calculator')).toBeInTheDocument()
    expect(screen.getByText('Strategy Calculator - Salary: 75000')).toBeInTheDocument()
  })

  it('renders Germany tax calculator for Germany', () => {
    const germanyProps = {
      ...defaultProps,
      salaryData: { 
        ...defaultProps.salaryData, 
        country: 'Germany',
        countryCode: 'DE'
      }
    }
    
    render(<TaxCalculator {...germanyProps} />)
    
    expect(screen.getByTestId('strategy-calculator')).toBeInTheDocument()
    expect(screen.getByText('Strategy Calculator - Salary: 75000')).toBeInTheDocument()
  })

  it('renders France tax calculator for France', () => {
    const franceProps = {
      ...defaultProps,
      salaryData: { 
        ...defaultProps.salaryData, 
        country: 'France',
        countryCode: 'FR'
      }
    }
    
    render(<TaxCalculator {...franceProps} />)
    
    expect(screen.getByTestId('strategy-calculator')).toBeInTheDocument()
    expect(screen.getByText('Strategy Calculator - Salary: 75000')).toBeInTheDocument()
  })

  it('renders Brazil tax calculator for Brazil', () => {
    const brazilProps = {
      ...defaultProps,
      salaryData: { 
        ...defaultProps.salaryData, 
        country: 'Brazil',
        countryCode: 'BR'
      }
    }
    
    render(<TaxCalculator {...brazilProps} />)
    
    expect(screen.getByTestId('strategy-calculator')).toBeInTheDocument()
    expect(screen.getByText('Strategy Calculator - Salary: 75000')).toBeInTheDocument()
  })

  it('renders South Africa tax calculator for South Africa', () => {
    const southAfricaProps = {
      ...defaultProps,
      salaryData: { 
        ...defaultProps.salaryData, 
        country: 'South Africa',
        countryCode: 'ZA'
      }
    }
    
    render(<TaxCalculator {...southAfricaProps} />)
    
    expect(screen.getByTestId('strategy-calculator')).toBeInTheDocument()
    expect(screen.getByText('Strategy Calculator - Salary: 75000')).toBeInTheDocument()
  })
}) 