/**
 * Premium vector illustrations for the onboarding flow, drawn with
 * react-native-svg so they stay crisp at any size and carry the brand's
 * gold-on-maroon gradient language. Each scene sits on a soft radial glow and a
 * slowly rotating dashed orbit ring (animated by the caller, not here).
 */
import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, Image, ImageSourcePropType } from 'react-native';
import LottieView from 'lottie-react-native';
import LinearGradientView from 'react-native-linear-gradient';
import { AIMark } from '../common/AIMark';
import Svg, {
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  Circle,
  Rect,
  G,
  Line,
  Path,
  Polyline,
  Polygon,
} from 'react-native-svg';

export type ArtVariant = 'ai' | 'analytics' | 'achieve';

interface Props {
  variant: ArtVariant;
  size?: number;
}

const GOLD = '#C49560';

const Shared = () => (
  <Defs>
    <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
      <Stop offset="0" stopColor={GOLD} stopOpacity="0.38" />
      <Stop offset="0.6" stopColor={GOLD} stopOpacity="0.10" />
      <Stop offset="1" stopColor={GOLD} stopOpacity="0" />
    </RadialGradient>
    <LinearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <Stop offset="0" stopColor="#F0D3A6" />
      <Stop offset="0.5" stopColor={GOLD} />
      <Stop offset="1" stopColor="#A87840" />
    </LinearGradient>
    <LinearGradient id="card" x1="0" y1="0" x2="0" y2="1">
      <Stop offset="0" stopColor="#52202E" />
      <Stop offset="1" stopColor="#2A0E13" />
    </LinearGradient>
  </Defs>
);

const NODES = [
  { x: 100, y: 40 },
  { x: 152, y: 70 },
  { x: 152, y: 130 },
  { x: 100, y: 160 },
  { x: 48, y: 130 },
  { x: 48, y: 70 },
];

const AiScene = () => (
  <>
    <Circle cx="100" cy="100" r="96" fill="url(#glow)" />
    <G stroke={GOLD} strokeOpacity="0.45" strokeWidth="1.4">
      {NODES.map((n, i) => (
        <Line key={i} x1="100" y1="100" x2={n.x} y2={n.y} />
      ))}
    </G>
    {NODES.map((n, i) => (
      <Circle key={i} cx={n.x} cy={n.y} r={i % 2 === 0 ? 9 : 6.5} fill="url(#gold)" />
    ))}
    <Circle cx="100" cy="100" r="26" fill="url(#card)" stroke={GOLD} strokeWidth="2" />
    {/* spark */}
    <Path
      d="M100 86 L104 98 L116 100 L104 102 L100 114 L96 102 L84 100 L96 98 Z"
      fill="url(#gold)"
    />
  </>
);

const AnalyticsScene = () => (
  <>
    <Circle cx="100" cy="100" r="96" fill="url(#glow)" />
    <Rect x="38" y="52" width="124" height="100" rx="16" fill="url(#card)" stroke={GOLD} strokeOpacity="0.4" strokeWidth="1.5" />
    {/* bars */}
    {[
      { x: 56, h: 34 },
      { x: 82, h: 56 },
      { x: 108, h: 44 },
      { x: 134, h: 74 },
    ].map((b, i) => (
      <Rect key={i} x={b.x} y={140 - b.h} width="14" height={b.h} rx="5" fill="url(#gold)" opacity={0.55 + i * 0.15} />
    ))}
    {/* trend line */}
    <Polyline
      points="63,108 89,86 115,98 141,68"
      fill="none"
      stroke="#F0D3A6"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {['63,108', '89,86', '115,98', '141,68'].map((p, i) => {
      const [cx, cy] = p.split(',');
      return <Circle key={i} cx={cx} cy={cy} r="3.5" fill="#FFFFFF" />;
    })}
    {/* up arrow */}
    <Polygon points="141,58 147,70 135,70" fill="#1A7A48" />
  </>
);

