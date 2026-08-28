import Constants from 'expo-constants';
import { CACHE_KEYS, cacheData, getCachedData } from './offlineService';
import { supabase } from './supabaseClient';

// ==================== MASJID OPERATIONS ====================

export const fetchMasjids = async () => {
  const cachedMasjids = await getCachedData<any[]>(CACHE_KEYS.masjids);

  try {
    const { data, error } = await supabase
      .from('masjids')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    const nextMasjids = data || [];
    await cacheData(CACHE_KEYS.masjids, nextMasjids);
    return nextMasjids;
  } catch (err) {
    console.warn('Falling back to cached masjids after fetch error:', err);
    return cachedMasjids || [];
  }
};

export const fetchMasjidById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('masjids')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error fetching masjid:', err);
    throw err;
  }
};

export const fetchNearbyMasjids = async (latitude: number, longitude: number, radiusKm: number = 5) => {
  try {
    const { data, error } = await supabase
      .rpc('get_nearby_masjids', {
        user_lat: latitude,
        user_lng: longitude,
        radius_km: radiusKm,
      });

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error fetching nearby masjids:', err);
    throw err;
  }
};

// ==================== USER PROFILE OPERATIONS ====================

export const fetchUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error fetching user profile:', err);
    throw err;
  }
};

export const updateUserProfile = async (userId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error updating user profile:', err);
    throw err;
  }
};

// ==================== COMMUNITY POSTS OPERATIONS ====================

const fetchPostLikeCounts = async (postIds: string[]) => {
  if (!postIds.length) {
    return {};
  }

  const { data, error } = await supabase
    .from('post_likes')
    .select('post_id')
    .in('post_id', postIds);

  if (error) throw error;

  return (data || []).reduce<Record<string, number>>((counts, like) => {
    counts[like.post_id] = (counts[like.post_id] || 0) + 1;
    return counts;
  }, {});
};

// ==================== PUSH NOTIFICATIONS ====================

