import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  MapPin,
  CreditCard,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';
import { ExpenseForm } from './ExpenseForm';
import { ExpenseService } from '@/application/services/ExpenseService';
import type { ExpenseCategory } from '@/core/domain/enums/ExpenseCategory';
import { OptimizedExpenseService, type Expense, type CreateExpenseData } from '@/infrastructure/services/OptimizedExpenseService';

interface ExpenseListProps {
  expenses: Expense[];
  categories: ExpenseCategory[];
  onExpenseUpdate: () => void;
  userId: string;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  categories,
  onExpenseUpdate,
  userId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = 
      expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.amount.toString().includes(searchTerm);
    
    const matchesCategory = categoryFilter === 'all' || 
      expense.category_id?.toString() === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleAddExpense = async (expenseData: CreateExpenseData) => {
    try {
      await OptimizedExpenseService.getInstance().createExpense(userId, expenseData);
      setIsAddDialogOpen(false);
      onExpenseUpdate();
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense. Please try again.');
    }
  };

  const handleEditExpense = async (expenseData: CreateExpenseData) => {
    if (!editingExpense) return;
    
    try {
      await OptimizedExpenseService.getInstance().updateExpense(editingExpense.id, expenseData);
      setEditingExpense(null);
      onExpenseUpdate();
    } catch (error) {
      console.error('Error updating expense:', error);
      alert('Failed to update expense. Please try again.');
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      await OptimizedExpenseService.getInstance().deleteExpense(expenseId);
      onExpenseUpdate();
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense. Please try again.');
    }
  };

  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return 'Uncategorized';
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  const getCategoryColor = (categoryId: number | null) => {
    if (!categoryId) return 'bg-gray-100 text-gray-800';
    const category = categories.find(c => c.id === categoryId);
    return category?.color ? `bg-${category.color}-100 text-${category.color}-800` : 'bg-blue-100 text-blue-800';
  };

  const getSourceIcon = (source: string | null) => {
    switch (source) {
      case 'credit_card':
        return <CreditCard className="w-4 h-4" />;
      case 'cash':
        return <DollarSign className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  try {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Expenses
              </CardTitle>
              <CardDescription>
                {filteredExpenses.length} expenses • Total: {totalAmount.toFixed(2)}
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Expense</DialogTitle>
                </DialogHeader>
                <ExpenseForm
                  onSave={handleAddExpense}
                  onCancel={() => setIsAddDialogOpen(false)}
                  userId={userId}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Expenses Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No expenses found
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {format(new Date(expense.date), 'MMM dd, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {expense.description || 'No description'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getCategoryColor(expense.category_id)}>
                        {getCategoryName(expense.category_id)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {expense.location && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="w-3 h-3" />
                          {expense.location}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getSourceIcon(expense.source)}
                        <span className="text-sm capitalize">
                          {expense.source?.replace('_', ' ') || 'Not specified'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {expense.currency} {expense.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingExpense(expense)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Expense</DialogTitle>
                            </DialogHeader>
                            <ExpenseForm
                              expense={expense}
                              onSave={handleEditExpense}
                              onCancel={() => setEditingExpense(null)}
                              userId={userId}
                            />
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
    );
  } catch (error) {
    console.error('Error rendering ExpenseList:', error);
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading Expenses</CardTitle>
          <CardDescription>
            There was an error loading the expenses. Please try refreshing the page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.reload()} variant="outline">
            Refresh Page
          </Button>
        </CardContent>
      </Card>
    );
  }
}; 