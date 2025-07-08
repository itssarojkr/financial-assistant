import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Upload, Receipt } from 'lucide-react';
import { CameraService, ReceiptData } from '@/infrastructure/services/mobile/CameraService';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MobileExpenseFormProps {
  onSubmit: (expense: unknown) => void;
  onCancel: () => void;
  categories: string[];
}

export const MobileExpenseForm: React.FC<MobileExpenseFormProps> = ({
  onSubmit,
  onCancel,
  categories
}) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState<Partial<ReceiptData> | null>(null);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTakePhoto = async () => {
    try {
      setIsLoading(true);
      const cameraService = CameraService.getInstance();
      const receiptData = await cameraService.takeReceiptPhoto();
      if (receiptData) {
        setReceipt(receiptData);
        toast({
          title: "Receipt captured",
          description: "Receipt photo taken successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to take receipt photo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFromGallery = async () => {
    try {
      setIsLoading(true);
      const cameraService = CameraService.getInstance();
      const receiptData = await cameraService.selectReceiptFromGallery();
      if (receiptData) {
        setReceipt(receiptData);
        toast({
          title: "Receipt selected",
          description: "Receipt selected from gallery",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to select receipt from gallery",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtractReceiptData = async () => {
    if (!receipt) return;
    setOcrLoading(true);
    setOcrResult(null);
    try {
      const cameraService = CameraService.getInstance();
      const result = await cameraService.extractReceiptData(receipt.imageUrl);
      setOcrResult(result);
      toast({
        title: 'Receipt data extracted',
        description: 'Review and apply extracted fields below.',
      });
    } catch (error) {
      toast({
        title: 'OCR Error',
        description: 'Failed to extract data from receipt.',
        variant: 'destructive',
      });
    } finally {
      setOcrLoading(false);
    }
  };

  const handleApplyOcrData = () => {
    if (!ocrResult) return;
    setFormData(prev => ({
      ...prev,
      description: ocrResult.merchant || prev.description,
      amount: ocrResult.amount ? ocrResult.amount.toString() : prev.amount,
      date: ocrResult.date ? new Date(ocrResult.date).toISOString().split('T')[0] : prev.date,
      category: ocrResult.category || prev.category,
      notes: ocrResult.notes || prev.notes,
    }));
    toast({
      title: 'Extracted data applied',
      description: 'Form fields updated from receipt.',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount || !formData.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const expense = {
      ...formData,
      amount: parseFloat(formData.amount),
      receipt: receipt,
      createdAt: new Date().toISOString()
    };

    onSubmit(expense);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Add Expense
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Receipt Section */}
          <div className="space-y-2">
            <Label>Receipt (Optional)</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTakePhoto}
                disabled={isLoading}
                className="flex-1"
              >
                <Camera className="h-4 w-4 mr-2" />
                Camera
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectFromGallery}
                disabled={isLoading}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                Gallery
              </Button>
            </div>
            {receipt && (
              <div className="text-sm text-green-600 flex items-center gap-2 mt-1">
                ✓ Receipt attached
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={handleExtractReceiptData}
                  disabled={ocrLoading}
                  className="ml-2"
                  aria-label="Extract data from receipt"
                >
                  {ocrLoading ? (
                    <span className="animate-pulse">Extracting...</span>
                  ) : (
                    'Extract Data from Receipt'
                  )}
                </Button>
              </div>
            )}
            {ocrResult && (
              <Alert className="mt-2 bg-blue-50 border-blue-200">
                <AlertDescription>
                  <div className="font-semibold mb-1">Extracted Data:</div>
                  <ul className="text-sm space-y-1">
                    {ocrResult.merchant && <li><b>Merchant:</b> {ocrResult.merchant}</li>}
                    {ocrResult.amount && <li><b>Amount:</b> {ocrResult.amount}</li>}
                    {ocrResult.date && <li><b>Date:</b> {new Date(ocrResult.date).toLocaleDateString()}</li>}
                    {ocrResult.category && <li><b>Category:</b> {ocrResult.category}</li>}
                    {ocrResult.notes && <li><b>Notes:</b> {ocrResult.notes}</li>}
                  </ul>
                  <Button
                    type="button"
                    size="sm"
                    variant="default"
                    onClick={handleApplyOcrData}
                    className="mt-2"
                  >
                    Apply to Form
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="What did you spend on?"
              required
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Expense'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}; 