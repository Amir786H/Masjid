import { Amiri_400Regular, Amiri_700Bold } from '@expo-google-fonts/amiri';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider, useAuthContext } from '@/contexts/AuthContext';
import { registerForPushNotifications, subscribeToNotificationResponses } from '@/services/notificationService';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // Default to the auth stack until the restore state is known.
  initialRouteName: '(auth)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    Amiri_400Regular,
    Amiri_700Bold,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}

function RootNavigator() {
  const { session, loading } = useAuthContext();
  const router = useRouter();
  const initialRouteName = loading ? '(auth)' : session ? '(tabs)' : '(auth)';

  useEffect(() => {
    if (!session?.user?.id) {
      return;
    }

    registerForPushNotifications(session.user.id).catch((error) => {
      console.warn('Push notification registration failed', error);
    });
  }, [session?.user?.id]);

  useEffect(() => {
    return subscribeToNotificationResponses((url) => {
      console.log('Notification response received with URL:', url);
      if (typeof url === 'string' && url.length > 0) {
        router.push(url as any);
      }
    });
  }, [router]);

  return (
    <Stack
      key={session ? 'authenticated' : 'guest'}
      initialRouteName={initialRouteName}
    >
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="admin" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
