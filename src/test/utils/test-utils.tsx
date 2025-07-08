import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { expect } from 'vitest'
import { Toaster } from '@/components/ui/toaster'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from 'next-themes'

// Create a new QueryClient for each test
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
})

// Custom render function that includes all necessary providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient()
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider attribute="class" defaultTheme="light">
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'

// Override render method
export { customRender as render }

// Test data helpers
export const mockSalaryData = {
  grossSalary: 75000,
  currency: 'USD',
  country: 'United States',
  city: 'New York',
}

export const mockTaxData = {
  brackets: [
    { min: 0, max: 11000, rate: 0.10, taxPaid: 1100 },
    { min: 11000, max: 44725, rate: 0.12, taxPaid: 4047 },
    { min: 44725, max: 95375, rate: 0.22, taxPaid: 6663 },
  ],
  totalTax: 11810,
  takeHomeSalary: 63190,
  federalTax: 11810,
  stateTax: 0,
  socialSecurity: 0,
  medicare: 0,
  taxableIncome: 75000,
}

export const mockDeductions = {
  ded401k: 5000,
  dedOther: 1000,
}

// Common test assertions
export const expectTaxCalculationToBeCorrect = (
  grossSalary: number,
  expectedTax: number,
  actualTax: number,
  tolerance = 1,
) => {
  expect(Math.abs(actualTax - expectedTax)).toBeLessThanOrEqual(tolerance)
}

export const expectTakeHomeToBeCorrect = (
  grossSalary: number,
  totalTax: number,
  takeHome: number,
) => {
  expect(takeHome).toBe(grossSalary - totalTax)
} 