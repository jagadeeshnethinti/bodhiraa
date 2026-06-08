import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { Colors, Radius } from '../../theme';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { useAuth } from '../../context/AuthContext';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { ApiError } from '../../api';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

type FieldErrors = Partial<Record<'name' | 'email' | 'phone' | 'password' | 'grade', string>>;

export const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const { register } = useAuth();
  const { submitting, run } = useAsyncAction();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [grade, setGrade] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColor = ['', Colors.danger, Colors.warning, Colors.success][strength];
  const strengthLabel = ['', 'Weak', 'Medium', 'Strong'][strength];

  const validate = (): boolean => {
    const next: FieldErrors = {};
    if (!name.trim()) next.name = 'Please enter your name.';
    if (!email.trim()) next.email = 'Please enter your email.';
    if (password.length < 6) next.password = 'Use at least 6 characters.';
    else if (password !== confirm) next.password = 'Passwords do not match.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleRegister = async () => {
    setFormError(null);
    if (!validate()) return;
    await run(async () => {
      try {
        await register({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          password,
          password_confirmation: confirm,
          role: 'student',
          grade: grade.trim() || undefined,
        });
        // success → root navigator routes to the student stack.
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.kind === 'validation' && err.errors) {
            const mapped: FieldErrors = {};
            (['name', 'email', 'phone', 'password', 'grade'] as const).forEach(f => {
              const msg = err.fieldError(f);
              if (msg) mapped[f] = msg;
            });
            setErrors(mapped);
            if (Object.keys(mapped).length === 0) setFormError(err.message);
          } else {
            setFormError(err.message);
          }
        } else {
          setFormError('Could not create your account. Please try again.');
        }
        throw err;
      }
    });
  };

  // Stable so the memoized <Input>s don't get a new callback (and re-render)
  // on every keystroke. Uses a functional update so it needs no deps.
  const clearError = useCallback((field: keyof FieldErrors) => {
    setErrors(prev => (prev[field] ? { ...prev, [field]: undefined } : prev));
  }, []);

  // One stable handler per field — typing in one field re-renders only that field.
  const onName = useCallback((t: string) => { setName(t); clearError('name'); }, [clearError]);
  const onEmail = useCallback((t: string) => { setEmail(t); clearError('email'); }, [clearError]);
  const onPhone = useCallback((t: string) => { setPhone(t); clearError('phone'); }, [clearError]);
  const onGrade = useCallback((t: string) => { setGrade(t); clearError('grade'); }, [clearError]);
  const onPassword = useCallback((t: string) => { setPassword(t); clearError('password'); }, [clearError]);
  const onConfirm = useCallback((t: string) => { setConfirm(t); clearError('password'); }, [clearError]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <View style={styles.topbar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.topTitle}>Create Account</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          automaticallyAdjustKeyboardInsets
        >
            <Text style={styles.sub}>Start your free trial — learn smarter with AI.</Text>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>FULL NAME</Text>
            <View style={[styles.inputBox, focusedField === 'name' && styles.inputBoxFocused, !!errors.name && styles.inputBoxError]}>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={onName}
                placeholder="Arjun Sharma"
                placeholderTextColor={Colors.text3}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            {errors.name ? <Text style={styles.fieldError}>{errors.name}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
            <View style={[styles.inputBox, focusedField === 'email' && styles.inputBoxFocused, !!errors.email && styles.inputBoxError]}>
              <TextInput
                style={styles.textInput}
                value={email}
                onChangeText={onEmail}
                placeholder="arjun@gmail.com"
                placeholderTextColor={Colors.text3}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            {errors.email ? <Text style={styles.fieldError}>{errors.email}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>MOBILE NUMBER (OPTIONAL)</Text>
            <View style={[styles.inputBox, focusedField === 'phone' && styles.inputBoxFocused, !!errors.phone && styles.inputBoxError]}>
              <TextInput
                style={styles.textInput}
                value={phone}
                onChangeText={onPhone}
                placeholder="+91 98765 43210"
                placeholderTextColor={Colors.text3}
                keyboardType="phone-pad"
                autoCapitalize="none"
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            {errors.phone ? <Text style={styles.fieldError}>{errors.phone}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>CLASS / GRADE</Text>
            <View style={[styles.inputBox, focusedField === 'grade' && styles.inputBoxFocused, !!errors.grade && styles.inputBoxError]}>
              <TextInput
                style={styles.textInput}
                value={grade}
                onChangeText={onGrade}
                placeholder="e.g. 9"
                placeholderTextColor={Colors.text3}
                onFocus={() => setFocusedField('grade')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            {errors.grade ? <Text style={styles.fieldError}>{errors.grade}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>SET PASSWORD</Text>
            <View style={[styles.inputBox, focusedField === 'password' && styles.inputBoxFocused]}>
              <TextInput
                style={[styles.textInput, styles.passwordInput]}
                value={password}
                onChangeText={onPassword}
                placeholder="••••••••••"
                placeholderTextColor={Colors.text3}
                secureTextEntry
                autoCapitalize="none"
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>CONFIRM PASSWORD</Text>
            <View style={[styles.inputBox, focusedField === 'confirm' && styles.inputBoxFocused, !!errors.password && styles.inputBoxError]}>
              <TextInput
                style={[styles.textInput, styles.passwordInput]}
                value={confirm}
                onChangeText={onConfirm}
                placeholder="••••••••••"
                placeholderTextColor={Colors.text3}
                secureTextEntry
                autoCapitalize="none"
                onFocus={() => setFocusedField('confirm')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            {errors.password ? <Text style={styles.fieldError}>{errors.password}</Text> : null}
          </View>

          {password.length > 0 && (
            <View style={styles.strengthWrap}>
              <View style={styles.strengthBars}>
                {[1, 2, 3, 4].map(i => (
                  <View
                    key={i}
                    style={[styles.strengthBar, { backgroundColor: i <= strength ? strengthColor : Colors.border }]}
                  />
                ))}
              </View>
              <Text style={styles.strengthTxt}>
                Strength: <Text style={{ color: strengthColor, fontWeight: '700' }}>{strengthLabel}</Text>
              </Text>
            </View>
          )}

          <View style={styles.termsRow}>
            <TouchableOpacity onPress={() => setAgreed(!agreed)} style={[styles.checkbox, agreed && styles.checkboxOn]}>
              {agreed && <Icon name="checkmark" size={11} color={Colors.brand} />}
            </TouchableOpacity>
            <Text style={styles.termsText}>
              I agree to the <Text style={styles.link}>Terms of Service</Text> and{' '}
              <Text style={styles.link}>Privacy Policy</Text>
            </Text>
          </View>

          {formError ? <Text style={styles.formError}>{formError}</Text> : null}

          <Button
            label={submitting ? 'Creating…' : 'Create Account →'}
            variant="primary"
            onPress={handleRegister}
            loading={submitting}
            disabled={submitting || !agreed || !name || !email || !password || !confirm}
            style={styles.createBtn}
          />

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  container: { flex: 1 },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border2,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.bg2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 26, color: Colors.text, lineHeight: 30, fontWeight: '300' },
  topTitle: { fontSize: 16, fontWeight: '800', color: Colors.text },
  scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 },
  sub: { fontSize: 12, color: Colors.text2, marginBottom: 18 },
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
  strengthWrap: { marginBottom: 14, marginTop: 2 },
  strengthBars: { flexDirection: 'row', gap: 4, marginBottom: 5 },
  strengthBar: { flex: 1, height: 3, borderRadius: 2 },
  strengthTxt: { fontSize: 10, color: Colors.text3 },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 18, marginTop: 4 },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
    backgroundColor: Colors.white,
  },
  checkboxOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  termsText: { fontSize: 11, color: Colors.text2, lineHeight: 17, flex: 1 },
  link: { color: Colors.primary, fontWeight: '700' },
  formError: { fontSize: 12, color: Colors.danger, fontWeight: '600', marginBottom: 12 },
  createBtn: { marginBottom: 18 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginText: { fontSize: 11, color: Colors.text2 },
  loginLink: { fontSize: 11, color: Colors.primary, fontWeight: '700' },
});
