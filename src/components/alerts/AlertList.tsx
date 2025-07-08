import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Bell, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { AlertForm } from './AlertForm';
import { AlertService } from '@/application/services/AlertService';
import { useToast } from '@/hooks/use-toast';

interface AlertListProps {
  alerts: SpendingAlert[];
  onAlertUpdate: () => void;
  userId: string;
}

export const AlertList: React.FC<AlertListProps> = ({
  alerts,
  onAlertUpdate,
  userId,
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<SpendingAlert | null>(null);
  const { toast } = useToast();

  const handleAddAlert = async (alertData: CreateAlertData) => {
    try {
      await AlertService.createAlert(userId, alertData);
      setIsAddDialogOpen(false);
      onAlertUpdate();
      toast({ title: 'Alert added', description: 'Your alert has been added successfully.' });
    } catch (error: unknown) {
      const message = (typeof error === 'object' && error && 'message' in error) ? (error as { message?: string }).message : undefined;
      toast({ title: 'Error adding alert', description: message || 'Failed to add alert.', variant: 'destructive' });
    }
  };

  const handleEditAlert = async (alertData: CreateAlertData) => {
    if (!editingAlert) return;
    try {
      await AlertService.updateAlert(editingAlert.id, alertData);
      setEditingAlert(null);
      onAlertUpdate();
      toast({ title: 'Alert updated', description: 'Your alert has been updated successfully.' });
    } catch (error: unknown) {
      const message = (typeof error === 'object' && error && 'message' in error) ? (error as { message?: string }).message : undefined;
      toast({ title: 'Error updating alert', description: message || 'Failed to update alert.', variant: 'destructive' });
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    if (!confirm('Are you sure you want to delete this alert?')) return;
    try {
      await AlertService.deleteAlert(alertId);
      onAlertUpdate();
      toast({ title: 'Alert deleted', description: 'Your alert has been deleted.' });
    } catch (error: unknown) {
      const message = (typeof error === 'object' && error && 'message' in error) ? (error as { message?: string }).message : undefined;
      toast({ title: 'Error deleting alert', description: message || 'Failed to delete alert.', variant: 'destructive' });
    }
  };

  const handleToggleActive = async (alertId: string, active: boolean) => {
    try {
      await AlertService.updateAlert(alertId, { active });
      onAlertUpdate();
      toast({ title: 'Alert status updated', description: 'Alert status has been updated.' });
    } catch (error: unknown) {
      const message = (typeof error === 'object' && error && 'message' in error) ? (error as { message?: string }).message : undefined;
      toast({ title: 'Error updating alert status', description: message || 'Failed to update alert status.', variant: 'destructive' });
    }
  };

  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return 'All Categories';
    // This would need to be passed from parent or fetched
    return 'Category'; // Placeholder
  };

  const getPeriodLabel = (period: string) => {
    const labels: Record<string, string> = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      yearly: 'Yearly',
    };
    return labels[period] || period;
  };

  const activeAlerts = alerts.filter(alert => alert.active);
  const inactiveAlerts = alerts.filter(alert => !alert.active);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-600" />
              Spending Alerts
            </CardTitle>
            <CardDescription>
              {alerts.length} alerts • {activeAlerts.length} active
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Alert
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Alert</DialogTitle>
              </DialogHeader>
              <AlertForm
                onSave={handleAddAlert}
                onCancel={() => setIsAddDialogOpen(false)}
                userId={userId}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Alerts Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Threshold</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No alerts found. Create your first spending alert to get notified.
                  </TableCell>
                </TableRow>
              ) : (
                alerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {alert.category_id ? (
                          <Badge variant="secondary">
                            {getCategoryName(alert.category_id)}
                          </Badge>
                        ) : (
                          <Badge variant="outline">All Categories</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {alert.threshold.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{getPeriodLabel(alert.period)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {alert.active ? (
                          <Badge variant="default" className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Inactive
                          </Badge>
                        )}
                        <Switch
                          checked={alert.active}
                          onCheckedChange={(checked) => handleToggleActive(alert.id, checked)}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingAlert(alert)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Alert</DialogTitle>
                            </DialogHeader>
                            <AlertForm
                              alert={alert}
                              onSave={handleEditAlert}
                              onCancel={() => setEditingAlert(null)}
                              userId={userId}
                            />
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAlert(alert.id)}
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
}; 