import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ActivityIndicator, Modal } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { Colors, Radius } from '../../theme';
import { Button } from '../../components/common/Button';
import { Icon, IconName } from '../../components/common/Icon';
import { AuthScaffold } from '../../components/common/AuthScaffold';
import { IdentifierField, PasswordField } from '../../components/common/AuthField';
import { FormBanner } from '../../components/common/FormBanner';
import { SCHOOL_THEMES } from '../../theme';
import { validateLoginIdentifier, validateRequired } from '../../utils/validation';
import { useAuth } from '../../context/AuthContext';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { ApiError } from '../../api';
import { Env } from '../../config/env';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

type LoginRole = 'student' | 'parent' | 'teacher' | 'admin';

interface RoleConfig {
  key: LoginRole;
  label: string;
  icon: IconName;
  accent: string;
  accentDark: string;
  onAccent: string;
  greeting: string;
  sub: string;
  placeholder: string;
  note?: string;
}

const ROLES: RoleConfig[] = [
  { key: 'student', label: 'Student', icon: 'user', accent: '#C49560', accentDark: '#A87840', onAccent: '#1A0A0C', greeting: 'Welcome back', sub: 'Sign in to continue your learning journey', placeholder: 'you@email.com or Roll No.' },
  { key: 'parent', label: 'Parent', icon: 'child', accent: '#0E7C5A', accentDark: '#0A5E44', onAccent: '#FFFFFF', greeting: 'Hello, Parent', sub: "Track your child's progress & attendance", placeholder: 'Registered email or phone' },
  { key: 'teacher', label: 'Teacher', icon: 'teacher', accent: '#2F4DA0', accentDark: '#233B7A', onAccent: '#FFFFFF', greeting: 'Welcome, Educator', sub: 'Manage your classes, content & reports', placeholder: 'Staff email or ID' },
  { key: 'admin', label: 'Admin', icon: 'lock', accent: '#7A1322', accentDark: '#5A0E1A', onAccent: '#FFFFFF', greeting: 'Admin Console', sub: 'Sign in to your school control center', placeholder: 'Admin email', note: 'Admins continue on the secure web dashboard after sign-in.' },
];

