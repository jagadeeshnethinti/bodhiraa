/**
 * Bodhira LMS — shared animation primitives.
 *
 * A tiny, dependency-free motion kit built on React Native's `Animated`. Used to
 * give the whole app a consistent, premium feel: entrance fades, press feedback,
 * counting stats, skeleton shimmers and subtle pulses. Transform/opacity work is
 * native-driven (60fps off the JS thread); width/number animations that must be
 * read on the JS side are clearly marked.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleProp,
  ViewStyle,
  PressableProps,
  StyleSheet,
} from 'react-native';
import { Colors, Radius } from '../../theme';

// ─────────────────────────────────────────────────────────────────────────────
// Entrance — fade + rise, runs once on mount. Stagger via `index` or `delay`.
// ─────────────────────────────────────────────────────────────────────────────

interface EntranceProps {
  children: React.ReactNode;
  /** Explicit delay (ms). Falls back to `index * stagger`. */
  delay?: number;
  /** Position in a list — multiplied by `stagger` for a cascading reveal. */
  index?: number;
  stagger?: number;
  /** Pixels to rise from. */
  distance?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}

export const Entrance: React.FC<EntranceProps> = ({
  children,
  delay,
  index = 0,
  stagger = 70,
  distance = 14,
  duration = 420,
  style,
}) => {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.timing(t, {
      toValue: 1,
      duration,
      delay: delay ?? index * stagger,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [t, delay, index, stagger, duration]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: t,
          transform: [
            { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PressableScale — tactile press feedback (spring scale + optional opacity).
// ─────────────────────────────────────────────────────────────────────────────

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
}

/**
 * A Pressable that springs slightly on touch. The scale transform is applied to
 * the Pressable itself (no wrapper view), so it lays out exactly like the styled
 * element it replaces — safe to drop in for any TouchableOpacity.
 */
export const PressableScale: React.FC<PressableScaleProps> = ({
  children,
  style,
  scaleTo = 0.96,
  disabled,
  onPressIn,
  onPressOut,
  ...rest
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const spring = (to: number) =>
    Animated.spring(scale, { toValue: to, useNativeDriver: true, friction: 7, tension: 140 }).start();

  return (
    <AnimatedPressable
      disabled={disabled}
      onPressIn={e => {
        if (!disabled) spring(scaleTo);
        onPressIn?.(e);
      }}
      onPressOut={e => {
        spring(1);
        onPressOut?.(e);
      }}
      style={[style, { transform: [{ scale }] }]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// AnimatedCounter — counts a numeric value up on mount. JS-driven (reads value).
// Handles "1,248" and "76%" by preserving thousands separators and a suffix.
// ─────────────────────────────────────────────────────────────────────────────

const withCommas = (n: number): string => {
  const s = String(n);
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

interface AnimatedCounterProps {
  value: string | number;
  duration?: number;
  style?: StyleProp<any>;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value, duration = 900, style }) => {
  const raw = String(value);
  const match = /^(\d[\d,]*)(.*)$/.exec(raw);
  const target = match ? Number(match[1].replace(/,/g, '')) : NaN;
  const suffix = match ? match[2] : '';
  const useComma = !!match && match[1].includes(',');

  const driver = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(Number.isNaN(target) ? raw : '0' + suffix);

  useEffect(() => {
    if (Number.isNaN(target)) {
      setDisplay(raw);
      return;
    }
    const id = driver.addListener(({ value: v }) => {
      const n = Math.round(v * target);
      setDisplay((useComma ? withCommas(n) : String(n)) + suffix);
    });
    driver.setValue(0);
    const anim = Animated.timing(driver, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    anim.start();
    return () => {
      anim.stop();
      driver.removeListener(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw]);

  return <Animated.Text style={style}>{display}</Animated.Text>;
};

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton — shimmering placeholder block for loading states.
// ─────────────────────────────────────────────────────────────────────────────

interface SkeletonProps {
  width?: number | string;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

export const Skeleton: React.FC<SkeletonProps> = ({ width = '100%', height = 16, radius = 8, style }) => {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [t]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius: radius,
          backgroundColor: Colors.bg2,
          opacity: t.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0.9] }),
        },
        style,
      ]}
    />
  );
};

/** A premium loading placeholder: a few shimmering cards. */
export const SkeletonList: React.FC<{ rows?: number }> = ({ rows = 4 }) => (
  <Animated.View style={{ padding: 16, gap: 12 }}>
    <Skeleton width="55%" height={22} radius={8} />
    <Skeleton width="80%" height={12} radius={6} style={{ marginBottom: 6 }} />
    {Array.from({ length: rows }).map((_, i) => (
      <Animated.View
        key={i}
        style={{
          flexDirection: 'row',
          gap: 12,
          alignItems: 'center',
          backgroundColor: Colors.white,
          borderRadius: Radius.md,
          borderWidth: 1,
          borderColor: Colors.border2,
          padding: 12,
        }}
      >
        <Skeleton width={44} height={44} radius={12} />
        <Animated.View style={{ flex: 1, gap: 8 }}>
          <Skeleton width="70%" height={13} radius={6} />
          <Skeleton width="40%" height={10} radius={5} />
        </Animated.View>
      </Animated.View>
    ))}
  </Animated.View>
);

// ─────────────────────────────────────────────────────────────────────────────
// Pulse — subtle looping breathe, for "alive" accents (AI, live dots).
// ─────────────────────────────────────────────────────────────────────────────

export const Pulse: React.FC<{ children: React.ReactNode; scaleTo?: number; duration?: number; style?: StyleProp<ViewStyle> }> = ({
  children,
  scaleTo = 1.08,
  duration = 1100,
  style,
}) => {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [t, duration]);

  return (
    <Animated.View
      style={[style, { transform: [{ scale: t.interpolate({ inputRange: [0, 1], outputRange: [1, scaleTo] }) }] }]}
    >
      {children}
    </Animated.View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Shimmer — a diagonal light sheen that sweeps across its parent. Drop inside a
// card with `overflow: 'hidden'` for a premium "glass" highlight.
// ─────────────────────────────────────────────────────────────────────────────

export const Shimmer: React.FC<{ duration?: number; color?: string; width?: number }> = ({
  duration = 2800,
  color = 'rgba(245,232,208,0.10)',
  width = 90,
}) => {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(t, { toValue: 1, duration, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [t, duration]);

  const translateX = t.interpolate({ inputRange: [0, 1], outputRange: [-width - 40, 460] });

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
      <Animated.View
        style={{ position: 'absolute', top: -60, bottom: -60, width, backgroundColor: color, transform: [{ translateX }, { rotate: '18deg' }] }}
      />
    </Animated.View>
  );
};
