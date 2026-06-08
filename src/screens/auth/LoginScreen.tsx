import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, Linking, ScrollView, TextInput } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { Colors, Radius } from '../../theme';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { useAuth } from '../../context/AuthContext';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { ApiError } from '../../api';
import { Env } from '../../config/env';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { login } = useAuth();
  const { submitting, run } = useAsyncAction();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [paused, setPaused] = useState(false); // 403 account_inactive
  const [cooldown, setCooldown] = useState(0); // 429 retry-after seconds
  const cooldownTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(
    () => () => {
      if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    },
    [],
  );

  const startCooldown = (seconds: number) => {
    setCooldown(seconds);
    if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    cooldownTimer.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1 && cooldownTimer.current) {
          clearInterval(cooldownTimer.current);
          cooldownTimer.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async () => {
    setFieldError(null);
    setFormError(null);
    // On success the root navigator swaps stacks automatically.
    await run(async () => {
      try {
        await login({ identifier: identifier.trim(), password });
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.kind === 'validation') {
            setFieldError(err.fieldError('identifier') ?? err.message);
          } else if (err.code === 'account_inactive' || err.status === 403) {
            setPaused(true);
          } else if (err.kind === 'rate_limited') {
            startCooldown(err.retryAfter ?? 60);
            setFormError('Too many attempts — please wait before trying again.');
          } else {
            setFormError(err.message);
          }
        } else {
          setFormError('Something went wrong. Please try again.');
        }
        throw err;
      }
    });
  };

  // Stable handler so typing doesn't recreate the callback on every render.
  // Declared before any early return so hook order stays constant.
  const onIdentifier = useCallback((t: string) => {
    setIdentifier(t);
    setFieldError(prev => (prev ? null : prev));
  }, []);

  // ── 403: account paused ─────────────────────────────────────────────────────
  if (paused) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
        <View style={styles.pausedWrap}>
          <Icon name="pause" size={48} color={Colors.text3} style={styles.pausedIcon} />
          <Text style={styles.pausedTitle}>Your account is paused</Text>
          <Text style={styles.pausedBody}>
            Contact your school admin to reactivate your account.
          </Text>
          <Button
            label="Back to sign in"
            variant="outline"
            onPress={() => setPaused(false)}
            style={styles.pausedBtn}
          />
        </View>
      </SafeAreaView>
    );
  }

  const disabled = submitting || cooldown > 0 || !identifier.trim() || !password;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#1A0A0C" />
      <ScrollView
          style={styles.container}
          bounces={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          automaticallyAdjustKeyboardInsets
        >
          <LinearGradient
            colors={['#1A0A0C', '#2A0E13', '#3D1520']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.brandHeader}
          >
            <SafeAreaView edges={['top']} style={styles.brandInner}>
              <View style={styles.shimmer} pointerEvents="none" />
              <View style={styles.headerRow}>
                <View style={styles.logoBox}>
                  <Icon name="brain" size={24} color={Colors.primary} />
                </View>
                <View>
                  <Text style={styles.brandName}>Bodhira LMS</Text>
                  <Text style={styles.brandTagline}>AI-Powered Learning Platform</Text>
                </View>
              </View>
            </SafeAreaView>
          </LinearGradient>

          <View style={styles.body}>
            <Text style={styles.greeting}>Welcome back</Text>
            <Text style={styles.sub}>Sign in to continue your learning journey</Text>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>EMAIL, PHONE, OR USERNAME</Text>
              <View style={[styles.inputBox, focusedField === 'identifier' && styles.inputBoxFocused, !!fieldError && styles.inputBoxError]}>
                <TextInput
                  style={styles.textInput}
                  value={identifier}
                  onChangeText={onIdentifier}
                  placeholder="you@email.com or +9198…"
                  placeholderTextColor={Colors.text3}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setFocusedField('identifier')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
              {fieldError ? <Text style={styles.fieldError}>{fieldError}</Text> : null}
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>PASSWORD</Text>
              <View style={[styles.inputBox, focusedField === 'password' && styles.inputBoxFocused]}>
                <TextInput
                  style={[styles.textInput, styles.passwordInput]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••••"
                  placeholderTextColor={Colors.text3}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity onPress={() => setShowPass(s => !s)}>
                  <Text style={styles.showBtn}>{showPass ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.forgotWrap}
              onPress={() => Linking.openURL(`${Env.apiOrigin}/forgot-password`)}
            >
              <Text style={styles.forgot}>Forgot password?</Text>
            </TouchableOpacity>

            {formError ? <Text style={styles.formError}>{formError}</Text> : null}

            <Button
              label={
                cooldown > 0 ? `Try again in ${cooldown}s` : submitting ? 'Signing in…' : 'Sign In →'
              }
              variant="primary"
              onPress={handleSubmit}
              loading={submitting}
              disabled={disabled}
              style={styles.signInBtn}
            />

            <View style={styles.divider}>
              <View style={styles.divLine} />
              <Text style={styles.divText}>or</Text>
              <View style={styles.divLine} />
            </View>

            <Button
              label="Sign in with Phone OTP"
              variant="outline"
              icon={<Icon name="phone" size={16} color={Colors.brand} />}
              onPress={() => navigation.navigate('PhoneLogin')}
            />

            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.signupLink}>Sign up free</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  container: { flex: 1 },
  brandHeader: { overflow: 'hidden' },
  brandInner: { paddingHorizontal: 20, paddingBottom: 24 },
  shimmer: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(196,149,96,0.1)' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(196,149,96,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(196,149,96,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: { fontSize: 20, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.4 },
  brandTagline: { fontSize: 10, color: 'rgba(196,149,96,0.75)', fontWeight: '600', marginTop: 2 },
  body: { padding: 20, paddingTop: 28 },
  greeting: { fontSize: 22, fontWeight: '800', color: Colors.text, letterSpacing: -0.44, marginBottom: 4 },
  sub: { fontSize: 12, color: Colors.text2, marginBottom: 20 },
  field: { marginBottom: 14 },
  fieldLabel: { fontSize: 11, color: Colors.text3, fontWeight: '700', letterSpacing: 0.6, marginBottom: 6 },
  inputBox: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputBoxFocused: { borderColor: Colors.primary },
  inputBoxError: { borderColor: Colors.danger },
  textInput: { flex: 1, fontSize: 16, color: Colors.text, fontWeight: '500', padding: 0 },
  passwordInput: { fontSize: 19, letterSpacing: 2 },
  fieldError: { fontSize: 11, color: Colors.danger, marginTop: 4, marginLeft: 2 },
  showBtn: { fontSize: 12, color: Colors.primary, fontWeight: '700', paddingLeft: 8 },
  forgotWrap: { alignSelf: 'flex-end', marginBottom: 14 },
  forgot: { fontSize: 11, color: Colors.primary, fontWeight: '700' },
  formError: { fontSize: 12, color: Colors.danger, marginBottom: 12, fontWeight: '600' },
  signInBtn: {
    marginBottom: 22,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 4,
  },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  divLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  divText: { fontSize: 11, color: Colors.text3 },
  signupRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  signupText: { fontSize: 12, color: Colors.text2 },
  signupLink: { fontSize: 12, color: Colors.primary, fontWeight: '700' },

  // Paused (403) state
  pausedWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 10 },
  pausedIcon: { opacity: 0.6, marginBottom: 4 },
  pausedTitle: { fontSize: 19, fontWeight: '800', color: Colors.text, textAlign: 'center' },
  pausedBody: { fontSize: 13, color: Colors.text2, textAlign: 'center', lineHeight: 20 },
  pausedBtn: { marginTop: 12, minWidth: 200 },
});
