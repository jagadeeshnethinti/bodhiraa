import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Radius } from '../../theme';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  initials?: string;
  emoji?: string;
  size?: AvatarSize;
  style?: ViewStyle;
}

const sizeMap: Record<AvatarSize, { box: number; font: number; radius: number }> = {
  sm: { box: 32, font: 11, radius: 10 },
  md: { box: 40, font: 14, radius: 12 },
  lg: { box: 56, font: 20, radius: 16 },
  xl: { box: 72, font: 28, radius: 22 },
};

export const Avatar: React.FC<AvatarProps> = ({ initials, emoji, size = 'md', style }) => {
  const s = sizeMap[size];
  return (
    <LinearGradient
      colors={['#C49560', '#A87840']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.base,
        { width: s.box, height: s.box, borderRadius: s.radius },
        style,
      ]}
    >
      <Text style={[styles.text, { fontSize: s.font }]}>
        {emoji ?? initials ?? '?'}
      </Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: Colors.brand,
    fontWeight: '800',
  },
});
