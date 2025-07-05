
import { supabase } from '@/integrations/supabase/client';
import { apiRateLimit } from '@/lib/security-utils';

interface ApiOptions {
  skipRateLimit?: boolean;
  retries?: number;
  timeout?: number;
}

export class SecureApiClient {
  private static readonly DEFAULT_TIMEOUT = 10000; // 10 seconds
  private static readonly DEFAULT_RETRIES = 3;

  static async executeQuery<T>(
    queryFn: () => Promise<{ data: T | null; error: any }>,
    context: string,
    options: ApiOptions = {}
  ): Promise<{ data: T | null; error: any }> {
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

    let lastError: any;

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
        lastError = error;
        
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

  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Secure methods for common operations
  static async getCountries() {
    return this.executeQuery(
      () => supabase.from('countries').select('*').order('name'),
      'get_countries'
    );
  }

  static async getCities(countryId: string) {
    return this.executeQuery(
      () => supabase.from('cities')
        .select('*')
        .eq('country_id', countryId)
        .order('name'),
      'get_cities'
    );
  }

  static async getTaxBrackets(countryId: string) {
    return this.executeQuery(
      () => supabase.from('tax_brackets')
        .select('*')
        .eq('country_id', countryId)
        .order('min_income'),
      'get_tax_brackets'
    );
  }

  static async saveCalculation(calculation: any) {
    return this.executeQuery(
      () => supabase.from('salary_calculations').insert([calculation]),
      'save_calculation'
    );
  }

  static async getUserCalculations(userId: string) {
    return this.executeQuery(
      () => supabase.from('salary_calculations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      'get_user_calculations'
    );
  }
}
