import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CommunityHighlight } from '../../components/CommunityHighlight';
import Hadith from '../../components/Hadith';
import { NextPrayerCard } from '../../components/NextPrayerCard';
import { PrayerCard } from '../../components/PrayerCard';
import { QuickActionButton } from '../../components/QuickActionButton';
import { Colors } from '../../constants/Colors';
import { Icons } from '../../constants/Icons';
import { useAuthContext } from '../../contexts/AuthContext';
import { useCountdown } from '../../hooks/useCountdown';
import { usePrayerTimes } from '../../hooks/usePrayerTimes';
import { useTabBarScroll } from '../../hooks/useTabBarVisibility';
import { fetchCustomPrayerTimesForMasjid } from '../../services/databaseService';
import type { PrayerTimings } from '../../services/prayerService';
import { useAppStore } from '../../stores/appStore';

import { useTranslation } from 'react-i18next'; // Import the useTranslation hook
import i18n from '../i18n';

const toIsoDate = (date?: string) => {
  if (!date) {
    return '';
  }

  const [day, month, year] = date.split('-');
  return year && month && day ? `${year}-${month}-${day}` : date;
};

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthContext();
  const { data, address, loading, error } = usePrayerTimes();
  const [customPrayerTimings, setCustomPrayerTimings] = useState<PrayerTimings | null>(null);
  const {
    user: profile,
    masjids,
    communityPosts,
    loadingCommunity,
    loadUserProfile,
    loadMasjids,
    loadCommunityPosts,
  } = useAppStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showHadith, setShowHadith] = useState(false);
  const drawerTranslateX = useRef(new Animated.Value(-280)).current;
  const sectionAnimations = useRef(
    Array.from({ length: 5 }, () => new Animated.Value(0))
  ).current;
  const activeMasjid = masjids[0];
  const prayerDay = toIsoDate(data?.date?.gregorian?.date);
  const timings = customPrayerTimings || data?.timings;
  const { nextPrayerName, countdown } = useCountdown(timings);
  const onScroll = useTabBarScroll();
  const { t } = useTranslation();

  // console.log('HomeScreen----', data?.meta?.latitude, data?.meta?.longitude);

  useEffect(() => {
    loadMasjids();
    loadCommunityPosts();
  }, [loadMasjids, loadCommunityPosts]);

  useEffect(() => {
    if (user) {
      loadUserProfile(user.id);
    }
  }, [user, loadUserProfile]);

  useEffect(() => {
    Animated.stagger(
      90,
      sectionAnimations.map((animation) =>
        Animated.timing(animation, {
          toValue: 1,
          duration: 520,
          useNativeDriver: true,
        })
      )
    ).start();
  }, [sectionAnimations]);

  useEffect(() => {
    let isMounted = true;

    const loadCustomPrayerTimes = async () => {
      if (!activeMasjid?.id || !prayerDay) {
        setCustomPrayerTimings(null);
        return;
      }

      try {
        const record = await fetchCustomPrayerTimesForMasjid(activeMasjid.id, prayerDay);
        if (isMounted) {
          setCustomPrayerTimings(record?.timings || null);
        }
      } catch (err) {
        console.error('Failed to load custom prayer times:', err);
        if (isMounted) {
          setCustomPrayerTimings(null);
        }
      }
    };

    loadCustomPrayerTimes();

    return () => {
      isMounted = false;
    };
  }, [activeMasjid?.id, prayerDay]);

  const toggleDrawer = (open: boolean) => {
    setIsDrawerOpen(open);
    Animated.timing(drawerTranslateX, {
      toValue: open ? 0 : -280,
      duration: 280,
      useNativeDriver: true,
    }).start();
  };

  const getSectionTransition = (index: number) => ({
    opacity: sectionAnimations[index],
    transform: [
      {
        translateY: sectionAnimations[index].interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
      {
        scale: sectionAnimations[index].interpolate({
          inputRange: [0, 1],
          outputRange: [0.98, 1],
        }),
      },
    ],
  });

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity style={styles.menuButton} onPress={() => toggleDrawer(true)}>
        <Icons.Ionicons name="menu" size={22} color={Colors.light.text} />
      </TouchableOpacity>
      <View style={styles.headerTextContainer}>
        {/* <Text style={styles.mosqueName}>{masjids[0]?.name || 'Masjid E Meena Shah'}</Text> */}
        <Text style={styles.mosqueName}>{t('home.Masjid_E_Hashimpur') || t('home.Masjid_Hashimpur')}</Text>
        <View style={{ padding: 5 }} />
        <Text numberOfLines={2} style={styles.location}>{masjids[0]?.address || address}</Text>
      </View>
      <TouchableOpacity style={styles.bellButton} onPress={() => i18n.changeLanguage('en')}>
        <Icons.Ionicons name="notifications" size={20} color={Colors.light.text} />
      </TouchableOpacity>
    </View>
  );

  const renderDrawer = () => (
    <>
      {isDrawerOpen ? (
        <TouchableOpacity style={styles.drawerOverlay} activeOpacity={1} onPress={() => toggleDrawer(false)} />
      ) : null}
      <Animated.View style={[styles.drawerContainer, { transform: [{ translateX: drawerTranslateX }] }]}>
        <View style={styles.drawerHeader}>
          <Text style={styles.drawerTitle}>Menu</Text>
          <TouchableOpacity onPress={() => toggleDrawer(false)} style={styles.drawerCloseButton}>
            <Icons.Ionicons name="close" size={22} color={Colors.light.text} />
          </TouchableOpacity>
        </View>
        {user && profile?.id === user.id && profile.is_admin ? (
          <TouchableOpacity
            style={styles.drawerItem}
            onPress={() => {
              toggleDrawer(false);
              router.push('../admin');
            }}
          >
            <Icons.MaterialIcons name="admin-panel-settings" size={20} color={Colors.light.primary} />
            <Text style={styles.drawerItemText}>Admin Dashboard</Text>
          </TouchableOpacity>
        ) : null}
      </Animated.View>
    </>
  );


  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <QuickActionButton
        label="Events"
        iconFamily="Ionicons"
        iconName="calendar-outline"
        onPress={() => {
          router.push('/(tabs)/community')
        }}
      />
      <QuickActionButton
        label="Qibla"
        iconFamily="Ionicons"
        iconName="compass-outline"
        onPress={() => {
          router.push('/(tabs)/qibla')
        }}
      />
      <QuickActionButton
        label="Tasbih"
        iconFamily="Ionicons"
        iconName="medical-outline"
        onPress={() => { router.push('/(tabs)/tasbih') }}
      />
      <QuickActionButton
        label="Hadith"
        iconFamily="Ionicons"
        iconName="book-outline"
        onPress={() => {
          //Have to integrate a Hadith API or local database to fetch Hadiths.
          setShowHadith(true);
        }}
      />
    </View>
  );

  const renderPrayerTimes = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>{t('common.Loading_Namaz_Times')}</Text>
        </View>
      );
    }

    if (error || !data) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Failed to load data.'}</Text>
        </View>
      );
    }

    const timings = customPrayerTimings || data.timings;

    const prayers = [
      { name: 'Fajr', time: timings.Fajr },
      { name: 'Sunrise', time: timings.Sunrise, iconName: 'sunny' },
      { name: 'Dhuhr', time: timings.Dhuhr },
      { name: 'Asr', time: timings.Asr },
      { name: 'Maghrib', time: timings.Maghrib },
      { name: 'Isha', time: timings.Isha },
    ];

    return (
      <View style={styles.prayerTimesContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('common.Prayer_Times')}</Text>
          <TouchableOpacity>
            <Text style={styles.viewMonthlyBtn}>{t('common.View_Monthly')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.prayerGridRow}>
          <PrayerCard name={t('namaz.Fajr')} time={prayers[0].time} isActive={nextPrayerName === t('namaz.Fajr')} />
          <PrayerCard name={t('namaz.Sunrise')} time={prayers[1].time} isActive={nextPrayerName === t('namaz.Sunrise')} iconName="sunny-outline" />
        </View>
        <View style={styles.prayerGridRow}>
          <PrayerCard name={t('namaz.Dhuhr')} time={prayers[2].time} isActive={nextPrayerName === t('namaz.Dhuhr')} />
          <PrayerCard name={t('namaz.Asr')} time={prayers[3].time} isActive={nextPrayerName === t('namaz.Asr')} />
        </View>
        <View style={styles.prayerGridRow}>
          <PrayerCard name={t('namaz.Maghrib')} time={prayers[4].time} isActive={nextPrayerName === t('namaz.Maghrib')} />
          <PrayerCard name={t('namaz.Isha')} time={prayers[5].time} isActive={nextPrayerName === t('namaz.Isha')} />
        </View>
      </View>
    );
  };

  const featuredPost = communityPosts?.[0];

  const renderCommunitySection = () => (
    <View style={styles.communityContainer}>
      <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>{t('common.Community_Highlights')}</Text>
      {loadingCommunity ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.light.primary} />
        </View>
      ) : featuredPost ? (
        <CommunityHighlight
          imageUrl={featuredPost.image_url || 'https://images.unsplash.com/photo-1589827577276-65d717348780?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
          date={new Date(featuredPost.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
          title={featuredPost.title}
          description={featuredPost.content || 'Tap to view the latest community news.'}
          onPress={() => {
            router.push('/(tabs)/community');
          }}
        />
      ) : (
        <View style={styles.emptyCommunityContainer}>
          <Text style={styles.emptyCommunityText}>{t('common.No_community_highlights_available_yet')}</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {renderDrawer()}
      <Modal visible={showHadith} animationType="slide" onRequestClose={() => setShowHadith(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.light.background }}>
          <View style={{ height: 56, paddingHorizontal: 16, marginVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
            <TouchableOpacity onPress={() => setShowHadith(false)} style={{ padding: 8 }}>
              <Text style={{ color: Colors.light.primary, fontWeight: '600' }}>Close</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.light.text }}>Hadith</Text>
            <View style={{ width: 48 }} />
          </View>
          <Hadith />
        </SafeAreaView>
      </Modal>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={16}>
        <Animated.View style={getSectionTransition(0)}>
          {renderHeader()}
        </Animated.View>

        <Animated.View style={getSectionTransition(1)}>
          <NextPrayerCard
            prayerName={nextPrayerName || '...'}
            countdown={countdown}
            gregorianDate={data?.date.gregorian.date ? `${data.date.gregorian.weekday.en}, ${data.date.gregorian.day} ${data.date.gregorian.month.en}` : 'Loading...'}
            hijriDate={data?.date.hijri.date ? `${data.date.hijri.day} ${data.date.hijri.month.en}` : 'Loading...'}
          />
        </Animated.View>

        <Animated.View style={getSectionTransition(2)}>
          {renderQuickActions()}
        </Animated.View>
        <Animated.View style={getSectionTransition(3)}>
          {renderPrayerTimes()}
        </Animated.View>
        <Animated.View style={getSectionTransition(4)}>
          {renderCommunitySection()}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContainer: {
    padding: 16,
    paddingTop: 40, // Usually SafeArea in Expo Router might need some padding
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 10,
  },
  mosqueName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    fontFamily: 'Inter_700Bold', // Optional if we switch to Inter completely later
  },
  location: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontFamily: 'Inter_400Regular',
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 24,
  },
  prayerTimesContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  viewMonthlyBtn: {
    color: Colors.light.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  prayerGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  communityContainer: {
    marginBottom: 32, // bottom padding for scrollview before tabs
  },
  drawerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  drawerContainer: {
    position: 'absolute',
    top: 10,
    left: 0,
    bottom: 0,
    width: 280,
    backgroundColor: Colors.light.cardBackground,
    padding: 20,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 24,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  drawerCloseButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: Colors.light.background,
    marginBottom: 12,
  },
  drawerItemText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: Colors.light.textSecondary,
  },
  emptyCommunityContainer: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: Colors.light.cardBackground,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  emptyCommunityText: {
    color: Colors.light.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  errorContainer: {
    padding: 24,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    alignItems: 'center',
  },
  errorText: {
    color: '#EF4444',
  },
});
