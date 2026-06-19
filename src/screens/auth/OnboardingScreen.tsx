import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  Easing,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { Colors } from '../../theme';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { OnboardingArt, OrbitRing, GlowBlob, ReadingArt, AiLogoArt, ArtVariant } from '../../components/illustrations/OnboardingArt';
import { boyReading } from '../../assets/illustrations';
import { boyReadingLottie } from '../../assets/lottie';

type Props = NativeStackScreenProps<AuthStackParamList, 'Onboarding'>;

const { width: W } = Dimensions.get('window');

interface Slide {
  key: string;
  art: ArtVariant | 'reading';
  overline: string;
  title: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    key: 'study',
    art: 'reading',
    overline: 'LEARN SMARTER',
    title: 'Read, learn,\ngrow every day',
    body: 'Thousands of lessons, chapters and notes — beautifully organised so you can just open a book and study.',
  },
  {
    key: 'ai',
    art: 'ai',
    overline: 'AI-POWERED',
    title: 'Your personal\nAI tutor, 24/7',
    body: 'Stuck on a concept? Ask anything and get a clear, step-by-step answer in seconds.',
  },
  {
    key: 'analytics',
    art: 'analytics',
    overline: 'SMART ANALYTICS',
    title: 'Track every\nstep of progress',
    body: 'Real-time insights into your strengths and weak spots, so you always know what to study next.',
  },
  {
    key: 'achieve',
    art: 'achieve',
    overline: 'STAY MOTIVATED',
    title: 'Learn, earn,\nachieve more',
    body: 'Streaks, badges and rewards keep you coming back — learning has never felt this good.',
  },
];

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<any>(null);
  const [index, setIndex] = useState(0);
  const isLast = index === SLIDES.length - 1;

  // Slow orbit-ring rotation + gentle floating of the hero art (native driver).
  const spin = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const spinLoop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 18000, easing: Easing.linear, useNativeDriver: true }),
    );
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    spinLoop.start();
    floatLoop.start();
    return () => {
      spinLoop.stop();
      floatLoop.stop();
    };
  }, [spin, float]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const floatY = float.interpolate({ inputRange: [0, 1], outputRange: [-9, 9] });

  const onScroll = Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
    useNativeDriver: true,
    listener: (e: any) => {
      const i = Math.round(e.nativeEvent.contentOffset.x / W);
      if (i !== index) setIndex(i);
    },
  });

  const next = () => {
    if (isLast) {
      navigation.navigate('SignUp');
    } else {
      scrollRef.current?.scrollTo?.({ x: (index + 1) * W, animated: true });
    }
  };

  return (
    <LinearGradient colors={['#1A0A0C', '#2A0E13', '#3D1520', '#52202E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fill}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Background glow blobs */}
      <View style={[styles.blob, { top: -60, left: -80 }]} pointerEvents="none">
        <GlowBlob size={300} />
      </View>
      <View style={[styles.blob, { bottom: 40, right: -90 }]} pointerEvents="none">
        <GlowBlob size={260} color="#7A1322" />
      </View>

      <SafeAreaView style={styles.fill} edges={['top', 'bottom']}>
        {/* Top bar: logo + skip */}
        <View style={styles.topbar}>
          <View style={styles.logoRow}>
            <View style={styles.logoBox}>
              <Icon name="brain" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.brand}>Bodhira</Text>
          </View>
          {!isLast && (
            <TouchableOpacity onPress={() => navigation.navigate('Login')} hitSlop={10}>
              <Text style={styles.skip}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Paged slides */}
        <Animated.ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          style={styles.fill}
        >
          {SLIDES.map((s, i) => {
            const inputRange = [(i - 1) * W, i * W, (i + 1) * W];
            const artScale = scrollX.interpolate({ inputRange, outputRange: [0.72, 1, 0.72], extrapolate: 'clamp' });
            const artTranslate = scrollX.interpolate({ inputRange, outputRange: [W * 0.22, 0, -W * 0.22], extrapolate: 'clamp' });
            const artOpacity = scrollX.interpolate({ inputRange, outputRange: [0.25, 1, 0.25], extrapolate: 'clamp' });
            const textTranslate = scrollX.interpolate({ inputRange, outputRange: [W * 0.4, 0, -W * 0.4], extrapolate: 'clamp' });
            const textOpacity = scrollX.interpolate({ inputRange, outputRange: [0, 1, 0], extrapolate: 'clamp' });

            return (
              <View key={s.key} style={styles.slide}>
                {/* Hero art with orbit + float + parallax */}
                <Animated.View style={[styles.artWrap, { opacity: artOpacity, transform: [{ translateX: artTranslate }, { scale: artScale }] }]}>
                  <Animated.View style={[styles.orbit, { transform: [{ rotate }] }]} pointerEvents="none">
                    <OrbitRing size={320} />
                  </Animated.View>
                  <Animated.View style={{ transform: [{ translateY: floatY }] }}>
                    {s.art === 'reading' ? (
                      <ReadingArt size={236} source={boyReading} lottie={boyReadingLottie} />
                    ) : s.art === 'ai' ? (
                      <AiLogoArt size={236} />
                    ) : (
                      <OnboardingArt variant={s.art} size={236} />
                    )}
                  </Animated.View>
                </Animated.View>

                {/* Copy */}
                <Animated.View style={[styles.copy, { opacity: textOpacity, transform: [{ translateX: textTranslate }] }]}>
                  <Text style={styles.overline}>{s.overline}</Text>
                  <Text style={styles.title}>{s.title}</Text>
                  <Text style={styles.body}>{s.body}</Text>
                </Animated.View>
              </View>
            );
          })}
        </Animated.ScrollView>

        {/* Footer: dots + CTA */}
        <View style={styles.footer}>
          <View style={styles.dots}>
            {SLIDES.map((_, i) => {
              const inputRange = [(i - 1) * W, i * W, (i + 1) * W];
              // Active page = a gold star; the rest stay circular dots (crossfade).
              const starOpacity = scrollX.interpolate({ inputRange, outputRange: [0, 1, 0], extrapolate: 'clamp' });
              const starScale = scrollX.interpolate({ inputRange, outputRange: [0.3, 1, 0.3], extrapolate: 'clamp' });
              const starRotate = scrollX.interpolate({ inputRange, outputRange: ['-45deg', '0deg', '45deg'], extrapolate: 'clamp' });
              const dotOpacity = scrollX.interpolate({ inputRange, outputRange: [0.4, 0, 0.4], extrapolate: 'clamp' });
              const dotScale = scrollX.interpolate({ inputRange, outputRange: [1, 0.2, 1], extrapolate: 'clamp' });
              return (
                <View key={i} style={styles.dotSlot}>
                  <Animated.View style={[styles.dot, { opacity: dotOpacity, transform: [{ scale: dotScale }] }]} />
                  <Animated.View style={[styles.starWrap, { opacity: starOpacity, transform: [{ scale: starScale }, { rotate: starRotate }] }]}>
                    <Icon name="star" size={20} color={Colors.primary} />
                  </Animated.View>
                </View>
              );
            })}
          </View>

          <Button
            label={isLast ? 'Get Started →' : 'Next'}
            variant="gold"
            onPress={next}
            style={styles.cta}
          />
          <TouchableOpacity onPress={() => navigation.navigate('Login')} hitSlop={8}>
            <Text style={styles.signin}>
              I already have an account <Text style={styles.signinBold}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
  blob: { position: 'absolute', opacity: 0.8 },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBox: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: 'rgba(196,149,96,0.18)', borderWidth: 1, borderColor: 'rgba(196,149,96,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
  brand: { fontSize: 18, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.3 },
  skip: { fontSize: 13, fontWeight: '700', color: 'rgba(245,232,208,0.75)' },

  slide: { width: W, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  artWrap: { width: 320, height: 320, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  orbit: { position: 'absolute' },
  copy: { alignItems: 'center', paddingHorizontal: 8 },
  overline: { fontSize: 11, fontWeight: '800', letterSpacing: 3, color: 'rgba(196,149,96,0.85)', marginBottom: 12 },
  title: { fontSize: 30, fontWeight: '900', color: '#F5E8D0', textAlign: 'center', lineHeight: 38, letterSpacing: -0.6 },
  body: { fontSize: 13.5, color: 'rgba(245,232,208,0.72)', textAlign: 'center', lineHeight: 21, marginTop: 14, paddingHorizontal: 6 },

  footer: { paddingHorizontal: 24, paddingBottom: 8, gap: 16, alignItems: 'center' },
  dots: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  dotSlot: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  starWrap: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  cta: {
    width: '100%',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 8,
  },
  signin: { fontSize: 12.5, color: 'rgba(245,232,208,0.6)', textAlign: 'center' },
  signinBold: { color: Colors.primary, fontWeight: '800' },
});
