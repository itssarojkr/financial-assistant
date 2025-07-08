import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Save, FileText, AlertTriangle } from 'lucide-react';
import { SalaryData, TaxData, ExpenseData } from '@/pages/Index';
import { TooltipProvider } from '@/components/ui/tooltip';

interface ExistingCalculation {
  id: string;
  data_name: string;
  data_content: {
    country: string;
    salary: number;
    currency: string;
    taxAmount: number;
    netSalary: number;
    expenseData?: {
      rent: number;
      utilities: number;
      food: number;
      transport: number;
      healthcare: number;
      other: number;
    };
  };
}

interface SaveCalculationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, isOverwrite: boolean, existingId?: string) => Promise<void>;
  existingCalculation?: ExistingCalculation;
  salaryData: SalaryData;
  taxData: TaxData;
  expenseData: ExpenseData;
}

export const SaveCalculationModal: React.FC<SaveCalculationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingCalculation,
  salaryData,
  taxData,
  expenseData
}) => {
  const [calculationName, setCalculationName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMode, setSaveMode] = useState<'new' | 'overwrite'>('new');

  const defaultName = `${salaryData.country} - ${salaryData.currency} ${salaryData.grossSalary.toLocaleString()} - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;

  React.useEffect(() => {
    if (isOpen) {
      setCalculationName(existingCalculation ? existingCalculation.data_name : defaultName);
      setSaveMode(existingCalculation ? 'overwrite' : 'new');
    }
  }, [isOpen, existingCalculation, defaultName]);

  const handleSave = async () => {
    if (!calculationName.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave(calculationName, saveMode === 'overwrite', existingCalculation?.id);
      onClose();
    } catch (error) {
      console.error('Error saving calculation:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = () => {
    if (!existingCalculation) return true;
    
    const existing = existingCalculation.data_content;
    return (
      existing.country !== salaryData.country ||
      existing.salary !== salaryData.grossSalary ||
      existing.currency !== salaryData.currency ||
      existing.taxAmount !== taxData.totalTax ||
      existing.netSalary !== taxData.takeHomeSalary ||
      existing.expenseData?.rent !== expenseData.rent ||
      existing.expenseData?.utilities !== expenseData.utilities ||
      existing.expenseData?.food !== expenseData.food ||
      existing.expenseData?.transport !== expenseData.transport ||
      existing.expenseData?.healthcare !== expenseData.healthcare ||
      existing.expenseData?.other !== expenseData.other
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <TooltipProvider>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Save className="w-5 h-5" />
              Save Calculation
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {existingCalculation && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-orange-800 mb-1">
                        Similar calculation found
                      </p>
                      <p className="text-orange-700">
                        A calculation with similar data already exists. Would you like to overwrite it or save as a new calculation?
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              <Label htmlFor="calculation-name">Calculation Name</Label>
              <Input
                id="calculation-name"
                value={calculationName}
                onChange={(e) => setCalculationName(e.target.value)}
                placeholder="Enter calculation name"
              />
            </div>

            {existingCalculation && (
              <div className="space-y-2">
                <Label>Save Option</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="overwrite"
                      name="saveMode"
                      value="overwrite"
                      checked={saveMode === 'overwrite'}
                      onChange={(e) => setSaveMode(e.target.value as 'new' | 'overwrite')}
                    />
                    <Label htmlFor="overwrite" className="text-sm">
                      Overwrite existing calculation
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="new"
                      name="saveMode"
                      value="new"
                      checked={saveMode === 'new'}
                      onChange={(e) => setSaveMode(e.target.value as 'new' | 'overwrite')}
                    />
                    <Label htmlFor="new" className="text-sm">
                      Save as new calculation
                    </Label>
                  </div>
                </div>
              </div>
            )}

            {!hasChanges() && (
              <Card className="border-gray-200 bg-gray-50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span>No changes detected. The calculation is already saved.</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={onClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isSaving || !calculationName.trim() || (!hasChanges() && !existingCalculation)}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  );
}; 