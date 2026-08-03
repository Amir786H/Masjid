import { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { syncPendingActions } from '../services/offlineService';
import { getCurrentSession, supabase } from '../services/supabaseClient';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state on app load
  useEffect(() => {
    const initAuth = async () => {
      try {
        const session = await getCurrentSession();
        setSession(session);
        if (session?.user) {
          setUser(session.user);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError('Failed to initialize authentication');
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const runSync = async () => {
      try {
        await syncPendingActions();
      } catch (error) {
        console.warn('Offline sync failed during app startup.', error);
      }
    };
    runSync();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    try {
      setError(null);
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) throw signUpError;

      // Create user profile in public.users table when the schema is available.
      // If the table is missing the full_name column or the schema cache is stale,
      // we still allow sign-up to complete and keep the name in auth metadata.
      if (data.user) {
        try {
          const { error: profileError } = await supabase
            .from('users')
            .insert([
              {
                id: data.user.id,
                email,
                full_name: fullName,
              },
            ]);

          if (profileError) {
            const message = profileError.message.toLowerCase();

            if (
              message.includes('full_name') ||
              message.includes('column') ||
              message.includes('does not exist') ||
              message.includes('schema cache')
            ) {
              console.warn('Profile insert skipped due to users table schema mismatch:', profileError.message);
            } else {
              console.warn('Profile insert failed:', profileError.message);
            }
          }
        } catch (profileInsertError: any) {
          console.warn('Profile insert error:', profileInsertError?.message || profileInsertError);
        }
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      setError(null);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSession(null);
      setUser(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
      setError(null);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'masjidapp://reset-password',
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        error,
        signUp,
        signIn,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  // console.log('context', context);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
