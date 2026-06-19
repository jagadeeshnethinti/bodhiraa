import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { Colors, Radius } from '../../theme';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { AuthScaffold } from '../../components/common/AuthScaffold';
import { EmailField } from '../../components/common/AuthField';
import { Entrance } from '../../components/common/anim';
import { AuthApi, ApiError } from '../../api';
import { useAsyncAction } from '../../hooks/useAsyncAction';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { submitting, run } = useAsyncAction();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  const startCooldown = (seconds: number) => {
    setCooldown(seconds);
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1 && timer.current) {
          clearInterval(timer.current);
          timer.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const send = async () => {
    setError(null);
    if (!isEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    const result = await run(async () => {
      try {
        return await AuthApi.forgotPassword(email.trim());
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.kind === 'rate_limited' ? 'Please wait a moment before trying again.' : err.message);
        } else {
          setError('Could not send the reset link. Check your connection.');
        }
        throw err;
      }
    });
    if (result) {
      setSent(true);
      startCooldown(30);
    }
  };

  // ── Success state ───────────────────────────────────────────────────────────
  if (sent) {
    return (
      <AuthScaffold
        title="Check your inbox"
        subtitle={
          <Text>
            We've sent a password reset link to{'\n'}
            <Text style={styles.emailHi}>{email.trim()}</Text>
          </Text>
        }
        badge="checkmark"
        accent={Colors.success}
        onBack={() => navigation.goBack()}
      >
        <Entrance index={1} style={styles.infoCard}>
          <Icon name="bell" size={16} color={Colors.success} />
          <Text style={styles.infoTxt}>
            Open the email and tap the link to set a new password. The link expires in 30 minutes.
          </Text>
        </Entrance>

        <Entrance index={2}>
          <Button label="Back to sign in" variant="primary" onPress={() => navigation.navigate('Login')} style={styles.btn} />
        </Entrance>

        <Entrance index={3} style={styles.resendRow}>
          <Text style={styles.resendText}>Didn't get the email? </Text>
          <TouchableOpacity disabled={cooldown > 0 || submitting} onPress={send}>
            <Text style={[styles.resendLink, (cooldown > 0 || submitting) && styles.resendDisabled]}>
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend link'}
            </Text>
          </TouchableOpacity>
        </Entrance>
      </AuthScaffold>
    );
  }

  // ── Request state ───────────────────────────────────────────────────────────
  return (
    <AuthScaffold
      title="Forgot password?"
      subtitle="No worries — enter your email and we'll send you a link to reset it."
      badge="lock"
      onBack={() => navigation.goBack()}
    >
      <Entrance index={1}>
        <EmailField
          label="EMAIL ADDRESS"
          value={email}
          onChangeText={t => {
            setEmail(t);
            if (error) setError(null);
          }}
          placeholder="you@email.com"
          error={error}
        />
      </Entrance>

      <Entrance index={2}>
        <Button
          label={submitting ? 'Sending…' : 'Send reset link →'}
          variant="primary"
          onPress={send}
          loading={submitting}
          disabled={submitting || !email.trim()}
          style={styles.btn}
        />
      </Entrance>

      <Entrance index={3} style={styles.backRow}>
        <Text style={styles.backText}>Remembered it? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.backLink}>Back to sign in</Text>
        </TouchableOpacity>
      </Entrance>
    </AuthScaffold>
  );
};

const styles = StyleSheet.create({
  emailHi: { fontWeight: '800', color: '#F5E8D0' },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Colors.successLight,
    borderWidth: 1,
    borderColor: 'rgba(26,122,72,0.25)',
    borderRadius: Radius.md,
    padding: 14,
    marginBottom: 20,
  },
  infoTxt: { flex: 1, fontSize: 12.5, color: Colors.text, lineHeight: 18 },
  btn: {
    marginTop: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 4,
  },
  resendRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  resendText: { fontSize: 12.5, color: Colors.text2 },
  resendLink: { fontSize: 12.5, color: Colors.primaryDark, fontWeight: '800' },
  resendDisabled: { color: Colors.text3 },
  backRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 22 },
  backText: { fontSize: 12.5, color: Colors.text2 },
  backLink: { fontSize: 12.5, color: Colors.primaryDark, fontWeight: '800' },
});
