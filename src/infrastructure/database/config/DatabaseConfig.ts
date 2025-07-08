/**
 * Database configuration class
 * 
 * This class manages database connection settings and environment variables
 * for the Supabase client configuration.
 */

export interface DatabaseConfigOptions {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
  auth?: {
    autoRefreshToken?: boolean;
    persistSession?: boolean;
    detectSessionInUrl?: boolean;
  };
  realtime?: {
    params?: {
      eventsPerSecond?: number;
    };
  };
  global?: {
    headers?: Record<string, string>;
  };
}

/**
 * Database configuration manager
 */
export class DatabaseConfig {
  private static instance: DatabaseConfig;
  private config: DatabaseConfigOptions;

  private constructor() {
    this.config = this.loadConfig();
  }

  /**
   * Gets the singleton instance of DatabaseConfig
   */
  static getInstance(): DatabaseConfig {
    if (!DatabaseConfig.instance) {
      DatabaseConfig.instance = new DatabaseConfig();
    }
    return DatabaseConfig.instance;
  }

  /**
   * Gets the current database configuration
   */
  getConfig(): DatabaseConfigOptions {
    return { ...this.config };
  }

  /**
   * Gets the Supabase URL
   */
  getUrl(): string {
    return this.config.url;
  }

  /**
   * Gets the anonymous key
   */
  getAnonKey(): string {
    return this.config.anonKey;
  }

  /**
   * Gets the service role key (if available)
   */
  getServiceRoleKey(): string | undefined {
    return this.config.serviceRoleKey;
  }

  /**
   * Validates the configuration
   */
  validate(): void {
    if (!this.config.url) {
      throw new Error('Database URL is required');
    }

    if (!this.config.anonKey) {
      throw new Error('Database anonymous key is required');
    }

    if (!this.isValidUrl(this.config.url)) {
      throw new Error('Invalid database URL format');
    }
  }

  /**
   * Loads configuration from environment variables
   */
  private loadConfig(): DatabaseConfigOptions {
    const url = this.getRequiredEnvVar('VITE_SUPABASE_URL');
    const anonKey = this.getRequiredEnvVar('VITE_SUPABASE_ANON_KEY');
    const serviceRoleKey = this.getOptionalEnvVar('VITE_SUPABASE_SERVICE_ROLE_KEY');

    return {
      url,
      anonKey,
      serviceRoleKey,
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
      global: {
        headers: {
          'X-Client-Info': 'financial-assistant-web',
        },
      },
    };
  }

  /**
   * Gets a required environment variable
   */
  private getRequiredEnvVar(name: string): string {
    const value = import.meta.env[name];
    if (!value) {
      throw new Error(`Required environment variable ${name} is not set`);
    }
    return value;
  }

  /**
   * Gets an optional environment variable
   */
  private getOptionalEnvVar(name: string): string | undefined {
    return import.meta.env[name];
  }

  /**
   * Validates URL format
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Checks if running in development mode
   */
  isDevelopment(): boolean {
    return import.meta.env.DEV;
  }

  /**
   * Checks if running in production mode
   */
  isProduction(): boolean {
    return import.meta.env.PROD;
  }

  /**
   * Gets the current environment name
   */
  getEnvironment(): string {
    return import.meta.env.MODE || 'development';
  }
} 