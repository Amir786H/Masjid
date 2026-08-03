import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TasbihTheme } from '../../constants/TasbihTheme';
import type { SurahTask } from '../../types/tasbih';
import { getProgressPercent, isTaskComplete, useTasbihLayout } from '../../hooks/useTasbihLayout';
import { CircularProgressRing } from './CircularProgressRing';
import { ProgressBar } from './ProgressBar';
import { IslamicStarBadge } from './TasbihSvgAssets';
import { Icons } from '../../constants/Icons';

interface SurahListItemProps {
  task: SurahTask;
  onPress?: (task: SurahTask) => void;
  isActive?: boolean;
}

export const SurahListItem: React.FC<SurahListItemProps> = ({ task, onPress, isActive }) => {
  const { rs, isCompact } = useTasbihLayout();
  const percent = getProgressPercent(task.current, task.target);
  const complete = isTaskComplete(task.current, task.target);
  const starSize = rs(34);

  return (
    <Pressable
      onPress={() => onPress?.(task)}
      style={({ pressed }) => [
        styles.row,
        {
          paddingVertical: rs(12),
          opacity: pressed ? 0.85 : 1,
          backgroundColor: isActive ? `${TasbihTheme.colors.gold}12` : 'transparent',
          borderRadius: rs(12),
          paddingHorizontal: rs(4),
        },
      ]}>
      <View style={[styles.surahCol, { flex: isCompact ? 2.2 : 2 }]}>
        <View style={styles.starWrap}>
          <IslamicStarBadge label={String(task.number).padStart(2, '0')} size={starSize} />
          <Text style={[styles.starLabel, { fontSize: rs(10), top: starSize * 0.34 }]}>
            {String(task.number).padStart(2, '0')}
          </Text>
        </View>
        <View style={styles.nameBlock}>
          <Text style={[styles.name, { fontSize: rs(14) }]} numberOfLines={1}>
            {task.name}
          </Text>
          <Text style={[styles.meaning, { fontSize: rs(11) }]} numberOfLines={1}>
            {task.meaning}
          </Text>
        </View>
      </View>

      {!isCompact && (
        <View style={[styles.targetCol, { flex: 0.9 }]}>
          <Text style={[styles.colLabel, { fontSize: rs(10) }]}>Target</Text>
          <Text style={[styles.colValue, { fontSize: rs(12) }]}>{task.target} times</Text>
        </View>
      )}

      <View style={[styles.progressCol, { flex: isCompact ? 1.5 : 1.4 }]}>
        <Text style={[styles.colLabel, { fontSize: rs(10) }]}>Daily Progress</Text>
        <Text style={[styles.progressFraction, { fontSize: rs(12) }]}>
          {task.current} / {task.target}
        </Text>
        <ProgressBar
          progress={percent}
          height={rs(5)}
          style={{ marginTop: rs(4) }}
        />
      </View>

      <View style={styles.statusCol}>
        <Text style={[styles.colLabel, { fontSize: rs(10), textAlign: 'center' }]}>Status</Text>
        <CircularProgressRing
          progress={percent}
          size={rs(40)}
          completed={complete}
          strokeWidth={3}
        />
      </View>

      <Icons.Ionicons
        name="chevron-forward"
        size={rs(16)}
        color={TasbihTheme.colors.textMuted}
        style={{ marginLeft: rs(2) }}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: TasbihTheme.colors.border,
  },
  surahCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: TasbihTheme.spacing.sm,
  },
  starWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  starLabel: {
    position: 'absolute',
    fontFamily: TasbihTheme.fonts.sansSemiBold,
    color: TasbihTheme.colors.primaryGreen,
  },
  nameBlock: {
    flex: 1,
  },
  name: {
    fontFamily: TasbihTheme.fonts.sansBold,
    color: TasbihTheme.colors.textPrimary,
  },
  meaning: {
    fontFamily: TasbihTheme.fonts.sans,
    color: TasbihTheme.colors.textSecondary,
    marginTop: 1,
  },
  targetCol: {
    paddingHorizontal: TasbihTheme.spacing.xs,
  },
  progressCol: {
    paddingHorizontal: TasbihTheme.spacing.xs,
  },
  statusCol: {
    alignItems: 'center',
    width: 52,
  },
  colLabel: {
    fontFamily: TasbihTheme.fonts.sansMedium,
    color: TasbihTheme.colors.textMuted,
    marginBottom: 2,
  },
  colValue: {
    fontFamily: TasbihTheme.fonts.sansSemiBold,
    color: TasbihTheme.colors.textPrimary,
  },
  progressFraction: {
    fontFamily: TasbihTheme.fonts.sansSemiBold,
    color: TasbihTheme.colors.textPrimary,
  },
});
