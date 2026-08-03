import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { TasbihTheme } from '../../constants/TasbihTheme';
import type { BenefitIconName, BenefitItem } from '../../types/tasbih';
import { useTasbihLayout } from '../../hooks/useTasbihLayout';
import { Icons } from '../../constants/Icons';

const BENEFIT_ICONS: Record<
  BenefitIconName,
  { name: keyof typeof Icons.Ionicons.glyphMap; family: 'ionicons' | 'material' }
> = {
  heart: { name: 'heart-outline', family: 'ionicons' },
  book: { name: 'book-outline', family: 'ionicons' },
  shield: { name: 'shield-checkmark-outline', family: 'ionicons' },
  star: { name: 'star-outline', family: 'ionicons' },
  moon: { name: 'moon-outline', family: 'ionicons' },
  hands: { name: 'hand-left-outline', family: 'ionicons' },
};

interface BenefitCardProps {
  item: BenefitItem;
  width?: number;
  onPress?: (item: BenefitItem) => void;
  style?: ViewStyle;
}

export const BenefitCard: React.FC<BenefitCardProps> = ({ item, width, onPress, style }) => {
  const { rs } = useTasbihLayout();
  const cardWidth = width ?? rs(148);
  const iconConfig = BENEFIT_ICONS[item.icon];

  return (
    <Pressable
      onPress={() => onPress?.(item)}
      style={({ pressed }) => [
        styles.card,
        {
          width: cardWidth,
          borderRadius: rs(16),
          padding: rs(14),
          opacity: pressed ? 0.9 : 1,
        },
        style,
      ]}>
      <View style={[styles.iconWrap, { width: rs(36), height: rs(36), borderRadius: rs(18) }]}>
        <Icons.Ionicons
          name={iconConfig.name}
          size={rs(18)}
          color={TasbihTheme.colors.primaryGreen}
        />
      </View>
      <Text style={[styles.title, { fontSize: rs(13), marginTop: rs(10) }]} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={[styles.detail, { fontSize: rs(11), marginTop: rs(6) }]} numberOfLines={2}>
        {item.surahName}, {item.times} time{item.times > 1 ? 's' : ''}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: TasbihTheme.colors.cardCream,
    borderWidth: 1,
    borderColor: TasbihTheme.colors.border,
    ...TasbihTheme.shadow.card,
  },
  iconWrap: {
    backgroundColor: `${TasbihTheme.colors.gold}22`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: TasbihTheme.fonts.sansBold,
    color: TasbihTheme.colors.primaryGreen,
    lineHeight: 18,
  },
  detail: {
    fontFamily: TasbihTheme.fonts.sans,
    color: TasbihTheme.colors.textSecondary,
    lineHeight: 16,
  },
});
