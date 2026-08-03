import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { TasbihTheme } from '../../constants/TasbihTheme';

interface ProgressBarProps {
  progress: number;
  height?: number;
  trackColor?: string;
  fillColor?: string;
  style?: ViewStyle;
  rounded?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 6,
  trackColor = TasbihTheme.colors.progressTrack,
  fillColor = TasbihTheme.colors.progressFill,
  style,
  rounded = true,
}) => {
  const clamped = Math.min(Math.max(progress, 0), 100);

  return (
    <View
      style={[
        styles.track,
        { height, backgroundColor: trackColor, borderRadius: rounded ? height / 2 : 2 },
        style,
      ]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clamped}%`,
            backgroundColor: fillColor,
            borderRadius: rounded ? height / 2 : 2,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
