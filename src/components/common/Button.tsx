import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Radius, Shadow, useTheme } from '../../theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type Variant = 'primary' | 'brand' | 'outline' | 'ghost' | 'danger' | 'success' | 'gold';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  fullWidth = true,
  style,
  textStyle,
  icon,
}) => {
  const sizeStyle = sizes[size];
  const variantStyle = variants[variant];
  const theme = useTheme(); // active brand (Bodhira gold or the user's school)

  // Tactile press feedback shared by every variant.
  const scale = useRef(new Animated.Value(1)).current;
  const pressIn = () => {
    if (disabled || loading) return;
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, friction: 7, tension: 160 }).start();
  };
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6, tension: 160 }).start();
  const scaleStyle = { transform: [{ scale }] };

  if (variant === 'primary') {
    return (
      <AnimatedTouchable
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        disabled={disabled || loading}
        activeOpacity={0.9}
        style={[styles.base, sizeStyle.btn, fullWidth && styles.full, disabled && styles.disabled, scaleStyle, style]}
      >
        <LinearGradient
          colors={[theme.accent, theme.accentDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[StyleSheet.absoluteFill, { borderRadius: Radius.md }]}
        />
        {loading ? (
          <ActivityIndicator color={theme.onAccent} size="small" />
        ) : (
          <>
            {icon}
            <Text style={[styles.text, sizeStyle.text, { color: theme.onAccent }, textStyle]}>{label}</Text>
          </>
        )}
      </AnimatedTouchable>
    );
  }

  if (variant === 'brand') {
    return (
      <AnimatedTouchable
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        disabled={disabled || loading}
        activeOpacity={0.9}
        style={[styles.base, sizeStyle.btn, fullWidth && styles.full, disabled && styles.disabled, scaleStyle, style]}
      >
        <LinearGradient
          colors={[theme.hero[1] ?? '#2A0E13', theme.hero[2] ?? '#3D1520']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[StyleSheet.absoluteFill, { borderRadius: Radius.md }]}
        />
        {loading ? (
          <ActivityIndicator color={theme.accent} size="small" />
        ) : (
          <>
            {icon}
            <Text style={[styles.text, sizeStyle.text, { color: theme.accent }, textStyle]}>{label}</Text>
          </>
        )}
      </AnimatedTouchable>
    );
  }

  // Theme the brand-accent variants (outline border / gold fill); semantic
  // variants (danger/success/ghost) keep their fixed colours.
  const themedBtn =
    variant === 'outline' ? { borderColor: theme.accent } : variant === 'gold' ? { backgroundColor: theme.accent } : null;
  const textColor =
    variant === 'outline' ? theme.accentDark : variant === 'gold' ? theme.onAccent : variantStyle.textColor;

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      disabled={disabled || loading}
      activeOpacity={0.9}
      style={[styles.base, sizeStyle.btn, variantStyle.btn, themedBtn, fullWidth && styles.full, disabled && styles.disabled, scaleStyle, style]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, sizeStyle.text, { color: textColor }, textStyle]}>{label}</Text>
        </>
      )}
    </AnimatedTouchable>
  );
};

const sizes = {
  sm: {
    btn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: Radius.sm, minHeight: 36 },
    text: { fontSize: 12 },
  },
  md: {
    btn: { paddingVertical: 13, paddingHorizontal: 18, borderRadius: Radius.md, minHeight: 46 },
    text: { fontSize: 13 },
  },
  lg: {
    btn: { paddingVertical: 16, paddingHorizontal: 24, borderRadius: Radius.lg, minHeight: 54 },
    text: { fontSize: 15 },
  },
};

const variants: Record<Variant, { btn: ViewStyle; textColor: string }> = {
  primary: { btn: {}, textColor: Colors.brand },
  brand:   { btn: {}, textColor: Colors.primary },
  outline: {
    btn: { backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.primary },
    textColor: Colors.brand,
  },
  ghost: {
    btn: { backgroundColor: Colors.bg },
    textColor: Colors.text,
  },
  danger: {
    btn: { backgroundColor: Colors.danger, ...Shadow.sm },
    textColor: Colors.white,
  },
  success: {
    btn: { backgroundColor: Colors.success, ...Shadow.sm },
    textColor: Colors.white,
  },
  gold: {
    btn: { backgroundColor: Colors.primary, ...Shadow.md },
    textColor: Colors.brand,
  },
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
    position: 'relative',
    ...Shadow.sm,
  },
  full: { width: '100%' },
  disabled: { opacity: 0.55 },
  text: {
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});
