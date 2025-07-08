import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DatabaseConfig } from '../config/DatabaseConfig';

/**
 * Database connection manager
 * 
 * This class manages the Supabase client connection and provides
 * access to the database client throughout the application.
 */
export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private client: SupabaseClient | null = null;
  private config: DatabaseConfig;

  private constructor() {
    this.config = DatabaseConfig.getInstance();
  }

  /**
   * Gets the singleton instance of DatabaseConnection
   */
  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  /**
   * Initializes the database connection
   */
  async initialize(): Promise<void> {
    try {
      this.config.validate();
      
      const config = this.config.getConfig();
      this.client = createClient(config.url, config.anonKey, {
        auth: config.auth,
        realtime: config.realtime,
        global: config.global,
      });

      // Test the connection
      await this.testConnection();
      
      console.log('Database connection initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database connection:', error);
      throw new Error(`Database initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets the Supabase client instance
   */
  getClient(): SupabaseClient {
    if (!this.client) {
      throw new Error('Database connection not initialized. Call initialize() first.');
    }
    return this.client;
  }

  /**
   * Tests the database connection
   */
  private async testConnection(): Promise<void> {
    if (!this.client) {
      throw new Error('Client not initialized');
    }

    try {
      // Simple query to test connection
      const { error } = await this.client
        .from('users')
        .select('count', { count: 'exact', head: true });

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
    } catch (error) {
      throw new Error(`Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Closes the database connection
   */
  async close(): Promise<void> {
    try {
      if (this.client) {
        // Supabase client doesn't have a close method, but we can clean up
        this.client = null;
        console.log('Database connection closed');
      }
    } catch (error) {
      console.error('Error closing database connection:', error);
    }
  }

  /**
   * Checks if the connection is active
   */
  isConnected(): boolean {
    return this.client !== null;
  }

  /**
   * Gets connection status information
   */
  getConnectionStatus(): {
    connected: boolean;
    environment: string;
    url: string;
  } {
    return {
      connected: this.isConnected(),
      environment: this.config.getEnvironment(),
      url: this.config.getUrl(),
    };
  }

  /**
   * Reinitializes the connection
   */
  async reconnect(): Promise<void> {
    await this.close();
    await this.initialize();
  }
} 