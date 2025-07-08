import { supabase } from '@/integrations/supabase/client';
import { apiRateLimit } from '@/lib/security-utils';

interface ApiOptions {
  skipRateLimit?: boolean;
  retries?: number;
  timeout?: number;
}

interface ApiError {
  message: string;
  code?: string | number;
  details?: string;
}

interface CalculationData {
  user_id: string;
  country: string;
  salary: number;
  tax_amount: number;
  net_salary: number;
  calculation_data: Record<string, unknown>;
  created_at?: string;
}

/**
 * SecureApiClient for handling API operations with security and reliability features
 * 
 * This client provides rate limiting, retry logic, timeout handling, and secure
 * database operations through Supabase.
 */
export class SecureApiClient {
  private static readonly DEFAULT_TIMEOUT = 10000; // 10 seconds
  private static readonly DEFAULT_RETRIES = 3;

  /**
   * Execute a database query with error handling and retry logic
   */
  static async executeQuery<T>(
    queryFn: () => Promise<{ data: T | null; error: ApiError | null }>,
    context: string,
    options: ApiOptions = {}
  ): Promise<{ data: T | null; error: ApiError | null }> {
    const { skipRateLimit = false, retries = this.DEFAULT_RETRIES, timeout = this.DEFAULT_TIMEOUT } = options;

    // Rate limiting check
    if (!skipRateLimit) {
      const rateLimitKey = `${context}_${Date.now()}`;
      if (!apiRateLimit.isAllowed(rateLimitKey)) {
        return {
          data: null,
          error: { message: 'Rate limit exceeded. Please try again later.' }
        };
      }
    }

    // Timeout wrapper
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeout);
    });

    let lastError: ApiError | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const result = await Promise.race([queryFn(), timeoutPromise]);
        
        if (result.error) {
          lastError = result.error;
          
          // Don't retry on auth errors or client errors
          if (result.error.message?.includes('auth') || 
              result.error.code?.toString().startsWith('4')) {
            break;
          }
          
          // Retry on network errors or server errors
          if (attempt < retries) {
            await this.sleep(1000 * attempt); // Exponential backoff
            continue;
          }
        }
        
        return result;
      } catch (error) {
        lastError = error as ApiError;
        
        if (attempt < retries) {
          await this.sleep(1000 * attempt);
          continue;
        }
      }
    }

    return {
      data: null,
      error: lastError || { message: 'Unknown error occurred' }
    };
  }

  /**
   * Sleep utility for retry delays
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get all countries
   */
  static async getCountries() {
    return this.executeQuery(
      async () => {
        const result = await supabase.from('countries').select('*').order('name');
        return { data: result.data, error: result.error };
      },
      'get_countries'
    );
  }

  /**
   * Get states for a specific country
   */
  static async getStates(countryId: string) {
    return this.executeQuery(
      async () => {
        const result = await supabase.from('states')
          .select('*')
          .eq('country_id', parseInt(countryId))
          .order('name');
        return { data: result.data, error: result.error };
      },
      'get_states'
    );
  }

  /**
   * Get cities for a specific state
   */
  static async getCities(stateId: string) {
    return this.executeQuery(
      async () => {
        const result = await supabase.from('cities')
          .select('*')
          .eq('state_id', parseInt(stateId))
          .order('name');
        return { data: result.data, error: result.error };
      },
      'get_cities'
    );
  }

  /**
   * Get localities for a specific city
   */
  static async getLocalities(cityId: string) {
    return this.executeQuery(
      async () => {
        const result = await supabase.from('localities')
          .select('*')
          .eq('city_id', parseInt(cityId))
          .order('name');
        return { data: result.data, error: result.error };
      },
      'get_localities'
    );
  }

  /**
   * Save user data (replaces tax brackets and salary calculations)
   */
  static async saveUserData(userData: unknown) {
    return this.executeQuery(
      async () => {
        const result = await supabase.from('user_data').insert([userData]);
        return { data: result.data, error: result.error };
      },
      'save_user_data'
    );
  }

  /**
   * Get user data for a specific user
   */
  static async getUserData(userId: string) {
    return this.executeQuery(
      async () => {
        const result = await supabase.from('user_data')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        return { data: result.data, error: result.error };
      },
      'get_user_data'
    );
  }
} 