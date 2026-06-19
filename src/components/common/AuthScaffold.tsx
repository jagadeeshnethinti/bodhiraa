/**
 * Premium chrome shared by the auth form screens (Sign up, Phone, OTP, Forgot
 * password). A branded dark gradient with soft glows carries a compact hero
 * (orbit-ring badge + title + subtitle); the form lives in an elevated white
 * card that sizes to its content and floats on the gradient — so short screens
 * never leave an awkward empty void and long ones scroll cleanly.
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
  Animated,
  Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Shadow } from '../../theme';
import { Icon, IconName } from './Icon';
import { Entrance, Pulse } from './anim';
import { GlowBlob, OrbitRing } from '../illustrations/OnboardingArt';

interface Props {
  title: string;
  subtitle?: React.ReactNode;
  badge?: IconName;
  accent?: string;
  onBack?: () => void;
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}

export const AuthScaffold: React.FC<Props> = ({
  title,
  subtitle,
  badge = 'brain',
  accent = Colors.primary,
  onBack,
  children,
  contentStyle,
}) => {
  const insets = useSafeAreaInsets();

  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 18000, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <LinearGradient colors={['#1A0A0C', '#2A0E13', '#3D1520']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fill}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={[styles.blob, { top: -80, right: -70 }]} pointerEvents="none">
        <GlowBlob size={280} color={accent} />
      </View>
      <View style={[styles.blob, { bottom: -40, left: -90 }]} pointerEvents="none">
        <GlowBlob size={240} color="#7A1322" />
      </View>

      <SafeAreaView edges={['top']} style={styles.topbar}>
        {onBack ? (
          <TouchableOpacity style={styles.backBtn} onPress={onBack} hitSlop={8}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backBtn} />
        )}
      </SafeAreaView>

      <ScrollView
        style={styles.fill}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Entrance index={0} style={styles.hero}>
          <View style={styles.badgeWrap}>
            <Animated.View style={[styles.badgeOrbit, { transform: [{ rotate }] }]} pointerEvents="none">
              <OrbitRing size={96} opacity={0.4} />
            </Animated.View>
            <Pulse style={[styles.badge, { borderColor: accent + '5A' }]}>
              <Icon name={badge} size={26} color={accent} />
            </Pulse>
          </View>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </Entrance>

        <Entrance delay={140} distance={30} duration={540} style={[styles.card, contentStyle]}>
          {children}
        </Entrance>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
  blob: { position: 'absolute', opacity: 0.7 },
  topbar: { paddingHorizontal: 18, paddingTop: 4 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(196,149,96,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(196,149,96,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 28, color: Colors.primary, fontWeight: '300', marginTop: -2 },

  scroll: { flexGrow: 1, paddingHorizontal: 18, paddingTop: 18 },
  hero: { alignItems: 'center', marginBottom: 22 },
  badgeWrap: { width: 58, height: 58, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  badgeOrbit: { position: 'absolute', width: 96, height: 96, alignItems: 'center', justifyContent: 'center' },
  badge: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: 'rgba(196,149,96,0.16)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 26, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.6, textAlign: 'center' },
  subtitle: { fontSize: 13, color: 'rgba(245,232,208,0.72)', marginTop: 8, lineHeight: 20, textAlign: 'center', paddingHorizontal: 12 },

  card: {
    backgroundColor: Colors.card,
    borderRadius: 26,
    padding: 22,
    borderWidth: 1,
    borderColor: Colors.border2,
    ...Shadow.xl,
  },
});
