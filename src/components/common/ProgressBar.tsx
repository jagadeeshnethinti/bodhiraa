import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius } from '../../theme';

type ProgressVariant = 'primary' | 'success' | 'warning' | 'danger' | 'teal';

interface ProgressBarProps {
  value: number; // 0-100
  variant?: ProgressVariant;
  height?: number;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  variant = 'primary',
  height = 4,
  style,
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  const fillColor = progressColors[variant];

  return (
    <View style={[styles.track, { height }, style]}>
      <View
        style={[
          styles.fill,
          { width: `${clampedValue}%` as any, backgroundColor: fillColor, height },
        ]}
      />
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
