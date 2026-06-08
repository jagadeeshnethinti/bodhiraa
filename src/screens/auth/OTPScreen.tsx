import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, StatusBar, ScrollView } from 'react-native';
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

type Props = NativeStackScreenProps<AuthStackParamList, 'OTP'>;

const OTP_LENGTH = 6;
const OTP_TTL = 10 * 60; // valid for 10 minutes (api.md §3.3)

export const OTPScreen: React.FC<Props> = ({ navigation, route }) => {
  const { phone, devOtp } = route.params;
  const { otpVerify, otpSend } = useAuth();
  const { submitting, run } = useAsyncAction();

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [shake, setShake] = useState(false);
  const [hintOtp, setHintOtp] = useState<string | undefined>(devOtp);
  // `round` bumps on each (re)send to restart the countdown + resend cooldown.
  const [round, setRound] = useState(0);
  const [canResend, setCanResend] = useState(false);

  const inputs = useRef<Array<TextInput | null>>([]);
  const verifiedRef = useRef(false);

  // Enable "Resend" after a 30s cooldown. This is a one-shot timeout — NOT a
  // per-second tick — so it doesn't re-render the screen (and the per-second
  // countdown lives in its own <Countdown> child below). That keeps the code
  // boxes from re-rendering every second, which is what was stealing focus.
  useEffect(() => {
    setCanResend(false);
    const id = setTimeout(() => setCanResend(true), 30_000);
    return () => clearTimeout(id);
  }, [round]);

  const handleExpire = useCallback(() => setExpired(true), []);

  const code = digits.join('');

  const submit = async (value: string) => {
    if (verifiedRef.current || submitting) return;
    setError(null);
    await run(async () => {
      try {
        verifiedRef.current = true;
        await otpVerify({ phone, otp: value });
        // success → root navigator swaps to the role stack automatically.
      } catch (err) {
        verifiedRef.current = false;
        if (err instanceof ApiError) {
          if (err.code === 'otp_expired') {
            setExpired(true);
            setError('This code has expired. Request a new one.');
          } else if (err.code === 'otp_invalid' || err.kind === 'validation') {
            setError('Wrong code. Please check and try again.');
            setShake(true);
            setTimeout(() => setShake(false), 400);
          } else {
            setError(err.message);
          }
        } else {
          setError('Could not verify the code. Try again.');
        }
        throw err;
      }
    });
  };

  const handleDigit = (text: string, index: number) => {
    const clean = text.replace(/\D/g, '');
    if (error) setError(null);

    // Support paste of the full code into any box.
    if (clean.length > 1) {
      const next = clean.slice(0, OTP_LENGTH).split('');
      const padded = Array(OTP_LENGTH)
        .fill('')
        .map((_, i) => next[i] ?? '');
      setDigits(padded);
      const lastFilled = Math.min(next.length, OTP_LENGTH) - 1;
      inputs.current[lastFilled]?.focus();
      if (next.length >= OTP_LENGTH) submit(padded.join(''));
      return;
    }

    const d = clean.slice(-1);
    const updated = [...digits];
    updated[index] = d;
    setDigits(updated);
    if (d && index < OTP_LENGTH - 1) inputs.current[index + 1]?.focus();

    const joined = updated.join('');
    if (joined.length === OTP_LENGTH && !joined.includes('')) submit(joined);
  };

  const handleKey = (key: string, index: number) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const resend = async () => {
    setError(null);
    const result = await run(async () => {
      try {
        return await otpSend(phone);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.kind === 'rate_limited' ? 'Please wait a minute before requesting again.' : err.message);
        }
        throw err;
      }
    });
    if (result) {
      setDigits(Array(OTP_LENGTH).fill(''));
      setExpired(false);
      setRound(r => r + 1);
      setHintOtp(result.otp);
      inputs.current[0]?.focus();
    }
  };

  const filled = useMemo(() => digits.filter(Boolean).length, [digits]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      <View style={styles.topbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Verify Phone</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView
        style={styles.flexOne}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
      >
        <Text style={styles.heading}>Enter the code</Text>
        <Text style={styles.sub}>
          A {OTP_LENGTH}-digit code was sent to <Text style={styles.phone}>{phone}</Text>
        </Text>

        {/* DEV-only echoed OTP (api.md §3.3 — local env only) */}
        {Env.isLocal && hintOtp ? (
          <View style={styles.devBanner}>
            <Text style={styles.devBannerText}>DEV ONLY · Your OTP is {hintOtp}</Text>
          </View>
        ) : null}

        <View style={[styles.otpRow, shake && styles.otpRowShake]}>
          {Array.from({ length: OTP_LENGTH }).map((_, i) => {
            const isFilled = !!digits[i];
            const isActive = filled === i;
            return (
              <View
                key={i}
                style={[styles.box, isFilled && styles.boxFilled, isActive && styles.boxActive, !!error && styles.boxError]}
              >
                <TextInput
                  ref={el => {
                    inputs.current[i] = el;
                  }}
                  style={styles.boxInput}
                  value={digits[i]}
                  onChangeText={t => handleDigit(t, i)}
                  onKeyPress={({ nativeEvent }) => handleKey(nativeEvent.key, i)}
                  keyboardType="number-pad"
                  maxLength={OTP_LENGTH}
                  textAlign="center"
                  autoFocus={i === 0}
                  editable={!submitting}
                />
              </View>
            );
          })}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.timerRow}>
          <Countdown round={round} expired={expired} onExpire={handleExpire} />
          <TouchableOpacity onPress={resend} disabled={submitting || (!canResend && !expired)}>
            <Text
              style={[
                styles.resend,
                (submitting || (!canResend && !expired)) && styles.resendDisabled,
              ]}
            >
              Resend
            </Text>
          </TouchableOpacity>
        </View>

        <Button
          label={submitting ? 'Verifying…' : 'Verify & Continue →'}
          variant="primary"
          onPress={() => submit(code)}
          loading={submitting}
          disabled={submitting || filled < OTP_LENGTH}
          style={styles.verifyBtn}
        />

        <View style={styles.security}>
          <Icon name="lock" size={14} color={Colors.text2} />
          <Text style={styles.securityTxt}>
            Secured by <Text style={{ fontWeight: '700', color: Colors.text }}>Bodhira LMS</Text> · code
            valid for 10 minutes
          </Text>
        </View>
        </ScrollView>
    </SafeAreaView>
  );
};

