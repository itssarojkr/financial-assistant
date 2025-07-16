
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ExpenseData, SalaryData } from '@/shared/types/common.types';
import { SpendingHabitService } from '@/application/services/SpendingHabitService';

interface LivingExpensesProps {
  salaryData: SalaryData;
  expenseData: ExpenseData;
  setExpenseData: React.Dispatch<React.SetStateAction<ExpenseData>>;
}

const LivingExpenses: React.FC<LivingExpensesProps> = ({
  salaryData,
  expenseData,
  setExpenseData,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [localExpenses, setLocalExpenses] = useState<ExpenseData>(expenseData);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [customHabitName, setCustomHabitName] = useState('');
  const [isSavingHabit, setIsSavingHabit] = useState(false);

  const expenseCategories = [
    { key: 'rent', label: 'Housing (Rent/Mortgage)', description: 'Monthly rent or mortgage payment' },
    { key: 'food', label: 'Food & Groceries', description: 'Monthly food and grocery expenses' },
    { key: 'transport', label: 'Transportation', description: 'Car payments, gas, public transport' },
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

  const handleReset = () => {
    const resetExpenses: ExpenseData = {
      rent: 0,
      food: 0,
      transport: 0,
      utilities: 0,
      healthcare: 0,
      other: 0,
      total: 0,
      entertainment: 0,
      description: ''
    };
    setLocalExpenses(resetExpenses);
    setExpenseData(resetExpenses);
  };

  // Save custom spending habit
  const handleSaveCustomHabit = async () => {
    if (!user || !customHabitName.trim()) return;

    if (!salaryData.grossSalary || salaryData.grossSalary <= 0) {
      toast({
        title: "Cannot save habit",
        description: "Please enter a valid gross salary before saving a custom habit.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingHabit(true);
    try {
      // Calculate the average multiplier from current expenses
      const baseExpenses = {
        rent: salaryData.grossSalary * 0.30,
        food: salaryData.grossSalary * 0.15,
        transport: salaryData.grossSalary * 0.10,
        utilities: salaryData.grossSalary * 0.08,
        healthcare: salaryData.grossSalary * 0.05,
        entertainment: salaryData.grossSalary * 0.07,
        other: salaryData.grossSalary * 0.05,
      };

      console.log('=== CUSTOM HABIT CALCULATION DEBUG ===');
      console.log('Gross salary:', salaryData.grossSalary);
      console.log('Base expenses:', baseExpenses);
      console.log('Current expenses:', localExpenses);
      
      const multipliers = Object.keys(baseExpenses).map(key => {
        const baseValue = baseExpenses[key as keyof typeof baseExpenses];
        const currentValue = localExpenses[key as keyof ExpenseData] as number;
        const multiplier = baseValue > 0 ? currentValue / baseValue : 1;
        console.log(`${key}: base=${baseValue}, current=${currentValue}, multiplier=${multiplier}`);
        return multiplier;
      });

      const averageMultiplier = multipliers.reduce((sum, mult) => sum + mult, 0) / multipliers.length;
      console.log('Average multiplier:', averageMultiplier);
      console.log('Is finite:', isFinite(averageMultiplier));
      console.log('Is NaN:', isNaN(averageMultiplier));

      if (!isFinite(averageMultiplier) || isNaN(averageMultiplier) || averageMultiplier <= 0) {
        toast({
          title: "Cannot save habit",
          description: "Calculated expense multiplier is invalid. Please check your expense values.",
          variant: "destructive",
        });
        setIsSavingHabit(false);
        return;
      }

      const newHabit = await SpendingHabitService.createSpendingHabit(user.id, {
        name: customHabitName.trim(),
        country_code: salaryData.countryCode || salaryData.country,
        state_code: salaryData.stateId || null,
        habit_type: 'custom',
        expense_multiplier: averageMultiplier,
        description: `Custom spending habit created on ${new Date().toLocaleDateString()}`
      });

      toast({
        title: "Custom habit saved",
        description: `"${customHabitName}" has been saved as a custom spending habit.`,
      });

      setShowSaveDialog(false);
      setCustomHabitName('');
    } catch (error) {
      console.error('Error saving custom habit:', error);
      toast({
        title: "Error saving habit",
        description: "Failed to save custom spending habit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingHabit(false);
    }
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
        {/* Expense Categories */}
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
          <Button onClick={handleReset} variant="outline" className="flex-1">
            Reset
          </Button>
          <Button 
            onClick={() => setShowSaveDialog(true)} 
            variant="outline" 
            className="flex-1"
            disabled={!user}
          >
            Save as Custom
          </Button>
        </div>
      </CardContent>

      {/* Save Custom Habit Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Custom Spending Habit</DialogTitle>
            <DialogDescription>
              Save your current expense values as a custom spending habit for future use.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="habit-name">Habit Name</Label>
              <Input
                id="habit-name"
                placeholder="e.g., My Budget Plan, Frugal Living"
                value={customHabitName}
                onChange={(e) => setCustomHabitName(e.target.value)}
              />
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>This habit will be saved for {salaryData.country} {salaryData.state && `(${salaryData.state})`} and will appear in your spending habits dropdown.</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveCustomHabit}
              disabled={!customHabitName.trim() || isSavingHabit}
            >
              {isSavingHabit ? "Saving..." : "Save Habit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default LivingExpenses;
