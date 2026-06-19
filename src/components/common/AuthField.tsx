/**
 * Auth form fields for Bodhira.
 *
 * `AuthField` is the shared visual base: floating label, leading icon that tints
 * to the accent on focus, an animated focus ring and inline error text. On top of
 * it we export *dedicated*, correctly-configured field components — one per input
 * kind (name, email, phone, number, password). Screens should use those rather
 * than wiring raw keyboard/autofill props by hand, so every field behaves
 * consistently and reliably.
 *
 * Why dedicated fields matter (and why typing felt "broken"): a controlled
 * <TextInput> with autocorrect / IME suggestions left ON can leave typed
 * characters stuck in the composing region so they never commit to state. Each
 * field below sets the right `keyboardType`, `autoComplete`, `textContentType`
 * and turns autocorrect/spellcheck off where it doesn't belong — which is what
 * actually makes text land in the box on Android.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  StyleProp,
  TextStyle,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { Colors, Radius } from '../../theme';
import { Icon, IconName } from './Icon';

// Animated inline error: a warning glyph + message that slides/fades in. Keyed on
// the message by the caller so a changed error re-plays the reveal.
const FieldError: React.FC<{ message: string }> = ({ message }) => {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(t, { toValue: 1, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [t]);
  return (
    <Animated.View
      style={[
        styles.errRow,
        { opacity: t, transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [-4, 0] }) }] },
      ]}
    >
      <Icon name="warning" size={13} color={Colors.danger} />
      <Text style={styles.err}>{message}</Text>
    </Animated.View>
  );
};

interface Props extends TextInputProps {
  label: string;
  icon?: IconName;
  error?: string | null;
  accent?: string;
  rightSlot?: React.ReactNode;
  inputStyle?: StyleProp<TextStyle>;
}

/**
 * Visual base field. Defaults to autocorrect/spellcheck OFF — the safe default
 * for the identifiers, codes and secrets that auth forms collect, and the thing
 * that keeps a controlled value from fighting the IME. Individual fields below
 * re-enable what they need (e.g. NameField turns word-capitalisation back on).
 */
export const AuthField: React.FC<Props> = ({
  label,
  icon,
  error,
  accent = Colors.primary,
  rightSlot,
  inputStyle,
  onFocus,
  onBlur,
  onChangeText,
  autoCorrect = false,
  spellCheck = false,
  ...input
}) => {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? Colors.danger : focused ? accent : Colors.border;
  const iconColor = error ? Colors.danger : focused ? accent : Colors.text3;

  // Shake the field when it transitions into an error state — a tactile, premium
  // "this needs attention" cue. Transform-only (no elevation) to keep focus safe.
  const shake = useRef(new Animated.Value(0)).current;
  const prevError = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (error && error !== prevError.current) {
      shake.setValue(0);
      Animated.sequence([
        Animated.timing(shake, { toValue: 1, duration: 45, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -1, duration: 45, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0.5, duration: 45, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 45, useNativeDriver: true }),
      ]).start();
    }
    prevError.current = error;
  }, [error, shake]);
  const translateX = shake.interpolate({ inputRange: [-1, 1], outputRange: [-6, 6] });

  return (
    <View style={styles.field}>
      <Text style={[styles.label, focused && { color: accent }, !!error && { color: Colors.danger }]}>{label}</Text>
      <Animated.View style={[styles.box, { borderColor, backgroundColor: error ? Colors.dangerLight : Colors.bg }, { transform: [{ translateX }] }]}>
        {icon ? <Icon name={icon} size={17} color={iconColor} style={styles.icon} /> : null}
        <TextInput
          style={[styles.input, inputStyle]}
          placeholderTextColor={Colors.text3}
          autoCorrect={autoCorrect}
          spellCheck={spellCheck}
          onChangeText={onChangeText}
          onFocus={e => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={e => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...input}
        />
        {rightSlot}
      </Animated.View>
      {error ? <FieldError message={error} key={error} /> : null}
    </View>
  );
};

// Props shared by the dedicated fields: everything AuthField takes, minus the
// keyboard/autofill knobs each one hard-codes for its kind.
type FieldProps = Omit<
  Props,
  'keyboardType' | 'autoComplete' | 'textContentType' | 'autoCapitalize' | 'inputMode' | 'secureTextEntry'
>;

