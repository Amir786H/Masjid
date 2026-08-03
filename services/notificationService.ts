import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { upsertPushToken } from './databaseService';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const getProjectId = () =>
  Constants.easConfig?.projectId ||
  (Constants.expoConfig?.extra as { eas?: { projectId?: string }; EXPO_PUBLIC_EAS_PROJECT_ID?: string } | undefined)
    ?.eas?.projectId ||
  (Constants.expoConfig?.extra as { EXPO_PUBLIC_EAS_PROJECT_ID?: string } | undefined)
    ?.EXPO_PUBLIC_EAS_PROJECT_ID;

export async function registerForPushNotifications(userId: string) {
  if (Platform.OS === 'web') {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const existingPermission = await Notifications.getPermissionsAsync();
  const existingPermissionCompat = existingPermission as unknown as {
    status?: string;
    granted?: boolean;
    ios?: { status?: number };
  };
  const permissionGranted =
    existingPermissionCompat.granted === true ||
    existingPermissionCompat.status === 'granted' ||
    existingPermissionCompat.ios?.status === 2;
  const finalPermission = permissionGranted
    ? existingPermission
    : await Notifications.requestPermissionsAsync();

  const finalPermissionCompat = finalPermission as unknown as {
    status?: string;
    granted?: boolean;
    ios?: { status?: number };
  };
  const finalGranted =
    finalPermissionCompat.granted === true ||
    finalPermissionCompat.status === 'granted' ||
    finalPermissionCompat.ios?.status === 2;
  if (!finalGranted) {
    return null;
  }

  const projectId = getProjectId();
  console.log('Project ID:', projectId);
  const token = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
  await upsertPushToken(userId, token.data, Platform.OS);
  return token.data;
}

export function subscribeToNotificationResponses(onNavigate: (url: string) => void) {
  const handleResponse = (response: Notifications.NotificationResponse | null) => {
    const url = response?.notification.request.content.data?.url;
    console.log('Notification response received with URL:', url);
    if (typeof url === 'string' && url.length > 0) {
      onNavigate(url);
    }
  };

  Notifications.getLastNotificationResponseAsync()
    .then(handleResponse)
    .catch((error) => console.warn('Unable to read last notification response', error));

  const subscription = Notifications.addNotificationResponseReceivedListener(handleResponse);
  return () => subscription.remove();
}
