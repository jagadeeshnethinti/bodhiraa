/**
 * A playful, premium background layer for the auth screens: small educational
 * SVG doodles (atom, book, bulb, rocket, flask, math symbols, sparkles) that
 * gently float, drift, rotate and twinkle. Pure decoration — `pointerEvents`
 * is off and everything is native-driven (transform/opacity only), so it never
 * touches the JS thread or blocks input.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import Svg, {
  Circle,
  Ellipse,
  G,
  Line,
  Path,
  Rect,
  Polygon,
  Text as SvgText,
} from 'react-native-svg';

const GOLD = '#C49560';
const LIGHT = '#F0D3A6';

type DoodleProps = { size: number; color: string };

const Atom = ({ size, color }: DoodleProps) => (
  <Svg width={size} height={size} viewBox="0 0 40 40">
    <Circle cx="20" cy="20" r="3.4" fill={color} />
    <G stroke={color} strokeWidth="1.6" fill="none">
      <Ellipse cx="20" cy="20" rx="16" ry="6" />
      <Ellipse cx="20" cy="20" rx="16" ry="6" rotation="60" originX="20" originY="20" />
      <Ellipse cx="20" cy="20" rx="16" ry="6" rotation="120" originX="20" originY="20" />
    </G>
  </Svg>
);

const Book = ({ size, color }: DoodleProps) => (
  <Svg width={size} height={size} viewBox="0 0 40 40">
    <Path
      d="M20 10 C16 7 9 7 5 9 L5 30 C9 28 16 28 20 31 C24 28 31 28 35 30 L35 9 C31 7 24 7 20 10 Z"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <Line x1="20" y1="10" x2="20" y2="31" stroke={color} strokeWidth="1.4" />
  </Svg>
);

const Bulb = ({ size, color }: DoodleProps) => (
  <Svg width={size} height={size} viewBox="0 0 40 40">
    <Circle cx="20" cy="16" r="10" fill="none" stroke={color} strokeWidth="1.8" />
    <Line x1="15" y1="28" x2="25" y2="28" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <Line x1="16" y1="32" x2="24" y2="32" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <Path d="M16 17 L20 21 L24 13" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const Rocket = ({ size, color }: DoodleProps) => (
  <Svg width={size} height={size} viewBox="0 0 40 40">
    <Path d="M20 5 C26 10 27 20 23 27 H17 C13 20 14 10 20 5 Z" fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    <Circle cx="20" cy="15" r="2.8" fill={color} />
    <Path d="M17 25 L12 32 L17 29 Z M23 25 L28 32 L23 29 Z" fill={color} />
  </Svg>
);

const Flask = ({ size, color }: DoodleProps) => (
  <Svg width={size} height={size} viewBox="0 0 40 40">
    <Path
      d="M17 9 V18 L9 30 C8 32.5 9.5 34 12 34 H28 C30.5 34 32 32.5 31 30 L23 18 V9"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <Line x1="15" y1="9" x2="25" y2="9" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <Line x1="14" y1="25" x2="26" y2="25" stroke={color} strokeWidth="1.6" />
  </Svg>
);

const Pencil = ({ size, color }: DoodleProps) => (
  <Svg width={size} height={size} viewBox="0 0 40 40">
    <G rotation="40" originX="20" originY="20">
      <Rect x="15" y="9" width="10" height="18" rx="2" fill="none" stroke={color} strokeWidth="1.8" />
      <Polygon points="15,27 25,27 20,34" fill={color} />
      <Line x1="15" y1="13" x2="25" y2="13" stroke={color} strokeWidth="1.6" />
    </G>
  </Svg>
);

const Star = ({ size, color }: DoodleProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12 2 L14.6 8.6 L21.6 9 L16.2 13.6 L18 20.4 L12 16.6 L6 20.4 L7.8 13.6 L2.4 9 L9.4 8.6 Z" fill={color} />
  </Svg>
);

const Sparkle = ({ size, color }: DoodleProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12 1 C12 7 17 12 23 12 C17 12 12 17 12 23 C12 17 7 12 1 12 C7 12 12 7 12 1 Z" fill={color} />
  </Svg>
);

const Glyph = (char: string) => ({ size, color }: DoodleProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <SvgText x="12" y="19" fontSize="20" fontWeight="bold" fill={color} textAnchor="middle">
      {char}
    </SvgText>
  </Svg>
);

const DOODLES: Record<string, React.FC<DoodleProps>> = {
  atom: Atom,
  book: Book,
  bulb: Bulb,
  rocket: Rocket,
  flask: Flask,
  pencil: Pencil,
  star: Star,
  sparkle: Sparkle,
  pi: Glyph('π'),
  sqrt: Glyph('√'),
  plus: Glyph('+'),
};

interface ItemCfg {
  type: keyof typeof DOODLES;
  top: number;
  left?: number;
  right?: number;
  size: number;
  color: string;
  op: number;
  drift: number;
  dur: number;
  delay: number;
  spin?: number; // ms for a full rotation, if it should rotate
  twinkle?: boolean;
}

// Hand-placed so nothing clusters or sits dead-centre over the title.
const LAYOUT: ItemCfg[] = [
  { type: 'atom', top: 66, left: 18, size: 42, color: GOLD, op: 0.5, drift: 9, dur: 3200, delay: 0, spin: 16000 },
  { type: 'sparkle', top: 58, right: 26, size: 16, color: LIGHT, op: 0.85, drift: 6, dur: 1800, delay: 200, twinkle: true },
  { type: 'rocket', top: 120, right: 30, size: 34, color: GOLD, op: 0.5, drift: 11, dur: 3600, delay: 400 },
  { type: 'pi', top: 150, left: 30, size: 30, color: LIGHT, op: 0.55, drift: 8, dur: 3000, delay: 600 },
  { type: 'bulb', top: 210, left: 22, size: 32, color: GOLD, op: 0.5, drift: 8, dur: 3400, delay: 300 },
  { type: 'flask', top: 196, right: 70, size: 28, color: LIGHT, op: 0.5, drift: 9, dur: 3100, delay: 900 },
  { type: 'star', top: 250, right: 28, size: 18, color: GOLD, op: 0.8, drift: 7, dur: 2200, delay: 500, twinkle: true, spin: 20000 },
  { type: 'sqrt', top: 290, left: 60, size: 26, color: GOLD, op: 0.45, drift: 8, dur: 3300, delay: 700 },
  { type: 'book', top: 300, right: 36, size: 34, color: LIGHT, op: 0.45, drift: 10, dur: 3500, delay: 200 },
  { type: 'plus', top: 110, left: 80, size: 22, color: LIGHT, op: 0.6, drift: 7, dur: 2600, delay: 1100, twinkle: true },
];

const FloatItem: React.FC<{ cfg: ItemCfg }> = ({ cfg }) => {
  const t = useRef(new Animated.Value(0)).current;
  const r = useRef(new Animated.Value(0)).current;
  const Doodle = DOODLES[cfg.type];

  useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration: cfg.dur, delay: cfg.delay, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: cfg.dur, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    floatLoop.start();
    let spinLoop: Animated.CompositeAnimation | undefined;
    if (cfg.spin) {
      spinLoop = Animated.loop(Animated.timing(r, { toValue: 1, duration: cfg.spin, easing: Easing.linear, useNativeDriver: true }));
      spinLoop.start();
    }
    return () => {
      floatLoop.stop();
      spinLoop?.stop();
    };
  }, [t, r, cfg]);

  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [cfg.drift, -cfg.drift] });
  const rotate = r.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const opacity = cfg.twinkle
    ? t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [cfg.op * 0.3, cfg.op, cfg.op * 0.3] })
    : cfg.op;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.item,
        { top: cfg.top, left: cfg.left, right: cfg.right, opacity, transform: [{ translateY }, ...(cfg.spin ? [{ rotate }] : [])] },
      ]}
    >
      <Doodle size={cfg.size} color={cfg.color} />
    </Animated.View>
  );
};

export const FloatingDoodles: React.FC = () => (
  <Animated.View style={StyleSheet.absoluteFill} pointerEvents="none">
    {LAYOUT.map((cfg, i) => (
      <FloatItem key={i} cfg={cfg} />
    ))}
  </Animated.View>
);

const styles = StyleSheet.create({
  item: { position: 'absolute' },
});
