import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { TasbihTheme } from '../../constants/TasbihTheme';
import { useTasbihLayout } from '../../hooks/useTasbihLayout';
import type { CurrentTask } from '../../types/tasbih';
import { LanternIllustration } from './TasbihSvgAssets';

interface CurrentTaskCardProps {
  task: CurrentTask;
  onViewDetails?: () => void;
}

export const CurrentTaskCard: React.FC<CurrentTaskCardProps> = ({ task, onViewDetails }) => {
  const { rs } = useTasbihLayout();

  const numericIcon = require('../../assets/images/numeric_icon.png');
  const namaz = require('../../assets/images/namaz.jpg');
  const tilawat = require('../../assets/images/tilawat.jpg');
  const adab = require('../../assets/images/adab.jpg');
  const zikr = require('../../assets/images/zikr.jpg');
  const zakat = require('../../assets/images/zakat.jpg');
  const book = require('../../assets/images/book.png');
  const allah = require('../../assets/images/allah.png');

  const pickBackground = () => {
    const key = (task.benefit + ' ' + (task.surahName || '')).toLowerCase();
    if (key.includes('namaz') || key.includes('prayer')) return namaz;
    if (key.includes('tilawat') || key.includes('recitation')) return tilawat;
    if (key.includes('adab')) return adab;
    if (key.includes('zikr') || key.includes('dhikr')) return zikr;
    if (key.includes('zakat')) return zakat;
    if (key.includes('book') || key.includes('surah')) return book;
    if (key.includes('allah')) return allah;
    return namaz;
  };

  const bgImage = pickBackground();

  return (
    <View style={[styles.card, { borderRadius: rs(18), padding: rs(14) }]}>
      <View style={styles.row}>
        <View style={[styles.thumbWrap, { width: rs(84), height: rs(84), borderRadius: rs(14) }]}>
          <Image source={bgImage} style={styles.thumbImage} />
          <View style={styles.numericWrap}>
            
            {/* <Image source={numericIcon} style={styles.numericIcon} /> */}
            {/* <View style={[styles.targetBadge, { paddingHorizontal: rs(6), paddingVertical: rs(4), borderRadius: rs(12) }]}>
              <Text style={[styles.targetText, { fontSize: rs(12) }]}>{task.target}</Text>
            </View> */}
          </View>
        </View>

        <View style={styles.body}>
          <Text style={[styles.eyebrow, { fontSize: rs(10) }]}>CURRENT TASK</Text>
          <Text style={[styles.benefit, { fontSize: rs(18) }]}>{task.benefit}</Text>
          <Text style={[styles.description, { fontSize: rs(12) }]} numberOfLines={2} ellipsizeMode="tail">
            {task.description}
          </Text>
          <Pressable onPress={onViewDetails} style={[styles.detailsBtn, { marginTop: rs(10) }]}>
            <Text style={[styles.detailsText, { fontSize: rs(11) }]}>View Details ›</Text>
          </Pressable>
        </View>

        <View style={styles.lanternWrap}>
          <LanternIllustration width={rs(76)} height={rs(96)} />
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: TasbihTheme.spacing.md,
  },
  thumbWrap: {
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbImage: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
    resizeMode: 'cover',
    opacity: 0.95,
  },
  numericWrap: {
    position: 'absolute',
    right: 6,
    top: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numericIcon: {
    width: 34,
    height: 34,
    borderRadius: 18,
    opacity: 0.95,
  },
  targetBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    backgroundColor: TasbihTheme.colors.gold,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  targetText: {
    fontFamily: TasbihTheme.fonts.sansSemiBold,
    color: TasbihTheme.colors.cardGreen,
  },
  body: {
    flex: 1,
    paddingRight: TasbihTheme.spacing.sm,
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
    paddingHorizontal: TasbihTheme.spacing.sm,
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
