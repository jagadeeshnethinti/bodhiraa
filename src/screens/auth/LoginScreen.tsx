import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { Colors, Radius } from '../../theme';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#1A0A0C" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* Brand gradient header — extends behind status bar */}
          <LinearGradient
            colors={['#1A0A0C', '#2A0E13', '#3D1520']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.brandHeader}
          >
            {/* Uses SafeAreaView top inset via paddingTop on the gradient header */}
            <SafeAreaView edges={['top']} style={styles.brandInner}>
              <View style={styles.shimmer} pointerEvents="none" />
              <View style={styles.headerRow}>
                <View style={styles.logoBox}>
                  <Text style={styles.logoEmoji}>🧠</Text>
                </View>
                <View>
                  <Text style={styles.brandName}>Bodhira LMS</Text>
                  <Text style={styles.brandTagline}>AI-Powered Learning Platform</Text>
                </View>
              </View>
            </SafeAreaView>
          </LinearGradient>

          {/* Body */}
          <View style={styles.body}>
            <Text style={styles.greeting}>Welcome back 👋</Text>
            <Text style={styles.sub}>Sign in to continue your learning journey</Text>

            <Input
              label="EMAIL ADDRESS"
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="PASSWORD"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••••"
              secureTextEntry={!showPass}
              rightElement={
                <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                  <Text style={styles.showBtn}>{showPass ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              }
            />

            <TouchableOpacity style={styles.forgotWrap}>
              <Text style={styles.forgot}>Forgot password?</Text>
            </TouchableOpacity>

            <Button
              label="Sign In →"
              variant="primary"
              onPress={() => navigation.replace('RoleSelection')}
              style={styles.signInBtn}
            />

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.divLine} />
              <Text style={styles.divText}>or continue with</Text>
              <View style={styles.divLine} />
            </View>

            {/* Social */}
            <View style={styles.social}>
              {[{ icon: '🔵', label: 'Google' }, { icon: '🪟', label: 'Microsoft' }].map((s, i) => (
                <TouchableOpacity key={i} style={styles.socialBtn}>
                  <Text style={{ fontSize: 16 }}>{s.icon}</Text>
                  <Text style={styles.socialText}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.signupLink}>Sign up free</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: Colors.bg },
  container:   { flex: 1 },
  brandHeader: { overflow: 'hidden' },
  brandInner:  { paddingHorizontal: 20, paddingBottom: 24 },
  shimmer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(196,149,96,0.1)',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoBox: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: 'rgba(196,149,96,0.2)',
    borderWidth: 1, borderColor: 'rgba(196,149,96,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
  logoEmoji:    { fontSize: 22 },
  brandName:    { fontSize: 20, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.4 },
  brandTagline: { fontSize: 10, color: 'rgba(196,149,96,0.75)', fontWeight: '600', marginTop: 2 },
  body: { padding: 20, paddingTop: 28, gap: 0 },
  greeting: { fontSize: 22, fontWeight: '800', color: Colors.text, letterSpacing: -0.44, marginBottom: 4 },
  sub:      { fontSize: 12, color: Colors.text2, marginBottom: 20 },
  showBtn:  { fontSize: 11, color: Colors.primary, fontWeight: '600' },
  forgotWrap: { alignSelf: 'flex-end', marginBottom: 20 },
  forgot:     { fontSize: 11, color: Colors.primary, fontWeight: '700' },
  signInBtn: {
    marginBottom: 22,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 4,
  },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  divLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  divText: { fontSize: 11, color: Colors.text3 },
  social:  { flexDirection: 'row', gap: 10, marginBottom: 26 },
  socialBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 12, backgroundColor: Colors.bg,
    borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md,
  },
  socialText: { fontSize: 12, fontWeight: '600', color: Colors.text },
  signupRow:  { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  signupText: { fontSize: 12, color: Colors.text2 },
  signupLink: { fontSize: 12, color: Colors.primary, fontWeight: '700' },
});
