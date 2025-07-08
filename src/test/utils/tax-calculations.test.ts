import { describe, it, expect } from 'vitest'
import { calculateBracketTax, calculateTotalBracketTax, calculateEffectiveTaxRate } from '@/lib/tax-utils'
import { TaxBracket } from '@/lib/tax-utils'

describe('Tax Calculation Utilities', () => {
  describe('calculateBracketTax', () => {
    it('calculates tax correctly for single bracket', () => {
      const brackets = [
        { min: 0, max: 50000, rate: 0.10 }
      ]
      const taxableIncome = 30000
      
      const result = calculateBracketTax(taxableIncome, brackets)
      
      expect(result).toHaveLength(1)
      expect(result[0].taxPaid).toBe(3000)
    })

    it('calculates tax correctly for multiple brackets', () => {
      const brackets = [
        { min: 0, max: 10000, rate: 0.10 },
        { min: 10000, max: 50000, rate: 0.20 },
        { min: 50000, max: null, rate: 0.30 }
      ]
      const taxableIncome = 75000
      
      const result = calculateBracketTax(taxableIncome, brackets)
      
      expect(result).toHaveLength(3)
      expect(result[0].taxPaid).toBe(1000) // 0-10000: 10000 * 0.10
      expect(result[1].taxPaid).toBe(8000) // 10000-50000: 40000 * 0.20
      expect(result[2].taxPaid).toBe(7500) // 50000-75000: 25000 * 0.30
    })

    it('handles zero taxable income', () => {
      const brackets = [
        { min: 0, max: 50000, rate: 0.10 }
      ]
      const taxableIncome = 0
      
      const result = calculateBracketTax(taxableIncome, brackets)
      
      expect(result).toHaveLength(1)
      expect(result[0].taxPaid).toBe(0)
    })

    it('handles negative taxable income', () => {
      const brackets = [
        { min: 0, max: 50000, rate: 0.10 }
      ]
      const taxableIncome = -1000
      
      const result = calculateBracketTax(taxableIncome, brackets)
      
      expect(result).toHaveLength(1)
      expect(result[0].taxPaid).toBe(0)
    })
  })

  describe('calculateTotalBracketTax', () => {
    it('calculates total tax from brackets', () => {
      const brackets = [
        { min: 0, max: 10000, rate: 0.10, taxPaid: 1000 },
        { min: 10000, max: 50000, rate: 0.20, taxPaid: 8000 },
        { min: 50000, max: null, rate: 0.30, taxPaid: 7500 }
      ]
      
      const result = calculateTotalBracketTax(brackets)
      
      expect(result).toBe(16500) // 1000 + 8000 + 7500
    })

    it('handles empty brackets', () => {
      const brackets: TaxBracket[] = [];
      
      const result = calculateTotalBracketTax(brackets)
      
      expect(result).toBe(0)
    })
  })

  describe('calculateEffectiveTaxRate', () => {
    it('calculates effective tax rate correctly', () => {
      const totalTax = 15000
      const grossSalary = 75000
      
      const result = calculateEffectiveTaxRate(totalTax, grossSalary)
      
      expect(result).toBe(20)
    })

    it('handles zero gross salary', () => {
      const totalTax = 15000
      const grossSalary = 0
      
      const result = calculateEffectiveTaxRate(totalTax, grossSalary)
      
      expect(result).toBe(0)
    })
  })
}) 