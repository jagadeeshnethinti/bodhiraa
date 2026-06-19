import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
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

type Props = NativeStackScreenProps<AuthStackParamList, 'PhoneLogin'>;

export const PhoneLoginScreen: React.FC<Props> = ({ navigation }) => {
  const { otpSend } = useAuth();
  const { submitting, run } = useAsyncAction();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);

  const handleSend = async () => {
    setError(null);
    const trimmed = phone.trim();
    const result = await run(async () => {
      try {
        return await otpSend(trimmed.startsWith('+') ? trimmed : `+91${trimmed}`);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.kind === 'rate_limited' ? 'Too many requests — wait a minute and retry.' : err.message);
        } else {
          setError('Could not send the code. Check your connection.');
        }
        throw err;
      }
    });
    if (result) {
      navigation.navigate('OTP', { phone: result.phone ?? trimmed, devOtp: result.otp });
    }
  };

  const borderColor = error ? Colors.danger : focused ? Colors.primary : Colors.border;

  return (
    <AuthScaffold
      title="Sign in with phone"
      subtitle="We'll text you a 6-digit verification code."
      badge="phone"
      onBack={() => navigation.goBack()}
    >
      <Entrance index={1}>
        <Text style={styles.label}>MOBILE NUMBER</Text>
        <View style={[styles.phoneBox, { borderColor }]}>
          <View style={styles.cc}>
            <Text style={styles.flag}>🇮🇳</Text>
            <Text style={styles.ccTxt}>+91</Text>
          </View>
          <View style={styles.divider} />
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={t => {
              setPhone(t.replace(/[^\d\s-]/g, ''));
              if (error) setError(null);
            }}
            placeholder="98765 43210"
            placeholderTextColor={Colors.text3}
            keyboardType="phone-pad"
            inputMode="tel"
            autoComplete="tel"
            textContentType="telephoneNumber"
            autoCorrect={false}
            spellCheck={false}
            maxLength={12}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </Entrance>

      <Entrance index={2}>
        <Button
          label={submitting ? 'Sending…' : 'Send code →'}
          variant="primary"
          onPress={handleSend}
          loading={submitting}
          disabled={submitting || phone.trim().length < 6}
          style={styles.sendBtn}
        />
      </Entrance>

      <Entrance index={3} style={styles.hintCard}>
        <Icon name="lock" size={15} color={Colors.text3} />
        <Text style={styles.hint}>
          Use the number registered with your account. Standard messaging rates may apply.
        </Text>
      </Entrance>
    </AuthScaffold>
  );
};

const styles = StyleSheet.create({
  label: { fontSize: 11, color: Colors.text3, fontWeight: '700', letterSpacing: 0.6, marginBottom: 6 },
  phoneBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg,
    borderWidth: 1.5,
    borderRadius: Radius.md,
    minHeight: 58,
    paddingRight: 16,
  },
  cc: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14 },
  flag: { fontSize: 18 },
  ccTxt: { fontSize: 16, fontWeight: '800', color: Colors.text },
  divider: { width: 1, height: 26, backgroundColor: Colors.border },
  input: { flex: 1, fontSize: 17, color: Colors.text, fontWeight: '600', paddingHorizontal: 12, letterSpacing: 1 },
  error: { fontSize: 11, color: Colors.danger, marginTop: 6, marginLeft: 2, fontWeight: '500' },
  sendBtn: {
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 4,
  },
  hintCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border2,
    borderRadius: Radius.md,
    padding: 12,
    marginTop: 18,
  },
  hint: { flex: 1, fontSize: 11, color: Colors.text2, lineHeight: 16 },
});
