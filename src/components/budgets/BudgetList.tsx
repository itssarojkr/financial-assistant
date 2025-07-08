import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Target, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  TrendingUp,
  AlertTriangle,
  Calculator
} from 'lucide-react';
import { format } from 'date-fns';
import { BudgetForm } from './BudgetForm';
import { BudgetService } from '@/application/services/BudgetService';

interface BudgetListProps {
  budgets: Budget[];
  budgetProgress: BudgetProgress[];
  onBudgetUpdate: () => void;
  userId: string;
  onEditInCalculator?: (budget: Budget) => void;
}

export const BudgetList: React.FC<BudgetListProps> = ({
  budgets,
  budgetProgress,
  onBudgetUpdate,
  userId,
  onEditInCalculator,
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const handleAddBudget = async (budgetData: CreateBudgetData) => {
    try {
      await BudgetService.createBudget(userId, budgetData);
      setIsAddDialogOpen(false);
      onBudgetUpdate();
    } catch (error) {
      console.error('Error adding budget:', error);
    }
  };

  const handleEditBudget = async (budgetData: CreateBudgetData) => {
    if (!editingBudget) return;
    
    try {
      await BudgetService.updateBudget(editingBudget.id, budgetData);
      setEditingBudget(null);
      onBudgetUpdate();
    } catch (error) {
      console.error('Error updating budget:', error);
      alert('Failed to update budget. Please try again.');
    }
  };

  const handleDeleteBudget = async (budgetId: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;
    
    try {
      await BudgetService.deleteBudget(budgetId);
      onBudgetUpdate();
    } catch (error) {
      console.error('Error deleting budget:', error);
      alert('Failed to delete budget. Please try again.');
    }
  };

  const getBudgetProgress = (budgetId: string) => {
    return budgetProgress.find(progress => progress.budget_id === budgetId);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    if (percentage >= 60) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getProgressTextColor = (percentage: number) => {
    if (percentage >= 100) return 'text-red-600';
    if (percentage >= 80) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-green-600';
  };

  const totalBudgetAmount = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpentAmount = budgetProgress.reduce((sum, progress) => sum + progress.spent_amount, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Budgets
            </CardTitle>
            <CardDescription>
              {budgets.length} budgets • Total: {totalBudgetAmount.toFixed(2)} • Spent: {totalSpentAmount.toFixed(2)}
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Budget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Budget</DialogTitle>
              </DialogHeader>
              <BudgetForm
                onSave={handleAddBudget}
                onCancel={() => setIsAddDialogOpen(false)}
                userId={userId}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Budgets Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No budgets found. Create your first budget to start tracking expenses.
                  </TableCell>
                </TableRow>
              ) : (
                budgets.map((budget) => {
                  const progress = getBudgetProgress(budget.id);
                  const percentage = progress ? progress.percentage_used : 0;
                  const isOverBudget = progress ? progress.is_over_budget : false;

                  return (
                    <TableRow key={budget.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {budget.category ? (
                            <>
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: budget.category.color || '#6B7280' }}
                              />
                              <span>{budget.category.name}</span>
                            </>
                          ) : (
                            <Badge variant="secondary">All Categories</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {budget.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="capitalize">{budget.period}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span className={getProgressTextColor(percentage)}>
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                          <Progress 
                            value={Math.min(percentage, 100)} 
                            className="h-2"
                          />
                          {progress && (
                            <div className="text-xs text-gray-500">
                              {progress.spent_amount.toFixed(2)} / {progress.budget_amount.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {isOverBudget ? (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Over Budget
                            </Badge>
                          ) : percentage >= 80 ? (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              Warning
                            </Badge>
                          ) : (
                            <Badge variant="default" className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              On Track
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          {onEditInCalculator && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEditInCalculator(budget)}
                              title="Edit in Calculator"
                            >
                              <Calculator className="w-4 h-4" />
                            </Button>
                          )}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingBudget(budget)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Budget</DialogTitle>
                              </DialogHeader>
                              <BudgetForm
                                budget={budget}
                                onSave={handleEditBudget}
                                onCancel={() => setEditingBudget(null)}
                                userId={userId}
                              />
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteBudget(budget.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}; 