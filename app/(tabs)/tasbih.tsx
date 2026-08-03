import React, { useMemo } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BenefitsCarousel,
  CurrentTaskCard,
  DailyOverviewGrid,
  SurahListSection,
  TasbihHeader,
  TasbihProgressCard,
} from '../../components/tasbih';
import { TasbihTheme } from '../../constants/TasbihTheme';
import { useTasbihLayout } from '../../hooks/useTasbihLayout';
import { useTasbihStore } from '../../stores/tasbihStore';

export default function TasbihScreen() {
  const insets = useSafeAreaInsets();
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

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={TasbihTheme.colors.background} />

      <ScrollView
        showsVerticalScrollIndicator={false}
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

          <CurrentTaskCard task={currentTask} />

          <View style={{ height: rs(24) }} />

          <SurahListSection
            tasks={surahTasks}
            activeSurahId={activeSurahId}
            onTaskPress={(task) => setActiveSurah(task.id)}
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
