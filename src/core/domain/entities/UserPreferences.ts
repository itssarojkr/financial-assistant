/**
 * UserPreferences - Value object representing user preferences and settings
 * 
 * This encapsulates user preferences with validation and business rules.
 */

export interface UserPreferencesProps {
  currency?: string;
  taxRegime?: 'old' | 'new';
  language?: string;
  timezone?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  privacy?: {
    shareAnalytics?: boolean;
    shareData?: boolean;
  };
  display?: {
    theme?: 'light' | 'dark' | 'auto';
    compactMode?: boolean;
  };
}

export interface CreateUserPreferencesParams {
  currency?: string;
  taxRegime?: 'old' | 'new';
  language?: string;
  timezone?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  privacy?: {
    shareAnalytics?: boolean;
    shareData?: boolean;
  };
  display?: {
    theme?: 'light' | 'dark' | 'auto';
    compactMode?: boolean;
  };
}

/**
 * UserPreferences value object with validation
 */
export class UserPreferences {
  private readonly _currency: string;
  private readonly _taxRegime: 'old' | 'new';
  private readonly _language: string;
  private readonly _timezone: string;
  private readonly _notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  private readonly _privacy: {
    shareAnalytics: boolean;
    shareData: boolean;
  };
  private readonly _display: {
    theme: 'light' | 'dark' | 'auto';
    compactMode: boolean;
  };

  constructor(props: UserPreferencesProps) {
    this.validatePreferencesProps(props);
    
    this._currency = props.currency || 'USD';
    this._taxRegime = props.taxRegime || 'new';
    this._language = props.language || 'en';
    this._timezone = props.timezone || 'UTC';
    this._notifications = {
      email: props.notifications?.email ?? true,
      push: props.notifications?.push ?? true,
      sms: props.notifications?.sms ?? false,
    };
    this._privacy = {
      shareAnalytics: props.privacy?.shareAnalytics ?? false,
      shareData: props.privacy?.shareData ?? false,
    };
    this._display = {
      theme: props.display?.theme || 'auto',
      compactMode: props.display?.compactMode ?? false,
    };
  }

  /**
   * Creates a new UserPreferences instance
   */
  static create(params: CreateUserPreferencesParams): UserPreferences {
    return new UserPreferences(params);
  }

  /**
   * Updates preferences with new data
   */
  update(params: Partial<UserPreferencesProps>): UserPreferences {
    return new UserPreferences({
      currency: params.currency ?? this._currency,
      taxRegime: params.taxRegime ?? this._taxRegime,
      language: params.language ?? this._language,
      timezone: params.timezone ?? this._timezone,
      notifications: {
        email: params.notifications?.email ?? this._notifications.email,
        push: params.notifications?.push ?? this._notifications.push,
        sms: params.notifications?.sms ?? this._notifications.sms,
      },
      privacy: {
        shareAnalytics: params.privacy?.shareAnalytics ?? this._privacy.shareAnalytics,
        shareData: params.privacy?.shareData ?? this._privacy.shareData,
      },
      display: {
        theme: params.display?.theme ?? this._display.theme,
        compactMode: params.display?.compactMode ?? this._display.compactMode,
      },
    });
  }

  /**
   * Checks if notifications are enabled for a specific type
   */
  isNotificationEnabled(type: 'email' | 'push' | 'sms'): boolean {
    return this._notifications[type];
  }

  /**
   * Checks if analytics sharing is enabled
   */
  isAnalyticsSharingEnabled(): boolean {
    return this._privacy.shareAnalytics;
  }

  /**
   * Checks if data sharing is enabled
   */
  isDataSharingEnabled(): boolean {
    return this._privacy.shareData;
  }

  /**
   * Gets the current theme
   */
  getTheme(): 'light' | 'dark' | 'auto' {
    return this._display.theme;
  }

  /**
   * Checks if compact mode is enabled
   */
  isCompactMode(): boolean {
    return this._display.compactMode;
  }

  // Validation methods
  private validatePreferencesProps(props: UserPreferencesProps): void {
    if (props.currency && !this.isValidCurrency(props.currency)) {
      throw new Error('Invalid currency code');
    }

    if (props.taxRegime && !['old', 'new'].includes(props.taxRegime)) {
      throw new Error('Invalid tax regime');
    }

    if (props.language && !this.isValidLanguage(props.language)) {
      throw new Error('Invalid language code');
    }

    if (props.display?.theme && !['light', 'dark', 'auto'].includes(props.display.theme)) {
      throw new Error('Invalid theme');
    }
  }

  private isValidCurrency(currency: string): boolean {
    const validCurrencies = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'BRL', 'ZAR'];
    return validCurrencies.includes(currency.toUpperCase());
  }

  private isValidLanguage(language: string): boolean {
    const validLanguages = ['en', 'es', 'fr', 'de', 'hi', 'pt', 'zh'];
    return validLanguages.includes(language.toLowerCase());
  }

  // Getters
  get currency(): string { return this._currency; }
  get taxRegime(): 'old' | 'new' { return this._taxRegime; }
  get language(): string { return this._language; }
  get timezone(): string { return this._timezone; }
  get notifications() { return { ...this._notifications }; }
  get privacy() { return { ...this._privacy }; }
  get display() { return { ...this._display }; }

  /**
   * Converts to plain object for serialization
   */
  toJSON(): UserPreferencesProps {
    return {
      currency: this._currency,
      taxRegime: this._taxRegime,
      language: this._language,
      timezone: this._timezone,
      notifications: this._notifications,
      privacy: this._privacy,
      display: this._display,
    };
  }

  /**
   * Creates UserPreferences from JSON data
   */
  static fromJSON(data: UserPreferencesProps): UserPreferences {
    return new UserPreferences(data);
  }
} 