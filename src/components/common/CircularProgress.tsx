/**
 * Animated circular progress ring (SVG). The arc draws on from 0 on mount / when
 * `progress` changes, with a gradient stroke and rounded cap for a premium feel.
 * Center content (a number, label, icon) is passed as children.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors } from '../../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Unique gradient id per instance so multiple rings don't collide.
let _uid = 0;

interface Props {
  size?: number;
  strokeWidth?: number;
  progress: number; // 0–100
  colors?: [string, string];
  trackColor?: string;
  duration?: number;
  delay?: number;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const CircularProgress: React.FC<Props> = ({
  size = 110,
  strokeWidth = 10,
  progress,
  colors = ['#F0D3A6', '#A87840'],
  trackColor = Colors.border2,
  duration = 1100,
  delay = 150,
  children,
  style,
}) => {
  const idRef = useRef(`cp${_uid++}`);
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, progress));

  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.timing(anim, {
      toValue: clamped,
      duration,
      delay,
      // SVG attributes can't run on the native driver.
      useNativeDriver: false,
    });
    a.start();
    return () => a.stop();
  }, [anim, clamped, duration, delay]);

  const strokeDashoffset = anim.interpolate({ inputRange: [0, 100], outputRange: [circ, 0] });

  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={idRef.current} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors[0]} />
            <Stop offset="1" stopColor={colors[1]} />
          </LinearGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={`url(#${idRef.current})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
};
