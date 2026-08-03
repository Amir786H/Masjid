import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { TasbihTheme } from '../../constants/TasbihTheme';
import type { DailyOverviewStats } from '../../types/tasbih';
import { getProgressPercent, useTasbihLayout } from '../../hooks/useTasbihLayout';
import { DailyStatCard } from './DailyStatCard';
import { SectionHeader } from './SectionHeader';
import { Icons } from '../../constants/Icons';

interface DailyOverviewGridProps {
  stats: DailyOverviewStats;
  onPress?: () => void;
  title?: string;
}

export const DailyOverviewGrid: React.FC<DailyOverviewGridProps> = ({
  stats,
  onPress,
  title = '4. Your Daily Overview',
}) => {
  const { rs, isCompact } = useTasbihLayout();
  const surahProgress = getProgressPercent(
    stats.surahsCompletedToday,
    stats.totalSurahsToday
  );

  return (
    <View style={styles.container}>
      <Pressable onPress={onPress}>
        <SectionHeader
          title={title}
          actionLabel="›"
          onActionPress={onPress}
        />
      </Pressable>

      <View style={[styles.grid, { gap: rs(12) }]}>
        <View style={styles.row}>
          <DailyStatCard
            label="Streak"
            value={`${stats.streakDays} Days`}
            iconName="calendar-outline"
            style={{ marginRight: rs(6) }}
          />
          <DailyStatCard
            label="Surahs Completed Today"
            value={`${stats.surahsCompletedToday} / ${stats.totalSurahsToday}`}
            iconName="book-outline"
            progress={surahProgress}
            style={{ marginLeft: rs(6) }}
          />
        </View>
        <View style={styles.row}>
          <DailyStatCard
            label="Total Recitations"
            value={`${stats.totalRecitationsToday} Today`}
            iconName="ellipse-outline"
            style={{ marginRight: rs(6) }}
          />
          <DailyStatCard
            label="Daily Goal"
            value={`${stats.dailyGoalSurahs} Surahs`}
            iconName="locate-outline"
            style={{ marginLeft: rs(6) }}
          />
        </View>
      </View>

      {!isCompact && (
        <View style={styles.footerHint}>
          <Icons.Ionicons
            name="chevron-forward"
            size={rs(14)}
            color={TasbihTheme.colors.textMuted}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: TasbihTheme.spacing.xxxl,
  },
  grid: {},
  row: {
    flexDirection: 'row',
  },
  footerHint: {
    alignItems: 'flex-end',
    marginTop: TasbihTheme.spacing.sm,
  },
});