const AchieveScene = () => (
  <>
    <Circle cx="100" cy="100" r="96" fill="url(#glow)" />
    {/* rays */}
    <G stroke={GOLD} strokeOpacity="0.5" strokeWidth="2.5" strokeLinecap="round">
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i * Math.PI) / 4;
        const r1 = 58;
        const r2 = 74;
        return (
          <Line
            key={i}
            x1={100 + r1 * Math.cos(a)}
            y1={70 + r1 * Math.sin(a)}
            x2={100 + r2 * Math.cos(a)}
            y2={70 + r2 * Math.sin(a)}
          />
        );
      })}
    </G>
    {/* cup */}
    <Path d="M64 56 H136 V72 Q136 104 100 110 Q64 104 64 72 Z" fill="url(#gold)" />
    {/* handles */}
    <Path d="M64 60 Q44 62 50 80 Q54 90 66 86" fill="none" stroke={GOLD} strokeWidth="5" />
    <Path d="M136 60 Q156 62 150 80 Q146 90 134 86" fill="none" stroke={GOLD} strokeWidth="5" />
    {/* stem + base */}
    <Rect x="93" y="108" width="14" height="20" fill="url(#gold)" />
    <Rect x="74" y="128" width="52" height="12" rx="4" fill="url(#card)" stroke={GOLD} strokeWidth="1.5" />
    {/* star */}
    <Path d="M100 66 L104 78 L116 78 L106 86 L110 98 L100 90 L90 98 L94 86 L84 78 L96 78 Z" fill="#2A0E13" />
    {/* confetti */}
    <Circle cx="52" cy="118" r="3.5" fill="#F0D3A6" />
    <Circle cx="150" cy="120" r="3" fill="#1A7A48" />
    <Circle cx="60" cy="150" r="2.5" fill={GOLD} />
    <Circle cx="142" cy="150" r="3" fill="#F0D3A6" />
  </>
);

export const OnboardingArt: React.FC<Props> = ({ variant, size = 240 }) => (
  <Svg width={size} height={size} viewBox="0 0 200 200">
    <Shared />
    {variant === 'ai' ? <AiScene /> : variant === 'analytics' ? <AnalyticsScene /> : <AchieveScene />}
  </Svg>
);

/**
 * StudentReadingArt — the study-app hero: a student reading an open book, drawn
 * in the brand's gold-on-maroon language and brought to life with a pulsing glow,
 * a gentle reading bob, and "knowledge" motes (sparkles + a tiny book) drifting
 * up off the page. Self-animated (looping) so it feels alive on the onboarding.
 */
