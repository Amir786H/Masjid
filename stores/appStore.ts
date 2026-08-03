import { create } from 'zustand';
import {
  fetchCommunityPosts,
  fetchDonations,
  fetchMasjids,
  fetchPrayerReminders,
  fetchUserProfile,
} from '../services/databaseService';
import {
  cacheData,
  getCachedData,
  CACHE_KEYS,
} from '../services/offlineService';

interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  location?: string;
  preferred_masjid?: string;  is_admin?: boolean;  notification_settings?: Record<string, any>;
}

interface CommunityPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

interface Donation {
  id: string;
  user_id: string;
  masjid_id?: string | null;
  masjids?: {
    id: string;
    name: string;
  } | null;
  amount: number;
  currency: string;
  payment_method?: string | null;
  purpose?: string | null;
  receipt_url?: string | null;
  created_at: string;
}

interface PrayerReminder {
  id: string;
  prayer_name: string;
  enabled: boolean;
  reminder_minutes_before: number;
}

interface Masjid {
  id: string;
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  [key: string]: any;
}

interface AppStore {
  // User
  user: User | null;
  setUser: (user: User | null) => void;
  loadUserProfile: (userId: string) => Promise<void>;

  // Community
  communityPosts: CommunityPost[];
  loadingCommunity: boolean;
  loadCommunityPosts: (limit?: number, offset?: number) => Promise<void>;
  addPost: (post: CommunityPost) => void;
  setCommunityPosts: (posts: CommunityPost[]) => void;
  updateCommunityPostLikes: (postId: string, likesCount: number) => void;

  // Donations
  donations: Donation[];
  loadingDonations: boolean;
  loadDonations: (userId?: string) => Promise<void>;

  // Prayer Reminders
  prayerReminders: PrayerReminder[];
  loadingReminders: boolean;
  loadPrayerReminders: (userId: string) => Promise<void>;

  // Masjids
  masjids: Masjid[];
  loadingMasjids: boolean;
  loadMasjids: () => Promise<void>;
  setMasjids: (masjids: Masjid[]) => void;

  // General
  error: string | null;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  // User
  user: null,
  setUser: (user) => set({ user }),
  loadUserProfile: async (userId: string) => {
    try {
      const profile = await fetchUserProfile(userId);
      set({ user: profile });
    } catch (err) {
      console.error('Error loading user profile:', err);
      set({ error: 'Failed to load user profile' });
    }
  },

  // Community
  communityPosts: [],
  loadingCommunity: false,
  loadCommunityPosts: async (limit = 10, offset = 0) => {
    const cached = await getCachedData<CommunityPost[]>(CACHE_KEYS.communityPosts);
    if (cached) {
      set({ communityPosts: cached });
    }

    set({ loadingCommunity: true });
    try {
      const posts = await fetchCommunityPosts(limit, offset);
      set({ communityPosts: posts || [] });
      await cacheData(CACHE_KEYS.communityPosts, posts || []);
    } catch (err) {
      console.error('Error loading community posts:', err);
      if (!get().communityPosts.length) {
        set({ error: 'Failed to load community posts' });
      }
    } finally {
      set({ loadingCommunity: false });
    }
  },
  addPost: (post: CommunityPost) => {
    const current = get().communityPosts;
    const next = [post, ...current];
    set({ communityPosts: next });
    cacheData(CACHE_KEYS.communityPosts, next).catch((error) => console.error('Failed to cache community posts', error));
  },
  setCommunityPosts: (posts: CommunityPost[]) => set({ communityPosts: posts }),
  updateCommunityPostLikes: (postId: string, likesCount: number) => {
    const next = get().communityPosts.map((post) =>
      post.id === postId ? { ...post, likes_count: likesCount } : post
    );
    set({ communityPosts: next });
    cacheData(CACHE_KEYS.communityPosts, next).catch((error) => console.error('Failed to cache community posts', error));
  },

  // Donations
  donations: [],
  loadingDonations: false,
  loadDonations: async (userId?: string) => {
    set({ loadingDonations: true });
    try {
      const donations = await fetchDonations(userId);
      set({ donations: donations || [] });
    } catch (err) {
      console.error('Error loading donations:', err);
      set({ error: 'Failed to load donations' });
    } finally {
      set({ loadingDonations: false });
    }
  },

  // Prayer Reminders
  prayerReminders: [],
  loadingReminders: false,
  loadPrayerReminders: async (userId: string) => {
    set({ loadingReminders: true });
    try {
      const reminders = await fetchPrayerReminders(userId);
      set({ prayerReminders: reminders || [] });
    } catch (err) {
      console.error('Error loading prayer reminders:', err);
      set({ error: 'Failed to load prayer reminders' });
    } finally {
      set({ loadingReminders: false });
    }
  },

  // Masjids
  masjids: [],
  loadingMasjids: false,
  loadMasjids: async () => {
    const cached = await getCachedData<Masjid[]>(CACHE_KEYS.masjids);
    if (cached) {
      set({ masjids: cached });
    }

    if (get().loadingMasjids) {
      return;
    }

    set({ loadingMasjids: true, error: null });
    try {
      const masjids = await fetchMasjids();
      set({ masjids: masjids || [] });
      await cacheData(CACHE_KEYS.masjids, masjids || []);
    } catch (err) {
      console.error('Error loading masjids:', err);
      if (!get().masjids.length) {
        set({ error: 'Failed to load masjids' });
      }
    } finally {
      set({ loadingMasjids: false });
    }
  },
  setMasjids: (masjids: Masjid[]) => set({ masjids }),

  // General
  error: null,
  setError: (error) => set({ error }),
}));
