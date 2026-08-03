import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { TasbihTheme } from '../../constants/TasbihTheme';
import type { SurahTask } from '../../types/tasbih';
import { useTasbihLayout } from '../../hooks/useTasbihLayout';
import { SectionHeader } from './SectionHeader';
import { SurahListItem } from './SurahListItem';

interface SurahListSectionProps {
  tasks: SurahTask[];
  activeSurahId?: string;
  onTaskPress?: (task: SurahTask) => void;
  onViewAll?: () => void;
  title?: string;
}

export const SurahListSection: React.FC<SurahListSectionProps> = ({
  tasks,
  activeSurahId,
  onTaskPress,
  onViewAll,
  title = '1. Choose a Surah',
}) => {
  const { rs, isCompact } = useTasbihLayout();

  return (
    <View style={styles.container}>
      <SectionHeader title={title} actionLabel="View All ›" onActionPress={onViewAll} />

      <View style={[styles.tableHeader, { paddingBottom: rs(6) }]}>
        <Text style={[styles.headerCell, styles.surahHeader, { fontSize: rs(10) }]}>Surah</Text>
        {!isCompact && (
          <Text style={[styles.headerCell, styles.targetHeader, { fontSize: rs(10) }]}>Target</Text>
        )}
        <Text style={[styles.headerCell, styles.progressHeader, { fontSize: rs(10) }]}>
          Daily Progress
        </Text>
        <Text style={[styles.headerCell, styles.statusHeader, { fontSize: rs(10) }]}>Status</Text>
        <View style={{ width: rs(18) }} />
      </View>

      {tasks.map((task) => (
        <SurahListItem
          key={task.id}
          task={task}
          isActive={task.id === activeSurahId}
          onPress={onTaskPress}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: TasbihTheme.spacing.xxl,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: TasbihTheme.colors.border,
  },
  headerCell: {
    fontFamily: TasbihTheme.fonts.sansSemiBold,
    color: TasbihTheme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  surahHeader: {
    flex: 2,
  },
  targetHeader: {
    flex: 0.9,
  },
  progressHeader: {
    flex: 1.4,
  },
  statusHeader: {
    width: 52,
    textAlign: 'center',
  },
});
