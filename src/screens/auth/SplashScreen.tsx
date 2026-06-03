import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { Colors } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  useEffect(() => {
    const t = setTimeout(() => navigation.replace('Onboarding'), 2500);
    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <LinearGradient
      colors={['#1A0A0C', '#2A0E13', '#3D1520', '#52202E']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Gold shimmer overlay */}
        <View style={styles.shimmer} pointerEvents="none" />

        <View style={styles.center}>
          {/* Logo */}
          <View style={styles.logoWrap}>
            <View style={styles.ring2} />
            <View style={styles.ring1} />
            <View style={styles.logoBox}>
              <Text style={styles.logoEmoji}>🧠</Text>
            </View>
          </View>

          {/* Brand */}
          <View style={styles.brand}>
            <Text style={styles.brandName}>Bodhira</Text>
            <Text style={styles.tagline}>AI-POWERED LEARNING</Text>
          </View>

          {/* Dots */}
          <View style={styles.dots}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={[styles.dot, styles.dotActive]} />
          </View>
        </View>

        <View style={styles.bottom}>
          <Text style={styles.version}>v3.0.0 · AI Edition</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe:     { flex: 1 },
  shimmer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(196,149,96,0.06)',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  logoWrap: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBox: {
    width: 104,
    height: 104,
    borderRadius: 30,
    backgroundColor: 'rgba(196,149,96,0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(196,149,96,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.brand,
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 12,
    zIndex: 2,
  },
  logoEmoji: { fontSize: 50 },
  ring1: {
    position: 'absolute',
    width: 128, height: 128, borderRadius: 64,
    borderWidth: 1, borderColor: 'rgba(196,149,96,0.14)',
  },
  ring2: {
    position: 'absolute',
    width: 152, height: 152, borderRadius: 76,
    borderWidth: 1, borderColor: 'rgba(196,149,96,0.06)',
  },
  brand: { alignItems: 'center', gap: 6 },
  brandName: {
    fontSize: 44, fontWeight: '900',
    letterSpacing: -0.03 * 44, color: '#F5E8D0',
  },
  tagline: {
    fontSize: 11, letterSpacing: 4,
    fontWeight: '700', color: Colors.primary,
  },
  dots: { flexDirection: 'row', gap: 6 },
  dot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: 'rgba(196,149,96,0.3)',
  },
  dotActive: {
    width: 20, borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  bottom: { alignItems: 'center', paddingBottom: 8 },
  version: {
    fontSize: 11, fontWeight: '600',
    color: 'rgba(196,149,96,0.6)', letterSpacing: 0.5,
  },
});