export const StudentReadingArt: React.FC<{ size?: number }> = ({ size = 236 }) => {
  const pulse = useRef(new Animated.Value(0)).current;
  const bob = useRef(new Animated.Value(0)).current;
  const flip = useRef(new Animated.Value(0)).current;
  const motes = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const ease = Easing.inOut(Easing.ease);
    const loops = [
      // Page turn: lift off the right, rotate over the spine, fade as it lands.
      Animated.loop(
        Animated.sequence([
          Animated.timing(flip, { toValue: 1, duration: 1700, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
          Animated.delay(900),
          Animated.timing(flip, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 1800, easing: ease, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0, duration: 1800, easing: ease, useNativeDriver: true }),
        ]),
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(bob, { toValue: 1, duration: 2000, easing: ease, useNativeDriver: true }),
          Animated.timing(bob, { toValue: 0, duration: 2000, easing: ease, useNativeDriver: true }),
        ]),
      ),
      ...motes.map((m, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(i * 600),
            Animated.timing(m, { toValue: 1, duration: 2800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
            Animated.timing(m, { toValue: 0, duration: 0, useNativeDriver: true }),
            Animated.delay(800),
          ]),
        ),
      ),
    ];
    loops.forEach(l => l.start());
    return () => loops.forEach(l => l.stop());
  }, [pulse, bob, flip, motes]);

  const k = size / 200; // SVG units → px
  const bobY = bob.interpolate({ inputRange: [0, 1], outputRange: [3, -3] });
  const glowScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.08] });
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0.9] });

  // Page-flip: rotate the page over the spine (left edge).
  const flipRotate = flip.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['0deg', '-165deg', '-165deg'] });
  const flipOpacity = flip.interpolate({ inputRange: [0, 0.04, 0.5, 0.64, 1], outputRange: [0, 1, 1, 0, 0] });
  const flipShade = flip.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.3, 0.3] });
  // Soft shadow the lifting page casts onto the left page, fading as it lands.
  const castShadow = flip.interpolate({ inputRange: [0, 0.12, 0.5, 0.64, 1], outputRange: [0, 0.16, 0.22, 0, 0] });

  // Motes rise from the open book (~0.6h) toward the top (~0.12h), fading in/out.
  const MOTES = [
    { x: 0.40, color: GOLD, s: 8, book: true },
    { x: 0.58, color: '#F0D3A6', s: 5, book: false },
    { x: 0.66, color: GOLD, s: 6, book: false },
    { x: 0.34, color: '#F0D3A6', s: 9, book: true },
  ];

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Pulsing glow */}
      <Animated.View style={{ position: 'absolute', opacity: glowOpacity, transform: [{ scale: glowScale }] }} pointerEvents="none">
        <GlowBlob size={size} />
      </Animated.View>

      {/* Floating knowledge motes */}
      {MOTES.map((m, i) => {
        const ty = motes[i].interpolate({ inputRange: [0, 1], outputRange: [size * 0.46, size * 0.12] });
        const op = motes[i].interpolate({ inputRange: [0, 0.2, 0.85, 1], outputRange: [0, 1, 1, 0] });
        const sc = motes[i].interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.1] });
        return (
          <Animated.View
            key={i}
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: size * m.x,
              width: m.book ? m.s + 4 : m.s,
              height: m.s,
              borderRadius: m.book ? 2 : m.s / 2,
              backgroundColor: m.color,
              opacity: op,
              transform: [{ translateY: ty }, { scale: sc }],
            }}
          />
        );
      })}

      {/* The reading scene (gentle bob) */}
      <Animated.View style={{ width: size, height: size, transform: [{ translateY: bobY }] }}>
        <Svg width={size} height={size} viewBox="0 0 200 200">
          <Defs>
            <LinearGradient id="rGold" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#F0D3A6" />
              <Stop offset="0.5" stopColor={GOLD} />
              <Stop offset="1" stopColor="#A87840" />
            </LinearGradient>
            <LinearGradient id="rCard" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#52202E" />
              <Stop offset="1" stopColor="#2A0E13" />
            </LinearGradient>
            <LinearGradient id="rPage" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#FBEAD0" />
              <Stop offset="1" stopColor="#E6C696" />
            </LinearGradient>
          </Defs>

          {/* Student */}
          <Path d="M58 132 Q58 92 100 92 Q142 92 142 132 Z" fill="url(#rCard)" stroke={GOLD} strokeOpacity="0.5" strokeWidth="1.5" />
          <Circle cx="100" cy="60" r="19" fill="url(#rGold)" />
          <Path d="M80 58 Q80 36 100 36 Q120 36 120 58 Q110 49 100 49 Q90 49 80 58 Z" fill="#1A0A0C" />
          <Path d="M89 97 L100 108 L111 97" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {/* Open book — cover then pages */}
          <Path
            d="M100 108 C 74 100 54 102 46 110 L46 150 C 56 144 80 144 100 152 C 120 144 144 144 154 150 L154 110 C 146 102 126 100 100 108 Z"
            fill="url(#rCard)"
            stroke={GOLD}
            strokeWidth="1.5"
          />
          <Path d="M100 112 C 80 106 62 108 54 114 L54 146 C 64 140 84 140 100 147 Z" fill="url(#rPage)" />
          <Path d="M100 112 C 120 106 138 108 146 114 L146 146 C 136 140 116 140 100 147 Z" fill="url(#rPage)" />
          <Line x1="100" y1="112" x2="100" y2="147" stroke={GOLD} strokeOpacity="0.55" strokeWidth="1.5" />
          <G stroke="#A87840" strokeOpacity="0.55" strokeWidth="1.6" strokeLinecap="round">
            <Line x1="62" y1="121" x2="91" y2="119" />
            <Line x1="61" y1="127" x2="91" y2="125" />
            <Line x1="61" y1="133" x2="89" y2="131" />
            <Line x1="109" y1="119" x2="138" y2="121" />
            <Line x1="109" y1="125" x2="139" y2="127" />
            <Line x1="111" y1="131" x2="139" y2="133" />
          </G>

          {/* Desk hint */}
          <Line x1="36" y1="153" x2="164" y2="153" stroke={GOLD} strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" />
        </Svg>

        {/* Shadow the turning page casts onto the left page */}
        <Animated.View
          pointerEvents="none"
          style={{ position: 'absolute', left: 56 * k, top: 113 * k, width: 44 * k, height: 33 * k, borderRadius: 6 * k, backgroundColor: '#1A0A0C', opacity: castShadow }}
        />

        {/* Turning page — pivots on the spine, real paper gradient + curl shadow */}
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 100 * k,
            top: 111 * k,
            width: 47 * k,
            height: 37 * k,
            transformOrigin: 'left center',
            opacity: flipOpacity,
            transform: [{ perspective: 800 }, { rotateY: flipRotate }],
          }}
        >
          <LinearGradientView
            colors={['#FDF3E0', '#ECD3A4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1, borderTopRightRadius: 6 * k, borderBottomRightRadius: 12 * k, borderWidth: 1, borderColor: 'rgba(168,120,64,0.5)' }}
          />
          {/* Curl shading (darkens as the page turns) */}
          <Animated.View
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#1A0A0C', borderTopRightRadius: 6 * k, borderBottomRightRadius: 12 * k, opacity: flipShade }}
          />
          {/* Spine highlight */}
          <View style={{ position: 'absolute', left: 0, top: 2 * k, bottom: 2 * k, width: 1.5, backgroundColor: 'rgba(255,255,255,0.45)' }} />
        </Animated.View>
      </Animated.View>
    </View>
  );
};

