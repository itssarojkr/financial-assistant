import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Bell, Plus, Save, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { ERROR } from '@/shared/constants/app.constants';
import { AlertService } from '@/application/services/AlertService';
import { ExpenseService } from '@/application/services/ExpenseService';
import { OptimizedExpenseService } from '@/infrastructure/services/OptimizedExpenseService';

interface AlertFormProps {
  alert?: {
    id: string;
    category_id: number | null;
    threshold: number;
    period: string;
    active: boolean;
  };
  onSave: (alert: { category_id: number | null; threshold: number; period: string; active: boolean }) => Promise<void>;
  onCancel: () => void;
  userId: string;
}

export const AlertForm: React.FC<AlertFormProps> = ({
  alert,
  onSave,
  onCancel,
  userId,
}) => {
  const [categories, setCategories] = useState<Array<{ id: number; name: string; icon: string | null; color: string | null }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [formData, setFormData] = useState<{
    category_id: number | null;
    threshold: number;
    period: string;
    active: boolean;
  }>({
    category_id: alert?.category_id || null,
    threshold: alert?.threshold || 0,
    period: alert?.period || 'monthly',
    active: alert?.active ?? true,
  });
  const thresholdRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (thresholdRef.current) {
      thresholdRef.current.focus();
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
        title: 'Alert saved',
        description: 'Your alert has been saved successfully.',
      });
    } catch (err: unknown) {
      const message = (typeof err === 'object' && err && 'message' in err) ? (err as { message?: string }).message : undefined;
      setError(message || ERROR.MESSAGES.GENERIC);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: 'category_id' | 'threshold' | 'period' | 'active', value: string | number | boolean | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {alert ? <Save className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
          {alert ? 'Edit Alert' : 'Create Alert'}
        </CardTitle>
        <CardDescription>
          {alert ? 'Update your spending alert' : 'Set up a new spending alert'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" role="form" aria-labelledby="alert-form-title" tabIndex={0}>
          {error && (
            <Alert variant="destructive" id="alert-error" aria-live="assertive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" id="alert-category-label">Category</Label>
            <Select
              value={formData.category_id !== null ? formData.category_id.toString() : 'none'}
              onValueChange={(value) => handleInputChange('category_id', value === 'none' ? null : parseInt(value))}
              aria-labelledby="alert-category-label"
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

          {/* Threshold */}
          <div className="space-y-2">
            <Label htmlFor="threshold" id="alert-threshold-label">Spending Threshold</Label>
            <Input
              id="threshold"
              ref={thresholdRef}
              type="number"
              step="0.01"
              min="0"
              value={formData.threshold}
              onChange={(e) => handleInputChange('threshold', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              required
              aria-describedby={error ? 'alert-error' : undefined}
              aria-invalid={!!error}
              aria-labelledby="alert-threshold-label"
              style={{ minHeight: '44px' }}
            />
            <p className="text-sm text-gray-500">
              You'll be notified when spending exceeds this amount
            </p>
          </div>

          {/* Period */}
          <div className="space-y-2">
            <Label htmlFor="period" id="alert-period-label">Alert Period</Label>
            <Select
              value={formData.period}
              onValueChange={(value) => handleInputChange('period', value)}
              aria-labelledby="alert-period-label"
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="space-y-0.5">
              <Label htmlFor="active" id="alert-active-label">Active</Label>
              <p className="text-sm text-gray-500">
                Enable or disable this alert
              </p>
            </div>
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => handleInputChange('active', checked)}
              aria-labelledby="alert-active-label"
              style={{ minHeight: '44px', minWidth: '44px' }}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1 min-h-[44px]">
              {isLoading ? 'Saving...' : (alert ? 'Update' : 'Create')}
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