// Supabase Client Configuration
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const expoExtra = Constants.expoConfig?.extra as {
  EXPO_PUBLIC_SUPABASE_URL?: string;
  EXPO_PUBLIC_SUPABASE_ANON_KEY?: string;
} | undefined;

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  expoExtra?.EXPO_PUBLIC_SUPABASE_URL ||
  '';
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  expoExtra?.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase credentials. Define EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in a .env file or app config, then restart Expo.'
  );
}

const storage =
  Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage
    ? {
        getItem: async (key: string) => window.localStorage.getItem(key),
        setItem: async (key: string, value: string) => {
          window.localStorage.setItem(key, value);
        },
        removeItem: async (key: string) => {
          window.localStorage.removeItem(key);
        },
      }
    : AsyncStorage;

// Create Supabase client with platform-appropriate storage for session persistence.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper to get current user
export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

// Helper to get current session
export const getCurrentSession = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
};
