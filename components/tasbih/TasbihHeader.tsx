import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { TasbihTheme } from '../../constants/TasbihTheme';
import { useTasbihLayout } from '../../hooks/useTasbihLayout';
import { IconCircleButton } from './IconCircleButton';
import { MosqueSilhouette } from './TasbihSvgAssets';

interface TasbihHeaderProps {
  title?: string;
  subtitle?: string;
  onMenuPress?: () => void;
  onStatsPress?: () => void;
}

export const TasbihHeader: React.FC<TasbihHeaderProps> = ({
  title = 'Surah Tasbih',
  subtitle = 'Recite with purpose, earn endless rewards.',
  onMenuPress,
  onStatsPress,
}) => {
  const { width, rs, horizontalPadding } = useTasbihLayout();

  return (
    <View style={[styles.container, { paddingHorizontal: horizontalPadding }]}>
      <View style={styles.silhouetteWrap}>
        <MosqueSilhouette width={width} height={rs(110)} />
      </View>

      <View style={styles.topRow}>
        <IconCircleButton iconName="menu" onPress={onMenuPress} size={rs(40)} />
        <IconCircleButton iconName="bar-chart-outline" onPress={onStatsPress} size={rs(40)} />
      </View>

      <View style={styles.titleBlock}>
        <Text style={[styles.title, { fontSize: rs(28) }]}>{title}</Text>
        <Text style={[styles.subtitle, { fontSize: rs(13) }]}>{subtitle}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: TasbihTheme.spacing.sm,
    paddingBottom: TasbihTheme.spacing.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  silhouetteWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  titleBlock: {
    alignItems: 'center',
    marginTop: TasbihTheme.spacing.xl,
    zIndex: 1,
  },
  title: {
    fontFamily: TasbihTheme.fonts.serif,
    color: TasbihTheme.colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontFamily: TasbihTheme.fonts.sans,
    color: TasbihTheme.colors.textSecondary,
    textAlign: 'center',
    marginTop: TasbihTheme.spacing.xs,
    lineHeight: 20,
  },
});
