import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SalaryData } from '@/shared/types/domain.types';

interface TaxCalculatorFormProps {
  salaryData: SalaryData;
  setSalaryData: (data: SalaryData) => void;
  onCalculate: () => void;
  isLoading: boolean;
}

/**
 * Tax Calculator Form Component
 * 
 * This component handles the input form for tax calculations,
 * including salary, country, and other relevant data.
 */
export const TaxCalculatorForm: React.FC<TaxCalculatorFormProps> = ({
  salaryData,
  setSalaryData,
  onCalculate,
  isLoading,
}) => {
  const handleSalaryChange = (value: string) => {
    const salary = parseFloat(value) || 0;
    setSalaryData({ ...salaryData, salary });
  };

  const handleCountryChange = (country: string) => {
    setSalaryData({ ...salaryData, country });
  };

  const handleCurrencyChange = (currency: string) => {
    setSalaryData({ ...salaryData, currency });
  };

  const isFormValid = salaryData.country && salaryData.salary > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax Calculation Input</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Country Selection */}
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Select value={salaryData.country} onValueChange={handleCountryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select your country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="United States">United States</SelectItem>
              <SelectItem value="Canada">Canada</SelectItem>
              <SelectItem value="United Kingdom">United Kingdom</SelectItem>
              <SelectItem value="Australia">Australia</SelectItem>
              <SelectItem value="Germany">Germany</SelectItem>
              <SelectItem value="France">France</SelectItem>
              <SelectItem value="India">India</SelectItem>
              <SelectItem value="Brazil">Brazil</SelectItem>
              <SelectItem value="South Africa">South Africa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Salary Input */}
        <div className="space-y-2">
          <Label htmlFor="salary">Annual Salary</Label>
          <div className="relative">
            <Input
              id="salary"
              type="number"
              placeholder="Enter your annual salary"
              value={salaryData.salary || ''}
              onChange={(e) => handleSalaryChange(e.target.value)}
              className="pr-12"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-gray-500 text-sm">
                {salaryData.currency || 'USD'}
              </span>
            </div>
          </div>
        </div>

        {/* Currency Selection */}
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select value={salaryData.currency} onValueChange={handleCurrencyChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD - US Dollar</SelectItem>
              <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
              <SelectItem value="GBP">GBP - British Pound</SelectItem>
              <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
              <SelectItem value="EUR">EUR - Euro</SelectItem>
              <SelectItem value="INR">INR - Indian Rupee</SelectItem>
              <SelectItem value="BRL">BRL - Brazilian Real</SelectItem>
              <SelectItem value="ZAR">ZAR - South African Rand</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Calculate Button */}
        <Button
          onClick={onCalculate}
          disabled={!isFormValid || isLoading}
          className="w-full"
        >
          {isLoading ? 'Calculating...' : 'Calculate Tax'}
        </Button>

        {/* Form Validation */}
        {!isFormValid && (
          <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
            Please fill in all required fields to calculate your tax.
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 
