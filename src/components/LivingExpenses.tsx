
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface ExpenseData {
  housing: number;
  food: number;
  transportation: number;
  utilities: number;
  healthcare: number;
  entertainment: number;
  other: number;
  description: string;
  total: number;
}

interface SalaryData {
  country: string;
  grossSalary: number;
  currency: string;
}

interface LivingExpensesProps {
  salaryData: SalaryData;
  expenseData: ExpenseData;
  setExpenseData: React.Dispatch<React.SetStateAction<ExpenseData>>;
}

const LivingExpenses: React.FC<LivingExpensesProps> = ({
  expenseData,
  setExpenseData,
}) => {
  const [localExpenses, setLocalExpenses] = useState<ExpenseData>(expenseData);

  const expenseCategories = [
    { key: 'housing', label: 'Housing (Rent/Mortgage)', description: 'Monthly rent or mortgage payment' },
    { key: 'food', label: 'Food & Groceries', description: 'Monthly food and grocery expenses' },
    { key: 'transportation', label: 'Transportation', description: 'Car payments, gas, public transport' },
    { key: 'utilities', label: 'Utilities', description: 'Electricity, water, internet, phone' },
    { key: 'healthcare', label: 'Healthcare', description: 'Insurance, medical expenses' },
    { key: 'entertainment', label: 'Entertainment', description: 'Movies, dining out, hobbies' },
    { key: 'other', label: 'Other Expenses', description: 'Miscellaneous monthly expenses' },
  ];

  const handleExpenseChange = (category: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setLocalExpenses(prev => {
      const updated = {
        ...prev,
        [category]: numValue
      };
      
      // Calculate total
      const total = Object.keys(updated)
        .filter(key => key !== 'description' && key !== 'total')
        .reduce((sum, key) => sum + (updated[key as keyof ExpenseData] as number), 0);
      
      updated.total = total;
      return updated;
    });
  };

  const handleSave = () => {
    setExpenseData(localExpenses);
  };

  const handleReset = () => {
    const resetExpenses: ExpenseData = {
      housing: 0,
      food: 0,
      transportation: 0,
      utilities: 0,
      healthcare: 0,
      entertainment: 0,
      other: 0,
      description: '',
      total: 0
    };
    setLocalExpenses(resetExpenses);
    setExpenseData(resetExpenses);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Living Expenses</CardTitle>
        <p className="text-sm text-muted-foreground">
          Enter your monthly living expenses to calculate your net savings potential.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          {expenseCategories.map((category) => (
            <div key={category.key} className="space-y-2">
              <Label htmlFor={category.key} className="text-sm font-medium">
                {category.label}
              </Label>
              <Input
                id={category.key}
                type="number"
                placeholder="0"
                value={localExpenses[category.key as keyof ExpenseData] || ''}
                onChange={(e) => handleExpenseChange(category.key, e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">{category.description}</p>
            </div>
          ))}
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            Additional Notes
          </Label>
          <Input
            id="description"
            placeholder="Any additional expense details..."
            value={localExpenses.description}
            onChange={(e) => setLocalExpenses(prev => ({ ...prev, description: e.target.value }))}
            className="w-full"
          />
        </div>

        <Separator />

        <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
          <span className="text-lg font-semibold">Total Monthly Expenses:</span>
          <span className="text-2xl font-bold text-primary">
            ${localExpenses.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleSave} className="flex-1">
            Save Expenses
          </Button>
          <Button onClick={handleReset} variant="outline" className="flex-1">
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LivingExpenses;
