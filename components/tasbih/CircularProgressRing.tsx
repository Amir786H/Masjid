import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { TasbihTheme } from '../../constants/TasbihTheme';
import { Icons } from '../../constants/Icons';

interface CircularProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  completed?: boolean;
  trackColor?: string;
  fillColor?: string;
  textColor?: string;
}

export const CircularProgressRing: React.FC<CircularProgressRingProps> = ({
  progress,
  size = 44,
  strokeWidth = 3.5,
  completed = false,
  trackColor = TasbihTheme.colors.progressTrack,
  fillColor = TasbihTheme.colors.progressFill,
  textColor = TasbihTheme.colors.textPrimary,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(progress, 0), 100);
  const strokeDashoffset = circumference - (circumference * clamped) / 100;
  const center = size / 2;

  if (completed) {
    return (
      <View
        style={[
          styles.completed,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: TasbihTheme.colors.checkGreen,
          },
        ]}>
        <Icons.Ionicons name="checkmark" size={size * 0.45} color={TasbihTheme.colors.white} />
      </View>
    );
  }

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={fillColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>
      <View style={styles.labelWrap}>
        <Text style={[styles.label, { color: textColor, fontSize: size * 0.22 }]}>
          {clamped}%
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  labelWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: TasbihTheme.fonts.sansSemiBold,
    fontWeight: '600',
  },
  completed: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
