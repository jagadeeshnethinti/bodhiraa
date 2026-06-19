import React from 'react';
import { Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius, Shadow } from '../../theme';
import { Icon, IconName } from './Icon';
import { Entrance, AnimatedCounter } from './anim';

interface StatCardProps {
  icon: IconName;
  value: string | number;
  label: string;
  valueColor?: string;
  iconColor?: string;
  style?: ViewStyle;
  /** Position in a row — drives the staggered entrance. */
  index?: number;
  /** Count the number up on mount (default true for numeric values). */
  animate?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  value,
  label,
  valueColor = Colors.text,
  iconColor,
  style,
  index = 0,
  animate = true,
}) => (
  <Entrance index={index} style={[styles.cell, style]}>
    <Icon name={icon} size={20} color={iconColor ?? valueColor} />
    {animate ? (
      <AnimatedCounter value={value} style={[styles.value, { color: valueColor }]} />
    ) : (
      <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
    )}
    <Text style={styles.label}>{label}</Text>
  </Entrance>
);

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 64,
    paddingVertical: 10,
    paddingHorizontal: 6,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border2,
    ...Shadow.sm,
  },
  value: { fontSize: 16, fontWeight: '800' },
  label: { fontSize: 9, color: Colors.text3, fontWeight: '600', letterSpacing: 0.5 },
});
