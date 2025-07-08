import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FolderOpen, Star, Calendar, DollarSign, TrendingUp, Loader2 } from 'lucide-react';
import { UserDataService } from '@/application/services/UserDataService';
import { useToast } from '@/hooks/use-toast';
import { TooltipProvider } from '@/components/ui/tooltip';

interface TaxCalculationData {
  country: string;
  currency: string;
  salary: number;
  netSalary: number;
  taxAmount: number;
  effectiveTaxRate: number;
  expenseData?: {
    rent: number;
    food: number;
    transport: number;
    utilities: number;
    healthcare: number;
    other: number;
    total: number;
  };
}

interface SavedCalculation {
  id: string;
  data_name: string;
  data_content: TaxCalculationData;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

interface LoadCalculationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (calculation: SavedCalculation) => void;
  userId: string;
}

export const LoadCalculationModal: React.FC<LoadCalculationModalProps> = ({
  isOpen,
  onClose,
  onLoad,
  userId
}) => {
  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadSavedCalculations = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await UserDataService.getTaxCalculations(userId);
      if (error) {
        console.error('Error loading saved calculations:', error);
        toast({
          title: "Error loading calculations",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setSavedCalculations(data || []);
      }
    } catch (error) {
      console.error('Error loading saved calculations:', error);
      toast({
        title: "Error loading calculations",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, toast]);

  useEffect(() => {
    if (isOpen) {
      loadSavedCalculations();
    }
  }, [isOpen, loadSavedCalculations]);

  const handleLoad = (calculation: SavedCalculation) => {
    onLoad(calculation);
    onClose();
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <TooltipProvider>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Load Saved Calculation
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Loading saved calculations...</span>
                </div>
              </div>
            ) : savedCalculations.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No saved calculations</h3>
                <p className="text-gray-500 mb-4">
                  You haven't saved any calculations yet. Complete a calculation and save it to load it later.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {savedCalculations.map((calculation) => {
                  const data = calculation.data_content;
                  return (
                    <Card 
                      key={calculation.id} 
                      className="cursor-pointer hover:bg-gray-50 transition-colors border-l-4 border-l-blue-500"
                      onClick={() => handleLoad(calculation)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <h3 className="font-semibold text-lg">{calculation.data_name}</h3>
                              {calculation.is_favorite && (
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              )}
                              <Badge variant="secondary" className="text-xs">
                                {data.country}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  Gross Salary
                                </p>
                                <p className="font-medium text-sm">
                                  {formatCurrency(data.salary || 0, data.currency || 'USD')}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" />
                                  Net Salary
                                </p>
                                <p className="font-medium text-sm text-green-600">
                                  {formatCurrency(data.netSalary || 0, data.currency || 'USD')}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Tax Amount</p>
                                <p className="font-medium text-sm text-red-600">
                                  {formatCurrency(data.taxAmount || 0, data.currency || 'USD')}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Tax Rate</p>
                                <p className="font-medium text-sm">
                                  {data.effectiveTaxRate ? `${data.effectiveTaxRate.toFixed(1)}%` : 'N/A'}
                                </p>
                              </div>
                            </div>

                            {data.expenseData && (
                              <div className="bg-gray-50 p-3 rounded-lg mb-3">
                                <p className="text-xs font-medium text-gray-700 mb-2">Living Expenses</p>
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                  <div>
                                    <span className="text-gray-500">Rent:</span>
                                    <span className="ml-1 font-medium">
                                      {formatCurrency(data.expenseData.rent || 0, data.currency || 'USD')}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Food:</span>
                                    <span className="ml-1 font-medium">
                                      {formatCurrency(data.expenseData.food || 0, data.currency || 'USD')}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Transport:</span>
                                    <span className="ml-1 font-medium">
                                      {formatCurrency(data.expenseData.transport || 0, data.currency || 'USD')}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              <span>Saved on {new Date(calculation.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <Button variant="ghost" size="sm" className="ml-4">
                            Load
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  );
}; 