export const upsertPushToken = async (userId: string, expoPushToken: string, platform: string) => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const resolvedUserId = userId || session?.user?.id;

    if (!resolvedUserId) {
      console.warn('Skipping push token registration because no authenticated Supabase user is available.');
      return null;
    }

    const { data: existingTokenRow, error: existingTokenError } = await supabase
      .from('push_tokens')
      .select('id, user_id')
      .eq('expo_push_token', expoPushToken)
      .maybeSingle();

    if (existingTokenError) {
      throw existingTokenError;
    }

    if (existingTokenRow) {
      if (existingTokenRow.user_id === resolvedUserId) {
        const { data, error } = await supabase
          .from('push_tokens')
          .update({
            platform,
            enabled: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingTokenRow.id)
          .select()
          .single();

        if (error) {
          if ((error as { code?: string }).code === '42501') {
            console.warn('Supabase blocked the push token update because the RLS policy does not allow it for this authenticated user.', error);
            return null;
          }

          throw error;
        }

        return data;
      }

      console.warn('Skipping push token registration because the token is already associated with another user.', {
        existingUserId: existingTokenRow.user_id,
        newUserId: resolvedUserId,
      });
      return null;
    }

    const { data, error } = await supabase
      .from('push_tokens')
      .insert([
        {
          user_id: resolvedUserId,
          expo_push_token: expoPushToken,
          platform,
          enabled: true,
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      if ((error as { code?: string }).code === '42501') {
        console.warn(
          'Supabase blocked the push token write because the push_tokens RLS policy is not enabled for the signed-in user.',
          error
        );
        return null;
      }

      if ((error as { code?: string }).code === '23505') {
        const { data: duplicateTokenRow, error: duplicateLookupError } = await supabase
          .from('push_tokens')
          .select('id, user_id')
          .eq('expo_push_token', expoPushToken)
          .maybeSingle();

        if (duplicateLookupError) {
          throw duplicateLookupError;
        }

        if (duplicateTokenRow?.user_id === resolvedUserId) {
          const { data: updatedToken, error: updateError } = await supabase
            .from('push_tokens')
            .update({
              platform,
              enabled: true,
              updated_at: new Date().toISOString(),
            })
            .eq('id', duplicateTokenRow.id)
            .select()
            .single();

          if (updateError) {
            if ((updateError as { code?: string }).code === '42501') {
              console.warn('Supabase blocked the push token update because the RLS policy does not allow it for this authenticated user.', updateError);
              return null;
            }

            throw updateError;
          }

          return updatedToken;
        }

        console.warn('Skipping push token registration because the token is already associated with another user.', {
          existingUserId: duplicateTokenRow?.user_id,
          newUserId: resolvedUserId,
        });
        return null;
      }

      throw error;
    }

    return data;
  } catch (err) {
    console.error('Error upserting push token:', err);
    throw err;
  }
};

const triggerPushDelivery = async (eventId: string) => {
  try {
    const extra = Constants.expoConfig?.extra as {
      EXPO_PUBLIC_SUPABASE_URL?: string;
      EXPO_PUBLIC_SUPABASE_ANON_KEY?: string;
    } | undefined;

    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || extra?.EXPO_PUBLIC_SUPABASE_URL || '';
    const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !anonKey) {
      console.warn('Push delivery skipped because Supabase URL or anon key is missing.');
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const headers = {
      'Content-Type': 'application/json',
      apikey: anonKey,
      Authorization: `Bearer ${session?.access_token || anonKey}`,
    };

    try {
      const invokeResponse = await supabase.functions.invoke('send-push-notifications', {
        body: { eventId },
        headers,
      });

      if (invokeResponse.error) {
        throw invokeResponse.error;
      }

      console.log('Push delivery request accepted:', invokeResponse.data);
      return;
    } catch (invokeError) {
      console.warn('Supabase function invoke failed, retrying with direct fetch:', invokeError);
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/send-push-notifications`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ eventId }),
    });
    console.log('Push delivery request sent, awaiting response...', response);

    const responseText = await response.text();

    if (!response.ok) {
      console.warn('Push delivery request failed:', response.status, responseText);
      return;
    }

    console.log('Push delivery request accepted:', responseText);
  } catch (error) {
    console.warn('Unable to invoke push delivery function:', error);
  }
};

export const queueNotificationEvent = async ({
  title,
  body,
  type,
  url,
  relatedId,
}: {
  title: string;
  body: string;
  type: string;
  url: string;
  relatedId?: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('notification_events')
      .insert([
        {
          title,
          body,
          type,
          data: {
            url,
            relatedId,
            source: 'app',
          },
          status: 'pending',
          attempts: 0,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    try {
      await triggerPushDelivery(data.id);
    } catch (invokeError) {
      console.warn('Unable to invoke push delivery function:', invokeError);
    }

    return data;
  } catch (err) {
    console.error('Error queueing push notification event:', err);
    throw err;
  }
};

export const fetchPostLikeCount = async (postId: string) => {
  try {
    const { count, error } = await supabase
      .from('post_likes')
      .select('id', { count: 'exact', head: true })
      .eq('post_id', postId);

    if (error) throw error;
    return count || 0;
  } catch (err) {
    console.error('Error fetching post like count:', err);
    throw err;
  }
};

export const fetchCommunityPosts = async (limit: number = 10, offset: number = 0) => {
  const cachedPosts = await getCachedData<any[]>(CACHE_KEYS.communityPosts);

  try {
    const { data, error } = await supabase
      .from('community_posts')
      .select(`
        *,
        users:user_id (id, email, full_name, avatar_url)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const likeCounts = await fetchPostLikeCounts((data || []).map((post) => post.id));
    const nextPosts = (data || []).map((post) => ({
      ...post,
      likes_count: likeCounts[post.id] || 0,
    }));

    await cacheData(CACHE_KEYS.communityPosts, nextPosts);
    return nextPosts;
  } catch (err) {
    console.warn('Falling back to cached community posts after fetch error:', err);
    return cachedPosts || [];
  }
};

export const fetchPostsByUser = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error fetching user posts:', err);
    throw err;
  }
};

