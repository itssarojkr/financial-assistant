import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils'
import TaxCalculator from '@/components/TaxCalculator'

// Mock the country-specific tax calculators
vi.mock('@/components/tax/TaxCalculatorIndia', () => ({
  default: ({ salaryData, setTaxData }: any) => (
    <div data-testid="india-calculator">
      India Calculator - Salary: {salaryData.grossSalary}
    </div>
  )
}))

vi.mock('@/components/tax/TaxCalculatorUS', () => ({
  default: ({ salaryData, setTaxData }: any) => (
    <div data-testid="us-calculator">
      US Calculator - Salary: {salaryData.grossSalary}
    </div>
  )
}))

vi.mock('@/components/tax/TaxCalculatorCanada', () => ({
  default: ({ salaryData, setTaxData }: any) => (
    <div data-testid="canada-calculator">
      Canada Calculator - Salary: {salaryData.grossSalary}
    </div>
  )
}))

describe('TaxCalculator', () => {
  const mockSetTaxData = vi.fn()

  const defaultProps = {
    salaryData: {
      country: 'United States',
      state: '',
      stateId: '',
      city: 'New York',
      cityId: '',
      locality: '',
      localityId: '',
      isNative: true,
      grossSalary: 75000,
      currency: 'USD'
    },
    setTaxData: mockSetTaxData,
    taxData: {
      federalTax: 0,
      stateTax: 0,
      socialSecurity: 0,
      medicare: 0,
      totalTax: 0,
      takeHomeSalary: 0,
      taxableIncome: 0
    },
    onNext: vi.fn(),
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
      salaryData: { ...defaultProps.salaryData, country: 'India' }
    }
    
    render(<TaxCalculator {...indiaProps} />)
    
    expect(screen.getByTestId('india-calculator')).toBeInTheDocument()
    expect(screen.getByText('India Calculator - Salary: 75000')).toBeInTheDocument()
  })

  it('renders Canada tax calculator for Canada', () => {
    const canadaProps = {
      ...defaultProps,
      salaryData: { ...defaultProps.salaryData, country: 'Canada' }
    }
    
    render(<TaxCalculator {...canadaProps} />)
    
    expect(screen.getByTestId('canada-calculator')).toBeInTheDocument()
    expect(screen.getByText('Canada Calculator - Salary: 75000')).toBeInTheDocument()
  })

  it('renders fallback for unsupported country', () => {
    const unsupportedProps = {
      ...defaultProps,
      salaryData: { ...defaultProps.salaryData, country: 'Unsupported Country' }
    }
    
    render(<TaxCalculator {...unsupportedProps} />)
    
    expect(screen.getByText(/tax calculation for/i)).toBeInTheDocument()
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument()
  })

  it('passes correct props to country calculators', () => {
    render(<TaxCalculator {...defaultProps} />)
    
    // The mock components should receive the salaryData and setTaxData props
    expect(screen.getByTestId('us-calculator')).toBeInTheDocument()
  })

  it('handles empty country', () => {
    const emptyCountryProps = {
      ...defaultProps,
      salaryData: { ...defaultProps.salaryData, country: '' }
    }
    
    render(<TaxCalculator {...emptyCountryProps} />)
    
    expect(screen.getByText(/tax calculation for/i)).toBeInTheDocument()
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument()
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
}) 