/**
 * Owns the per-second tick in its OWN component so the parent OTPScreen (and the
 * 6 code boxes) don't re-render every second. Restarts whenever `round` changes
 * (i.e. after a resend). `expired` forces the expired label for a server-side
 * `otp_expired` before the local countdown reaches zero.
 */
const Countdown: React.FC<{ round: number; expired: boolean; onExpire: () => void }> = ({
  round,
  expired,
  onExpire,
}) => {
  const [seconds, setSeconds] = useState(OTP_TTL);
  useEffect(() => {
    setSeconds(OTP_TTL);
    const id = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          clearInterval(id);
          onExpire();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [round, onExpire]);

  if (expired || seconds <= 0) {
    return <Text style={styles.expiredTxt}>Code expired</Text>;
  }
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return (
    <Text style={styles.expireTxt}>
      Expires in <Text style={styles.timerVal}>{`${mm}:${ss}`}</Text>
    </Text>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
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
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 24, color: Colors.text },
  topTitle: { fontSize: 15, fontWeight: '800', color: Colors.text },
  flexOne: { flex: 1 },
  body: { flexGrow: 1, paddingHorizontal: 22, paddingTop: 24, paddingBottom: 28 },
  heading: { fontSize: 22, fontWeight: '900', color: Colors.text, letterSpacing: -0.44, marginBottom: 6 },
  sub: { fontSize: 13, color: Colors.text2, lineHeight: 19, marginBottom: 18 },
  phone: { fontWeight: '800', color: Colors.text },
  devBanner: {
    backgroundColor: Colors.warningLight,
    borderWidth: 1,
    borderColor: Colors.warning,
    borderRadius: Radius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 18,
  },
  devBannerText: { fontSize: 12, fontWeight: '800', color: Colors.warning, textAlign: 'center', letterSpacing: 0.5 },
  otpRow: { flexDirection: 'row', gap: 8, justifyContent: 'space-between', marginBottom: 14 },
  otpRowShake: { transform: [{ translateX: 2 }] },
  box: {
    flex: 1,
    height: 60,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFilled: { borderColor: Colors.primary },
  boxActive: { borderWidth: 2, borderColor: Colors.primary },
  boxError: { borderColor: Colors.danger },
  boxInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
  },
  error: { fontSize: 12, color: Colors.danger, fontWeight: '600', marginBottom: 10 },
  timerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  expireTxt: { fontSize: 12, color: Colors.text2 },
  expiredTxt: { fontSize: 12, color: Colors.danger, fontWeight: '700' },
  timerVal: { fontWeight: '800', color: Colors.primary },
  resend: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  resendDisabled: { color: Colors.text3 },
  verifyBtn: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 4,
  },
  security: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 10,
    paddingHorizontal: 12,
    marginTop: 18,
  },
  securityTxt: { fontSize: 10, color: Colors.text2, flex: 1, lineHeight: 15 },
});
