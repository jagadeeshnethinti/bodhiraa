import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Radius, Shadow } from '../../theme';

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

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.85}
        style={[styles.base, sizeStyle.btn, fullWidth && styles.full, disabled && styles.disabled, style]}
      >
        <LinearGradient
          colors={['#C49560', '#A87840']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[StyleSheet.absoluteFill, { borderRadius: Radius.md }]}
        />
        {loading ? (
          <ActivityIndicator color={Colors.brand} size="small" />
        ) : (
          <>
            {icon}
            <Text style={[styles.text, sizeStyle.text, { color: Colors.brand }, textStyle]}>{label}</Text>
          </>
        )}
      </TouchableOpacity>
    );
  }

  if (variant === 'brand') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.85}
        style={[styles.base, sizeStyle.btn, fullWidth && styles.full, disabled && styles.disabled, style]}
      >
        <LinearGradient
          colors={['#2A0E13', '#3D1520']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[StyleSheet.absoluteFill, { borderRadius: Radius.md }]}
        />
        {loading ? (
          <ActivityIndicator color={Colors.primary} size="small" />
        ) : (
          <>
            {icon}
            <Text style={[styles.text, sizeStyle.text, { color: Colors.primary }, textStyle]}>{label}</Text>
          </>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[styles.base, sizeStyle.btn, variantStyle.btn, fullWidth && styles.full, disabled && styles.disabled, style]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.textColor} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, sizeStyle.text, { color: variantStyle.textColor }, textStyle]}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
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
