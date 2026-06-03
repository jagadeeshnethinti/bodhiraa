import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { Colors, Radius } from '../../theme';
import { Button } from '../../components/common/Button';

type Props = NativeStackScreenProps<AuthStackParamList, 'OTP'>;

export const OTPScreen: React.FC<Props> = ({ navigation, route }) => {
  const { phone } = route.params;
  const [otp, setOtp]     = useState(['', '', '', '']);
  const [timer, setTimer] = useState(165);

  const r0 = useRef<TextInput>(null);
  const r1 = useRef<TextInput>(null);
  const r2 = useRef<TextInput>(null);
  const r3 = useRef<TextInput>(null);
  const refs = [r0, r1, r2, r3];

  useEffect(() => {
    const id = setInterval(() => setTimer(t => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleDigit = (text: string, i: number) => {
    const d = text.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[i] = d;
    setOtp(next);
    if (d && i < 3) refs[i + 1].current?.focus();
  };

  const handleKey = (key: string, i: number) => {
    if (key === 'Backspace' && !otp[i] && i > 0) refs[i - 1].current?.focus();
  };

  const filled = otp.filter(Boolean).length;
  const timerPct = (timer / 165) * 100;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      {/* Topbar */}
      <View style={styles.topbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Verify Account</Text>
        <View style={{ width: 34 }} />
      </View>

      {/* Step progress */}
      <View style={styles.steps}>
        <View style={styles.stepBars}>
          {[1, 2, 3, 4].map(i => (
            <View key={i} style={[styles.stepBar, i <= 3 ? styles.stepOn : styles.stepOff]} />
          ))}
        </View>
        <View style={styles.stepLabels}>
          <Text style={styles.stepLeft}>STEP 3 OF 4</Text>
          <Text style={styles.stepRight}>PHONE VERIFICATION</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.body}>
        <Text style={styles.heading}>Enter OTP</Text>
        <Text style={styles.sub}>A 4-digit code was sent to your mobile number</Text>

        {/* Phone row */}
        <View style={styles.phoneRow}>
          <View style={styles.phoneLeft}>
            <View style={styles.phoneIcon}><Text style={{ fontSize: 18 }}>📱</Text></View>
            <View>
              <Text style={styles.sentLabel}>SENT TO</Text>
              <Text style={styles.phoneNum}>+91 {phone || '98765 43210'}</Text>
            </View>
          </View>
          <TouchableOpacity>
            <Text style={styles.editBtn}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* OTP Boxes */}
        <View style={styles.otpRow}>
          {[0, 1, 2, 3].map(i => {
            const isFilled  = !!otp[i];
            const isActive  = otp.filter(Boolean).length === i;
            return (
              <View key={i} style={[styles.box, isFilled && styles.boxFilled, isActive && styles.boxActive]}>
                <TextInput
                  ref={refs[i]}
                  style={styles.boxInput}
                  value={otp[i]}
                  onChangeText={t => handleDigit(t, i)}
                  onKeyPress={({ nativeEvent }) => handleKey(nativeEvent.key, i)}
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                />
                {isActive && !otp[i] && <View style={styles.cursor} pointerEvents="none" />}
              </View>
            );
          })}
        </View>

        {/* Timer */}
        <View style={styles.timerRow}>
          <View style={styles.timerCircle}>
            {/* Progress ring approximation */}
            <View style={[styles.timerRing, { borderColor: Colors.primary, opacity: timerPct / 100 }]} />
            <Text style={styles.timerTxt}>{fmt(timer)}</Text>
          </View>
          <View>
            <Text style={styles.expireTxt}>
              OTP expires in <Text style={{ color: Colors.primary }}>{fmt(timer)}</Text>
            </Text>
            <Text style={styles.resendTxt}>
              Didn't receive it? <Text style={{ color: Colors.primary, fontWeight: '700' }}>Resend</Text>
            </Text>
          </View>
        </View>

        {/* Security badge */}
        <View style={styles.security}>
          <Text style={{ fontSize: 14 }}>🔒</Text>
          <Text style={styles.securityTxt}>
            Secured by <Text style={{ fontWeight: '700', color: Colors.text }}>Bodhira LMS</Text> · OTP valid for 10 minutes only
          </Text>
        </View>
      </View>

      {/* CTA pinned to bottom */}
      <View style={styles.cta}>
        <Button
          label="Verify & Continue →"
          variant="primary"
          onPress={() => navigation.navigate('RoleSelection')}
          disabled={filled < 4}
          style={styles.verifyBtn}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FEFAF6' },
  topbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
  },
  backBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#2A0E13', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 1,
  },
  backIcon:  { fontSize: 24, color: Colors.text, lineHeight: 28 },
  topTitle:  { fontSize: 14, fontWeight: '800', color: Colors.text },
  steps:     { paddingHorizontal: 20, paddingBottom: 20 },
  stepBars:  { flexDirection: 'row', gap: 4 },
  stepBar:   { flex: 1, height: 3, borderRadius: 2 },
  stepOn:    { backgroundColor: Colors.primary },
  stepOff:   { backgroundColor: Colors.border },
  stepLabels:{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  stepLeft:  { fontSize: 9, fontWeight: '700', color: Colors.primary },
  stepRight: { fontSize: 9, fontWeight: '600', color: Colors.text3 },
  body:      { flex: 1, paddingHorizontal: 22 },
  heading:   { fontSize: 22, fontWeight: '900', color: Colors.text, letterSpacing: -0.44, marginBottom: 6 },
  sub:       { fontSize: 12, color: Colors.text2, lineHeight: 19, marginBottom: 22 },
  phoneRow: {
    backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.md, paddingVertical: 11, paddingHorizontal: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 32, shadowColor: '#2A0E13',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  phoneLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  phoneIcon: {
    width: 34, height: 34, borderRadius: 9,
    backgroundColor: Colors.brand, alignItems: 'center', justifyContent: 'center',
  },
  sentLabel: { fontSize: 10, fontWeight: '700', color: Colors.text3, letterSpacing: 0.4, marginBottom: 2 },
  phoneNum:  { fontSize: 13, fontWeight: '800', color: Colors.text },
  editBtn:   { fontSize: 11, fontWeight: '700', color: Colors.primary, textDecorationLine: 'underline' },
  otpRow:    { flexDirection: 'row', gap: 12, justifyContent: 'center', marginBottom: 28 },
  box: {
    width: 64, height: 72,
    backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center',
  },
  boxFilled: {
    borderColor: Colors.primary,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.18, shadowRadius: 8, elevation: 2,
  },
  boxActive: { borderWidth: 2, borderColor: Colors.primary },
  boxInput: {
    position: 'absolute', width: '100%', height: '100%',
    fontSize: 24, fontWeight: '800', color: Colors.text, textAlign: 'center',
    backgroundColor: 'transparent',
  },
  cursor: {
    width: 2, height: 26, backgroundColor: Colors.primary,
    borderRadius: 1, opacity: 0.85,
  },
  timerRow:   { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 18 },
  timerCircle:{
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
    backgroundColor: 'rgba(196,149,96,0.08)',
  },
  timerRing: {
    position: 'absolute', width: 44, height: 44, borderRadius: 22,
    borderWidth: 2.5, borderColor: Colors.primary,
  },
  timerTxt:   { fontSize: 10, fontWeight: '800', color: Colors.primaryDark },
  expireTxt:  { fontSize: 12, fontWeight: '700', color: Colors.text },
  resendTxt:  { fontSize: 10, color: Colors.text3, marginTop: 2 },
  security: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 10, padding: 10, paddingHorizontal: 12,
  },
  securityTxt: { fontSize: 10, color: Colors.text2, flex: 1, lineHeight: 15 },
  cta: {
    padding: 16, paddingHorizontal: 18,
    backgroundColor: '#FEFAF6', borderTopWidth: 1, borderTopColor: '#F3E9D8',
  },
  verifyBtn: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 4,
  },
});
