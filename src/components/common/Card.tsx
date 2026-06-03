import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius, Shadow } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'ai' | 'elevated';
  padding?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  padding = 12,
}) => {
  const variantStyle = cardVariants[variant];
  return (
    <View style={[styles.base, { padding }, variantStyle, style]}>
      {children}
    </View>
  );
};

const cardVariants: Record<string, ViewStyle> = {
  default: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border2,
    ...Shadow.sm,
  },
  ai: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: 'rgba(196,149,96,0.2)',
  },
  elevated: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border2,
    ...Shadow.md,
  },
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
});