/**
 * ReadingArt — the study hero. Prefers a real **Lottie** animation of a boy
 * reading; otherwise a still **illustration** (PNG); otherwise the vector
 * `StudentReadingArt`. A pulsing glow sits behind it (the onboarding also floats
 * it). Drop assets via `src/assets/lottie` / `src/assets/illustrations`.
 */
export const ReadingArt: React.FC<{ size?: number; source?: ImageSourcePropType | null; lottie?: any }> = ({ size = 236, source, lottie }) => {
  const pulse = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(0)).current;
  const active = !!(lottie || source);

  useEffect(() => {
    if (!active) return;
    const ease = Easing.inOut(Easing.ease);
    const loops = [
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 1800, easing: ease, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0, duration: 1800, easing: ease, useNativeDriver: true }),
        ]),
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(breathe, { toValue: 1, duration: 2400, easing: ease, useNativeDriver: true }),
          Animated.timing(breathe, { toValue: 0, duration: 2400, easing: ease, useNativeDriver: true }),
        ]),
      ),
    ];
    loops.forEach(l => l.start());
    return () => loops.forEach(l => l.stop());
  }, [pulse, breathe, active]);

  if (!active) return <StudentReadingArt size={size} />;

  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0.85] });
  const glowScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.1] });
  const imgScale = breathe.interpolate({ inputRange: [0, 1], outputRange: [0.99, 1.03] });

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{ position: 'absolute', opacity: glowOpacity, transform: [{ scale: glowScale }] }} pointerEvents="none">
        <GlowBlob size={size} />
      </Animated.View>
      {lottie ? (
        <LottieView source={lottie} autoPlay loop style={{ width: size, height: size }} resizeMode="contain" />
      ) : (
        <Animated.View style={{ transform: [{ scale: imgScale }] }}>
          <Image source={source!} style={{ width: size * 0.92, height: size * 0.92, resizeMode: 'contain' }} />
        </Animated.View>
      )}
    </View>
  );
};

