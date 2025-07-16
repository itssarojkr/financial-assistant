/**
 * UserPreferences - Value object representing user preferences
 * 
 * This encapsulates user preference data with validation and business rules.
 */

export interface UserPreferencesProps {
  userId: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  currency: string;
  taxRegime?: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  smsScanning: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserPreferencesParams {
  userId: string;
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  currency?: string;
  taxRegime?: string;
  notifications?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  smsScanning?: boolean;
}

export interface UpdateUserPreferencesParams {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  currency?: string;
  taxRegime?: string;
  notifications?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  smsScanning?: boolean;
}

/**
 * UserPreferences value object with validation
 */
export class UserPreferences {
  private readonly _userId: string;
  private readonly _theme: 'light' | 'dark' | 'system';
  private readonly _language: string;
  private readonly _currency: string;
  private readonly _taxRegime: string;
  private readonly _notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  private readonly _smsScanning: boolean;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  constructor(props: UserPreferencesProps) {
    this.validatePreferencesProps(props);
    
    this._userId = props.userId;
    this._theme = props.theme;
    this._language = props.language;
    this._currency = props.currency;
    this._taxRegime = props.taxRegime || 'new';
    this._notifications = props.notifications;
    this._smsScanning = props.smsScanning;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  /**
   * Creates a new UserPreferences instance
   */
  static create(params: CreateUserPreferencesParams): UserPreferences {
    const now = new Date();
    
    return new UserPreferences({
      userId: params.userId,
      theme: params.theme || 'system',
      language: params.language || 'en',
      currency: params.currency || 'USD',
      taxRegime: params.taxRegime || 'new',
      notifications: params.notifications || {
        email: true,
        push: true,
        sms: false,
      },
      smsScanning: params.smsScanning || false,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Updates preferences with new data
   */
  update(params: UpdateUserPreferencesParams): UserPreferences {
    return new UserPreferences({
      userId: this._userId,
      theme: params.theme ?? this._theme,
      language: params.language ?? this._language,
      currency: params.currency ?? this._currency,
      taxRegime: params.taxRegime ?? this._taxRegime,
      notifications: params.notifications ?? this._notifications,
      smsScanning: params.smsScanning ?? this._smsScanning,
      createdAt: this._createdAt,
      updatedAt: new Date(),
    });
  }

  /**
   * Checks if SMS scanning is enabled
   */
  isSmsScanningEnabled(): boolean {
    return this._smsScanning;
  }

  /**
   * Checks if email notifications are enabled
   */
  isEmailNotificationsEnabled(): boolean {
    return this._notifications.email;
  }

  /**
   * Checks if push notifications are enabled
   */
  isPushNotificationsEnabled(): boolean {
    return this._notifications.push;
  }

  /**
   * Checks if SMS notifications are enabled
   */
  isSmsNotificationsEnabled(): boolean {
    return this._notifications.sms;
  }

  /**
   * Gets the user's preferred theme
   */
  getTheme(): 'light' | 'dark' | 'system' {
    return this._theme;
  }

  /**
   * Gets the user's preferred language
   */
  getLanguage(): string {
    return this._language;
  }

  /**
   * Gets the user's preferred currency
   */
  getCurrency(): string {
    return this._currency;
  }

  /**
   * Gets the user's tax regime preference
   */
  getTaxRegime(): string {
    return this._taxRegime;
  }

  // Validation methods
  private validatePreferencesProps(props: UserPreferencesProps): void {
    if (!props.userId || props.userId.trim().length === 0) {
      throw new Error('User ID is required');
    }

    if (!['light', 'dark', 'system'].includes(props.theme)) {
      throw new Error('Invalid theme value');
    }

    if (!props.language || props.language.trim().length === 0) {
      throw new Error('Language is required');
    }

    if (!props.currency || props.currency.trim().length === 0) {
      throw new Error('Currency is required');
    }

    if (!props.notifications) {
      throw new Error('Notifications configuration is required');
    }

    if (props.createdAt > props.updatedAt) {
      throw new Error('Created date cannot be after updated date');
    }
  }

  // Getters
  get userId(): string { return this._userId; }
  get theme(): 'light' | 'dark' | 'system' { return this._theme; }
  get language(): string { return this._language; }
  get currency(): string { return this._currency; }
  get taxRegime(): string { return this._taxRegime; }
  get notifications(): { email: boolean; push: boolean; sms: boolean } { 
    return { ...this._notifications }; 
  }
  get smsScanning(): boolean { return this._smsScanning; }
  get createdAt(): Date { return new Date(this._createdAt); }
  get updatedAt(): Date { return new Date(this._updatedAt); }

  /**
   * Converts to plain object for serialization
   */
  toJSON(): UserPreferencesProps {
    return {
      userId: this._userId,
      theme: this._theme,
      language: this._language,
      currency: this._currency,
      taxRegime: this._taxRegime,
      notifications: { ...this._notifications },
      smsScanning: this._smsScanning,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  /**
   * Creates UserPreferences from JSON data
   */
  static fromJSON(data: unknown): UserPreferences {
    const d = data as Record<string, unknown>;
    return new UserPreferences({
      userId: d.userId as string,
      theme: d.theme as 'light' | 'dark' | 'system',
      language: d.language as string,
      currency: d.currency as string,
      taxRegime: d.taxRegime as string,
      notifications: d.notifications as { email: boolean; push: boolean; sms: boolean },
      smsScanning: d.smsScanning as boolean,
      createdAt: new Date(d.createdAt as string),
      updatedAt: new Date(d.updatedAt as string),
    });
  }
}
