import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { Colors } from '../../theme';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { AuthScaffold } from '../../components/common/AuthScaffold';
import { NameField, EmailField, PhoneField, NumberField, PasswordField } from '../../components/common/AuthField';
import { FormBanner } from '../../components/common/FormBanner';
import { Entrance, PressableScale } from '../../components/common/anim';
import { useAuth } from '../../context/AuthContext';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { ApiError } from '../../api';
import { validateName, validateEmail, validatePhone, validatePassword, validateConfirm, validateGrade } from '../../utils/validation';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

type FieldErrors = Partial<Record<'name' | 'email' | 'phone' | 'password' | 'grade' | 'confirm', string>>;

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

  const [errors, setErrors] = useState<FieldErrors>({});
  const [termsError, setTermsError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColor = ['', Colors.danger, Colors.warning, Colors.success][strength];
  const strengthLabel = ['', 'Weak', 'Medium', 'Strong'][strength];

  const validate = (): boolean => {
    const next: FieldErrors = {};
    const nameErr = validateName(name); if (nameErr) next.name = nameErr;
    const emailErr = validateEmail(email); if (emailErr) next.email = emailErr;
    const phoneErr = validatePhone(phone, { required: false }); if (phoneErr) next.phone = phoneErr;
    const gradeErr = validateGrade(grade); if (gradeErr) next.grade = gradeErr;
    const pwErr = validatePassword(password); if (pwErr) next.password = pwErr;
    const confirmErr = validateConfirm(password, confirm); if (confirmErr) next.confirm = confirmErr;
    setErrors(next);
    setTermsError(agreed ? null : 'Please accept the Terms to continue.');
    return Object.keys(next).length === 0 && agreed;
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

  const clearError = useCallback((field: keyof FieldErrors) => {
    setErrors(prev => (prev[field] ? { ...prev, [field]: undefined } : prev));
  }, []);

  const onName = useCallback((t: string) => { setName(t); clearError('name'); }, [clearError]);
  const onEmail = useCallback((t: string) => { setEmail(t); clearError('email'); }, [clearError]);
  const onPhone = useCallback((t: string) => { setPhone(t); clearError('phone'); }, [clearError]);
  const onGrade = useCallback((t: string) => { setGrade(t); clearError('grade'); }, [clearError]);
  // Editing either password field clears both password + confirm errors.
  const onPassword = useCallback((t: string) => {
    setPassword(t);
    setErrors(prev => (prev.password || prev.confirm ? { ...prev, password: undefined, confirm: undefined } : prev));
  }, []);
  const onConfirm = useCallback((t: string) => { setConfirm(t); clearError('confirm'); }, [clearError]);
  const toggleAgreed = useCallback(() => { setAgreed(a => !a); setTermsError(null); }, []);

  return (
    <AuthScaffold
      title="Create account"
      subtitle="Start your free trial — learn smarter with AI."
      badge="rocket"
      onBack={() => navigation.goBack()}
    >
      <Entrance index={1}>
        <NameField label="FULL NAME" value={name} onChangeText={onName} placeholder="Arjun Sharma" error={errors.name} />
      </Entrance>
      <Entrance index={2}>
        <EmailField
          label="EMAIL ADDRESS"
          value={email}
          onChangeText={onEmail}
          onBlur={() => { if (email.trim()) setErrors(prev => ({ ...prev, email: validateEmail(email) ?? undefined })); }}
          placeholder="arjun@gmail.com"
          error={errors.email}
        />
      </Entrance>
      <Entrance index={3}>
        <PhoneField
          label="MOBILE NUMBER (OPTIONAL)"
          value={phone}
          onChangeText={onPhone}
          placeholder="98765 43210"
          error={errors.phone}
        />
      </Entrance>
      <Entrance index={4}>
        <NumberField label="CLASS / GRADE" value={grade} onChangeText={onGrade} placeholder="e.g. 9" maxLength={2} error={errors.grade} />
      </Entrance>
      <Entrance index={5}>
        <PasswordField label="SET PASSWORD" value={password} onChangeText={onPassword} placeholder="••••••••••" newPassword error={errors.password} />
      </Entrance>
      <Entrance index={6}>
        <PasswordField
          label="CONFIRM PASSWORD"
          value={confirm}
          onChangeText={onConfirm}
          placeholder="••••••••••"
          newPassword
          error={errors.confirm}
        />
      </Entrance>

      {password.length > 0 && (
        <View style={styles.strengthWrap}>
          <View style={styles.strengthBars}>
            {[1, 2, 3, 4].map(i => (
              <View key={i} style={[styles.strengthBar, { backgroundColor: i <= strength ? strengthColor : Colors.border }]} />
            ))}
          </View>
          <Text style={styles.strengthTxt}>
            Strength: <Text style={{ color: strengthColor, fontWeight: '700' }}>{strengthLabel}</Text>
          </Text>
        </View>
      )}

      <View style={styles.termsRow}>
        <PressableScale onPress={toggleAgreed} style={[styles.checkbox, agreed && styles.checkboxOn, !!termsError && styles.checkboxError]}>
          {agreed && <Icon name="checkmark" size={11} color={Colors.brand} />}
        </PressableScale>
        <Text style={styles.termsText}>
          I agree to the <Text style={styles.link}>Terms of Service</Text> and <Text style={styles.link}>Privacy Policy</Text>
        </Text>
      </View>
      {termsError ? <Text style={styles.termsErr}>{termsError}</Text> : null}

      <FormBanner message={formError} />

      <Button
        label={submitting ? 'Creating…' : 'Create Account →'}
        variant="primary"
        onPress={handleRegister}
        loading={submitting}
        disabled={submitting}
        style={styles.createBtn}
      />

      <View style={styles.loginRow}>
        <Text style={styles.loginText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </AuthScaffold>
  );
};

const styles = StyleSheet.create({
  strengthWrap: { marginBottom: 14, marginTop: 2 },
  strengthBars: { flexDirection: 'row', gap: 4, marginBottom: 5 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2 },
  strengthTxt: { fontSize: 10, color: Colors.text3 },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 18, marginTop: 4 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    backgroundColor: Colors.white,
  },
  checkboxOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkboxError: { borderColor: Colors.danger },
  termsText: { fontSize: 11.5, color: Colors.text2, lineHeight: 17, flex: 1 },
  link: { color: Colors.primaryDark, fontWeight: '700' },
  termsErr: { fontSize: 11.5, color: Colors.danger, fontWeight: '600', marginTop: -10, marginBottom: 12, marginLeft: 2 },
  formError: { fontSize: 12, color: Colors.danger, fontWeight: '600', marginBottom: 12 },
  createBtn: { marginBottom: 18, marginTop: 2 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginText: { fontSize: 12, color: Colors.text2 },
  loginLink: { fontSize: 12, color: Colors.primaryDark, fontWeight: '700' },
});