/**
 * AiLogoArt — the AI slide's hero: the Bodhira AI brand mark (gold badge + spark)
 * with a pulsing glow, electrons orbiting it, and a gentle twinkle. Premium,
 * consistent with the AI identity used across the app.
 */
export const AiLogoArt: React.FC<{ size?: number }> = ({ size = 236 }) => {
  const pulse = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const twinkle = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const ease = Easing.inOut(Easing.ease);
    const loops = [
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 1700, easing: ease, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0, duration: 1700, easing: ease, useNativeDriver: true }),
        ]),
      ),
      Animated.loop(Animated.timing(spin, { toValue: 1, duration: 9000, easing: Easing.linear, useNativeDriver: true })),
      Animated.loop(
        Animated.sequence([
          Animated.timing(twinkle, { toValue: 1, duration: 1400, easing: ease, useNativeDriver: true }),
          Animated.timing(twinkle, { toValue: 0, duration: 1400, easing: ease, useNativeDriver: true }),
        ]),
      ),
    ];
    loops.forEach(l => l.start());
    return () => loops.forEach(l => l.stop());
  }, [pulse, spin, twinkle]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0.85] });
  const glowScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.1] });
  const markScale = twinkle.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1.04] });

  const R = size * 0.34;
  const ORBIT = [
    { a: 20, s: 9, c: GOLD },
    { a: 140, s: 6, c: '#F0D3A6' },
    { a: 260, s: 7, c: GOLD },
  ];

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{ position: 'absolute', opacity: glowOpacity, transform: [{ scale: glowScale }] }} pointerEvents="none">
        <GlowBlob size={size} />
      </Animated.View>

      {/* Orbiting electrons */}
      <Animated.View style={{ position: 'absolute', width: size, height: size, transform: [{ rotate }] }} pointerEvents="none">
        {ORBIT.map((o, i) => {
          const rad = (o.a * Math.PI) / 180;
          return (
            <View
              key={i}
              style={{
                position: 'absolute',
                left: size / 2 + R * Math.cos(rad) - o.s / 2,
                top: size / 2 + R * Math.sin(rad) - o.s / 2,
                width: o.s,
                height: o.s,
                borderRadius: o.s / 2,
                backgroundColor: o.c,
              }}
            />
          );
        })}
      </Animated.View>

      {/* Central AI mark */}
      <Animated.View style={{ transform: [{ scale: markScale }] }}>
        <AIMark size={size * 0.46} glow={false} />
      </Animated.View>
    </View>
  );
};

/** A slowly rotating dashed orbit ring used behind the hero art. */
export const OrbitRing: React.FC<{ size?: number; opacity?: number }> = ({ size = 300, opacity = 0.35 }) => (
  <Svg width={size} height={size} viewBox="0 0 200 200">
    <Circle
      cx="100"
      cy="100"
      r="92"
      fill="none"
      stroke={GOLD}
      strokeOpacity={opacity}
      strokeWidth="1.5"
      strokeDasharray="2 10"
    />
    <Circle cx="100" cy="100" r="74" fill="none" stroke={GOLD} strokeOpacity={opacity * 0.6} strokeWidth="1" strokeDasharray="1 8" />
  </Svg>
);

/** Soft glow blob for layering into dark headers/backgrounds. */
export const GlowBlob: React.FC<{ size?: number; color?: string }> = ({ size = 260, color = GOLD }) => (
  <Svg width={size} height={size} viewBox="0 0 200 200">
    <Defs>
      <RadialGradient id="blob" cx="50%" cy="50%" r="50%">
        <Stop offset="0" stopColor={color} stopOpacity="0.5" />
        <Stop offset="1" stopColor={color} stopOpacity="0" />
      </RadialGradient>
    </Defs>
    <Circle cx="100" cy="100" r="100" fill="url(#blob)" />
  </Svg>
);
