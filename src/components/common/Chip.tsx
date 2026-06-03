import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius } from '../../theme';

type ChipVariant = 'primary' | 'brand' | 'gold' | 'success' | 'warning' | 'danger' | 'gray' | 'teal' | 'rose' | 'cyan';

interface ChipProps {
  label: string;
  variant?: ChipVariant;
  style?: ViewStyle;
  small?: boolean;
}

export const Chip: React.FC<ChipProps> = ({ label, variant = 'primary', style, small }) => {
  const v = chipVariants[variant];
  return (
    <View style={[styles.base, { backgroundColor: v.bg }, small && styles.small, style]}>
      <Text style={[styles.text, { color: v.text }, small && styles.smallText]}>{label}</Text>
    </View>
  );
};

const chipVariants: Record<ChipVariant, { bg: string; text: string }> = {
  primary: { bg: Colors.primaryLight,  text: Colors.primaryDark },
  brand:   { bg: Colors.brand,         text: Colors.primary },
  gold:    { bg: Colors.primary,        text: Colors.brand },
  success: { bg: Colors.successLight,  text: Colors.success },
  warning: { bg: Colors.warningLight,  text: Colors.warning },
  danger:  { bg: Colors.dangerLight,   text: Colors.danger },
  gray:    { bg: Colors.bg2,           text: Colors.text2 },
  teal:    { bg: '#ECFEFF',            text: '#0E7490' },
  rose:    { bg: '#FFF1F2',            text: '#BE123C' },
  cyan:    { bg: '#ECFEFF',            text: '#0E7490' },
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  small: {
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  text: {
    fontSize: 10,
    fontWeight: '600',
  },
  smallText: {
    fontSize: 9,
  },
});
