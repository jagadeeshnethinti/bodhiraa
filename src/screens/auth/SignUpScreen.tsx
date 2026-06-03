import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { Colors, Radius } from '../../theme';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [phone, setPhone]       = useState('');
  const [grade, setGrade]       = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed]     = useState(false);

  const strength      = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColor = ['', Colors.danger, Colors.warning, Colors.success][strength];
  const strengthLabel = ['', 'Weak', 'Medium', 'Strong'][strength];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Topbar */}
        <View style={styles.topbar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.topTitle}>Create Account</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scroll}
        >
          <Text style={styles.sub}>Join 2 million+ students learning smarter with AI</Text>

          <Input label="FULL NAME"       value={name}     onChangeText={setName}     placeholder="Arjun Sharma" />
          <Input label="EMAIL ADDRESS"   value={email}    onChangeText={setEmail}    placeholder="arjun@gmail.com" keyboardType="email-address" autoCapitalize="none" />
          <Input
            label="MOBILE NUMBER"
            value={phone}
            onChangeText={setPhone}
            placeholder="98765 43210"
            keyboardType="phone-pad"
            leftElement={<Text style={styles.countryCode}>🇮🇳 +91  </Text>}
          />
          <Input label="CLASS / GRADE"   value={grade}    onChangeText={setGrade}    placeholder="Class 11 — Science" />
          <Input label="SET PASSWORD"    value={password} onChangeText={setPassword} placeholder="••••••••••" secureTextEntry />

          {/* Strength */}
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

          {/* Terms */}
          <View style={styles.termsRow}>
            <TouchableOpacity
              onPress={() => setAgreed(!agreed)}
              style={[styles.checkbox, agreed && styles.checkboxOn]}
            >
              {agreed && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
            <Text style={styles.termsText}>
              I agree to the <Text style={styles.link}>Terms of Service</Text> and <Text style={styles.link}>Privacy Policy</Text>
            </Text>
          </View>

          <Button
            label="Create Account →"
            variant="primary"
            onPress={() => navigation.navigate('OTP', { phone, email })}
            disabled={!agreed || !name || !email}
            style={styles.createBtn}
          />

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: Colors.bg },
  container: { flex: 1 },
  topbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border2,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.bg2,
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon:  { fontSize: 26, color: Colors.text, lineHeight: 30, fontWeight: '300' },
  topTitle:  { fontSize: 16, fontWeight: '800', color: Colors.text },
  scroll:    { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32, gap: 0 },
  sub:       { fontSize: 12, color: Colors.text2, marginBottom: 18 },
  countryCode: { fontSize: 13, fontWeight: '600', color: Colors.text2, marginRight: 4 },
  strengthWrap: { marginBottom: 14 },
  strengthBars: { flexDirection: 'row', gap: 4, marginBottom: 5 },
  strengthBar:  { flex: 1, height: 3, borderRadius: 2 },
  strengthTxt:  { fontSize: 10, color: Colors.text3 },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 22, marginTop: 4 },
  checkbox: {
    width: 18, height: 18, borderRadius: 5,
    borderWidth: 1.5, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, marginTop: 1, backgroundColor: Colors.white,
  },
  checkboxOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkmark:  { fontSize: 11, color: Colors.brand, fontWeight: '800' },
  termsText:  { fontSize: 11, color: Colors.text2, lineHeight: 17, flex: 1 },
  link:       { color: Colors.primary, fontWeight: '700' },
  createBtn:  { marginBottom: 18 },
  loginRow:   { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginText:  { fontSize: 11, color: Colors.text2 },
  loginLink:  { fontSize: 11, color: Colors.primary, fontWeight: '700' },
});
