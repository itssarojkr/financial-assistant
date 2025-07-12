
export interface UserPreferences {
  userId: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  currency: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  smsScanning: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateUserPreferencesParams = Omit<UserPreferences, 'createdAt' | 'updatedAt'>;
export type UpdateUserPreferencesParams = Partial<Omit<UserPreferences, 'userId' | 'createdAt'>>;
