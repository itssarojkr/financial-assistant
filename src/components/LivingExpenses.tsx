import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"

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
  countryCode: string;
  state: string;
  stateId: string;
  city: string;
  cityId: string;
  locality: string;
  localityId: string;
  isNative: boolean;
  grossSalary: number;
  currency: string;
}

const expenseCategories = [
  { name: 'Housing', value: 'housing' },
  { name: 'Food', value: 'food' },
  { name: 'Transportation', value: 'transportation' },
  { name: 'Utilities', value: 'utilities' },
  { name: 'Healthcare', value: 'healthcare' },
  { name: 'Entertainment', value: 'entertainment' },
  { name: 'Other', value: 'other' },
];

interface LivingExpensesProps {
  expenseData: ExpenseData;
  setExpenseData: (data: ExpenseData) => void;
  onNext: () => void;
  onBack: () => void;
  salaryData: SalaryData;
}

const LivingExpenses: React.FC<LivingExpensesProps> = ({
  expenseData,
  setExpenseData,
  onNext,
  onBack,
  salaryData,
}) => {
  const handleExpenseChange = (category: string, value: number) => {
    const newExpenseData = {
      ...expenseData,
      [category]: value,
    };
    
    // Calculate the new total
    let newTotal = 0;
    for (const key in newExpenseData) {
      if (expenseCategories.find(ec => ec.value === key)) {
        newTotal += newExpenseData[key];
      }
    }
    newExpenseData.total = newTotal;

    setExpenseData(newExpenseData);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setExpenseData({
      ...expenseData,
      description: e.target.value,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Living Expenses</CardTitle>
        <CardDescription>
          Enter your estimated monthly living expenses.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {expenseCategories.map((category) => (
          <div key={category.value} className="space-y-2">
            <Label htmlFor={category.value}>{category.name}</Label>
            <Slider
              id={category.value}
              defaultValue={[expenseData[category.value as keyof ExpenseData] as number || 0]}
              max={10000}
              step={100}
              onValueChange={(value) => handleExpenseChange(category.value, value[0])}
            />
            <div className="text-sm text-muted-foreground">
              Estimated: ${expenseData[category.value as keyof ExpenseData]}
            </div>
          </div>
        ))}

        <Separator />

        <div>
          <Label htmlFor="description">Additional Notes</Label>
          <Textarea
            id="description"
            placeholder="Any additional details about your expenses?"
            value={expenseData.description}
            onChange={handleDescriptionChange}
          />
        </div>

        <div className="text-lg font-semibold">
          Total Estimated Expenses: ${expenseData.total}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext}>Next</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LivingExpenses;
