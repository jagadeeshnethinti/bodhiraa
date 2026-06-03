import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../theme';

interface GradientHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightElement?: React.ReactNode;
  children?: React.ReactNode;
  style?: ViewStyle;
}

export const GradientHeader: React.FC<GradientHeaderProps> = ({
  title,
  subtitle,
  showBack,
  onBack,
  rightElement,
  children,
  style,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={['#1A0A0C', '#2A0E13', '#3D1520', '#52202E']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[{ paddingTop: insets.top }, style]}
    >
      {/* Gold shimmer overlay */}
      <View style={styles.shimmer} pointerEvents="none" />

      {title || showBack ? (
        <View style={styles.row}>
          {showBack && (
            <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
              <Text style={styles.backIcon}>‹</Text>
            </TouchableOpacity>
          )}
          <View style={styles.titleBlock}>
            {title ? <Text style={styles.title}>{title}</Text> : null}
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {rightElement ?? <View style={{ width: 36 }} />}
        </View>
      ) : null}

      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  shimmer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'transparent',
    // Gold radial glow approximation via corner tint
    borderTopRightRadius: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(196,149,96,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(196,149,96,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: Colors.primaryLight,
    lineHeight: 28,
    fontWeight: '300',
  },
  titleBlock: { flex: 1 },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F5E8D0',
    letterSpacing: -0.02 * 18,
  },
  subtitle: {
    fontSize: 11,
    color: 'rgba(196,149,96,0.75)',
    fontWeight: '600',
    marginTop: 2,
  },
});
