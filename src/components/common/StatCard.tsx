import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius, Shadow } from '../../theme';
import { Icon, IconName } from './Icon';

interface StatCardProps {
  icon: IconName;
  value: string | number;
  label: string;
  valueColor?: string;
  iconColor?: string;
  style?: ViewStyle;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  value,
  label,
  valueColor = Colors.text,
  iconColor,
  style,
}) => (
  <View style={[styles.cell, style]}>
    <Icon name={icon} size={20} color={iconColor ?? valueColor} />
    <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
    <Text style={styles.label}>{label}</Text>
  </View>
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
