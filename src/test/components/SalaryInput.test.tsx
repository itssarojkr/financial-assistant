import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils'
import SalaryInput from '@/components/SalaryInput'

describe('SalaryInput', () => {
  const mockSetSalaryData = vi.fn()

  const defaultProps = {
    salaryData: { 
      grossSalary: 0, 
      currency: 'USD', 
      country: '', 
      city: '',
      state: '',
      stateId: '',
      cityId: '',
      locality: '',
      localityId: '',
      isNative: true
    },
    setSalaryData: mockSetSalaryData,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders salary input form', () => {
    render(<SalaryInput {...defaultProps} />)
    
    expect(screen.getByLabelText(/annual gross salary/i)).toBeInTheDocument()
    expect(screen.getByText(/currency/i)).toBeInTheDocument()
    expect(screen.getByText(/salary information/i)).toBeInTheDocument()
  })



  it('accepts valid salary input', async () => {
    render(<SalaryInput {...defaultProps} />)
    
    const salaryInput = screen.getByLabelText(/annual gross salary/i)
    fireEvent.change(salaryInput, { target: { value: '75000' } })

    // The component formats the value, so we need to wait for the update
    await waitFor(() => {
      expect(mockSetSalaryData).toHaveBeenCalledWith({
        ...defaultProps.salaryData,
        grossSalary: 75000,
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







  it('updates salary data when salary changes', async () => {
    render(<SalaryInput {...defaultProps} />)
    
    const salaryInput = screen.getByLabelText(/annual gross salary/i)
    fireEvent.change(salaryInput, { target: { value: '75000' } })

    await waitFor(() => {
      expect(mockSetSalaryData).toHaveBeenCalledWith({
        ...defaultProps.salaryData,
        grossSalary: 75000,
      })
    })
  })


}) 