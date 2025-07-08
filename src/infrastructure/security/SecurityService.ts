import { supabase } from '@/integrations/supabase/client';

/**
 * Security service for handling security-related operations
 * 
 * This service provides security utilities and operations
 * for the application.
 */
export class SecurityService {
  /**
   * Validates password strength
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Password must be at least 8 characters long');
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one uppercase letter');
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one lowercase letter');
    }

    // Number check
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one number');
    }

    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one special character');
    }

    return {
      isValid: score >= 4,
      score,
      feedback,
    };
  }

  /**
   * Checks if a password has been leaked
   */
  static async checkPasswordLeak(password: string): Promise<boolean> {
    try {
      // In a real implementation, this would check against a database of leaked passwords
      // For now, we'll use a simple check against common weak passwords
      const commonPasswords = [
        'password',
        '123456',
        '123456789',
        'qwerty',
        'abc123',
        'password123',
        'admin',
        'letmein',
        'welcome',
        'monkey',
      ];

      return commonPasswords.includes(password.toLowerCase());
    } catch (error) {
      console.error('Error checking password leak:', error);
      return false;
    }
  }

  /**
   * Generates a secure random token
   */
  static generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const randomArray = new Uint8Array(length);
    crypto.getRandomValues(randomArray);
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(randomArray[i] % chars.length);
    }
    
    return result;
  }

  /**
   * Hashes a password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    try {
      // In a real implementation, this would use a proper bcrypt library
      // For now, we'll use a simple hash function
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    } catch (error) {
      throw new Error('Failed to hash password');
    }
  }

  /**
   * Verifies a password against a hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      const passwordHash = await this.hashPassword(password);
      return passwordHash === hash;
    } catch (error) {
      return false;
    }
  }

  /**
   * Sanitizes user input to prevent XSS
   */
  static sanitizeInput(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Validates email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validates phone number format
   */
  static validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Checks if user session is valid
   */
  static async validateSession(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    } catch (error) {
      return false;
    }
  }

  /**
   * Logs security events
   */
  static async logSecurityEvent(
    event: string,
    userId?: string,
    details?: Record<string, unknown>
  ): Promise<void> {
    try {
      // TODO: Implement security logging when database table is available
      console.log('Security event:', { event, userId, details });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  /**
   * Gets user permissions
   */
  static async getUserPermissions(userId: string): Promise<string[]> {
    try {
      // TODO: Implement user permissions when database table is available
      return ['read', 'write']; // Default permissions
    } catch (error) {
      console.error('Failed to get user permissions:', error);
      return [];
    }
  }

  /**
   * Checks if user has specific permission
   */
  static async hasPermission(userId: string, permission: string): Promise<boolean> {
    try {
      const permissions = await this.getUserPermissions(userId);
      return permissions.includes(permission);
    } catch (error) {
      console.error('Failed to check permission:', error);
      return false;
    }
  }
} 