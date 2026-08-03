import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';

import { TasbihTheme } from '../../constants/TasbihTheme';
import { Icons } from '../../constants/Icons';

interface IconCircleButtonProps {
  iconName: React.ComponentProps<typeof Icons.Ionicons>['name'];
  onPress?: () => void;
  size?: number;
  style?: ViewStyle;
}

export const IconCircleButton: React.FC<IconCircleButtonProps> = ({
  iconName,
  onPress,
  size = 40,
  style,
}) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.button,
      {
        width: size,
        height: size,
        borderRadius: size / 2,
        opacity: pressed ? 0.75 : 1,
      },
      style,
    ]}>
    <Icons.Ionicons
      name={iconName}
      size={size * 0.45}
      color={TasbihTheme.colors.primaryGreen}
    />
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: TasbihTheme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: TasbihTheme.colors.border,
    ...TasbihTheme.shadow.card,
  },
});
