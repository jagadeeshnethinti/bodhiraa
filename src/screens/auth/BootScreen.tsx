import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated, Easing } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme';
import { Icon } from '../../components/common/Icon';
import { OrbitRing, GlowBlob } from '../../components/illustrations/OnboardingArt';

/**
 * Animated splash shown while the app restores the stored token. A rotating
 * orbit ring sits behind a gently pulsing logo, the wordmark fades up, and an
 * indeterminate gold bar tracks the load.
 */
export const BootScreen: React.FC = () => {
  const spin = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const intro = useRef(new Animated.Value(0)).current;
  const bar = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loops = [
      Animated.loop(Animated.timing(spin, { toValue: 1, duration: 14000, easing: Easing.linear, useNativeDriver: true })),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      ),
      Animated.loop(Animated.timing(bar, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true })),
    ];
    const introAnim = Animated.timing(intro, { toValue: 1, duration: 700, delay: 150, easing: Easing.out(Easing.cubic), useNativeDriver: true });
    loops.forEach(l => l.start());
    introAnim.start();
    return () => {
      loops.forEach(l => l.stop());
      introAnim.stop();
    };
  }, [spin, pulse, intro, bar]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const introY = intro.interpolate({ inputRange: [0, 1], outputRange: [12, 0] });
  const barX = bar.interpolate({ inputRange: [0, 1], outputRange: [-44, 88] });

  return (
    <LinearGradient colors={['#1A0A0C', '#2A0E13', '#3D1520', '#52202E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
      <View style={styles.blob} pointerEvents="none">
        <GlowBlob size={360} />
      </View>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.center}>
          <View style={styles.logoStack}>
            <Animated.View style={[styles.orbit, { transform: [{ rotate }] }]} pointerEvents="none">
              <OrbitRing size={172} opacity={0.45} />
            </Animated.View>
            <Animated.View style={[styles.logoBox, { transform: [{ scale }] }]}>
              <Icon name="brain" size={46} color={Colors.primary} />
            </Animated.View>
          </View>

          <Animated.View style={{ opacity: intro, transform: [{ translateY: introY }], alignItems: 'center' }}>
            <Text style={styles.brand}>Bodhira</Text>
            <Text style={styles.tagline}>AI-POWERED LEARNING</Text>
          </Animated.View>

          <View style={styles.barTrack}>
            <Animated.View style={[styles.barFill, { transform: [{ translateX: barX }] }]} />
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  blob: { position: 'absolute', top: '20%', alignSelf: 'center', opacity: 0.8 },
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  logoStack: { width: 172, height: 172, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  orbit: { position: 'absolute' },
  logoBox: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: 'rgba(196,149,96,0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(196,149,96,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: { fontSize: 38, fontWeight: '900', color: '#F5E8D0', letterSpacing: -1 },
  tagline: { fontSize: 11, letterSpacing: 4, fontWeight: '700', color: Colors.primary, marginTop: 2 },
  barTrack: {
    width: 132,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(196,149,96,0.18)',
    overflow: 'hidden',
    marginTop: 30,
  },
  barFill: { width: 44, height: 4, borderRadius: 2, backgroundColor: Colors.primary },
});
