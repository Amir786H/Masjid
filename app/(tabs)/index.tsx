import React from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CommunityHighlight } from '../../components/CommunityHighlight';
import { NextPrayerCard } from '../../components/NextPrayerCard';
import { PrayerCard } from '../../components/PrayerCard';
import { QuickActionButton } from '../../components/QuickActionButton';
import { Colors } from '../../constants/Colors';
import { Icons } from '../../constants/Icons';
import { useCountdown } from '../../hooks/useCountdown';
import { usePrayerTimes } from '../../hooks/usePrayerTimes';

export default function HomeScreen() {
  const { data, address, loading, error } = usePrayerTimes();
  const { nextPrayerName, countdown } = useCountdown(data?.timings);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View>
        <Text style={styles.mosqueName}>Masjid Al-Noor</Text>
        <Text style={styles.location}>{address}</Text>
      </View>
      <TouchableOpacity style={styles.bellButton}>
        <Icons.Ionicons name="notifications" size={20} color={Colors.light.text} />
      </TouchableOpacity>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <QuickActionButton
        label="Events"
        iconFamily="Ionicons"
        iconName="calendar-outline"
        onPress={() => { }}
      />
      <QuickActionButton
        label="Qibla"
        iconFamily="Ionicons"
        iconName="compass-outline"
        onPress={() => { }}
      />
      <QuickActionButton
        label="Tasbih"
        iconFamily="Ionicons"
        iconName="medical-outline"
        onPress={() => { }}
      />
      <QuickActionButton
        label="Quran"
        iconFamily="Ionicons"
        iconName="book-outline"
        onPress={() => { }}
      />
    </View>
  );

  const renderPrayerTimes = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Loading Prayer Times...</Text>
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

    const { timings } = data;

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
          <Text style={styles.sectionTitle}>Prayer Times</Text>
          <TouchableOpacity>
            <Text style={styles.viewMonthlyBtn}>View Monthly</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.prayerGridRow}>
          <PrayerCard name="Fajr" time={prayers[0].time} isActive={nextPrayerName === 'Fajr'} />
          <PrayerCard name="Sunrise" time={prayers[1].time} isActive={nextPrayerName === 'Sunrise'} iconName="sunny-outline" />
        </View>
        <View style={styles.prayerGridRow}>
          <PrayerCard name="Dhuhr" time={prayers[2].time} isActive={nextPrayerName === 'Dhuhr'} />
          <PrayerCard name="Asr" time={prayers[3].time} isActive={nextPrayerName === 'Asr'} />
        </View>
        <View style={styles.prayerGridRow}>
          <PrayerCard name="Maghrib" time={prayers[4].time} isActive={nextPrayerName === 'Maghrib'} />
          <PrayerCard name="Isha" time={prayers[5].time} isActive={nextPrayerName === 'Isha'} />
        </View>
      </View>
    );
  };

  const renderCommunitySection = () => (
    <View style={styles.communityContainer}>
      <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>Community Highlight</Text>
      <CommunityHighlight
        imageUrl="https://images.unsplash.com/photo-1572949645841-094f3a9c4c94?q=80&w=600&auto=format&fit=crop"
        date="Oct 27, 2023"
        title="Friday Khutbah: Youth & Modernity"
        description="Join us this Friday for a special session with Sheikh Ahmed as he discusses navigating modern challenges."
        onPress={() => { }}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {renderHeader()}

        <NextPrayerCard
          prayerName={nextPrayerName || '...'}
          countdown={countdown}
          gregorianDate={data?.date.gregorian.date ? `${data.date.gregorian.weekday.en}, ${data.date.gregorian.day} ${data.date.gregorian.month.en}` : 'Loading...'}
          hijriDate={data?.date.hijri.date ? `${data.date.hijri.day} ${data.date.hijri.month.en}` : 'Loading...'}
        />

        {renderQuickActions()}
        {renderPrayerTimes()}
        {renderCommunitySection()}
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
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: Colors.light.textSecondary,
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
