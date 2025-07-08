import { useState, useEffect, useCallback } from 'react';
import { useUserService } from './useUserService';
import { User } from '@/core/domain/entities/User';
import { SecurityService } from '@/infrastructure/security/SecurityService';
import { supabase } from '@/integrations/supabase/client';

/**
 * Authentication hook for managing user authentication state
 * 
 * This hook provides authentication functionality including
 * login, signup, logout, and password reset operations.
 */
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getUserById, createUser } = useUserService();

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  /**
   * Checks if user has an active session
   */
  const checkSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const isValid = await SecurityService.validateSession();
      if (isValid) {
        // Get current user from Supabase auth
        const { data: { user: authUser }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Error getting current user from auth:', error);
          return;
        }
        
        if (authUser) {
          // Get user data from database using the auth user ID
          const currentUser = await getUserById(authUser.id);
          if (currentUser) {
            setUser(currentUser);
          }
        }
      }
    } catch (err) {
      console.error('Session check failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getUserById]);

  /**
   * Logs in a user
   */
  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate input
      if (!SecurityService.validateEmail(email)) {
        throw new Error('Invalid email format');
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      // Check for password leak
      const isLeaked = await SecurityService.checkPasswordLeak(password);
      if (isLeaked) {
        throw new Error('This password has been compromised. Please choose a different password.');
      }

      // Authenticate user with Supabase
      const { data: { user: authUser }, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw new Error(error.message);
      }

      if (authUser) {
        // Get user data from database
        const authenticatedUser = await getUserById(authUser.id);
        if (authenticatedUser) {
          setUser(authenticatedUser);
          // Log security event
          await SecurityService.logSecurityEvent('user_login', authenticatedUser.id);
        }
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getUserById]);

  /**
   * Signs up a new user
   */
  const signup = useCallback(async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate input
      if (!SecurityService.validateEmail(email)) {
        throw new Error('Invalid email format');
      }

      const passwordValidation = SecurityService.validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        throw new Error(`Password requirements not met: ${passwordValidation.feedback.join(', ')}`);
      }

      // Check for password leak
      const isLeaked = await SecurityService.checkPasswordLeak(password);
      if (isLeaked) {
        throw new Error('This password has been compromised. Please choose a different password.');
      }

      // Create user with Supabase auth
      const { data: { user: authUser }, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        throw new Error(error.message);
      }

      if (authUser) {
        // Create user in database
        const newUser = await createUser(email, {
          firstName,
          lastName
        });
        setUser(newUser);

        // Log security event
        await SecurityService.logSecurityEvent('user_signup', newUser.id);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [createUser]);

  /**
   * Logs out the current user
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (user) {
        // Log security event
        await SecurityService.logSecurityEvent('user_logout', user.id);
      }

      // Clear user session from Supabase
      await supabase.auth.signOut();
      setUser(null);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Resets user password
   */
  const resetPassword = useCallback(async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate email
      if (!SecurityService.validateEmail(email)) {
        throw new Error('Invalid email format');
      }

      // Send password reset through Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        throw new Error(error.message);
      }

      // Log security event
      await SecurityService.logSecurityEvent('password_reset_requested', undefined, { email });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password reset failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Updates user profile
   */
  const updateProfile = useCallback(async (updates: Partial<User>) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user) {
        throw new Error('No user logged in');
      }

      // Update user profile in database
      const updatedUser = await getUserById(user.id);
      if (updatedUser) {
        // Apply updates to the user object
        Object.assign(updatedUser, updates);
        setUser(updatedUser);
      }

      // Log security event
      await SecurityService.logSecurityEvent('profile_updated', user.id);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Profile update failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getUserById, user]);

  /**
   * Changes user password
   */
  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user) {
        throw new Error('No user logged in');
      }

      // Validate new password
      const passwordValidation = SecurityService.validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        throw new Error(`Password requirements not met: ${passwordValidation.feedback.join(', ')}`);
      }

      // Check for password leak
      const isLeaked = await SecurityService.checkPasswordLeak(newPassword);
      if (isLeaked) {
        throw new Error('This password has been compromised. Please choose a different password.');
      }

      // Change password in Supabase
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw new Error(error.message);
      }

      // Log security event
      await SecurityService.logSecurityEvent('password_changed', user.id);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password change failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Clears the current error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    isLoading,
    error,
    login,
    signup,
    logout,
    resetPassword,
    updateProfile,
    changePassword,
    clearError,
    checkSession,
  };
}; 