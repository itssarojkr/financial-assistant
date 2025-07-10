import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, TrendingUp, DollarSign, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotificationSettings {
  taxReminders: boolean;
  expenseTracking: boolean;
  financialInsights: boolean;
  budgetAlerts: boolean;
  marketUpdates: boolean;
  weeklyReports: boolean;
  monthlyReports: boolean;
  customReminders: boolean;
}

interface MobileNotificationSettingsProps {
  userId?: string;
}

export const MobileNotificationSettings: React.FC<MobileNotificationSettingsProps> = ({ userId }) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSettings>({
    taxReminders: true,
    expenseTracking: true,
    financialInsights: true,
    budgetAlerts: true,
    marketUpdates: false,
    weeklyReports: true,
    monthlyReports: true,
    customReminders: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  // Check notification permission on mount
  useEffect(() => {
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = Notification.permission;
      setHasPermission(permission === 'granted');
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setHasPermission(permission === 'granted');
        
        if (permission === 'granted') {
          toast({
            title: "Notifications enabled",
            description: "You'll now receive important financial reminders and updates.",
          });
        } else {
          toast({
            title: "Notifications disabled",
            description: "You can enable notifications later in your device settings.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        toast({
          title: "Permission error",
          description: "Unable to request notification permission.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const saveSettings = async () => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save notification settings.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated.",
      });
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast({
        title: "Error saving settings",
        description: "Unable to save notification preferences.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testNotification = async () => {
    if (!hasPermission) {
      toast({
        title: "Permission required",
        description: "Please enable notifications to test them.",
        variant: "destructive",
      });
      return;
    }

    try {
      new Notification('Financial Assistant', {
        body: 'This is a test notification from your financial assistant.',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      });
      
      toast({
        title: "Test notification sent",
        description: "Check your device for the test notification.",
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: "Test failed",
        description: "Unable to send test notification.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Permission Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Permissions
          </CardTitle>
          <CardDescription>
            Manage your notification preferences and permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="notification-permission">Device Notifications</Label>
              <Badge variant={hasPermission ? "default" : "secondary"}>
                {hasPermission ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            {!hasPermission && (
              <Button 
                size="sm" 
                onClick={requestNotificationPermission}
                className="flex items-center gap-2"
              >
                <Bell className="w-4 h-4" />
                Enable
              </Button>
            )}
          </div>
          
          {hasPermission && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={testNotification}
              className="w-full"
            >
              <Bell className="w-4 h-4 mr-2" />
              Send Test Notification
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Notification Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Categories</CardTitle>
          <CardDescription>
            Choose which types of notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {/* Tax Reminders */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <Label htmlFor="tax-reminders" className="font-medium">
                    Tax Reminders
                  </Label>
                  <p className="text-sm text-gray-500">
                    Important tax deadlines and filing reminders
                  </p>
                </div>
              </div>
              <Switch
                id="tax-reminders"
                checked={settings.taxReminders}
                onCheckedChange={(checked) => handleSettingChange('taxReminders', checked)}
              />
            </div>

            {/* Expense Tracking */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-green-600" />
                <div>
                  <Label htmlFor="expense-tracking" className="font-medium">
                    Expense Tracking
                  </Label>
                  <p className="text-sm text-gray-500">
                    Daily expense summaries and spending alerts
                  </p>
                </div>
              </div>
              <Switch
                id="expense-tracking"
                checked={settings.expenseTracking}
                onCheckedChange={(checked) => handleSettingChange('expenseTracking', checked)}
              />
            </div>

            {/* Financial Insights */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <div>
                  <Label htmlFor="financial-insights" className="font-medium">
                    Financial Insights
                  </Label>
                  <p className="text-sm text-gray-500">
                    Personalized financial tips and insights
                  </p>
                </div>
              </div>
              <Switch
                id="financial-insights"
                checked={settings.financialInsights}
                onCheckedChange={(checked) => handleSettingChange('financialInsights', checked)}
              />
            </div>

            {/* Budget Alerts */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <div>
                  <Label htmlFor="budget-alerts" className="font-medium">
                    Budget Alerts
                  </Label>
                  <p className="text-sm text-gray-500">
                    Budget limit warnings and overspending alerts
                  </p>
                </div>
              </div>
              <Switch
                id="budget-alerts"
                checked={settings.budgetAlerts}
                onCheckedChange={(checked) => handleSettingChange('budgetAlerts', checked)}
              />
            </div>

            {/* Market Updates */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                <div>
                  <Label htmlFor="market-updates" className="font-medium">
                    Market Updates
                  </Label>
                  <p className="text-sm text-gray-500">
                    Important market news and investment updates
                  </p>
                </div>
              </div>
              <Switch
                id="market-updates"
                checked={settings.marketUpdates}
                onCheckedChange={(checked) => handleSettingChange('marketUpdates', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Frequency */}
      <Card>
        <CardHeader>
          <CardTitle>Report Frequency</CardTitle>
          <CardDescription>
            Choose how often you want to receive financial reports
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {/* Weekly Reports */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">W</span>
                </div>
                <div>
                  <Label htmlFor="weekly-reports" className="font-medium">
                    Weekly Reports
                  </Label>
                  <p className="text-sm text-gray-500">
                    Weekly spending and savings summaries
                  </p>
                </div>
              </div>
              <Switch
                id="weekly-reports"
                checked={settings.weeklyReports}
                onCheckedChange={(checked) => handleSettingChange('weeklyReports', checked)}
              />
            </div>

            {/* Monthly Reports */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-green-600">M</span>
                </div>
                <div>
                  <Label htmlFor="monthly-reports" className="font-medium">
                    Monthly Reports
                  </Label>
                  <p className="text-sm text-gray-500">
                    Comprehensive monthly financial analysis
                  </p>
                </div>
              </div>
              <Switch
                id="monthly-reports"
                checked={settings.monthlyReports}
                onCheckedChange={(checked) => handleSettingChange('monthlyReports', checked)}
              />
            </div>

            {/* Custom Reminders */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-600" />
                <div>
                  <Label htmlFor="custom-reminders" className="font-medium">
                    Custom Reminders
                  </Label>
                  <p className="text-sm text-gray-500">
                    Personalized reminders for your financial goals
                  </p>
                </div>
              </div>
              <Switch
                id="custom-reminders"
                checked={settings.customReminders}
                onCheckedChange={(checked) => handleSettingChange('customReminders', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={() => setSettings({
            taxReminders: true,
            expenseTracking: true,
            financialInsights: true,
            budgetAlerts: true,
            marketUpdates: false,
            weeklyReports: true,
            monthlyReports: true,
            customReminders: false,
          })}
          className="flex-1"
        >
          Reset to Default
        </Button>
        <Button 
          onClick={saveSettings}
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-2">
            <Bell className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 mb-1">
                Notification Tips
              </p>
              <ul className="text-blue-700 space-y-1">
                <li>• Notifications help you stay on top of your finances</li>
                <li>• You can change these settings anytime</li>
                <li>• Tax reminders are especially important for compliance</li>
                <li>• Budget alerts help prevent overspending</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 