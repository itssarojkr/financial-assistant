import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils'
import { SalaryInput } from '@/components/SalaryInput'

// Mock the security utils
vi.mock('@/lib/security-utils', () => ({
  validateSalaryInput: vi.fn((value: number) => ({
    isValid: value > 0 && value <= 10000000,
    error: value <= 0 ? 'Please enter a valid salary greater than 0' : 
           value > 10000000 ? 'Salary cannot exceed $10,000,000' : null
  })),
  sanitizeStringInput: vi.fn((value: string) => value.replace(/[^0-9,.-]/g, ''))
}))

// Mock the useAsyncError hook
vi.mock('@/hooks/use-error-boundary', () => ({
  useAsyncError: () => ({
    handleAsyncError: vi.fn()
  })
}))

// Mock the utils with all necessary exports
vi.mock('@/lib/utils', () => ({
  convertCurrency: vi.fn((amount: number, from: string, to: string) => amount),
  cn: vi.fn((...classes: (string | undefined | null | false)[]) => 
    classes.filter(Boolean).join(' ')
  ),
  formatCurrency: vi.fn((amount: number, currency: string) => `${currency}${amount}`),
  formatNumber: vi.fn((num: number) => num.toLocaleString()),
  debounce: vi.fn((func: (...args: unknown[]) => void, delay: number) => func),
  throttle: vi.fn((func: (...args: unknown[]) => void, delay: number) => func),
  generateId: vi.fn(() => 'test-id'),
  isValidEmail: vi.fn((email: string) => email.includes('@')),
  isValidPhone: vi.fn((phone: string) => phone.length >= 10),
  isValidUrl: vi.fn((url: string) => url.startsWith('http')),
  capitalize: vi.fn((str: string) => str.charAt(0).toUpperCase() + str.slice(1)),
  truncate: vi.fn((str: string, length: number) => str.slice(0, length) + '...'),
  sleep: vi.fn((ms: number) => Promise.resolve()),
  retry: vi.fn((fn: (...args: unknown[]) => void, retries: number) => fn()),
  memoize: vi.fn((fn: (...args: unknown[]) => void) => fn),
  deepClone: vi.fn((obj: unknown) => JSON.parse(JSON.stringify(obj))),
  isEmpty: vi.fn((value: unknown) => !value || (Array.isArray(value) && value.length === 0)),
  isEqual: vi.fn((a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)),
  pick: vi.fn((obj: Record<string, unknown>, keys: string[]) => {
    const result: Record<string, unknown> = {};
    keys.forEach(key => {
      if (key in obj) {
        result[key] = obj[key];
      }
    });
    return result;
  }),
  omit: vi.fn((obj: Record<string, unknown>, keys: string[]) => {
    const result: Record<string, unknown> = {};
    Object.keys(obj).forEach(key => {
      if (!keys.includes(key)) {
        result[key] = obj[key];
      }
    });
    return result;
  }),
}))

