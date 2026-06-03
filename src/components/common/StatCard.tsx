import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius, Shadow } from '../../theme';

interface StatCardProps {
  emoji: string;
  value: string | number;
  label: string;
  valueColor?: string;
  style?: ViewStyle;
}

export const StatCard: React.FC<StatCardProps> = ({
  emoji,
  value,
  label,
  valueColor = Colors.text,
  style,
}) => (
  <View style={[styles.cell, style]}>
    <Text style={styles.emoji}>{emoji}</Text>
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
  emoji: { fontSize: 18 },
  value: { fontSize: 16, fontWeight: '800' },
  label: { fontSize: 9, color: Colors.text3, fontWeight: '600', letterSpacing: 0.5 },
});
