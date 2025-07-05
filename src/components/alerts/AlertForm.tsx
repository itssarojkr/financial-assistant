import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Bell, Plus, Save, X } from 'lucide-react';
import { AlertService, ExpenseService, type CreateAlertData, type ExpenseCategory } from '@/services';

interface AlertFormProps {
  alert?: {
    id: string;
    category_id: number | null;
    threshold: number;
    period: string;
    active: boolean;
  };
  onSave: (alert: CreateAlertData) => Promise<void>;
  onCancel: () => void;
  userId: string;
}

export const AlertForm: React.FC<AlertFormProps> = ({
  alert,
  onSave,
  onCancel,
  userId,
}) => {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateAlertData>({
    category_id: alert?.category_id || null,
    threshold: alert?.threshold || 0,
    period: alert?.period || 'monthly',
    active: alert?.active ?? true,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const categoriesData = await ExpenseService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving alert:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateAlertData, value: string | number | boolean | null) => {
    setFormData(prev => ({
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
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category_id !== null ? formData.category_id.toString() : 'none'}
              onValueChange={(value) => handleInputChange('category_id', value === 'none' ? null : parseInt(value))}
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
            <Label htmlFor="threshold">Spending Threshold</Label>
            <Input
              id="threshold"
              type="number"
              step="0.01"
              min="0"
              value={formData.threshold}
              onChange={(e) => handleInputChange('threshold', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              required
            />
            <p className="text-sm text-gray-500">
              You'll be notified when spending exceeds this amount
            </p>
          </div>

          {/* Period */}
          <div className="space-y-2">
            <Label htmlFor="period">Alert Period</Label>
            <Select
              value={formData.period}
              onValueChange={(value) => handleInputChange('period', value)}
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
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="active">Active</Label>
              <p className="text-sm text-gray-500">
                Enable or disable this alert
              </p>
            </div>
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => handleInputChange('active', checked)}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Saving...' : (alert ? 'Update' : 'Create')}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}; 