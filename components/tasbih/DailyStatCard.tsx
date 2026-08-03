import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { TasbihTheme } from '../../constants/TasbihTheme';
import { useTasbihLayout } from '../../hooks/useTasbihLayout';
import { ProgressBar } from './ProgressBar';
import { Icons } from '../../constants/Icons';

type StatIconName = keyof typeof Icons.Ionicons.glyphMap;

interface DailyStatCardProps {
  label: string;
  value: string;
  iconName: StatIconName;
  progress?: number;
  style?: ViewStyle;
}

export const DailyStatCard: React.FC<DailyStatCardProps> = ({
  label,
  value,
  iconName,
  progress,
  style,
}) => {
  const { rs } = useTasbihLayout();

  return (
    <View
      style={[
        styles.card,
        {
          borderRadius: rs(16),
          padding: rs(14),
          minHeight: rs(96),
        },
        style,
      ]}>
      <View style={[styles.iconWrap, { width: rs(32), height: rs(32), borderRadius: rs(16) }]}>
        <Icons.Ionicons name={iconName} size={rs(16)} color={TasbihTheme.colors.primaryGreen} />
      </View>
      <Text style={[styles.value, { fontSize: rs(18), marginTop: rs(8) }]}>{value}</Text>
      <Text style={[styles.label, { fontSize: rs(11), marginTop: rs(2) }]}>{label}</Text>
      {typeof progress === 'number' && (
        <ProgressBar progress={progress} height={rs(4)} style={{ marginTop: rs(8) }} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: TasbihTheme.colors.white,
    borderWidth: 1,
    borderColor: TasbihTheme.colors.border,
    flex: 1,
    ...TasbihTheme.shadow.card,
  },
  iconWrap: {
    backgroundColor: `${TasbihTheme.colors.gold}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontFamily: TasbihTheme.fonts.serif,
    color: TasbihTheme.colors.textPrimary,
  },
  label: {
    fontFamily: TasbihTheme.fonts.sans,
    color: TasbihTheme.colors.textSecondary,
  },
});
