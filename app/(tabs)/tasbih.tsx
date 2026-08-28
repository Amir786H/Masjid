import React, { useMemo } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTabBarScroll } from '../../hooks/useTabBarVisibility';

import { useRouter } from 'expo-router';
import {
  BenefitsCarousel,
  CurrentTaskCard,
  DailyOverviewGrid,
  SurahListSection,
  SurahPickerModal,
  TasbihHeader,
  TasbihProgressCard,
} from '../../components/tasbih';
import { TasbihTheme } from '../../constants/TasbihTheme';
import { useTasbihLayout } from '../../hooks/useTasbihLayout';
import { useTasbihStore } from '../../stores/tasbihStore';

export default function TasbihScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { horizontalPadding, rs, isWide, contentMaxWidth } = useTasbihLayout();

  const {
    currentTask,
    surahTasks,
    benefits,
    dailyOverview,
    activeSurahId,
    setActiveSurah,
    incrementProgress,
    decrementProgress,
    resetProgress,
  } = useTasbihStore();

  const activeTask = useMemo(
    () => surahTasks.find((task) => task.id === activeSurahId) ?? surahTasks[0],
    [surahTasks, activeSurahId]
  );
  const [showPicker, setShowPicker] = React.useState(false);
  const onScroll = useTabBarScroll();

  // Show only up to 4 items on the main screen but ensure the active surah is visible
  const displayedSurahTasks = React.useMemo(() => {
    if (!surahTasks || surahTasks.length === 0) return surahTasks;
    const limit = 4;
    const first = surahTasks.slice(0, limit);
    if (activeSurahId && !first.find((t) => t.id === activeSurahId)) {
      // include active surah by replacing the last item if it exists
      const active = surahTasks.find((t) => t.id === activeSurahId);
      if (active) {
        return [...first.slice(0, Math.max(0, limit - 1)), active];
      }
    }
    return first;
  }, [surahTasks, activeSurahId]);

  const onViewDetails = () => {
    router.push({
      pathname: '/modal',
      params: { surahId: activeSurahId ?? surahTasks[0]?.id ?? '' },
    });
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={TasbihTheme.colors.background} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + rs(8),
            paddingBottom: insets.bottom + rs(100),
            paddingHorizontal: horizontalPadding,
            alignItems: isWide ? 'center' : 'stretch',
          },
        ]}>
        <View style={[styles.content, { maxWidth: contentMaxWidth, width: '100%' }]}>
          <TasbihHeader />

          <CurrentTaskCard task={currentTask} onViewDetails={onViewDetails} />

          <View style={{ height: rs(24) }} />

          <SurahListSection
            tasks={displayedSurahTasks}
            activeSurahId={activeSurahId}
            onTaskPress={(task) => setActiveSurah(task.id)}
            onViewAll={() => setShowPicker(true)}
          />

          <Text style={[styles.sectionTitle, { fontSize: rs(16), marginBottom: rs(12) }]}>
            2. Your Tasbih Progress
          </Text>
          <TasbihProgressCard
            task={activeTask}
            onIncrement={() => incrementProgress()}
            onDecrement={() => decrementProgress()}
            onReset={() => resetProgress()}
          />

          <View style={{ height: rs(24) }} />

          <BenefitsCarousel items={benefits} />

          <DailyOverviewGrid stats={dailyOverview} />
        </View>
      </ScrollView>
      <SurahPickerModal
        visible={showPicker}
        tasks={surahTasks}
        activeSurahId={activeSurahId}
        onClose={() => setShowPicker(false)}
        onSelect={(id: string) => {
          setActiveSurah(id);
          setShowPicker(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: TasbihTheme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    width: '100%',
  },
  sectionTitle: {
    fontFamily: TasbihTheme.fonts.sansBold,
    fontWeight: '700',
    color: TasbihTheme.colors.primaryGreen,
  },
});