export const createCommunityPost = async (userId: string, postData: any) => {
  try {
    const { data, error } = await supabase
      .from('community_posts')
      .insert([
        {
          user_id: userId,
          title: postData.title,
          content: postData.content,
          image_url: postData.image_url,
          masjid_id: postData.masjid_id,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error creating community post:', err);
    throw err;
  }
};

export const updateCommunityPost = async (postId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('community_posts')
      .update(updates)
      .eq('id', postId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error updating community post:', err);
    throw err;
  }
};

export const deleteCommunityPost = async (postId: string) => {
  try {
    const { error } = await supabase
      .from('community_posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;
  } catch (err) {
    console.error('Error deleting community post:', err);
    throw err;
  }
};

export const fetchLikedPostIds = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('user_id', userId);

    if (error) throw error;
    return (data || []).map((like) => like.post_id);
  } catch (err) {
    console.error('Error fetching liked posts:', err);
    throw err;
  }
};

export const likePost = async (userId: string, postId: string) => {
  try {
    const { error } = await supabase
      .from('post_likes')
      .insert([{ user_id: userId, post_id: postId }]);

    if (error) throw error;
  } catch (err) {
    console.error('Error liking post:', err);
    throw err;
  }
};

export const unlikePost = async (userId: string, postId: string) => {
  try {
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId);

    if (error) throw error;
  } catch (err) {
    console.error('Error unliking post:', err);
    throw err;
  }
};

// ==================== DONATIONS OPERATIONS ====================

export const fetchDonations = async (userId?: string) => {
  try {
    let query = supabase
      .from('donations')
      .select(`
        *,
        users:user_id (id, email, full_name),
        masjids:masjid_id (id, name)
      `)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error fetching donations:', err);
    throw err;
  }
};

export const createDonation = async (userId: string, donationData: any) => {
  try {
    const { data, error } = await supabase
      .from('donations')
      .insert([
        {
          user_id: userId,
          masjid_id: donationData.masjid_id,
          amount: donationData.amount,
          currency: donationData.currency || 'USD',
          payment_method: donationData.payment_method,
          purpose: donationData.purpose,
          receipt_url: donationData.receipt_url,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error creating donation:', err);
    throw err;
  }
};

// ==================== PRAYER REMINDERS OPERATIONS ====================

export const fetchPrayerReminders = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('prayer_reminders')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error fetching prayer reminders:', err);
    throw err;
  }
};

export const createPrayerReminder = async (userId: string, reminderData: any) => {
  try {
    const { data, error } = await supabase
      .from('prayer_reminders')
      .insert([
        {
          user_id: userId,
          masjid_id: reminderData.masjid_id,
          prayer_name: reminderData.prayer_name,
          enabled: reminderData.enabled,
          reminder_minutes_before: reminderData.reminder_minutes_before,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error creating prayer reminder:', err);
    throw err;
  }
};

export const updatePrayerReminder = async (reminderId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('prayer_reminders')
      .update(updates)
      .eq('id', reminderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error updating prayer reminder:', err);
    throw err;
  }
};

// ==================== MASJID MANAGEMENT ====================

export const createMasjid = async (masjidData: any) => {
  try {
    const { data, error } = await supabase
      .from('masjids')
      .insert([masjidData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error creating masjid:', err);
    throw err;
  }
};

export const updateMasjid = async (masjidId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('masjids')
      .update(updates)
      .eq('id', masjidId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error updating masjid:', err);
    throw err;
  }
};

export const deleteMasjid = async (masjidId: string) => {
  try {
    const { error } = await supabase
      .from('masjids')
      .delete()
      .eq('id', masjidId);

    if (error) throw error;
  } catch (err) {
    console.error('Error deleting masjid:', err);
    throw err;
  }
};

// ==================== CUSTOM PRAYER TIMES ====================

export const fetchCustomPrayerTimes = async (limit: number = 20, offset: number = 0) => {
  try {
    const { data, error } = await supabase
      .from('custom_prayer_times')
      .select(`
        *,
        masjid:masjid_id (id, name)
      `)
      .order('day', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error fetching custom prayer times:', err);
    throw err;
  }
};

export const fetchCustomPrayerTimesForMasjid = async (masjidId: string, day: string) => {
  try {
    const { data, error } = await supabase
      .from('custom_prayer_times')
      .select('*')
      .eq('masjid_id', masjidId)
      .eq('day', day)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error fetching custom prayer times for masjid:', err);
    throw err;
  }
};

export const upsertCustomPrayerTimes = async (masjidId: string, day: string, timings: any, createdBy: string) => {
  try {
    const { data, error } = await supabase
      .from('custom_prayer_times')
      .upsert(
        [
          {
            masjid_id: masjidId,
            day,
            timings,
            created_by: createdBy,
          },
        ],
        // { onConflict: ['masjid_id', 'day'] }
        { onConflict: 'masjid_id, day' }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error upserting custom prayer times:', err);
    throw err;
  }
};

// ==================== REAL-TIME SUBSCRIPTIONS ====================

export const subscribeToCommunityPosts = (callback: (payload: any) => void) => {
  return supabase
    .channel('public:community_posts')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'community_posts' }, callback)
    .subscribe();
};

export const subscribeToUserUpdates = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`public:users:id=eq.${userId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'users', filter: `id=eq.${userId}` }, callback)
    .subscribe();
};
