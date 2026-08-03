import { Colors } from '@/constants/Colors';
import { Icons } from '@/constants/Icons';
import { useAuthContext } from '@/contexts/AuthContext';
import {
  createCommunityPost,
  createMasjid,
  deleteCommunityPost,
  deleteMasjid,
  fetchCustomPrayerTimesForMasjid,
  queueNotificationEvent,
  updateMasjid,
  upsertCustomPrayerTimes
} from '@/services/databaseService';
import { addPendingAction, isOfflineError } from '@/services/offlineService';
import { useAppStore } from '@/stores/appStore';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const defaultPrayerTimings = {
  Fajr: '00:00',
  Sunrise: '00:00',
  Dhuhr: '00:00',
  Asr: '00:00',
  Maghrib: '00:00',
  Isha: '00:00',
};

export default function AdminScreen() {
  const router = useRouter();
  const { user } = useAuthContext();
  const {
    user: profile,
    masjids,
    communityPosts,
    loadingCommunity,
    loadingMasjids,
    loadUserProfile,
    loadCommunityPosts,
    loadMasjids,
  } = useAppStore();

  const [activeSection, setActiveSection] = useState<'masjids' | 'community' | 'prayerTimes'>('masjids');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedMasjidId, setSelectedMasjidId] = useState<string | null>(null);
  const [masjidForm, setMasjidForm] = useState({
    id: '',
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    phone: '',
    email: '',
    website: '',
    image_url: '',
  });
  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    image_url: '',
    masjid_id: masjids[0]?.id || '',
  });
  const [customDay, setCustomDay] = useState('');
  const [timings, setTimings] = useState(defaultPrayerTimings);
  const [customPrayerTimesLoading, setCustomPrayerTimesLoading] = useState(false);

  const isAdmin = useMemo(
    () => !!user && profile?.id === user.id && !!profile?.is_admin,
    [profile, user]
  );

  useEffect(() => {
    if (user) {
      loadUserProfile(user.id);
    }
  }, [user, loadUserProfile]);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (!profile) {
      return;
    }

    if (!isAdmin) {
      Alert.alert('Access denied', 'You must be an admin to access this page.');
      router.replace('/(tabs)');
      return;
    }

    loadMasjids();
    loadCommunityPosts();
  }, [user, profile, isAdmin, loadMasjids, loadCommunityPosts, router]);

  useEffect(() => {
    setPostForm((current) => ({
      ...current,
      masjid_id: current.masjid_id || masjids[0]?.id || '',
    }));
  }, [masjids]);

  const resetMasjidForm = () => {
    setMasjidForm({
      id: '',
      name: '',
      address: '',
      latitude: '',
      longitude: '',
      phone: '',
      email: '',
      website: '',
      image_url: '',
    });
    setSelectedMasjidId(null);
  };

  const handleChooseMasjid = (masjid: any) => {
    setSelectedMasjidId(masjid.id);
    setMasjidForm({
      id: masjid.id,
      name: masjid.name || '',
      address: masjid.address || '',
      latitude: masjid.latitude?.toString() || '',
      longitude: masjid.longitude?.toString() || '',
      phone: masjid.phone || '',
      email: masjid.email || '',
      website: masjid.website || '',
      image_url: masjid.image_url || '',
    });
  };

  const queueOfflineAction = async (type: any, payload: any) => {
    try {
      await addPendingAction({
        id: Date.now().toString(),
        type,
        payload,
        createdAt: Date.now(),
      });
      Alert.alert('Offline', 'Your change is queued and will sync automatically when an internet connection is restored.');
    } catch (queueError) {
      console.error('Error queueing offline action:', queueError);
      Alert.alert('Error', 'Unable to queue this change for offline sync.');
    }
  };

  const handleSaveMasjid = async () => {
    if (!masjidForm.name.trim()) {
      Alert.alert('Validation', 'Please enter a name for the masjid.');
      return;
    }

    const payload = {
      name: masjidForm.name,
      address: masjidForm.address,
      latitude: parseFloat(masjidForm.latitude) || 0,
      longitude: parseFloat(masjidForm.longitude) || 0,
      phone: masjidForm.phone,
      email: masjidForm.email,
      website: masjidForm.website,
      image_url: masjidForm.image_url,
    };

    setIsSaving(true);
    try {
      let savedMasjid;
      if (selectedMasjidId) {
        savedMasjid = await updateMasjid(selectedMasjidId, payload);
        Alert.alert('Saved', 'Masjid updated successfully.');
      } else {
        savedMasjid = await createMasjid(payload);
        Alert.alert('Saved', 'Masjid created successfully.');
      }

      await queueNotificationEvent({
        title: 'Masjid update',
        body: `A new update was made for ${savedMasjid?.name || payload.name}.`,
        type: 'masjid_update',
        url: '/(tabs)',
        relatedId: savedMasjid?.id,
      });

      await loadMasjids();
      resetMasjidForm();
    } catch (err: any) {
      if (isOfflineError(err)) {
        await queueOfflineAction(
          selectedMasjidId ? 'updateMasjid' : 'createMasjid',
          selectedMasjidId
            ? {
                id: selectedMasjidId,
                updates: payload,
                notification: {
                  title: 'Masjid update',
                  body: `A new update was made for ${payload.name}.`,
                  type: 'masjid_update',
                  url: '/(tabs)',
                  relatedId: selectedMasjidId,
                },
              }
            : {
                ...payload,
                notification: {
                  title: 'Masjid update',
                  body: `A new update was made for ${payload.name}.`,
                  type: 'masjid_update',
                  url: '/(tabs)',
                },
              }
        );
        await loadMasjids();
        resetMasjidForm();
      } else {
        Alert.alert('Error', err?.message || 'Failed to save masjid.');
        console.error(err);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMasjid = async (id: string) => {
    Alert.alert('Confirm delete', 'Delete this masjid? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsSaving(true);
            await deleteMasjid(id);
            await loadMasjids();
            if (selectedMasjidId === id) {
              resetMasjidForm();
            }
          } catch (err: any) {
            if (isOfflineError(err)) {
              await queueOfflineAction('deleteMasjid', { id });
              if (selectedMasjidId === id) {
                resetMasjidForm();
              }
            } else {
              Alert.alert('Error', err?.message || 'Failed to delete masjid.');
            }
          } finally {
            setIsSaving(false);
          }
        },
      },
    ]);
  };

  //Delete Community Post
  const handleDeletePost = async (id: string) => {
    Alert.alert('Confirm delete', 'Delete this post? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsSaving(true);
            await deleteCommunityPost(id);
            await loadCommunityPosts();
          } catch (err: any) {
            if (isOfflineError(err)) {
              await queueOfflineAction('deleteCommunityPost', { id });
            } else {
              Alert.alert('Error', err?.message || 'Failed to delete community post.');
            }
          } finally {
            setIsSaving(false);
          }
        },
      },
    ]);
  };

  const handleSavePost = async () => {
    if (!user) {
      Alert.alert('Authentication', 'You must be signed in to create posts.');
      return;
    }

    if (!postForm.title.trim() || !postForm.content.trim()) {
      Alert.alert('Validation', 'Please enter both a title and content.');
      return;
    }

    setIsSaving(true);
    try {
      const createdPost = await createCommunityPost(user.id, {
        title: postForm.title,
        content: postForm.content,
        image_url: postForm.image_url,
        masjid_id: postForm.masjid_id,
      });

      await queueNotificationEvent({
        title: 'New community update',
        body: postForm.title,
        type: 'community_post',
        url: '/(tabs)/community',
        relatedId: createdPost?.id,
      });

      await loadCommunityPosts();
      setPostForm({
        title: '',
        content: '',
        image_url: '',
        masjid_id: masjids[0]?.id || '',
      });
      Alert.alert('Saved', 'Community post created successfully.');
    } catch (err: any) {
      if (isOfflineError(err)) {
        await queueOfflineAction('createCommunityPost', {
          userId: user.id,
          postData: {
            title: postForm.title,
            content: postForm.content,
            image_url: postForm.image_url,
            masjid_id: postForm.masjid_id,
          },
          notification: {
            title: 'New community update',
            body: postForm.title,
            type: 'community_post',
            url: '/(tabs)/community',
          },
        });
        setPostForm({
          title: '',
          content: '',
          image_url: '',
          masjid_id: masjids[0]?.id || '',
        });
      } else {
        Alert.alert('Error', err?.message || 'Failed to save community post.');
        console.error(err);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const loadPrayerTimesForSelectedMasjid = async () => {
    if (!selectedMasjidId || !customDay) {
      return;
    }

    setCustomPrayerTimesLoading(true);
    try {
      const record = await fetchCustomPrayerTimesForMasjid(selectedMasjidId, customDay);
      if (record) {
        setTimings(record.timings);
      } else {
        setTimings(defaultPrayerTimings);
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to load custom prayer times.');
      console.error(err);
    } finally {
      setCustomPrayerTimesLoading(false);
    }
  };

  const handleSaveCustomPrayerTimes = async () => {
    if (!user) {
      Alert.alert('Authentication', 'You must be signed in to save prayer times.');
      return;
    }

    if (!selectedMasjidId || !customDay.trim()) {
      Alert.alert('Validation', 'Please select a masjid and date before saving prayer times.');
      return;
    }

    setIsSaving(true);
    try {
      const savedPrayerTimes = await upsertCustomPrayerTimes(selectedMasjidId, customDay, timings, user.id);
      await queueNotificationEvent({
        title: 'Prayer times updated',
        body: `Prayer times were updated for ${selectedMasjidId} on ${customDay}.`,
        type: 'prayer_times',
        url: '/(tabs)',
        relatedId: savedPrayerTimes?.id,
      });
      Alert.alert('Saved', 'Custom prayer times saved successfully.');
    } catch (err: any) {
      if (isOfflineError(err)) {
        await queueOfflineAction('upsertCustomPrayerTimes', {
          masjidId: selectedMasjidId,
          day: customDay,
          timings,
          createdBy: user.id,
          notification: {
            title: 'Prayer times updated',
            body: `Prayer times were updated for ${selectedMasjidId} on ${customDay}.`,
            type: 'prayer_times',
            url: '/(tabs)',
          },
        });
      } else {
        Alert.alert('Error', err?.message || 'Failed to save custom prayer times.');
        console.error(err);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const sectionButtons = [
    { key: 'masjids', label: 'Masjids' },
    { key: 'community', label: 'Community Posts' },
    { key: 'prayerTimes', label: 'Prayer Times' },
  ] as const;

  if (!user || !profile || !isAdmin) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.heading}>Checking admin access</Text>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.heading}>Admin Dashboard</Text>
      <View style={styles.sectionPicker}>
        {sectionButtons.map((button) => (
          <TouchableOpacity
            key={button.key}
            style={[
              styles.sectionButton,
              activeSection === button.key && styles.sectionButtonActive,
            ]}
            onPress={() => setActiveSection(button.key)}
          >
            <Text
              style={[
                styles.sectionButtonText,
                activeSection === button.key && styles.sectionButtonTextActive, { textAlign: 'center', flexWrap: 'wrap' }
              ]}
            >
              {button.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeSection === 'masjids' && (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Manage Masjids</Text>
          <View style={styles.fieldRow}>
            <TextInput
              style={styles.input}
              value={masjidForm.name}
              onChangeText={(text) => setMasjidForm((prev) => ({ ...prev, name: text }))}
              placeholder="Masjid name"
            />
            <TextInput
              style={styles.input}
              value={masjidForm.address}
              onChangeText={(text) => setMasjidForm((prev) => ({ ...prev, address: text }))}
              placeholder="Address"
            />
          </View>
          <View style={styles.fieldRow}>
            <TextInput
              style={styles.input}
              value={masjidForm.latitude}
              onChangeText={(text) => setMasjidForm((prev) => ({ ...prev, latitude: text }))}
              placeholder="Latitude"
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              value={masjidForm.longitude}
              onChangeText={(text) => setMasjidForm((prev) => ({ ...prev, longitude: text }))}
              placeholder="Longitude"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.fieldRow}>
            <TextInput
              style={styles.input}
              value={masjidForm.phone}
              onChangeText={(text) => setMasjidForm((prev) => ({ ...prev, phone: text }))}
              placeholder="Phone"
            />
            <TextInput
              style={styles.input}
              value={masjidForm.email}
              onChangeText={(text) => setMasjidForm((prev) => ({ ...prev, email: text }))}
              placeholder="Email"
              keyboardType="email-address"
            />
          </View>
          <View style={styles.fieldRow}>
            <TextInput
              style={styles.input}
              value={masjidForm.website}
              onChangeText={(text) => setMasjidForm((prev) => ({ ...prev, website: text }))}
              placeholder="Website"
            />
            <TextInput
              style={styles.input}
              value={masjidForm.image_url}
              onChangeText={(text) => setMasjidForm((prev) => ({ ...prev, image_url: text }))}
              placeholder="Image URL"
            />
          </View>
          <TouchableOpacity
            style={[styles.primaryButton, isSaving && styles.disabledButton]}
            onPress={handleSaveMasjid}
            disabled={isSaving}
          >
            <Text style={styles.primaryButtonText}>{selectedMasjidId ? 'Update Masjid' : 'Create Masjid'}</Text>
          </TouchableOpacity>
          <Text style={styles.subTitle}>Existing Masjids</Text>
          {loadingMasjids ? (
            <ActivityIndicator size="large" color={Colors.light.primary} />
          ) : (
            <FlatList
              data={masjids}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.listItem}>
                  <View style={styles.listItemText}>
                    <Text style={styles.listItemTitle}>{item.name}</Text>
                    <Text style={styles.listItemSubtitle}>{item.address || 'No address provided'}</Text>
                  </View>
                  <View style={styles.rowActions}>
                    <TouchableOpacity onPress={() => handleChooseMasjid(item)} style={styles.iconButton}>
                      <Icons.MaterialIcons name="edit" size={18} color={Colors.light.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteMasjid(item.id)} style={styles.iconButton}>
                      <Icons.MaterialIcons name="delete" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      )}

      {activeSection === 'community' && (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Community Posts</Text>
          <TextInput
            style={styles.input}
            value={postForm.title}
            onChangeText={(text) => setPostForm((prev) => ({ ...prev, title: text }))}
            placeholder="Post title"
          />
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={postForm.content}
            onChangeText={(text) => setPostForm((prev) => ({ ...prev, content: text }))}
            placeholder="Post content"
            multiline
            numberOfLines={4}
          />
          <TextInput
            style={styles.input}
            value={postForm.image_url}
            onChangeText={(text) => setPostForm((prev) => ({ ...prev, image_url: text }))}
            placeholder="Image URL"
          />
          <TouchableOpacity
            style={[styles.primaryButton, isSaving && styles.disabledButton]}
            onPress={handleSavePost}
            disabled={isSaving}
          >
            <Text style={styles.primaryButtonText}>Create Community Post</Text>
          </TouchableOpacity>
          <Text style={styles.subTitle}>Recent Community Posts</Text>
          {loadingCommunity ? (
            <ActivityIndicator size="large" color={Colors.light.primary} />
          ) : (
            <FlatList
              data={communityPosts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.listItem}>
                  <View style={styles.listItemText}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text numberOfLines={1} style={[styles.listItemTitle, { width: '85%' }]}>
                        {item.title}
                      </Text>
                      <TouchableOpacity onPress={() => handleDeletePost(item.id)} style={styles.iconButton}>
                        <Icons.MaterialIcons name="delete" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.listItemSubtitle} numberOfLines={3}>
                      {item.content}
                    </Text>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      )}

      {activeSection === 'prayerTimes' && (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Custom Prayer Times</Text>
          <View style={styles.fieldRow}>
            <TextInput
              style={styles.input}
              // value={selectedMasjidId || ''}
              value={masjids[0]?.id || ''}  //For selecting the masjid id from the appStore
              placeholder="Select Masjid ID from existing masjids"
              editable={true}
            />
          </View>
          <View style={styles.fieldRow}>
            <TextInput
              style={styles.input}
              value={customDay}
              onChangeText={setCustomDay}
              placeholder="Date (YYYY-MM-DD)"
            />
            <TouchableOpacity style={styles.secondaryButton} onPress={loadPrayerTimesForSelectedMasjid} disabled={customPrayerTimesLoading || !customDay || !selectedMasjidId}>
              <Text style={styles.secondaryButtonText}>Load</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.smallText}>Choose a masjid from the Masjids section to populate the ID here.</Text>
          <View style={styles.fieldRow}>
            <TextInput
              style={styles.input}
              value={timings.Fajr}
              onChangeText={(value) => setTimings((prev) => ({ ...prev, Fajr: value }))}
              placeholder="Fajr"
            />
            <TextInput
              style={styles.input}
              value={timings.Sunrise}
              onChangeText={(value) => setTimings((prev) => ({ ...prev, Sunrise: value }))}
              placeholder="Sunrise"
            />
          </View>
          <View style={styles.fieldRow}>
            <TextInput
              style={styles.input}
              value={timings.Dhuhr}
              onChangeText={(value) => setTimings((prev) => ({ ...prev, Dhuhr: value }))}
              placeholder="Dhuhr"
            />
            <TextInput
              style={styles.input}
              value={timings.Asr}
              onChangeText={(value) => setTimings((prev) => ({ ...prev, Asr: value }))}
              placeholder="Asr"
            />
          </View>
          <View style={styles.fieldRow}>
            <TextInput
              style={styles.input}
              value={timings.Maghrib}
              onChangeText={(value) => setTimings((prev) => ({ ...prev, Maghrib: value }))}
              placeholder="Maghrib"
            />
            <TextInput
              style={styles.input}
              value={timings.Isha}
              onChangeText={(value) => setTimings((prev) => ({ ...prev, Isha: value }))}
              placeholder="Isha"
            />
          </View>
          <TouchableOpacity style={[styles.primaryButton, isSaving && styles.disabledButton]} onPress={handleSaveCustomPrayerTimes} disabled={isSaving}>
            <Text style={styles.primaryButtonText}>Save Custom Prayer Times</Text>
          </TouchableOpacity>
          <Text style={styles.smallText}>Use this section to override prayer times for a masjid on a specific date.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 36,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: 18,
  },
  sectionPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  sectionButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: Colors.light.cardBackground,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: 'center',
  },
  sectionButtonActive: {
    backgroundColor: Colors.light.primary,
  },
  sectionButtonText: {
    color: Colors.light.textSecondary,
    fontWeight: '700',
    // height: 40,
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  sectionButtonTextActive: {
    color: '#fff',
  },
  sectionCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 18,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: 12,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 20,
    marginBottom: 12,
  },
  fieldRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    minWidth: 140,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
    color: Colors.light.text,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  primaryButton: {
    marginTop: 12,
    backgroundColor: Colors.light.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: Colors.light.lightGreen,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: Colors.light.primary,
    fontWeight: '700',
  },
  listItem: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItemText: {
    flex: 1,
    marginRight: 12,
  },
  listItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  listItemSubtitle: {
    color: Colors.light.textSecondary,
    fontSize: 13,
  },
  rowActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: Colors.light.background,
  },
  smallText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
});
