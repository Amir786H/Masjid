import { useAppStore } from '@/stores/appStore';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { Colors } from '../../constants/Colors';
import { useAuthContext } from '../../contexts/AuthContext';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const MosqueMark = ({ size }: { size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 160 160">
    <Circle cx="80" cy="80" r="66" fill="#FFFFFF" opacity="0.94" />
    <Circle cx="80" cy="80" r="52" fill="#E8F7ED" />
    <Path
      d="M48 112V78c0-19 14-34 32-43 18 9 32 24 32 43v34H48Z"
      fill={Colors.light.primary}
      opacity="0.95"
    />
    <Path
      d="M64 112V86c0-8 7-15 16-15s16 7 16 15v26H64Z"
      fill="#FFFFFF"
      opacity="0.95"
    />
    <Rect x="30" y="66" width="16" height="46" rx="8" fill="#16A34A" opacity="0.86" />
    <Rect x="114" y="66" width="16" height="46" rx="8" fill="#16A34A" opacity="0.86" />
    <Path
      d="M102 43c-15 5-24-3-25-15 9 9 20 8 29 0-1 6-2 11-4 15Z"
      fill="#FACC15"
    />
    <Path d="M36 116h88" stroke="#166534" strokeWidth="8" strokeLinecap="round" opacity="0.2" />
  </Svg>
);

export default function SplashScreen() {
  const { loading, session, user } = useAuthContext();
  const {
      user: profile,
      masjids,
      communityPosts,
      loadingCommunity,
      loadUserProfile,
      loadMasjids,
      loadCommunityPosts,
    } = useAppStore();
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const entrance = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const orbit = useRef(new Animated.Value(0)).current;

  const markSize = useMemo(() => {
    const shortestSide = Math.min(width, height);
    return Math.max(144, Math.min(shortestSide * 0.46, 220));
  }, [height, width]);

  const orbitSize = markSize + 54;

  useEffect(() => {
    // console.log('SplashScreen----', 'loading:', loading, 'session:', session, 'user:', user);

    if (loading) {
      return;
    }

    const timer = setTimeout(() => {
      if (session) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/sign-in');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [loading, session, router]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(entrance, {
        toValue: 1,
        duration: 720,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1,
            duration: 1400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 0,
            duration: 1400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.loop(
        Animated.timing(orbit, {
          toValue: 1,
          duration: 7200,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ),
    ]).start();
  }, [entrance, orbit, pulse]);

  const entranceStyle = {
    opacity: entrance,
    transform: [
      {
        translateY: entrance.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
      {
        scale: entrance.interpolate({
          inputRange: [0, 1],
          outputRange: [0.94, 1],
        }),
      },
    ],
  };

  const pulseStyle = {
    opacity: pulse.interpolate({
      inputRange: [0, 1],
      outputRange: [0.18, 0.36],
    }),
    transform: [
      {
        scale: pulse.interpolate({
          inputRange: [0, 1],
          outputRange: [0.92, 1.08],
        }),
      },
    ],
  };

  const orbitStyle = {
    transform: [
      {
        rotate: orbit.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        }),
      },
    ],
  };

  return (
    <AnimatedLinearGradient
      colors={['#FAFAFA', '#E8F7ED', '#FFFFFF']}
      locations={[0, 0.54, 1]}
      style={styles.container}
    >
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <Animated.View style={[styles.content, entranceStyle]}>
        <View style={[styles.markStage, { width: orbitSize, height: orbitSize }]}>
          <Animated.View
            style={[
              styles.pulseRing,
              pulseStyle,
              {
                width: markSize + 34,
                height: markSize + 34,
                borderRadius: (markSize + 34) / 2,
              },
            ]}
          />
          <Animated.View style={[styles.orbit, { width: orbitSize, height: orbitSize, borderRadius: orbitSize / 2 }, orbitStyle]}>
            {Array.from({ length: 8 }).map((_, index) => {
              const angle = (index / 8) * Math.PI * 2;
              const radius = orbitSize / 2 - 6;
              const beadSize = index % 2 === 0 ? 7 : 5;

              return (
                <View
                  key={index}
                  style={[
                    styles.bead,
                    {
                      width: beadSize,
                      height: beadSize,
                      borderRadius: beadSize / 2,
                      left: orbitSize / 2 + Math.cos(angle) * radius - beadSize / 2,
                      top: orbitSize / 2 + Math.sin(angle) * radius - beadSize / 2,
                      opacity: index % 2 === 0 ? 0.8 : 0.42,
                    },
                  ]}
                />
              );
            })}
          </Animated.View>
          <View style={styles.markShadow}>
            <MosqueMark size={markSize} />
          </View>
        </View>

        <View style={styles.copyBlock}>
          <Text style={styles.appName}>{masjids[0]?.name || 'Masjid Hashimpur'}</Text>
          <Text style={styles.tagline}>Namaz times, community, and qibla in one peaceful place.</Text>
        </View>
      </Animated.View>
    </AnimatedLinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    overflow: 'hidden',
    paddingHorizontal: 28,
  },
  glowTop: {
    position: 'absolute',
    top: -120,
    right: -90,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#BBF7D0',
    opacity: 0.34,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -140,
    left: -120,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#DCFCE7',
    opacity: 0.54,
  },
  content: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
  },
  markStage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: Colors.light.primary,
    backgroundColor: '#DCFCE7',
  },
  orbit: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.14)',
  },
  bead: {
    position: 'absolute',
    backgroundColor: Colors.light.primary,
  },
  markShadow: {
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 14,
  },
  copyBlock: {
    marginTop: 18,
    alignItems: 'center',
  },
  appName: {
    color: Colors.light.text,
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  tagline: {
    color: Colors.light.textSecondary,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    maxWidth: 310,
    textAlign: 'center',
  },
});
