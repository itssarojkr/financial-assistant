import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Clock, AlertTriangle, Calendar } from 'lucide-react';
import { mobileNotificationService } from '@/infrastructure/services/mobile/MobileNotificationService';
import { useToast } from '@/hooks/use-toast';

interface NotificationSettings {
  budgetAlerts: boolean;
  expenseReminders: boolean;
  taxReminders: boolean;
  weeklyReviews: boolean;
  dailyReminderTime: string;
  weeklyReviewDay: string;
  budgetWarningThreshold: number;
}

export const MobileNotificationSettings: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    budgetAlerts: true,
    expenseReminders: true,
    taxReminders: true,
    weeklyReviews: true,
    dailyReminderTime: '20:00',
    weeklyReviewDay: '0', // Sunday
    budgetWarningThreshold: 80
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load settings from local storage or preferences
      const savedSettings = localStorage.getItem('notificationSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      setIsLoading(true);
      
      // Save to local storage
      localStorage.setItem('notificationSettings', JSON.stringify(settings));
      
      // Update notification schedules
      await updateNotificationSchedules();
      
      toast({
        title: "Settings saved",
        description: "Notification settings updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notification settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateNotificationSchedules = async () => {
    try {
      // Cancel existing notifications
      await mobileNotificationService.cancelAllNotifications();
      
      // Schedule new notifications based on settings
      if (settings.expenseReminders) {
        const [hour, minute] = settings.dailyReminderTime.split(':');
        await mobileNotificationService.scheduleDailyExpenseReminder(parseInt(hour), parseInt(minute));
      }
      
      if (settings.weeklyReviews) {
        const dayOfWeek = parseInt(settings.weeklyReviewDay);
        await mobileNotificationService.scheduleWeeklyBudgetReview(dayOfWeek, 9);
      }
    } catch (error) {
      console.error('Failed to update notification schedules:', error);
    }
  };

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleTimeChange = (value: string) => {
    setSettings(prev => ({
      ...prev,
      dailyReminderTime: value
    }));
  };

  const handleDayChange = (value: string) => {
    setSettings(prev => ({
      ...prev,
      weeklyReviewDay: value
    }));
  };

  const handleThresholdChange = (value: string) => {
    setSettings(prev => ({
      ...prev,
      budgetWarningThreshold: parseInt(value)
    }));
  };

  const testNotification = async () => {
    try {
      await mobileNotificationService.sendImmediateNotification(
        'Test Notification',
        'This is a test notification from Financial Assistant',
        'budget-alerts'
      );
      toast({
        title: "Test notification sent",
        description: "Check your notification panel",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test notification",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Budget Alerts */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Budget Alerts
              </Label>
              <p className="text-sm text-muted-foreground">
                Get notified when you're close to or exceed your budget
              </p>
            </div>
            <Switch
              checked={settings.budgetAlerts}
              onCheckedChange={() => handleToggle('budgetAlerts')}
            />
          </div>

          {/* Expense Reminders */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Daily Expense Reminders
              </Label>
              <p className="text-sm text-muted-foreground">
                Daily reminders to log your expenses
              </p>
            </div>
            <Switch
              checked={settings.expenseReminders}
              onCheckedChange={() => handleToggle('expenseReminders')}
            />
          </div>

          {/* Tax Reminders */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Tax Reminders
              </Label>
              <p className="text-sm text-muted-foreground">
                Important tax-related reminders and deadlines
              </p>
            </div>
            <Switch
              checked={settings.taxReminders}
              onCheckedChange={() => handleToggle('taxReminders')}
            />
          </div>

          {/* Weekly Reviews */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Weekly Budget Reviews
              </Label>
              <p className="text-sm text-muted-foreground">
                Weekly reminders to review your spending
              </p>
            </div>
            <Switch
              checked={settings.weeklyReviews}
              onCheckedChange={() => handleToggle('weeklyReviews')}
            />
          </div>

          {/* Daily Reminder Time */}
          {settings.expenseReminders && (
            <div className="space-y-2">
              <Label>Daily Reminder Time</Label>
              <Select value={settings.dailyReminderTime} onValueChange={handleTimeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="08:00">8:00 AM</SelectItem>
                  <SelectItem value="12:00">12:00 PM</SelectItem>
                  <SelectItem value="18:00">6:00 PM</SelectItem>
                  <SelectItem value="20:00">8:00 PM</SelectItem>
                  <SelectItem value="22:00">10:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Weekly Review Day */}
          {settings.weeklyReviews && (
            <div className="space-y-2">
              <Label>Weekly Review Day</Label>
              <Select value={settings.weeklyReviewDay} onValueChange={handleDayChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Sunday</SelectItem>
                  <SelectItem value="1">Monday</SelectItem>
                  <SelectItem value="2">Tuesday</SelectItem>
                  <SelectItem value="3">Wednesday</SelectItem>
                  <SelectItem value="4">Thursday</SelectItem>
                  <SelectItem value="5">Friday</SelectItem>
                  <SelectItem value="6">Saturday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Budget Warning Threshold */}
          {settings.budgetAlerts && (
            <div className="space-y-2">
              <Label>Budget Warning Threshold (%)</Label>
              <Select 
                value={settings.budgetWarningThreshold.toString()} 
                onValueChange={handleThresholdChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="70">70%</SelectItem>
                  <SelectItem value="80">80%</SelectItem>
                  <SelectItem value="90">90%</SelectItem>
                  <SelectItem value="95">95%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={testNotification}
              className="flex-1"
            >
              Test Notification
            </Button>
            <Button
              onClick={saveSettings}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 