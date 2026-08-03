import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { TasbihTheme } from '../../constants/TasbihTheme';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
  style?: ViewStyle;
  titleSize?: number;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  actionLabel,
  onActionPress,
  style,
  titleSize = 16,
}) => (
  <View style={[styles.row, style]}>
    <Text style={[styles.title, { fontSize: titleSize }]}>{title}</Text>
    {actionLabel ? (
      <Pressable onPress={onActionPress} hitSlop={8}>
        <Text style={styles.action}>{actionLabel}</Text>
      </Pressable>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: TasbihTheme.spacing.md,
  },
  title: {
    fontFamily: TasbihTheme.fonts.sansBold,
    fontWeight: '700',
    color: TasbihTheme.colors.primaryGreen,
    flex: 1,
  },
  action: {
    fontFamily: TasbihTheme.fonts.sansMedium,
    fontSize: 13,
    color: TasbihTheme.colors.textSecondary,
  },
});
