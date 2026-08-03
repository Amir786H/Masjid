import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createCommunityPost,
  createMasjid,
  deleteMasjid,
  updateMasjid,
  upsertCustomPrayerTimes,
  queueNotificationEvent,
} from './databaseService';

const PENDING_ACTIONS_KEY = '@offline:pendingActions';

export const CACHE_KEYS = {
  masjids: '@cache:masjids',
  communityPosts: '@cache:communityPosts',
  userProfile: '@cache:userProfile',
  prayerTimes: '@cache:prayerTimes',
  donations: '@cache:donations',
  prayerReminders: '@cache:prayerReminders',
};

type OfflineActionType =
  | 'createMasjid'
  | 'updateMasjid'
  | 'deleteMasjid'
  | 'createCommunityPost'
  | 'upsertCustomPrayerTimes';

export interface OfflineAction {
  id: string;
  type: OfflineActionType;
  payload: any;
  createdAt: number;
}

export async function cacheData<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error writing cache data', key, error);
  }
}

export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error('Error reading cache data', key, error);
    return null;
  }
}

export async function addPendingAction(action: OfflineAction): Promise<void> {
  try {
    const existing = await getPendingActions();
    const next = [...existing, action];
    await AsyncStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify(next));
  } catch (error) {
    console.error('Error queueing offline action', error);
  }
}

export async function getPendingActions(): Promise<OfflineAction[]> {
  try {
    const raw = await AsyncStorage.getItem(PENDING_ACTIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as OfflineAction[];
  } catch (error) {
    console.error('Error reading offline action queue', error);
    return [];
  }
}

async function savePendingActions(actions: OfflineAction[]) {
  try {
    await AsyncStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify(actions));
  } catch (error) {
    console.error('Error saving offline action queue', error);
  }
}

function isNetworkError(error: any): boolean {
  const message = (error?.message || '').toString().toLowerCase();
  return /network|failed to fetch|request failed|offline|timeout|dns|socket|connection/i.test(message);
}

async function executeOfflineAction(action: OfflineAction) {
  let result;

  switch (action.type) {
    case 'createMasjid':
      result = await createMasjid(action.payload);
      break;
    case 'updateMasjid':
      result = await updateMasjid(action.payload.id, action.payload.updates);
      break;
    case 'deleteMasjid':
      result = await deleteMasjid(action.payload.id);
      break;
    case 'createCommunityPost':
      result = await createCommunityPost(action.payload.userId, action.payload.postData);
      break;
    case 'upsertCustomPrayerTimes':
      result = await upsertCustomPrayerTimes(
        action.payload.masjidId,
        action.payload.day,
        action.payload.timings,
        action.payload.createdBy
      );
      break;
    default:
      throw new Error(`Unsupported offline action type: ${action.type}`);
  }

  if (action.payload?.notification) {
    await queueNotificationEvent(action.payload.notification);
  }

  return result;
}

export async function syncPendingActions(): Promise<void> {
  const pendingActions = await getPendingActions();
  if (!pendingActions.length) return;

  const remaining: OfflineAction[] = [];

  for (const action of pendingActions) {
    try {
      await executeOfflineAction(action);
    } catch (error) {
      const offline = isNetworkError(error);
      if (offline) {
        remaining.push(action);
      } else {
        console.error('Dropping offline action after non-network failure', action.type, error);
      }
    }
  }

  await savePendingActions(remaining);
}

export function isOfflineError(error: any): boolean {
  return isNetworkError(error);
}