// ─────────────────────────────────────────────────────────────────────────────
// NameField — person's name. Word-cased, name autofill, autocorrect off.
// ─────────────────────────────────────────────────────────────────────────────
export const NameField: React.FC<FieldProps> = props => (
  <AuthField
    icon="user"
    autoCapitalize="words"
    autoComplete="name"
    textContentType="name"
    {...props}
  />
);

// ─────────────────────────────────────────────────────────────────────────────
// EmailField — email keyboard, lowercase, email autofill, no autocorrect.
// ─────────────────────────────────────────────────────────────────────────────
export const EmailField: React.FC<FieldProps> = props => (
  <AuthField
    icon="user"
    keyboardType="email-address"
    inputMode="email"
    autoCapitalize="none"
    autoComplete="email"
    textContentType="emailAddress"
    {...props}
  />
);

// ─────────────────────────────────────────────────────────────────────────────
// IdentifierField — login id that may be an email, phone or username. Plain text
// keyboard, no capitalisation/autocorrect (don't mangle usernames).
// ─────────────────────────────────────────────────────────────────────────────
export const IdentifierField: React.FC<FieldProps> = props => (
  <AuthField
    icon="user"
    keyboardType="default"
    autoCapitalize="none"
    autoComplete="username"
    textContentType="username"
    {...props}
  />
);

// ─────────────────────────────────────────────────────────────────────────────
// PhoneField — phone pad, digits only (strips letters/symbols), tel autofill.
// ─────────────────────────────────────────────────────────────────────────────
export const PhoneField: React.FC<FieldProps> = ({ onChangeText, ...props }) => {
  const handle = useCallback(
    (t: string) => onChangeText?.(t.replace(/[^\d+\s-]/g, '')),
    [onChangeText],
  );
  return (
    <AuthField
      icon="phone"
      keyboardType="phone-pad"
      inputMode="tel"
      autoComplete="tel"
      textContentType="telephoneNumber"
      maxLength={18}
      onChangeText={handle}
      {...props}
    />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// NumberField — digits only (grade, age, codes). Numeric keypad.
// ─────────────────────────────────────────────────────────────────────────────
export const NumberField: React.FC<FieldProps & { maxLength?: number }> = ({ onChangeText, ...props }) => {
  const handle = useCallback(
    (t: string) => onChangeText?.(t.replace(/[^\d]/g, '')),
    [onChangeText],
  );
  return (
    <AuthField
      icon="school"
      keyboardType="number-pad"
      inputMode="numeric"
      autoCapitalize="none"
      onChangeText={handle}
      {...props}
    />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PasswordField — masked entry with a built-in Show/Hide toggle. `newPassword`
// switches the autofill hint to "new-password" for sign-up/reset screens.
// ─────────────────────────────────────────────────────────────────────────────
export const PasswordField: React.FC<FieldProps & { newPassword?: boolean }> = ({
  newPassword,
  accent = Colors.primary,
  ...props
}) => {
  const [show, setShow] = useState(false);
  return (
    <AuthField
      icon="lock"
      accent={accent}
      secureTextEntry={!show}
      autoCapitalize="none"
      autoComplete={newPassword ? 'password-new' : 'password'}
      textContentType={newPassword ? 'newPassword' : 'password'}
      inputStyle={styles.passwordInput}
      rightSlot={
        <TouchableOpacity onPress={() => setShow(s => !s)} hitSlop={8}>
          <Text style={[styles.showBtn, { color: accent }]}>{show ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      }
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  field: { marginBottom: 14 },
  label: { fontSize: 11, color: Colors.text3, fontWeight: '700', letterSpacing: 0.6, marginBottom: 6 },
  box: {
    backgroundColor: Colors.bg,
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  // NOTE: do NOT add `elevation`/`shadow` to the box on focus. Toggling elevation
  // on focus promotes the view to a new native layer on the New Architecture,
  // which drops the TextInput's focus and makes typing fail (focus bounces to the
  // next field). The focus ring is conveyed by border colour only — keep it that way.
  icon: {},
  input: { flex: 1, fontSize: 16, color: Colors.text, fontWeight: '500', padding: 0, paddingVertical: 14 },
  passwordInput: { fontSize: 18, letterSpacing: 2 },
  showBtn: { fontSize: 12, fontWeight: '700', paddingLeft: 8 },
  errRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6, marginLeft: 2 },
  err: { flex: 1, fontSize: 11.5, color: Colors.danger, fontWeight: '600' },
});
