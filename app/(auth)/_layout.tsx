import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
      <Stack initialRouteName="splash">
        <Stack.Screen
          name="splash"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="sign-in"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="sign-up"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="forgot-password"
          options={{ headerShown: false }}
        />
      </Stack>
  );
}
