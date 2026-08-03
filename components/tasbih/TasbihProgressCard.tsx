import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TasbihTheme } from '../../constants/TasbihTheme';
import type { SurahTask } from '../../types/tasbih';
import { getProgressPercent, useTasbihLayout } from '../../hooks/useTasbihLayout';
import { ProgressBar } from './ProgressBar';
import { Icons } from '../../constants/Icons';

interface TasbihProgressCardProps {
  task: SurahTask;
  onIncrement?: () => void;
  onDecrement?: () => void;
  onReset?: () => void;
}

export const TasbihProgressCard: React.FC<TasbihProgressCardProps> = ({
  task,
  onIncrement,
  onDecrement,
  onReset,
}) => {
  const { rs } = useTasbihLayout();
  const percent = getProgressPercent(task.current, task.target);
  const buttonSize = rs(52);

  return (
    <View style={[styles.card, { borderRadius: rs(20), padding: rs(18) }]}>
      <View style={styles.header}>
        <View style={[styles.arabicCircle, { width: rs(48), height: rs(48), borderRadius: rs(24) }]}>
          <Text style={[styles.arabicText, { fontSize: rs(14) }]}>{task.arabicName}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.surahName, { fontSize: rs(16) }]}>Surah {task.name}</Text>
          <Text style={[styles.targetLabel, { fontSize: rs(12) }]}>
            Target: {task.target} Time{task.target > 1 ? 's' : ''}
          </Text>
        </View>
        <Pressable onPress={onReset} style={styles.resetBtn} hitSlop={8}>
          <Icons.Ionicons name="refresh" size={rs(14)} color={TasbihTheme.colors.textOnGreenMuted} />
          <Text style={[styles.resetText, { fontSize: rs(11) }]}>Reset</Text>
        </Pressable>
      </View>

      <View style={styles.counterRow}>
        <Pressable
          onPress={onDecrement}
          style={[styles.counterBtn, { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 }]}>
          <Icons.Ionicons name="remove" size={rs(26)} color={TasbihTheme.colors.textOnGreen} />
        </Pressable>

        <View style={styles.counterCenter}>
          <Text style={[styles.counter, { fontSize: rs(42) }]}>
            {task.current} / {task.target}
          </Text>
          <Text style={[styles.completedLabel, { fontSize: rs(12) }]}>Completed</Text>
        </View>

        <Pressable
          onPress={onIncrement}
          style={[styles.counterBtn, { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 }]}>
          <Icons.Ionicons name="add" size={rs(26)} color={TasbihTheme.colors.textOnGreen} />
        </Pressable>
      </View>

      <View style={styles.bottomProgress}>
        <ProgressBar
          progress={percent}
          height={rs(8)}
          trackColor={TasbihTheme.colors.progressTrackOnGreen}
          fillColor={TasbihTheme.colors.progressFillGold}
        />
        <Text style={[styles.percentLabel, { fontSize: rs(12), marginTop: rs(8) }]}>
          {percent}% Completed
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: TasbihTheme.colors.cardGreenDeep,
    ...TasbihTheme.shadow.elevated,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: TasbihTheme.spacing.xl,
  },
  arabicCircle: {
    borderWidth: 2,
    borderColor: TasbihTheme.colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(200,168,112,0.12)',
  },
  arabicText: {
    fontFamily: TasbihTheme.fonts.arabic,
    color: TasbihTheme.colors.gold,
  },
  headerText: {
    flex: 1,
    marginLeft: TasbihTheme.spacing.md,
  },
  surahName: {
    fontFamily: TasbihTheme.fonts.serif,
    color: TasbihTheme.colors.textOnGreen,
  },
  targetLabel: {
    fontFamily: TasbihTheme.fonts.sans,
    color: TasbihTheme.colors.textOnGreenMuted,
    marginTop: 2,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: TasbihTheme.spacing.sm,
  },
  resetText: {
    fontFamily: TasbihTheme.fonts.sansMedium,
    color: TasbihTheme.colors.textOnGreenMuted,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: TasbihTheme.spacing.xl,
  },
  counterBtn: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterCenter: {
    alignItems: 'center',
    flex: 1,
  },
  counter: {
    fontFamily: TasbihTheme.fonts.serif,
    color: TasbihTheme.colors.textOnGreen,
    letterSpacing: 1,
  },
  completedLabel: {
    fontFamily: TasbihTheme.fonts.sans,
    color: TasbihTheme.colors.textOnGreenMuted,
    marginTop: TasbihTheme.spacing.xs,
  },
  bottomProgress: {
    marginTop: TasbihTheme.spacing.sm,
  },
  percentLabel: {
    fontFamily: TasbihTheme.fonts.sansMedium,
    color: TasbihTheme.colors.textOnGreenMuted,
    textAlign: 'center',
  },
});
