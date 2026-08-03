import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { TasbihTheme } from '../../constants/TasbihTheme';
import type { BenefitItem } from '../../types/tasbih';
import { useTasbihLayout } from '../../hooks/useTasbihLayout';
import { BenefitCard } from './BenefitCard';
import { SectionHeader } from './SectionHeader';

interface BenefitsCarouselProps {
  items: BenefitItem[];
  onItemPress?: (item: BenefitItem) => void;
  onViewAll?: () => void;
  title?: string;
}

export const BenefitsCarousel: React.FC<BenefitsCarouselProps> = ({
  items,
  onItemPress,
  onViewAll,
  title = '3. How Many Times & For What?',
}) => {
  const { rs } = useTasbihLayout();
  const cardWidth = rs(148);

  return (
    <View style={styles.container}>
      <SectionHeader title={title} actionLabel="View All ›" onActionPress={onViewAll} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { gap: rs(12), paddingRight: rs(4) }]}>
        {items.map((item) => (
          <BenefitCard key={item.id} item={item} width={cardWidth} onPress={onItemPress} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: TasbihTheme.spacing.xxl,
  },
  scrollContent: {
    paddingBottom: TasbihTheme.spacing.xs,
  },
});
