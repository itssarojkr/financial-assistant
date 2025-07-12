
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  Bell, 
  Settings, 
  Plus,
  Trash2,
  Edit
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AlertService, CreateAlertData, SpendingAlert } from '@/application/services/AlertService';
import { PostgrestError } from '@supabase/supabase-js';

interface AlertListProps {
  onCreateAlert: (alert: CreateAlertData) => void;
}

export function AlertList({ onCreateAlert }: AlertListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<SpendingAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAlerts();
    }
  }, [user]);

  const loadAlerts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await AlertService.getUserAlerts(user.id);
      if (error) {
        toast({
          title: "Error loading alerts",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setAlerts((data as unknown) as SpendingAlert[] || []);
      }
    } catch (error) {
      toast({
        title: "Error loading alerts",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async (alertData: CreateAlertData) => {
    if (!user) return;

    try {
      const { error } = await AlertService.createAlert(alertData);
      if (error) throw error;
      
      toast({
        title: "Alert created",
        description: "Your spending alert has been set up successfully.",
      });
      
      loadAlerts();
      onCreateAlert(alertData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: "Error creating alert",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    try {
      const { error } = await AlertService.deleteAlert(alertId);
      if (error) throw error;
      
      toast({
        title: "Alert deleted",
        description: "The alert has been removed.",
      });
      
      loadAlerts();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: "Error deleting alert",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Bell className="w-4 h-4" />;
      case 'low': return <Settings className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const activeAlerts = alerts.filter(alert => alert.active);

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please sign in to manage alerts.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Spending Alerts</h2>
        <Button onClick={() => handleCreateAlert({
          userId: user.id,
          type: 'spending',
          title: 'New Alert',
          message: 'New spending alert created'
        })}>
          <Plus className="w-4 h-4 mr-2" />
          Create Alert
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">
            Active Alerts ({activeAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All Alerts ({alerts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading alerts...</p>
            </div>
          ) : activeAlerts.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Active Alerts</h3>
                <p className="text-muted-foreground mb-4">
                  Set up spending alerts to monitor your expenses and stay within budget.
                </p>
                <Button onClick={() => handleCreateAlert({
                  userId: user.id,
                  type: 'spending',
                  title: 'First Alert',
                  message: 'Your first spending alert'
                })}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Alert
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeAlerts.map((alert) => (
                <Card key={alert.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="flex items-center gap-2">
                      {getSeverityIcon(alert.severity || 'medium')}
                      <span className="capitalize">{alert.type} Alert</span>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(alert.severity || 'medium')}>
                        {alert.severity || 'Medium'}
                      </Badge>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteAlert(alert.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Threshold:</span>
                        <span className="font-medium">
                          {alert.currency} {alert.threshold.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Period:</span>
                        <span className="capitalize">{alert.period}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <Badge variant={alert.active ? "default" : "secondary"}>
                          {alert.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading alerts...</p>
            </div>
          ) : alerts.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Alerts Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first spending alert to get started.
                </p>
                <Button onClick={() => handleCreateAlert({
                  userId: user.id,
                  type: 'spending',
                  title: 'First Alert',
                  message: 'Your first spending alert'
                })}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Alert
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {alerts.map((alert) => (
                <Card key={alert.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="flex items-center gap-2">
                      {getSeverityIcon(alert.severity || 'medium')}
                      <span className="capitalize">{alert.type} Alert</span>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(alert.severity || 'medium')}>
                        {alert.severity || 'Medium'}
                      </Badge>
                      <Badge variant={alert.active ? "default" : "secondary"}>
                        {alert.active ? "Active" : "Inactive"}
                      </Badge>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteAlert(alert.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Threshold:</span>
                        <span className="font-medium">
                          {alert.currency} {alert.threshold.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Period:</span>
                        <span className="capitalize">{alert.period}</span>
                      </div>
                      {alert.created_at && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Created:</span>
                          <span>{new Date(alert.created_at).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
