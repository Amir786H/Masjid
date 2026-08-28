import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

import SurahDetail from '@/components/tasbih/SurahDetail';
import { TasbihTheme } from '@/constants/TasbihTheme';

export default function SurahDetailModalScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <SurahDetail />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TasbihTheme.colors.background,
  },
});
