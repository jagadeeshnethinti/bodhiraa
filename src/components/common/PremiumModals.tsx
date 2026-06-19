/**
 * Bodhira — premium centered modals.
 *
 * Replaces native `Alert.alert` with on-brand, animated, center-screen dialogs:
 *
 *  • ConfirmDialog — backdrop fade + spring-pop card with an icon badge, title,
 *    message and cancel/confirm actions. Used for sign-out and payment confirms.
 *
 *  • SuccessModal — a celebratory payment-success moment: a spring success badge
 *    with a drawn checkmark, expanding ripples and a gold sparkle burst, then the
 *    title / message / button rise in.
 *
 * Both are dependency-free (RN Animated + react-native-svg) and native-driven.
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Animated, Easing } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors, Radius, Shadow } from '../../theme';
import { Button } from './Button';
import { BoldIcon, BoldIconName } from './BoldIcon';

// ── Shared enter animation ──────────────────────────────────────────────────
function useEnter(visible: boolean) {
  const backdrop = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!visible) return;
    backdrop.setValue(0);
    pop.setValue(0);
    Animated.parallel([
      Animated.timing(backdrop, { toValue: 1, duration: 200, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.spring(pop, { toValue: 1, friction: 8, tension: 80, useNativeDriver: true }),
    ]).start();
  }, [visible, backdrop, pop]);
  return { backdrop, pop };
}

const cardTransform = (pop: Animated.Value) => [
  { scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] }) },
  { translateY: pop.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) },
];

// ── ConfirmDialog ───────────────────────────────────────────────────────────
type Tone = 'danger' | 'primary' | 'success';
const TONES: Record<Tone, { bg: string; fg: string }> = {
  danger: { bg: Colors.dangerLight, fg: Colors.danger },
  primary: { bg: Colors.primaryLight, fg: Colors.primaryDark },
  success: { bg: Colors.successLight, fg: Colors.success },
};

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  icon?: BoldIconName;
  tone?: Tone;
  confirmLabel?: string;
  /** Omit to render a single (info) button with no cancel. */
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  icon,
  tone = 'primary',
  confirmLabel = 'Confirm',
  cancelLabel,
  loading,
  onConfirm,
  onCancel,
}) => {
  const { backdrop, pop } = useEnter(visible);
  const t = TONES[tone];

  return (
    <Modal visible={visible} transparent statusBarTranslucent animationType="none" onRequestClose={loading ? undefined : onCancel}>
      <Animated.View style={[styles.backdrop, { opacity: backdrop }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={loading ? undefined : onCancel} />
        <Animated.View style={[styles.card, { opacity: pop, transform: cardTransform(pop) }]}>
          {icon ? (
            <View style={[styles.badge, { backgroundColor: t.bg }]}>
              <BoldIcon name={icon} size={32} color={t.fg} />
            </View>
          ) : null}
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.actions}>
            {cancelLabel ? (
              <View style={styles.actionFlex}>
                <Button label={cancelLabel} variant="outline" onPress={onCancel} disabled={loading} />
              </View>
            ) : null}
            <View style={styles.actionFlex}>
              <Button
                label={confirmLabel}
                variant={tone === 'danger' ? 'danger' : tone === 'success' ? 'success' : 'primary'}
                onPress={onConfirm}
                loading={loading}
              />
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// ── SuccessModal ────────────────────────────────────────────────────────────
const SPARKS = 12;
const SPARK_DIST = 78;

interface SuccessModalProps {
  visible: boolean;
  title?: string;
  message?: string;
  buttonLabel?: string;
  onClose: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  title = 'Payment successful',
  message,
  buttonLabel = 'Done',
  onClose,
}) => {
  const backdrop = useRef(new Animated.Value(0)).current;
  const card = useRef(new Animated.Value(0)).current;
  const badge = useRef(new Animated.Value(0)).current;
  const check = useRef(new Animated.Value(0)).current;
  const ripple = useRef(new Animated.Value(0)).current;
  const content = useRef(new Animated.Value(0)).current;
  const sparks = useRef(Array.from({ length: SPARKS }, () => new Animated.Value(0))).current;

  useEffect(() => {
    if (!visible) return;
    [backdrop, card, badge, check, ripple, content, ...sparks].forEach(v => v.setValue(0));
    Animated.sequence([
      Animated.parallel([
        Animated.timing(backdrop, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(card, { toValue: 1, friction: 8, tension: 70, useNativeDriver: true }),
      ]),
      Animated.spring(badge, { toValue: 1, friction: 5, tension: 130, useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(check, { toValue: 1, friction: 5, tension: 150, useNativeDriver: true }),
        Animated.timing(ripple, { toValue: 1, duration: 750, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.stagger(
          28,
          sparks.map(sp => Animated.timing(sp, { toValue: 1, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: true })),
        ),
      ]),
      Animated.timing(content, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [visible, backdrop, card, badge, check, ripple, content, sparks]);

  return (
    <Modal visible={visible} transparent statusBarTranslucent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.backdrop, { opacity: backdrop }]}>
        <Animated.View style={[styles.card, { opacity: card, transform: cardTransform(card) }]}>
          {/* Badge + burst */}
          <View style={styles.successArea}>
            {/* Expanding ripples */}
            {[0, 1].map(i => (
              <Animated.View
                key={i}
                pointerEvents="none"
                style={[
                  styles.ripple,
                  {
                    opacity: ripple.interpolate({ inputRange: [0, 1], outputRange: [0.45 - i * 0.15, 0] }),
                    transform: [{ scale: ripple.interpolate({ inputRange: [0, 1], outputRange: [0.6, 2 + i * 0.5] }) }],
                  },
                ]}
              />
            ))}

            {/* Gold sparkle burst */}
            {sparks.map((sp, i) => {
              const angle = (i / SPARKS) * Math.PI * 2;
              const dx = Math.cos(angle) * SPARK_DIST;
              const dy = Math.sin(angle) * SPARK_DIST;
              const big = i % 2 === 0;
              return (
                <Animated.View
                  key={i}
                  pointerEvents="none"
                  style={[
                    styles.spark,
                    {
                      width: big ? 8 : 5,
                      height: big ? 8 : 5,
                      backgroundColor: big ? Colors.primary : '#F5E8D0',
                      opacity: sp.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 1, 0] }),
                      transform: [
                        { translateX: sp.interpolate({ inputRange: [0, 1], outputRange: [0, dx] }) },
                        { translateY: sp.interpolate({ inputRange: [0, 1], outputRange: [0, dy] }) },
                        { scale: sp.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 1.1, 0.5] }) },
                      ],
                    },
                  ]}
                />
              );
            })}

            {/* Success badge with drawn check */}
            <Animated.View
              style={[
                styles.successBadge,
                { transform: [{ scale: badge.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }) }] },
              ]}
            >
              <Animated.View style={{ transform: [{ scale: check.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] }) }], opacity: check }}>
                <Svg width={48} height={48} viewBox="0 0 48 48">
                  <Path d="M13 24.5 L20.5 32 L35 16" fill="none" stroke="#FFFFFF" strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </Animated.View>
            </Animated.View>
          </View>

          {/* Content */}
          <Animated.View
            style={{
              alignItems: 'center',
              width: '100%',
              opacity: content,
              transform: [{ translateY: content.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
            }}
          >
            <Text style={styles.title}>{title}</Text>
            {message ? <Text style={styles.message}>{message}</Text> : null}
            <View style={[styles.actions, { marginTop: 18 }]}>
              <View style={styles.actionFlex}>
                <Button label={buttonLabel} variant="primary" onPress={onClose} />
              </View>
            </View>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20,6,9,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.white,
    borderRadius: 26,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: 'center',
    ...Shadow.lg,
  },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 18, fontWeight: '900', color: Colors.text, textAlign: 'center', letterSpacing: -0.3 },
  message: { fontSize: 13, color: Colors.text2, textAlign: 'center', lineHeight: 19, marginTop: 8 },
  actions: { flexDirection: 'row', gap: 10, width: '100%', marginTop: 20 },
  actionFlex: { flex: 1 },

  // Success
  successArea: { width: 140, height: 140, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  ripple: { position: 'absolute', width: 88, height: 88, borderRadius: 44, backgroundColor: Colors.success },
  successBadge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(196,149,96,0.35)',
    ...Shadow.md,
  },
  spark: { position: 'absolute', borderRadius: 4 },
});
