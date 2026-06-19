import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { OtpInput, OtpInputRef } from 'react-native-otp-entry';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { Colors, Radius } from '../../theme';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { AuthScaffold } from '../../components/common/AuthScaffold';
import { Entrance } from '../../components/common/anim';
import { useAuth } from '../../context/AuthContext';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { ApiError } from '../../api';
import { Env } from '../../config/env';

type Props = NativeStackScreenProps<AuthStackParamList, 'OTP'>;

const OTP_LENGTH = 6;
const OTP_TTL = 10 * 60;

export const OTPScreen: React.FC<Props> = ({ navigation, route }) => {
  const { phone, devOtp } = route.params;
  const { otpVerify, otpSend } = useAuth();
  const { submitting, run } = useAsyncAction();

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [hintOtp, setHintOtp] = useState<string | undefined>(devOtp);
  const [round, setRound] = useState(0);
  const [canResend, setCanResend] = useState(false);

  const otpRef = useRef<OtpInputRef>(null);
  const verifiedRef = useRef(false);
  const shakeX = useRef(new Animated.Value(0)).current;

  const triggerShake = useCallback(() => {
    Animated.sequence(
      [9, -9, 7, -7, 0].map(v => Animated.timing(shakeX, { toValue: v, duration: 50, useNativeDriver: true })),
    ).start();
  }, [shakeX]);

  useEffect(() => {
    setCanResend(false);
    const id = setTimeout(() => setCanResend(true), 30_000);
    return () => clearTimeout(id);
  }, [round]);

  const handleExpire = useCallback(() => setExpired(true), []);

  const submit = async (value: string) => {
    if (verifiedRef.current || submitting || value.length < OTP_LENGTH) return;
    setError(null);
    await run(async () => {
      try {
        verifiedRef.current = true;
        await otpVerify({ phone, otp: value });
      } catch (err) {
        verifiedRef.current = false;
        if (err instanceof ApiError) {
          if (err.code === 'otp_expired') {
            setExpired(true);
            setError('This code has expired. Request a new one.');
          } else if (err.code === 'otp_invalid' || err.kind === 'validation') {
            setError('Wrong code. Please check and try again.');
            triggerShake();
            otpRef.current?.clear();
            setCode('');
            otpRef.current?.focus();
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
      otpRef.current?.clear();
      setCode('');
      setExpired(false);
      setRound(r => r + 1);
      setHintOtp(result.otp);
      otpRef.current?.focus();
    }
  };

  return (
    <AuthScaffold
      title="Verify your number"
      subtitle={
        <Text>
          Enter the {OTP_LENGTH}-digit code sent to <Text style={styles.phone}>{phone}</Text>
        </Text>
      }
      badge="lock"
      onBack={() => navigation.goBack()}
    >
      {Env.isLocal && hintOtp ? (
        <Entrance index={1} style={styles.devBanner}>
          <Text style={styles.devBannerText}>DEV ONLY · Your OTP is {hintOtp}</Text>
        </Entrance>
      ) : null}

      <Entrance index={2}>
        <Animated.View style={{ transform: [{ translateX: shakeX }], marginBottom: 14 }}>
          <OtpInput
            ref={otpRef}
            numberOfDigits={OTP_LENGTH}
            type="numeric"
            autoFocus
            focusColor={error ? Colors.danger : Colors.primary}
            onTextChange={t => {
              setCode(t);
              if (error) setError(null);
            }}
            onFilled={submit}
            disabled={submitting}
            theme={{
              containerStyle: styles.otpContainer,
              pinCodeContainerStyle: { ...styles.pinBox, ...(error ? styles.pinBoxError : {}) },
              focusedPinCodeContainerStyle: styles.pinBoxFocused,
              filledPinCodeContainerStyle: error ? styles.pinBoxError : styles.pinBoxFilled,
              pinCodeTextStyle: styles.pinText,
              focusStickStyle: styles.stick,
            }}
          />
        </Animated.View>
      </Entrance>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Entrance index={3} style={styles.timerRow}>
        <Countdown round={round} expired={expired} onExpire={handleExpire} />
        <TouchableOpacity onPress={resend} disabled={submitting || (!canResend && !expired)}>
          <Text style={[styles.resend, (submitting || (!canResend && !expired)) && styles.resendDisabled]}>Resend</Text>
        </TouchableOpacity>
      </Entrance>

      <Entrance index={4}>
        <Button
          label={submitting ? 'Verifying…' : 'Verify & Continue →'}
          variant="primary"
          onPress={() => submit(code)}
          loading={submitting}
          disabled={submitting || code.length < OTP_LENGTH}
          style={styles.verifyBtn}
        />
      </Entrance>

      <Entrance index={5} style={styles.security}>
        <Icon name="lock" size={14} color={Colors.text2} />
        <Text style={styles.securityTxt}>
          Secured by <Text style={{ fontWeight: '700', color: Colors.text }}>Bodhira LMS</Text> · code valid for 10 minutes
        </Text>
      </Entrance>
    </AuthScaffold>
  );
};

const Countdown: React.FC<{ round: number; expired: boolean; onExpire: () => void }> = ({ round, expired, onExpire }) => {
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

  if (expired || seconds <= 0) return <Text style={styles.expiredTxt}>Code expired</Text>;
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return (
    <Text style={styles.expireTxt}>
      Expires in <Text style={styles.timerVal}>{`${mm}:${ss}`}</Text>
    </Text>
  );
};

const styles = StyleSheet.create({
  phone: { fontWeight: '800', color: '#F5E8D0' },
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

  otpContainer: { justifyContent: 'space-between' },
  pinBox: {
    width: 44,
    height: 58,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.bg,
  },
  pinBoxFocused: {
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  pinBoxFilled: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  pinBoxError: { borderColor: Colors.danger, backgroundColor: Colors.dangerLight },
  pinText: { fontSize: 24, fontWeight: '800', color: Colors.text },
  stick: { backgroundColor: Colors.primary, width: 2, height: 26 },

  error: { fontSize: 12, color: Colors.danger, fontWeight: '600', marginBottom: 10 },
  timerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  expireTxt: { fontSize: 12, color: Colors.text2 },
  expiredTxt: { fontSize: 12, color: Colors.danger, fontWeight: '700' },
  timerVal: { fontWeight: '800', color: Colors.primaryDark },
  resend: { fontSize: 12, fontWeight: '700', color: Colors.primaryDark },
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
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border2,
    borderRadius: 10,
    padding: 12,
    marginTop: 18,
  },
  securityTxt: { fontSize: 10.5, color: Colors.text2, flex: 1, lineHeight: 15 },
});
