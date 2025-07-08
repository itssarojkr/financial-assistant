import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { OptimizedExpenseService, type CreateExpenseData } from '@/infrastructure/services/OptimizedExpenseService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { ERROR } from '@/shared/constants/app.constants';

interface ExpenseFormProps {
  expense?: {
    id: string;
    amount: number;
    currency: string;
    date: string;
    description: string | null;
    location: string | null;
    source: string | null;
    category_id: number | null;
  };
  onSave: (expense: CreateExpenseData) => Promise<void>;
  onCancel: () => void;
  userId: string;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  expense,
  onSave,
  onCancel,
  userId,
}) => {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateExpenseData>({
    amount: expense?.amount || 0,
    currency: expense?.currency || 'USD',
    date: expense?.date || new Date().toISOString().split('T')[0],
    description: expense?.description || '',
    location: expense?.location || '',
    source: expense?.source || '',
    category_id: expense?.category_id || null,
  });
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const amountRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
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

  // Debug logging
  console.log('ExpenseForm render - isLoading:', isLoading);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await onSave(formData);
      toast({
        title: 'Expense saved',
        description: 'Your expense has been saved successfully.',
      });
    } catch (err: unknown) {
      const message = (typeof err === 'object' && err && 'message' in err) ? (err as { message?: string }).message : undefined;
      setError(message || ERROR.MESSAGES.GENERIC);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateExpenseData, value: string | number | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2" id="expense-form-title">
          {expense ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {expense ? 'Edit Expense' : 'Add Expense'}
        </CardTitle>
        <CardDescription>
          {expense ? 'Update your expense details' : 'Enter the details of your expense'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" role="form" aria-labelledby="expense-form-title" tabIndex={0}>
          {error && (
            <Alert variant="destructive" id="expense-error" aria-live="assertive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" id="expense-amount-label">Amount</Label>
            <div className="flex gap-2 flex-col sm:flex-row">
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
                className="flex-1"
                aria-describedby={error ? 'expense-error' : undefined}
                aria-invalid={!!error}
                aria-labelledby="expense-amount-label"
                style={{ minHeight: '44px' }}
              />
              <Select
                value={formData.currency}
                onValueChange={(value) => handleInputChange('currency', value)}
                aria-label="Currency"
              >
                <SelectTrigger className="w-24 min-h-[44px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                  <SelectItem value="AUD">AUD</SelectItem>
                  <SelectItem value="INR">INR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" id="expense-category-label">Category</Label>
            <Select
              value={formData.category_id !== null ? formData.category_id.toString() : 'none'}
              onValueChange={(value) => handleInputChange('category_id', value === 'none' ? null : parseInt(value))}
              aria-labelledby="expense-category-label"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Category</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? format(new Date(formData.date), "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.date ? new Date(formData.date) : undefined}
                  onSelect={(date) => handleInputChange('date', date ? date.toISOString().split('T')[0] : '')}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="What was this expense for?"
              rows={3}
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location || ''}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Where did this happen?"
            />
          </div>

          {/* Source */}
          <div className="space-y-2">
            <Label htmlFor="source">Source</Label>
            <Select
              value={formData.source || 'not_specified'}
              onValueChange={(value) => handleInputChange('source', value === 'not_specified' ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="How did you pay?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not_specified">Not specified</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="debit_card">Debit Card</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="mobile_payment">Mobile Payment</SelectItem>
                <SelectItem value="check">Check</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="flex-1 min-h-[44px]"
            >
              {isLoading ? 'Saving...' : (expense ? 'Update' : 'Add')}
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