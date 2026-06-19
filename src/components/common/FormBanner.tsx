/**
 * Bodhira — inline form banner.
 *
 * A premium, tone-aware status strip for form-level messages (e.g. "Invalid
 * credentials", "Too many attempts", "Check your details"). Renders nothing when
 * there's no message; springs/fades in when one appears. Replaces the plain red
 * `<Text>` error lines on the auth screens.
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, StyleProp, ViewStyle } from 'react-native';
import { Colors, Radius } from '../../theme';
import { BoldIcon, BoldIconName } from './BoldIcon';

type Tone = 'danger' | 'success' | 'info';

const TONES: Record<Tone, { bg: string; border: string; fg: string; icon: BoldIconName }> = {
  danger: { bg: Colors.dangerLight, border: 'rgba(196,32,32,0.25)', fg: Colors.danger, icon: 'warning' },
  success: { bg: Colors.successLight, border: 'rgba(26,122,72,0.25)', fg: Colors.success, icon: 'checkmark' },
  info: { bg: Colors.primaryLight, border: 'rgba(196,149,96,0.3)', fg: Colors.primaryDark, icon: 'help' },
};

interface Props {
  message?: string | null;
  tone?: Tone;
  icon?: BoldIconName;
  style?: StyleProp<ViewStyle>;
}

export const FormBanner: React.FC<Props> = ({ message, tone = 'danger', icon, style }) => {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!message) return;
    t.setValue(0);
    Animated.timing(t, { toValue: 1, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [message, t]);

  if (!message) return null;
  const c = TONES[tone];

  return (
    <Animated.View
      style={[
        styles.banner,
        { backgroundColor: c.bg, borderColor: c.border },
        { opacity: t, transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [-6, 0] }) }] },
        style,
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: c.fg + '1F' }]}>
        <BoldIcon name={icon ?? c.icon} size={15} color={c.fg} />
      </View>
      <Text style={[styles.text, { color: c.fg }]}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  iconWrap: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, fontSize: 12.5, fontWeight: '600', lineHeight: 17 },
});
