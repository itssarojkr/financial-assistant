import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Save, X, Target } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { BudgetService } from '@/application/services/BudgetService';
import { ExpenseService } from '@/application/services/ExpenseService';
import { OptimizedExpenseService } from '@/infrastructure/services/OptimizedExpenseService';
import type { CreateBudgetData, ExpenseCategory } from '@/application/services/BudgetService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { ERROR } from '@/shared/constants/app.constants';

interface BudgetFormProps {
  budget?: {
    id: string;
    amount: number;
    period: string;
    start_date: string | null;
    end_date: string | null;
    category_id: number | null;
  };
  onSave: (budget: CreateBudgetData) => Promise<void>;
  onCancel: () => void;
  userId: string;
}

export const BudgetForm: React.FC<BudgetFormProps> = ({
  budget,
  onSave,
  onCancel,
  userId,
}) => {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateBudgetData>({
    amount: budget?.amount || 0,
    period: budget?.period || 'monthly',
    start_date: budget?.start_date || new Date().toISOString().split('T')[0],
    end_date: budget?.end_date || null,
    category_id: budget?.category_id || null,
  });
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const amountRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadCategories();
    if (amountRef.current) {
      amountRef.current.focus();
    }
  }, []);

  const loadCategories = async () => {
    try {
      const categoriesData = await OptimizedExpenseService.getInstance().getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await onSave(formData);
      toast({
        title: 'Budget saved',
        description: 'Your budget has been saved successfully.',
      });
    } catch (err: unknown) {
      const message = (typeof err === 'object' && err && 'message' in err) ? (err as { message?: string }).message : undefined;
      setError(message || ERROR.MESSAGES.GENERIC);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateBudgetData, value: string | number | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const getPeriodEndDate = (startDate: string, period: string) => {
    const start = new Date(startDate);
    const end = new Date(start);
    
    switch (period) {
      case 'weekly':
        end.setDate(start.getDate() + 7);
        break;
      case 'monthly':
        end.setMonth(start.getMonth() + 1);
        break;
      case 'quarterly':
        end.setMonth(start.getMonth() + 3);
        break;
      case 'yearly':
        end.setFullYear(start.getFullYear() + 1);
        break;
      default:
        end.setMonth(start.getMonth() + 1);
    }
    
    return end.toISOString().split('T')[0];
  };

  const handlePeriodChange = (period: string) => {
    const endDate = getPeriodEndDate(formData.start_date, period);
    setFormData(prev => ({
      ...prev,
      period,
      end_date: endDate,
    }));
  };

  const handleStartDateChange = (date: string) => {
    const endDate = getPeriodEndDate(date, formData.period);
    setFormData(prev => ({
      ...prev,
      start_date: date,
      end_date: endDate,
    }));
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2" id="budget-form-title">
          {budget ? <Save className="w-5 h-5" /> : <Target className="w-5 h-5" />}
          {budget ? 'Edit Budget' : 'Create Budget'}
        </CardTitle>
        <CardDescription>
          {budget ? 'Update your budget details' : 'Set up a new budget for tracking expenses'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" role="form" aria-labelledby="budget-form-title" tabIndex={0}>
          {error && (
            <Alert variant="destructive" id="budget-error" aria-live="assertive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" id="budget-amount-label">Budget Amount</Label>
            <Input
              id="amount"
              ref={amountRef}
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              required
              aria-describedby={error ? 'budget-error' : undefined}
              aria-invalid={!!error}
              aria-labelledby="budget-amount-label"
              style={{ minHeight: '44px' }}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" id="budget-category-label">Category (Optional)</Label>
            <Select
              value={formData.category_id !== null ? formData.category_id.toString() : 'none'}
              onValueChange={(value) => handleInputChange('category_id', value === 'none' ? null : parseInt(value))}
              aria-labelledby="budget-category-label"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Period */}
          <div className="space-y-2">
            <Label htmlFor="period" id="budget-period-label">Budget Period</Label>
            <Select
              value={formData.period}
              onValueChange={handlePeriodChange}
              aria-labelledby="budget-period-label"
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.start_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.start_date ? format(new Date(formData.start_date), "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.start_date ? new Date(formData.start_date) : undefined}
                  onSelect={(date) => handleStartDateChange(date ? date.toISOString().split('T')[0] : '')}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* End Date Display */}
          {formData.end_date && (
            <div className="space-y-2">
              <Label>End Date</Label>
              <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded border">
                {format(new Date(formData.end_date), "PPP")}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1 min-h-[44px]">
              {isLoading ? 'Saving...' : (budget ? 'Update' : 'Create')}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="min-h-[44px]">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}; 