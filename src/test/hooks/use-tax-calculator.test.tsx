import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTaxCalculator } from '@/hooks/use-tax-calculator'

describe('useTaxCalculator', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => useTaxCalculator(75000))

    expect(result.current.viewMode).toBe('annual')
    expect(result.current.showAdvanced).toBe(false)
    expect(result.current.showWhatIf).toBe(false)
    expect(result.current.whatIfSalary).toBe(75000)
    expect(result.current.showCalculationModal).toBe(false)
    expect(result.current.deductions).toEqual({})
    expect(result.current.totalDeductions).toBe(0)
  })

  it('updates deductions correctly', () => {
    const { result } = renderHook(() => useTaxCalculator(75000))

    act(() => {
      result.current.updateDeduction('ded401k', 5000)
      result.current.updateDeduction('dedOther', 1000)
    })

    expect(result.current.deductions).toEqual({
      ded401k: 5000,
      dedOther: 1000
    })
    expect(result.current.totalDeductions).toBe(6000)
  })

  it('toggles advanced options', () => {
    const { result } = renderHook(() => useTaxCalculator(75000))

    act(() => {
      result.current.toggleAdvanced()
    })

    expect(result.current.showAdvanced).toBe(true)

    act(() => {
      result.current.toggleAdvanced()
    })

    expect(result.current.showAdvanced).toBe(false)
  })

  it('toggles view mode', () => {
    const { result } = renderHook(() => useTaxCalculator(75000))

    act(() => {
      result.current.setViewMode('monthly')
    })

    expect(result.current.viewMode).toBe('monthly')
    expect(result.current.viewLabel).toBe('Monthly')

    act(() => {
      result.current.setViewMode('annual')
    })

    expect(result.current.viewMode).toBe('annual')
    expect(result.current.viewLabel).toBe('Annual')
  })

  it('calculates total deductions correctly', () => {
    const { result } = renderHook(() => useTaxCalculator(75000))

    act(() => {
      result.current.updateDeduction('ded401k', 5000)
      result.current.updateDeduction('dedOther', 1000)
      result.current.updateDeduction('dedHSA', -500) // Negative should be ignored
    })

    expect(result.current.totalDeductions).toBe(6000) // Only positive values
  })

  it('handles zero salary', () => {
    const { result } = renderHook(() => useTaxCalculator(0))

    expect(result.current.whatIfSalary).toBe(0)
    expect(result.current.totalDeductions).toBe(0)
  })

  it('updates what-if salary', () => {
    const { result } = renderHook(() => useTaxCalculator(75000))

    act(() => {
      result.current.updateWhatIfSalary(100000)
    })

    expect(result.current.whatIfSalary).toBe(100000)
  })

  it('toggles what-if scenario', () => {
    const { result } = renderHook(() => useTaxCalculator(75000))

    act(() => {
      result.current.toggleWhatIf()
    })

    expect(result.current.showWhatIf).toBe(true)

    act(() => {
      result.current.toggleWhatIf()
    })

    expect(result.current.showWhatIf).toBe(false)
  })

  it('resets state correctly', () => {
    const { result } = renderHook(() => useTaxCalculator(75000))

    // Set some state
    act(() => {
      result.current.setViewMode('monthly')
      result.current.setShowAdvanced(true)
      result.current.setShowWhatIf(true)
      result.current.updateDeduction('ded401k', 5000)
    })

    // Reset
    act(() => {
      result.current.resetState()
    })

    expect(result.current.viewMode).toBe('annual')
    expect(result.current.showAdvanced).toBe(false)
    expect(result.current.showWhatIf).toBe(false)
    expect(result.current.deductions).toEqual({})
    expect(result.current.totalDeductions).toBe(0)
  })

  it('calculates getValue correctly for different view modes', () => {
    const { result } = renderHook(() => useTaxCalculator(75000))

    // Annual view
    expect(result.current.getValue(75000)).toBe(75000)

    // Monthly view
    act(() => {
      result.current.setViewMode('monthly')
    })

    expect(result.current.getValue(75000)).toBe(6250) // 75000 / 12
  })
}) 