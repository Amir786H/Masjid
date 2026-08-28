import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { TasbihTheme } from '../../constants/TasbihTheme';
import { useTasbihLayout } from '../../hooks/useTasbihLayout';
import { useTasbihStore } from '../../stores/tasbihStore';
import { ProgressBar } from './ProgressBar';

const SurahDetail = () => {
  const router = useRouter();
  const { surahId } = useLocalSearchParams<{ surahId?: string }>();
  const { surahTasks } = useTasbihStore();
  const { rs, isCompact, isWide } = useTasbihLayout();

  const task = useMemo(
    () => surahTasks.find((item) => item.id === surahId) ?? surahTasks[0],
    [surahTasks, surahId]
  );

  const progress = Math.min(Math.round((task.current / task.target) * 100), 100);

  return (
    <View style={styles.wrapper}>
      {/* <View style={[styles.header, { paddingHorizontal: rs(16), paddingTop: rs(20), paddingBottom: rs(12) }]}>
        <Pressable onPress={() => router.back()} style={styles.closeButton} hitSlop={12}>
          <Icons.Ionicons name="close" size={rs(20)} color={TasbihTheme.colors.primaryGreen} />
        </Pressable>
        <Text style={[styles.headerTitle, { fontSize: rs(18) }]}>Surah Details</Text>
        <View style={{ width: rs(28) }} />
      </View> */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: isWide ? rs(32) : rs(16),
          paddingBottom: rs(40),
          alignItems: 'center',
        }}
      >
        <View
          style={[
            styles.card,
            {
              width: '100%',
              maxWidth: isWide ? 560 : '100%',
              borderRadius: rs(28),
              padding: rs(20),
            },
          ]}
        >
          <View style={styles.topRow}>
            <View style={[styles.arabicBadge, { width: rs(80), height: rs(80), borderRadius: rs(18) }]}>
              <Text style={[styles.arabicText, { fontSize: rs(30) }]}>{task.arabicName}</Text>
            </View>

            <View style={styles.nameWrap}>
              <Text style={[styles.eyebrow, { fontSize: rs(11) }]}>Selected Surah</Text>
              <Text style={[styles.surahName, { fontSize: rs(26) }]}>Surah {task.name}</Text>
              <Text style={[styles.meaning, { fontSize: rs(13) }]}>{task.meaning}</Text>
            </View>
          </View>

          <View style={[styles.metaGrid, { marginTop: rs(22) }]}>
            <View style={styles.metaItem}>
              <Text style={[styles.metaLabel, { fontSize: rs(10) }]}>Target</Text>
              <Text style={[styles.metaValue, { fontSize: rs(18) }]}>{task.target}x</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={[styles.metaLabel, { fontSize: rs(10) }]}>Completed</Text>
              <Text style={[styles.metaValue, { fontSize: rs(18) }]}>{task.current}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={[styles.metaLabel, { fontSize: rs(10) }]}>Progress</Text>
              <Text style={[styles.metaValue, { fontSize: rs(18) }]}>{progress}%</Text>
            </View>
          </View>

          <View style={[styles.section, { marginTop: rs(22) }]}>
            <Text style={[styles.sectionTitle, { fontSize: rs(13) }]}>Benefit</Text>
            <Text style={[styles.sectionText, { fontSize: rs(15) }]}>{task.benefit}</Text>
          </View>

          <View style={[styles.section, { marginTop: rs(18) }]}>
            <Text style={[styles.sectionTitle, { fontSize: rs(13) }]}>Daily Progress</Text>
            <View style={{ marginTop: rs(10) }}>
              <ProgressBar
                progress={progress}
                height={rs(10)}
                trackColor={TasbihTheme.colors.progressTrack}
                fillColor={TasbihTheme.colors.progressFillGold}
              />
              <Text style={[styles.progressText, { fontSize: rs(12), marginTop: rs(8) }]}>
                {task.current} of {task.target} recitations completed
              </Text>
            </View>
          </View>

          <View style={[styles.section, { marginTop: rs(18) }]}>
            <Text style={[styles.sectionTitle, { fontSize: rs(13) }]}>Guidance</Text>
            <Text style={[styles.sectionText, { fontSize: rs(15) }]}>
              Keep reflecting on this surah and continue your daily practice with consistency and intention.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default SurahDetail;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: TasbihTheme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: TasbihTheme.colors.border,
    backgroundColor: TasbihTheme.colors.background,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(10,61,46,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: TasbihTheme.fonts.sansBold,
    color: TasbihTheme.colors.primaryGreen,
  },
  card: {
    backgroundColor: TasbihTheme.colors.white,
    borderWidth: 1,
    borderColor: TasbihTheme.colors.border,
    ...TasbihTheme.shadow.elevated,
    marginTop: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  arabicBadge: {
    backgroundColor: 'rgba(200,168,112,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(200,168,112,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arabicText: {
    fontFamily: TasbihTheme.fonts.arabic,
    color: TasbihTheme.colors.primaryGreen,
  },
  nameWrap: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    fontFamily: TasbihTheme.fonts.sansSemiBold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: TasbihTheme.colors.gold,
    marginBottom: 4,
  },
  surahName: {
    fontFamily: TasbihTheme.fonts.serif,
    color: TasbihTheme.colors.primaryGreen,
    lineHeight: 32,
  },
  meaning: {
    fontFamily: TasbihTheme.fonts.sans,
    color: TasbihTheme.colors.textSecondary,
    marginTop: 2,
  },
  metaGrid: {
    flexDirection: 'row',
    borderRadius: 18,
    backgroundColor: TasbihTheme.colors.cream,
    padding: 12,
    gap: 10,
  },
  metaItem: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  metaLabel: {
    fontFamily: TasbihTheme.fonts.sansMedium,
    color: TasbihTheme.colors.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  metaValue: {
    fontFamily: TasbihTheme.fonts.sansBold,
    color: TasbihTheme.colors.primaryGreen,
  },
  section: {
    borderTopWidth: 1,
    borderTopColor: TasbihTheme.colors.border,
    paddingTop: 18,
  },
  sectionTitle: {
    fontFamily: TasbihTheme.fonts.sansSemiBold,
    color: TasbihTheme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionText: {
    fontFamily: TasbihTheme.fonts.sans,
    color: TasbihTheme.colors.textPrimary,
    marginTop: 8,
    lineHeight: 24,
  },
  progressText: {
    fontFamily: TasbihTheme.fonts.sansMedium,
    color: TasbihTheme.colors.textSecondary,
  },
});