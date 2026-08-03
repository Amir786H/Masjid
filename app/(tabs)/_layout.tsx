import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useColorScheme } from '../../components/useColorScheme';
import { Colors } from '../../constants/Colors';
import { TasbihTheme } from '../../constants/TasbihTheme';
import { Icons } from '../../constants/Icons';

function AnimatedTabButton(props: any) {
  const { children, style, accessibilityState, onPress, compact } = props;
  const scheme = useColorScheme();
  const palette = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const focused = accessibilityState?.selected ?? false;

  const scale = useSharedValue(1);
  const glow = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withSpring(focused ? 1.03 : 1, {
      damping: 14,
      stiffness: 180,
    });
    glow.value = withTiming(focused ? 1 : 0, { duration: 250 });
  }, [focused, glow, scale]);

  const chipStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: focused
      ? scheme === 'dark'
        ? `${palette.primary}24`
        : `${palette.lightGreen}CC`
      : 'transparent',
    borderColor: focused ? `${palette.primary}42` : 'transparent',
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value * (scheme === 'dark' ? 0.85 : 0.65),
    transform: [{ scale: 1 + glow.value * 0.09 }],
    backgroundColor: focused ? `${palette.primary}28` : 'transparent',
  }));

  return (
    <Pressable onPress={onPress} style={[style, styles.tabButton]}>
      <Animated.View style={[styles.tabChip, compact && styles.tabChipCompact, chipStyle]}>
        <Animated.View style={[styles.tabGlow, glowStyle]} />
        {children}
      </Animated.View>
    </Pressable>
  );
}

function TasbihTabIcon({ focused }: { focused: boolean }) {
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const size = isCompact ? 52 : 56;

  return (
    <View style={[tasbihIconStyles.wrap, { width: size, height: size, borderRadius: size / 2 }]}>
      <LinearGradient
        colors={[TasbihTheme.colors.cardGreen, TasbihTheme.colors.primaryGreen]}
        style={[tasbihIconStyles.gradient, { borderRadius: size / 2 }]}>
        <Icons.MaterialCommunityIcons
          name="circle-multiple"
          size={isCompact ? 24 : 26}
          color={TasbihTheme.colors.white}
        />
      </LinearGradient>
      {focused && <View style={tasbihIconStyles.dot} />}
    </View>
  );
}

const tasbihIconStyles = StyleSheet.create({
  wrap: {
    marginTop: -18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: TasbihTheme.colors.background,
    shadowColor: TasbihTheme.colors.primaryGreen,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 10,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: TasbihTheme.colors.primaryGreen,
    marginTop: 4,
  },
});

export default function TabLayout() {
  const scheme = useColorScheme();
  const palette = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const isWide = width >= 768;
  const horizontalInset = isWide ? Math.max((width - 640) / 2, 28) : isCompact ? 8 : 12;
  const tabBarHeight = isCompact ? 64 : 70;
  const bottomInset = Platform.OS === 'ios' ? (isCompact ? 10 : 14) : 12;
  const glassBorder = scheme === 'dark' ? 'rgba(255,255,255,0.13)' : 'rgba(255, 255, 255, 0.72)';
  const glassShadow = scheme === 'dark' ? 0.26 : 0.16;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.tabIconDefault,
        tabBarButton: (props) => <AnimatedTabButton {...props} compact={isCompact} />,
        tabBarBackground: () => (
          <View style={styles.glassBackground}>
            <LinearGradient
              colors={
                scheme === 'dark'
                  ? ['rgba(30,41,59,0.78)', 'rgba(15,23,42,0.62)', 'rgba(15,23,42,0.78)']
                  : ['rgba(255,255,255,0.86)', 'rgba(255,255,255,0.66)', 'rgba(236,253,245,0.74)']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={[styles.glassHighlight, { borderColor: glassBorder }]} />
            <View
              style={[
                styles.glassTint,
                {
                  backgroundColor:
                    scheme === 'dark' ? `${palette.primary}10` : `${palette.primary}0D`,
                },
              ]}
            />
          </View>
        ),
        tabBarStyle: {
          position: 'absolute',
          left: horizontalInset,
          right: horizontalInset,
          bottom: bottomInset,
          height: tabBarHeight,
          borderRadius: 30,
          borderTopWidth: 0,
          backgroundColor: 'transparent',
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: glassBorder,
          overflow: 'hidden',
          elevation: 14,
          shadowColor: palette.primary,
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: glassShadow,
          shadowRadius: 22,
          paddingTop: isCompact ? 5 : 6,
          paddingBottom: isCompact ? 3 : 4,
          paddingHorizontal: isCompact ? 4 : 6,
        },
        tabBarItemStyle: {
          borderRadius: 20,
          marginHorizontal: isCompact ? 0 : 2,
          paddingVertical: 2,
        },
        tabBarIconStyle: {
          marginBottom: isCompact ? 1 : 2,
        },
        tabBarLabelStyle: {
          fontSize: isCompact ? 9 : 10,
          fontWeight: '800',
          letterSpacing: 0.4,
          textTransform: 'uppercase',
          width: isCompact ? 50 : 60,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'HOME',
          tabBarIcon: ({ color, focused }) => (
            <Icons.Ionicons name="home" size={focused ? 24 : 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="prayers"
        options={{
          title: 'PRAYERS',
          tabBarIcon: ({ color, focused }) => (
            <Icons.Ionicons name="time" size={focused ? 24 : 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'COMMUNITY',
          tabBarIcon: ({ color, focused }) => (
            <Icons.Ionicons name="people" size={focused ? 24 : 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasbih"
        options={{
          title: 'TASBIH',
          tabBarIcon: ({ focused }) => <TasbihTabIcon focused={focused} />,
          tabBarLabelStyle: {
            marginTop: -2,
          },
        }}
      />
      <Tabs.Screen
        name="donation"
        options={{
          title: 'DONATION',
          tabBarIcon: ({ color, focused }) => (
            <Icons.MaterialIcons name="volunteer-activism" size={focused ? 24 : 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="qibla"
        options={{
          title: 'QIBLA',
          tabBarIcon: ({ color, focused }) => (
            <Icons.MaterialIcons name="mosque" size={focused ? 24 : 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'PROFILE',
          tabBarIcon: ({ color, focused }) => (
            <Icons.Ionicons name="person" size={focused ? 24 : 22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabChip: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    minHeight: 54,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: StyleSheet.hairlineWidth,
    // borderWidth: 2,
    overflow: 'hidden',
  },
  tabChipCompact: {
    minHeight: 50,
    paddingHorizontal: 6,
    paddingVertical: 5,
  },
  tabGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
  },
  glassBackground: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    borderRadius: 30,
  },
  glassHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 30,
  },
  glassTint: {
    ...StyleSheet.absoluteFillObject,
  },
});
