import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TasbihTheme } from '../../constants/TasbihTheme';
import type { CurrentTask } from '../../types/tasbih';
import { useTasbihLayout } from '../../hooks/useTasbihLayout';
import { LanternIllustration, TargetIcon } from './TasbihSvgAssets';

interface CurrentTaskCardProps {
  task: CurrentTask;
  onViewDetails?: () => void;
}

export const CurrentTaskCard: React.FC<CurrentTaskCardProps> = ({ task, onViewDetails }) => {
  const { rs } = useTasbihLayout();

  return (
    <View style={[styles.card, { borderRadius: rs(20), padding: rs(18) }]}>
      <View style={styles.content}>
        <View style={styles.left}>
          <View style={[styles.iconWrap, { width: rs(44), height: rs(44), borderRadius: rs(22) }]}>
            <TargetIcon width={rs(24)} height={rs(24)} />
          </View>
          <View style={styles.textBlock}>
            <Text style={[styles.eyebrow, { fontSize: rs(10) }]}>CURRENT TASK</Text>
            <Text style={[styles.benefit, { fontSize: rs(18) }]}>{task.benefit}</Text>
            <Text style={[styles.description, { fontSize: rs(12) }]}>{task.description}</Text>
            <Pressable
              onPress={onViewDetails}
              style={[styles.detailsBtn, { marginTop: rs(10), paddingVertical: rs(6), paddingHorizontal: rs(12) }]}>
              <Text style={[styles.detailsText, { fontSize: rs(11) }]}>View Details ›</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.lanternWrap}>
          <LanternIllustration width={rs(80)} height={rs(100)} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: TasbihTheme.colors.cardGreen,
    overflow: 'hidden',
    ...TasbihTheme.shadow.elevated,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: TasbihTheme.spacing.md,
  },
  iconWrap: {
    backgroundColor: 'rgba(200,168,112,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(200,168,112,0.35)',
  },
  textBlock: {
    flex: 1,
    paddingRight: TasbihTheme.spacing.sm,
  },
  eyebrow: {
    fontFamily: TasbihTheme.fonts.sansSemiBold,
    color: TasbihTheme.colors.gold,
    letterSpacing: 1.2,
    marginBottom: TasbihTheme.spacing.xs,
  },
  benefit: {
    fontFamily: TasbihTheme.fonts.serif,
    color: TasbihTheme.colors.textOnGreen,
    lineHeight: 26,
  },
  description: {
    fontFamily: TasbihTheme.fonts.sans,
    color: TasbihTheme.colors.textOnGreenMuted,
    marginTop: TasbihTheme.spacing.xs,
    lineHeight: 18,
  },
  detailsBtn: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: TasbihTheme.colors.borderLight,
    borderRadius: TasbihTheme.radius.pill,
  },
  detailsText: {
    fontFamily: TasbihTheme.fonts.sansMedium,
    color: TasbihTheme.colors.textOnGreen,
  },
  lanternWrap: {
    marginLeft: -8,
    marginTop: 8,
  },
});