describe('SalaryInput', () => {
  const mockSetSalaryData = vi.fn()

  const defaultSalaryData = {
    country: 'United States',
    countryCode: 'US',
    state: 'California',
    stateId: 'CA',
    city: 'San Francisco',
    cityId: 'SF',
    locality: 'Downtown',
    localityId: 'DT',
    isNative: false,
    grossSalary: 0,
    currency: 'USD',
  }

  const defaultProps = {
    salaryData: defaultSalaryData,
    setSalaryData: mockSetSalaryData,
    showLoadButton: false,
    disabled: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders salary input form', () => {
    render(<SalaryInput {...defaultProps} />)
    
    expect(screen.getByLabelText(/annual gross salary/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter your annual salary/i)).toBeInTheDocument()
  })

  it('accepts valid salary input', async () => {
    render(<SalaryInput {...defaultProps} />)
    
    const salaryInput = screen.getByLabelText(/annual gross salary/i)
    fireEvent.change(salaryInput, { target: { value: '75000' } })

    await waitFor(() => {
      expect(mockSetSalaryData).toHaveBeenCalledWith({
        ...defaultSalaryData,
        grossSalary: 75000
      })
    })
  })

  it('rejects negative salary values', async () => {
    render(<SalaryInput {...defaultProps} />)
    
    const salaryInput = screen.getByLabelText(/annual gross salary/i)
    fireEvent.change(salaryInput, { target: { value: '-1000' } })

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid salary greater than 0/i)).toBeInTheDocument()
    })
  })

  it('rejects zero salary values', async () => {
    render(<SalaryInput {...defaultProps} />)
    
    const salaryInput = screen.getByLabelText(/annual gross salary/i)
    
    // Clear the input first
    fireEvent.change(salaryInput, { target: { value: '' } })
    
    // Then set it to 0
    fireEvent.change(salaryInput, { target: { value: '0' } })

    // The component should call setSalaryData with 0 since 0 is valid according to validation
    await waitFor(() => {
      expect(mockSetSalaryData).toHaveBeenCalledWith({
        ...defaultSalaryData,
        grossSalary: 0
      })
    })
    
    // The validation should show an error for 0 since it's not a valid salary
    expect(screen.getByText(/please enter a valid salary greater than 0/i)).toBeInTheDocument()
  })

  it('rejects salary values exceeding maximum', async () => {
    render(<SalaryInput {...defaultProps} />)
    
    const salaryInput = screen.getByLabelText(/annual gross salary/i)
    fireEvent.change(salaryInput, { target: { value: '15000000' } })

    await waitFor(() => {
      expect(screen.getByText(/salary cannot exceed \$10,000,000/i)).toBeInTheDocument()
    })
  })

  it('handles empty input', async () => {
    render(<SalaryInput {...defaultProps} />)
    
    const salaryInput = screen.getByLabelText(/annual gross salary/i)
    fireEvent.change(salaryInput, { target: { value: '' } })

    await waitFor(() => {
      expect(mockSetSalaryData).toHaveBeenCalledWith({
        ...defaultSalaryData,
        grossSalary: 0
      })
    })
  })

  it('formats number on blur', async () => {
    const propsWithSalary = {
      ...defaultProps,
      salaryData: {
        ...defaultSalaryData,
        grossSalary: 75000
      }
    }
    
    render(<SalaryInput {...propsWithSalary} />)
    
    const salaryInput = screen.getByLabelText(/annual gross salary/i)
    fireEvent.blur(salaryInput)

    await waitFor(() => {
      expect(salaryInput).toHaveValue('75,000')
    })
  })

  it('removes formatting on focus', async () => {
    const propsWithSalary = {
      ...defaultProps,
      salaryData: {
        ...defaultSalaryData,
        grossSalary: 75000
      }
    }
    
    render(<SalaryInput {...propsWithSalary} />)
    
    const salaryInput = screen.getByLabelText(/annual gross salary/i)
    fireEvent.focus(salaryInput)

    await waitFor(() => {
      expect(salaryInput).toHaveValue('75000')
    })
  })

  it('handles disabled state', () => {
    const disabledProps = {
      ...defaultProps,
      disabled: true
    }
    
    render(<SalaryInput {...disabledProps} />)
    
    const salaryInput = screen.getByLabelText(/annual gross salary/i)
    expect(salaryInput).toBeDisabled()
  })

  it('shows validation error styling', async () => {
    render(<SalaryInput {...defaultProps} />)
    
    const salaryInput = screen.getByLabelText(/annual gross salary/i)
    fireEvent.change(salaryInput, { target: { value: '-1000' } })

    await waitFor(() => {
      expect(salaryInput).toHaveClass('border-red-500')
    })
  })

  it('handles different currencies', () => {
    const eurProps = {
      ...defaultProps,
      salaryData: {
        ...defaultSalaryData,
        currency: 'EUR'
      }
    }
    
    render(<SalaryInput {...eurProps} />)
    
    expect(screen.getByLabelText(/annual gross salary/i)).toBeInTheDocument()
    expect(screen.getByText(/currency/i)).toBeInTheDocument()
  })

  it('shows load calculation button when enabled', () => {
    const propsWithLoadButton = {
      ...defaultProps,
      showLoadButton: true,
      onLoadCalculation: vi.fn()
    }
    
    render(<SalaryInput {...propsWithLoadButton} />)
    
    expect(screen.getByText(/load saved calculation/i)).toBeInTheDocument()
  })

  it('displays currency symbol correctly', () => {
    render(<SalaryInput {...defaultProps} />)
    
    // Should show USD symbol ($)
    expect(screen.getByText('$')).toBeInTheDocument()
  })

  it('displays EUR currency symbol correctly', () => {
    const eurProps = {
      ...defaultProps,
      salaryData: {
        ...defaultSalaryData,
        currency: 'EUR'
      }
    }
    
    render(<SalaryInput {...eurProps} />)
    
    // Should show EUR symbol (€)
    expect(screen.getByText('€')).toBeInTheDocument()
  })
}) 