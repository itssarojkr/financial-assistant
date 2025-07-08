import { LocalNotifications, ScheduleOptions, Channel } from '@capacitor/local-notifications';

export class MobileNotificationService {
  private static instance: MobileNotificationService;
  private isInitialized = false;

  static getInstance(): MobileNotificationService {
    if (!MobileNotificationService.instance) {
      MobileNotificationService.instance = new MobileNotificationService();
    }
    return MobileNotificationService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    await LocalNotifications.requestPermissions();
    // Create channels (Android)
    await LocalNotifications.createChannel({
      id: 'budget-alerts',
      name: 'Budget Alerts',
      description: 'Notifications for budget limits',
      importance: 4,
      sound: 'default',
      visibility: 1,
      lights: true,
      vibration: true,
    } as Channel);
    await LocalNotifications.createChannel({
      id: 'expense-reminders',
      name: 'Expense Reminders',
      description: 'Daily reminders to log expenses',
      importance: 3,
      sound: 'default',
      visibility: 1,
      lights: true,
      vibration: true,
    } as Channel);
    await LocalNotifications.createChannel({
      id: 'tax-reminders',
      name: 'Tax Reminders',
      description: 'Tax deadline notifications',
      importance: 2,
      sound: 'default',
      visibility: 1,
      lights: true,
      vibration: true,
    } as Channel);
    this.isInitialized = true;
  }

  async sendImmediateNotification(title: string, body: string, channelId: string = 'budget-alerts') {
    await this.initialize();
    await LocalNotifications.schedule({
      notifications: [
        {
          title,
          body,
          id: Date.now(),
          channelId,
          schedule: { at: new Date() },
          sound: 'default',
        },
      ],
    });
  }

  async scheduleDailyExpenseReminder(hour: number, minute: number = 0) {
    await this.initialize();
    await LocalNotifications.schedule({
      notifications: [
        {
          title: 'Daily Expense Reminder',
          body: 'Don\'t forget to log your expenses today!',
          id: 1001,
          channelId: 'expense-reminders',
          schedule: {
            repeats: true,
            on: { hour, minute },
          },
          sound: 'default',
        },
      ],
    });
  }

  async scheduleWeeklyBudgetReview(dayOfWeek: number, hour: number = 9) {
    await this.initialize();
    await LocalNotifications.schedule({
      notifications: [
        {
          title: 'Weekly Budget Review',
          body: 'Review your budget and spending for the week.',
          id: 1002,
          channelId: 'budget-alerts',
          schedule: {
            repeats: true,
            on: { weekday: dayOfWeek, hour },
          },
          sound: 'default',
        },
      ],
    });
  }

  async cancelAllNotifications() {
    await this.initialize();
    await LocalNotifications.cancel({ notifications: [] });
  }
}

export const mobileNotificationService = MobileNotificationService.getInstance(); 