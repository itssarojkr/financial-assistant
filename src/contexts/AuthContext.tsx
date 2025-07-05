import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError, PostgrestError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData?: Partial<UserProfile>) => Promise<{ error: AuthError | PostgrestError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: AuthError | PostgrestError | null }>;
  refreshSession: () => Promise<void>;
}

interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData?: Partial<UserProfile>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });

    if (error) {
      return { error };
    }

    // The trigger should automatically create the profile, but we'll try as a fallback
    if (data.user) {
      try {
        const profileData: TablesInsert<'profiles'> = {
          id: data.user.id,
          email: data.user.email!,
          first_name: userData?.first_name || null,
          last_name: userData?.last_name || null,
          avatar_url: userData?.avatar_url || null,
        };

        const { error: profileError } = await supabase
          .from('profiles')
          .insert([profileData]);

        if (profileError) {
          console.warn('Profile creation failed (this is usually handled by the trigger):', profileError);
          // Don't fail the signup if profile creation fails
          // The trigger should handle this automatically
        }
      } catch (err) {
        console.warn('Profile creation error (this is usually handled by the trigger):', err);
        // Don't fail the signup if profile creation fails
      }
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    return { error };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({
      password,
    });

    return { error };
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { error: { message: 'No user logged in' } as AuthError };
    }

    const profileUpdates: TablesUpdate<'profiles'> = {
      first_name: updates.first_name || null,
      last_name: updates.last_name || null,
      avatar_url: updates.avatar_url || null,
    };

    const { error } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', user.id);

    return { error };
  };

  const refreshSession = async () => {
    const { data, error } = await supabase.auth.refreshSession();
    if (!error && data.session) {
      setSession(data.session);
      setUser(data.session.user);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 