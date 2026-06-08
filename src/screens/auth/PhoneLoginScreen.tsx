import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { Colors, Radius } from '../../theme';
import { Button } from '../../components/common/Button';
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
        return await otpSend(trimmed);
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

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <View style={styles.topbar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.topTitle}>Phone Sign In</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          automaticallyAdjustKeyboardInsets
        >
            <Text style={styles.heading}>Enter your phone number</Text>
          <Text style={styles.sub}>We'll text you a 6-digit verification code.</Text>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>MOBILE NUMBER</Text>
            <View style={[styles.inputBox, focused && styles.inputBoxFocused, !!error && styles.inputBoxError]}>
              <TextInput
                style={styles.textInput}
                value={phone}
                onChangeText={t => {
                  setPhone(t);
                  if (error) setError(null);
                }}
                placeholder="+91 98765 43210"
                placeholderTextColor={Colors.text3}
                keyboardType="phone-pad"
                autoCapitalize="none"
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
              />
            </View>
            {error ? <Text style={styles.fieldError}>{error}</Text> : null}
          </View>

          <Button
            label={submitting ? 'Sending…' : 'Send code →'}
            variant="primary"
            onPress={handleSend}
            loading={submitting}
            disabled={submitting || phone.trim().length < 6}
            style={styles.sendBtn}
          />

          <Text style={styles.hint}>
            Use the number registered with your account. Standard messaging rates may apply.
          </Text>
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
  backIcon: { fontSize: 26, color: Colors.text, fontWeight: '300' },
  topTitle: { fontSize: 16, fontWeight: '800', color: Colors.text },
  body: { padding: 22, paddingTop: 28 },
  heading: { fontSize: 22, fontWeight: '900', color: Colors.text, letterSpacing: -0.44, marginBottom: 6 },
  sub: { fontSize: 13, color: Colors.text2, lineHeight: 19, marginBottom: 24 },
  field: { marginBottom: 10 },
  fieldLabel: { fontSize: 10, color: Colors.text3, fontWeight: '700', letterSpacing: 0.6, marginBottom: 3 },
  inputBox: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputBoxFocused: { borderColor: Colors.primary },
  inputBoxError: { borderColor: Colors.danger },
  textInput: { flex: 1, fontSize: 13, color: Colors.text, fontWeight: '500', padding: 0 },
  fieldError: { fontSize: 10, color: Colors.danger, marginTop: 3, marginLeft: 2 },
  sendBtn: { marginTop: 8 },
  hint: { fontSize: 11, color: Colors.text3, marginTop: 16, lineHeight: 16, textAlign: 'center' },
});
