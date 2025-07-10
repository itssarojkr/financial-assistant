import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, MapPin, DollarSign, Tag, X, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExpenseData {
  id?: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  location?: string;
  receiptImage?: string;
  tags: string[];
  currency: string;
  isRecurring: boolean;
  recurringFrequency?: 'weekly' | 'monthly' | 'yearly';
}

interface MobileExpenseFormProps {
  onSave: (expense: ExpenseData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<ExpenseData>;
  userId?: string;
}

const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Housing',
  'Utilities',
  'Healthcare',
  'Entertainment',
  'Shopping',
  'Education',
  'Travel',
  'Insurance',
  'Taxes',
  'Other'
];

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
];

export const MobileExpenseForm: React.FC<MobileExpenseFormProps> = ({
  onSave,
  onCancel,
  initialData,
  userId
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [locationLoading, setLocationLoading] = useState(false);

  const [expense, setExpense] = useState<ExpenseData>({
    amount: initialData?.amount || 0,
    category: initialData?.category || 'Other',
    description: initialData?.description || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    location: initialData?.location || '',
    receiptImage: initialData?.receiptImage || '',
    tags: initialData?.tags || [],
    currency: initialData?.currency || 'USD',
    isRecurring: initialData?.isRecurring || false,
    recurringFrequency: initialData?.recurringFrequency || 'monthly',
  });

  const [newTag, setNewTag] = useState('');

  // Get current location on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Reverse geocoding would be implemented here
          setCurrentLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          setLocationLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationLoading(false);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    }
  }, []);

  const handleInputChange = (field: keyof ExpenseData, value: string | number | boolean | string[] | undefined) => {
    setExpense(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAmountChange = (value: string) => {
    const amount = parseFloat(value) || 0;
    handleInputChange('amount', amount);
  };

  const handleDateChange = (value: string) => {
    handleInputChange('date', value);
  };

  const handleCategoryChange = (value: string) => {
    handleInputChange('category', value);
  };

  const handleCurrencyChange = (value: string) => {
    handleInputChange('currency', value);
  };

  const handleDescriptionChange = (value: string) => {
    handleInputChange('description', value);
  };

  const handleLocationChange = (value: string) => {
    handleInputChange('location', value);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !expense.tags.includes(newTag.trim())) {
      handleInputChange('tags', [...expense.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange('tags', expense.tags.filter(tag => tag !== tagToRemove));
  };

  const handleRecurringToggle = () => {
    handleInputChange('isRecurring', !expense.isRecurring);
  };

  const handleRecurringFrequencyChange = (value: string) => {
    handleInputChange('recurringFrequency', value as 'weekly' | 'monthly' | 'yearly');
  };

  const handleCameraCapture = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({
        title: "Camera not available",
        description: "Camera access is not supported on this device.",
        variant: "destructive",
      });
      return;
    }

    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // In a real implementation, you would capture the image here
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate captured image
      const mockImageData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...';
      handleInputChange('receiptImage', mockImageData);
      
      toast({
        title: "Receipt captured",
        description: "Receipt image has been captured successfully.",
      });
    } catch (error) {
      console.error('Error capturing image:', error);
      toast({
        title: "Camera error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    } finally {
      setIsCapturing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        handleInputChange('receiptImage', result);
        toast({
          title: "Image uploaded",
          description: "Receipt image has been uploaded successfully.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseCurrentLocation = () => {
    if (currentLocation) {
      handleInputChange('location', currentLocation);
      toast({
        title: "Location set",
        description: "Current location has been set for this expense.",
      });
    }
  };

  const handleSave = async () => {
    if (!expense.amount || expense.amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid expense amount.",
        variant: "destructive",
      });
      return;
    }

    if (!expense.description.trim()) {
      toast({
        title: "Missing description",
        description: "Please enter a description for this expense.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onSave(expense);
      toast({
        title: "Expense saved",
        description: "Your expense has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving expense:', error);
      toast({
        title: "Error saving expense",
        description: "Unable to save expense. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrencySymbol = (currencyCode: string) => {
    const currency = CURRENCIES.find(c => c.code === currencyCode);
    return currency?.symbol || '$';
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Add Expense</h2>
          <p className="text-sm text-gray-500">Record a new expense with details</p>
        </div>
        <Button variant="outline" size="sm" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Amount Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Amount
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={expense.amount || ''}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0.00"
                className="text-lg font-semibold"
              />
            </div>
            <div className="w-24">
              <Label htmlFor="currency">Currency</Label>
              <Select value={expense.currency} onValueChange={handleCurrencyChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(currency => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category and Date */}
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={expense.category} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={expense.date}
                onChange={(e) => handleDateChange(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={expense.description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder="Enter expense description..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={expense.location}
              onChange={(e) => handleLocationChange(e.target.value)}
              placeholder="Enter location or use current location"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleUseCurrentLocation}
              disabled={locationLoading || !currentLocation}
            >
              {locationLoading ? (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
              ) : (
                <MapPin className="w-4 h-4" />
              )}
            </Button>
          </div>
          {currentLocation && (
            <div className="text-sm text-gray-500">
              Current location: {currentLocation}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Receipt Capture */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-purple-600" />
            Receipt
          </CardTitle>
          <CardDescription>
            Capture or upload a receipt image
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {expense.receiptImage ? (
            <div className="space-y-2">
              <div className="relative">
                <img
                  src={expense.receiptImage}
                  alt="Receipt"
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => handleInputChange('receiptImage', '')}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Check className="w-4 h-4" />
                Receipt captured
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Button
                onClick={handleCameraCapture}
                disabled={isCapturing}
                className="w-full"
                variant="outline"
              >
                {isCapturing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-2" />
                    Capturing...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 mr-2" />
                    Capture Receipt
                  </>
                )}
              </Button>
              
              <div className="relative">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                  variant="outline"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-orange-600" />
            Tags
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag..."
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
            />
            <Button onClick={handleAddTag} disabled={!newTag.trim()}>
              Add
            </Button>
          </div>
          
          {expense.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {expense.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recurring Expense */}
      <Card>
        <CardHeader>
          <CardTitle>Recurring Expense</CardTitle>
          <CardDescription>
            Mark this as a recurring expense
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="recurring">Recurring Expense</Label>
            <input
              id="recurring"
              type="checkbox"
              checked={expense.isRecurring}
              onChange={handleRecurringToggle}
              className="w-4 h-4"
            />
          </div>
          
          {expense.isRecurring && (
            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={expense.recurringFrequency || 'monthly'} onValueChange={handleRecurringFrequencyChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={isLoading || !expense.amount || !expense.description.trim()}
          className="flex-1"
        >
          {isLoading ? "Saving..." : "Save Expense"}
        </Button>
      </div>

      {/* Validation Info */}
      {(!expense.amount || expense.amount <= 0) && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          Please enter a valid amount
        </div>
      )}
      
      {!expense.description.trim() && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          Please enter a description
        </div>
      )}
    </div>
  );
}; 