// Schools available to pick from (derived from the brand-theme registry).
const SCHOOLS = Object.values(SCHOOL_THEMES).map(t => ({ code: t.key, name: t.name, accent: t.accent }));

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { login } = useAuth();
  const { submitting, run } = useAsyncAction();

  const [roleKey, setRoleKey] = useState<LoginRole>('student');
  const roleIndex = ROLES.findIndex(r => r.key === roleKey);
  const role = ROLES[roleIndex];

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Students choose: join with their School (themed) or a personal Bodhira account.
  const [accountType, setAccountType] = useState<'school' | 'personal'>('school');
  const [schoolCode, setSchoolCode] = useState('');
  const [schoolError, setSchoolError] = useState<string | null>(null);
  const [schoolPickerOpen, setSchoolPickerOpen] = useState(false);
  const usingSchool = roleKey === 'student' && accountType === 'school';
  const matchedSchool = usingSchool ? SCHOOL_THEMES[schoolCode.trim().toUpperCase()] : undefined;

  const [fieldError, setFieldError] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const pillX = useRef(new Animated.Value(0)).current;
  const ctaScale = useRef(new Animated.Value(1)).current;
  const [trackW, setTrackW] = useState(0);
  const segW = trackW > 0 ? (trackW - 8) / ROLES.length : 0;

  useEffect(() => {
    if (segW <= 0) return;
    Animated.spring(pillX, { toValue: segW * roleIndex, useNativeDriver: true, friction: 9, tension: 90 }).start();
  }, [roleIndex, segW, pillX]);

  useEffect(() => () => { if (cooldownTimer.current) clearInterval(cooldownTimer.current); }, []);

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
    setFormError(null);
    // Client-side validation first — no point hitting the API with bad input.
    const idErr = validateLoginIdentifier(identifier);
    const pwErr = validateRequired(password, 'your password');
    const schErr = usingSchool && !schoolCode.trim() ? 'Enter your school code to continue.' : null;
    setFieldError(idErr);
    setPwError(pwErr);
    setSchoolError(schErr);
    if (idErr || pwErr || schErr) return;
    await run(async () => {
      try {
        await login({
          identifier: identifier.trim(),
          password,
          ...(Env.useMock ? { role: roleKey } : {}),
          ...(usingSchool ? { school_code: schoolCode.trim() } : {}),
        });
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.kind === 'validation') setFieldError(err.fieldError('identifier') ?? err.message);
          else if (err.code === 'account_inactive' || err.status === 403) setPaused(true);
          else if (err.kind === 'rate_limited') {
            startCooldown(err.retryAfter ?? 60);
            setFormError('Too many attempts — please wait before trying again.');
          } else setFormError(err.message);
        } else {
          setFormError('Something went wrong. Please try again.');
        }
        throw err;
      }
    });
  };

  const onIdentifier = useCallback((t: string) => {
    setIdentifier(t);
    setFieldError(prev => (prev ? null : prev));
  }, []);

  const onPassword = useCallback((t: string) => {
    setPassword(t);
    setPwError(prev => (prev ? null : prev));
  }, []);

  const selectRole = useCallback((key: LoginRole) => {
    setRoleKey(key);
    setFormError(null);
  }, []);

  // ── 403: account paused ─────────────────────────────────────────────────────
  if (paused) {
    return (
      <AuthScaffold title="Account paused" subtitle="Contact your school admin to reactivate your account." badge="pause" accent={Colors.warning} onBack={() => setPaused(false)}>
        <Button label="Back to sign in" variant="outline" onPress={() => setPaused(false)} />
      </AuthScaffold>
    );
  }

  const disabled = submitting || cooldown > 0 || !identifier.trim() || !password || (usingSchool && !schoolCode.trim());

  return (
    <AuthScaffold title={role.greeting} subtitle={role.sub} badge={role.icon} accent={role.accent}>
      {/* Role selector */}
      <Text style={styles.selectorLabel}>SIGN IN AS</Text>
      <View style={styles.track} onLayout={e => setTrackW(e.nativeEvent.layout.width)}>
        {segW > 0 && (
          <Animated.View style={[styles.pill, { width: segW, backgroundColor: role.accent, transform: [{ translateX: pillX }] }]} />
        )}
        {ROLES.map(r => {
          const active = r.key === roleKey;
          const tint = active ? r.onAccent : Colors.text3;
          return (
            <TouchableOpacity key={r.key} style={styles.segment} activeOpacity={0.7} onPress={() => selectRole(r.key)}>
              <Icon name={r.icon} size={18} color={tint} />
              <Text style={[styles.segmentLabel, { color: tint, fontWeight: active ? '800' : '600' }]}>{r.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {roleKey === 'student' && (
        <>
          <Text style={styles.selectorLabel}>ACCOUNT TYPE</Text>
          <View style={styles.acctToggle}>
            {(['school', 'personal'] as const).map(t => {
              const active = accountType === t;
              return (
                <TouchableOpacity key={t} style={[styles.acctSeg, active && styles.acctSegActive]} activeOpacity={0.85} onPress={() => setAccountType(t)}>
                  <Icon name={t === 'school' ? 'school' : 'user'} size={16} color={active ? Colors.brand : Colors.text3} />
                  <Text style={[styles.acctSegTxt, active && styles.acctSegTxtActive]}>{t === 'school' ? 'My School' : 'Personal'}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {accountType === 'school' ? (
            <>
              <Text style={styles.fieldLabel}>SELECT SCHOOL</Text>
              <TouchableOpacity activeOpacity={0.85} style={[styles.dropdown, !!schoolError && styles.dropdownError]} onPress={() => setSchoolPickerOpen(true)}>
                <Icon name="school" size={17} color={matchedSchool ? matchedSchool.accent : Colors.text3} />
                {matchedSchool ? (
                  <Text style={styles.dropdownValue} numberOfLines={1}>{matchedSchool.name}</Text>
                ) : (
                  <Text style={styles.dropdownPlaceholder}>Choose your school</Text>
                )}
                <Text style={styles.dropdownChevron}>▾</Text>
              </TouchableOpacity>
              {schoolError ? <Text style={styles.fieldErr}>{schoolError}</Text> : null}
            </>
          ) : (
            <View style={[styles.noteBox, { backgroundColor: Colors.primaryLight, borderColor: 'rgba(196,149,96,0.33)' }]}>
              <Icon name="ai" size={14} color={Colors.primaryDark} />
              <Text style={[styles.noteText, { color: Colors.primaryDark }]}>Personal Bodhira account — learn solo with full premium access.</Text>
            </View>
          )}

          {matchedSchool && accountType === 'school' ? (
            <View style={styles.schoolPreview}>
              <Icon name="checkmark" size={13} color={Colors.success} />
              <Text style={styles.schoolPreviewTxt}>The app will use {matchedSchool.name}'s theme</Text>
            </View>
          ) : null}

          <Modal visible={schoolPickerOpen} transparent animationType="fade" onRequestClose={() => setSchoolPickerOpen(false)}>
            <TouchableOpacity style={styles.pickerBackdrop} activeOpacity={1} onPress={() => setSchoolPickerOpen(false)}>
              <View style={styles.pickerSheet}>
                <Text style={styles.pickerTitle}>Select your school</Text>
                {SCHOOLS.map(s => {
                  const active = s.code === schoolCode;
                  return (
                    <TouchableOpacity
                      key={s.code}
                      activeOpacity={0.8}
                      style={[styles.pickerRow, active && styles.pickerRowActive]}
                      onPress={() => { setSchoolCode(s.code); setSchoolError(null); setSchoolPickerOpen(false); }}
                    >
                      <View style={[styles.pickerDot, { backgroundColor: s.accent }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.pickerName}>{s.name}</Text>
                        <Text style={styles.pickerCode}>{s.code}</Text>
                      </View>
                      {active ? <Icon name="checkmark" size={16} color={Colors.success} /> : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </TouchableOpacity>
          </Modal>
        </>
      )}

      {role.note ? (
        <View style={[styles.noteBox, { backgroundColor: role.accent + '14', borderColor: role.accent + '33' }]}>
          <Icon name="warning" size={13} color={role.accent} />
          <Text style={[styles.noteText, { color: role.accentDark }]}>{role.note}</Text>
        </View>
      ) : null}

      <View style={styles.fields}>
        <IdentifierField
          label="EMAIL, PHONE, OR USERNAME"
          accent={role.accent}
          value={identifier}
          onChangeText={onIdentifier}
          onBlur={() => { if (identifier.trim()) setFieldError(validateLoginIdentifier(identifier)); }}
          placeholder={role.placeholder}
          error={fieldError}
        />
        <PasswordField
          label="PASSWORD"
          accent={role.accentDark}
          value={password}
          onChangeText={onPassword}
          placeholder="••••••••••"
          error={pwError}
        />
      </View>

      <TouchableOpacity style={styles.forgotWrap} onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={[styles.forgot, { color: role.accentDark }]}>Forgot password?</Text>
      </TouchableOpacity>

      <FormBanner message={formError} tone={cooldown > 0 ? 'info' : 'danger'} />

      {/* Role-themed animated CTA */}
      <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
        <TouchableOpacity
          activeOpacity={0.9}
          disabled={disabled}
          onPressIn={() => Animated.spring(ctaScale, { toValue: 0.97, useNativeDriver: true, friction: 8, tension: 120 }).start()}
          onPressOut={() => Animated.spring(ctaScale, { toValue: 1, useNativeDriver: true, friction: 6, tension: 120 }).start()}
          onPress={handleSubmit}
          style={[styles.cta, disabled && styles.ctaDisabled, { shadowColor: role.accent }]}
        >
          <LinearGradient colors={[role.accent, role.accentDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
          {submitting ? (
            <ActivityIndicator color={role.onAccent} size="small" />
          ) : (
            <Text style={[styles.ctaText, { color: role.onAccent }]}>
              {cooldown > 0 ? `Try again in ${cooldown}s` : `Sign In as ${role.label} →`}
            </Text>
          )}
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.divider}>
        <View style={styles.divLine} />
        <Text style={styles.divText}>or</Text>
        <View style={styles.divLine} />
      </View>

      <Button
        label="Sign in with Phone OTP"
        variant="outline"
        icon={<Icon name="phone" size={16} color={role.accentDark} />}
        onPress={() => navigation.navigate('PhoneLogin')}
      />

      <View style={styles.signupRow}>
        <Text style={styles.signupText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={[styles.signupLink, { color: role.accentDark }]}>Sign up free</Text>
        </TouchableOpacity>
      </View>
    </AuthScaffold>
  );
};

const styles = StyleSheet.create({
  selectorLabel: { fontSize: 11, color: Colors.text3, fontWeight: '700', letterSpacing: 0.6, marginBottom: 8 },
  track: { flexDirection: 'row', backgroundColor: Colors.bg2, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border2, padding: 4, marginBottom: 18 },
  pill: { position: 'absolute', top: 4, bottom: 4, left: 4, borderRadius: Radius.md, shadowColor: '#2A0E13', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.18, shadowRadius: 6, elevation: 3 },
  segment: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 11 },
  segmentLabel: { fontSize: 11.5, letterSpacing: -0.1 },

  noteBox: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: 12, paddingVertical: 9, marginBottom: 16 },
  noteText: { fontSize: 11.5, fontWeight: '600', flex: 1, lineHeight: 16 },

  acctToggle: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  acctSeg: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingVertical: 12, borderRadius: Radius.md, backgroundColor: Colors.bg2, borderWidth: 1, borderColor: Colors.border2 },
  acctSegActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  acctSegTxt: { fontSize: 12.5, fontWeight: '700', color: Colors.text3 },
  acctSegTxtActive: { color: Colors.brand },
  schoolDot: { width: 16, height: 16, borderRadius: 8 },
  schoolPreview: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, marginBottom: 16, marginLeft: 2 },
  schoolPreviewTxt: { fontSize: 11.5, color: Colors.success, fontWeight: '600', flex: 1 },

  // School dropdown
  fieldLabel: { fontSize: 11, color: Colors.text3, fontWeight: '700', letterSpacing: 0.6, marginBottom: 6 },
  dropdown: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.bg, borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: 14, minHeight: 56 },
  dropdownError: { borderColor: Colors.danger, backgroundColor: Colors.dangerLight },
  dropdownValue: { flex: 1, fontSize: 15, color: Colors.text, fontWeight: '700' },
  dropdownPlaceholder: { flex: 1, fontSize: 14, color: Colors.text3 },
  dropdownChevron: { fontSize: 14, color: Colors.text3 },
  fieldErr: { fontSize: 11.5, color: Colors.danger, fontWeight: '600', marginTop: 6, marginLeft: 2 },

  // School picker modal
  pickerBackdrop: { flex: 1, backgroundColor: 'rgba(20,6,9,0.55)', justifyContent: 'center', padding: 28 },
  pickerSheet: { backgroundColor: Colors.white, borderRadius: 22, padding: 16, gap: 8 },
  pickerTitle: { fontSize: 15, fontWeight: '800', color: Colors.text, marginBottom: 6, marginLeft: 2 },
  pickerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 12, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border2, backgroundColor: Colors.bg },
  pickerRowActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  pickerDot: { width: 18, height: 18, borderRadius: 9 },
  pickerName: { fontSize: 14, fontWeight: '800', color: Colors.text },
  pickerCode: { fontSize: 11, color: Colors.text2, marginTop: 1 },

  fields: { marginTop: 2 },
  forgotWrap: { alignSelf: 'flex-end', marginBottom: 14, marginTop: 2 },
  forgot: { fontSize: 11.5, fontWeight: '700' },
  formError: { fontSize: 12, color: Colors.danger, marginBottom: 12, fontWeight: '600' },

  cta: { height: 54, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 20, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 5 },
  ctaDisabled: { opacity: 0.5 },
  ctaText: { fontSize: 15, fontWeight: '800', letterSpacing: 0.2 },

  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  divLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  divText: { fontSize: 11, color: Colors.text3 },
  signupRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 22 },
  signupText: { fontSize: 12, color: Colors.text2 },
  signupLink: { fontSize: 12, fontWeight: '700' },
});
