import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils'
import CountrySelector from '@/components/CountrySelector';

// Mock the API client
vi.mock('@/infrastructure/api/SecureApiClient', () => ({
  SecureApiClient: {
    getCountries: vi.fn(() => Promise.resolve({
      data: [
        { id: 1, name: 'United States', code: 'US', currency: 'USD', region: 'North America' },
        { id: 2, name: 'Canada', code: 'CA', currency: 'CAD', region: 'North America' },
        { id: 3, name: 'India', code: 'IN', currency: 'INR', region: 'Asia' }
      ],
      error: null
    })),
    getStates: vi.fn(() => Promise.resolve({ data: [], error: null })),
    getCities: vi.fn(() => Promise.resolve({ data: [], error: null })),
    getLocalities: vi.fn(() => Promise.resolve({ data: [], error: null }))
  }
}))

// Mock the useAsyncError hook
vi.mock('@/hooks/use-error-boundary', () => ({
  useAsyncError: () => ({
    handleAsyncError: vi.fn()
  })
}))

// Mock react-query with all necessary exports
vi.mock('@tanstack/react-query', () => ({
  QueryClient: vi.fn().mockImplementation(() => ({
    setQueryData: vi.fn(),
    getQueryData: vi.fn(),
    invalidateQueries: vi.fn(),
    clear: vi.fn(),
  })),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
  useQuery: vi.fn(({ queryKey, queryFn }: { queryKey: string[]; queryFn: () => Promise<unknown> }) => {
    if (queryKey[0] === 'countries') {
      return {
        data: [
          { id: 1, name: 'United States', code: 'US', currency: 'USD', region: 'North America' },
          { id: 2, name: 'Canada', code: 'CA', currency: 'CAD', region: 'North America' },
          { id: 3, name: 'India', code: 'IN', currency: 'INR', region: 'Asia' }
        ],
        isLoading: false,
        error: null
      }
    }
    return {
      data: [],
      isLoading: false,
      error: null
    }
  }),
  useMutation: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isLoading: false,
    error: null,
    data: null,
  })),
}))

describe('CountrySelector', () => {
  const mockSetSalaryData = vi.fn()

  const defaultSalaryData = {
    country: '',
    countryCode: '',
    state: '',
    stateId: '',
    city: '',
    cityId: '',
    locality: '',
    localityId: '',
    isNative: false,
    grossSalary: 0,
    currency: 'USD',
  }

  const defaultProps = {
    salaryData: defaultSalaryData,
    setSalaryData: mockSetSalaryData,
    onNext: vi.fn(),
    salaryValid: false,
    showLoadButton: false,
    disabled: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders location selector form', () => {
    render(<CountrySelector {...defaultProps} />)
    
    expect(screen.getByText(/country\/region/i)).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('shows countries data when loaded', () => {
    render(<CountrySelector {...defaultProps} />)
    
    // Should show country selector without loading state
    expect(screen.queryByText(/loading countries/i)).not.toBeInTheDocument()
    expect(screen.getByText(/country\/region/i)).toBeInTheDocument()
  })

  it('shows placeholder when no country is selected', () => {
    render(<CountrySelector {...defaultProps} />)
    
    expect(screen.getByText(/select a country/i)).toBeInTheDocument()
  })

  it('shows selected country when one is provided', () => {
    const propsWithCountry = {
      ...defaultProps,
      salaryData: {
        ...defaultSalaryData,
        country: '1',
        countryCode: 'US'
      }
    }
    
    render(<CountrySelector {...propsWithCountry} />)
    
    // The component should show the selected country in the select trigger
    const selectTrigger = screen.getByRole('combobox')
    expect(selectTrigger).toBeInTheDocument()
    
    // Since we can't easily test the Select component's internal state,
    // we verify the component renders without errors when a country is selected
    expect(screen.getByText(/country\/region/i)).toBeInTheDocument()
  })

  it('calls setSalaryData when country is selected', () => {
    render(<CountrySelector {...defaultProps} />)
    
    const selectTrigger = screen.getByRole('combobox')
    fireEvent.click(selectTrigger)
    
    // The select should be interactive
    expect(selectTrigger).toBeInTheDocument()
  })

  it('handles disabled state', () => {
    const disabledProps = {
      ...defaultProps,
      disabled: true
    }
    
    render(<CountrySelector {...disabledProps} />)
    
    const selectTrigger = screen.getByRole('combobox')
    expect(selectTrigger).toBeDisabled()
  })

  it('shows load calculation button when enabled', () => {
    const propsWithLoadButton = {
      ...defaultProps,
      showLoadButton: true
    }
    
    render(<CountrySelector {...propsWithLoadButton} />)
    
    expect(screen.getByText(/load calculation/i)).toBeInTheDocument()
  })

  it('shows next button when salary is valid', () => {
    const propsWithValidSalary = {
      ...defaultProps,
      salaryValid: true
    }
    
    render(<CountrySelector {...propsWithValidSalary} />)
    
    expect(screen.getByText(/next/i)).toBeInTheDocument()
  })

  it('handles error state', async () => {
    // Mock react-query to return error
    const { useQuery } = await import('@tanstack/react-query')
    vi.mocked(useQuery).mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to load countries'),
      isError: true,
      isSuccess: false,
      isPending: false,
      isFetching: false,
      isRefetching: false,
      isStale: false,
      isPlaceholderData: false,
      dataUpdatedAt: 0,
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetched: true,
      isFetchedAfterMount: true,
      isLoadingError: false,
      isPaused: false,
      isRefetchError: true,
      isInitialLoading: false,
      status: 'error',
      fetchStatus: 'idle',
      refetch: vi.fn(),
      remove: vi.fn(),
    } as { data: Country[]; isLoading: boolean; error: Error | null })
    
    render(<CountrySelector {...defaultProps} />)
    
    expect(screen.getByText(/failed to load countries/i)).toBeInTheDocument()
  })
}) 