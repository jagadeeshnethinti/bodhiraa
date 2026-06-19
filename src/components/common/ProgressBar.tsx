import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ViewStyle, Animated, Easing } from 'react-native';
import { Colors, Radius } from '../../theme';

type ProgressVariant = 'primary' | 'success' | 'warning' | 'danger' | 'teal';

interface ProgressBarProps {
  value: number; // 0-100
  variant?: ProgressVariant;
  height?: number;
  style?: ViewStyle;
  /** Explicit fill color — overrides `variant` (e.g. a subject's accent). */
  color?: string;
  /** Animate the fill from 0 on mount / when the value changes (default true). */
  animate?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  variant = 'primary',
  height = 4,
  style,
  color,
  animate = true,
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  const fillColor = color ?? progressColors[variant];

  // Width can't use the native driver, but a single bar fill is cheap on the JS
  // thread and the easing reads as premium.
  const t = useRef(new Animated.Value(animate ? 0 : clampedValue)).current;
  useEffect(() => {
    const anim = Animated.timing(t, {
      toValue: clampedValue,
      duration: 750,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    anim.start();
    return () => anim.stop();
  }, [t, clampedValue]);

  const width = t.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });

  return (
    <View style={[styles.track, { height }, style]}>
      <Animated.View style={[styles.fill, { width, backgroundColor: fillColor, height }]} />
    </View>
  );
};

const progressColors: Record<ProgressVariant, string> = {
  primary: Colors.primary,
  success: Colors.success,
  warning: Colors.warning,
  danger:  Colors.danger,
  teal:    '#0E7490',
};

const styles = StyleSheet.create({
  track: {
    backgroundColor: Colors.bg2,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: Radius.full,
  },
});
