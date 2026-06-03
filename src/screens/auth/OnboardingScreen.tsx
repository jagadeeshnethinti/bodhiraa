import React from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { Colors, Radius } from '../../theme';
import { Button } from '../../components/common/Button';

type Props = NativeStackScreenProps<AuthStackParamList, 'Onboarding'>;

const features = [
  { icon: '🤖', title: 'AI Doubt Solver',   desc: 'Answers any doubt in seconds' },
  { icon: '📊', title: 'Smart Analytics',   desc: 'Track every detail of progress' },
  { icon: '🏆', title: 'Gamified Learning', desc: 'Earn badges, streaks & rewards' },
];

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => (
  <LinearGradient
    colors={['#1A0A0C', '#2A0E13', '#3D1520', '#52202E']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.gradient}
  >
    <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.shimmer} pointerEvents="none" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo mark */}
        <View style={styles.logoRow}>
          <View style={styles.logoBox}>
            <Text style={{ fontSize: 26 }}>🧠</Text>
          </View>
          <View>
            <Text style={styles.appName}>Bodhira LMS</Text>
            <Text style={styles.appTag}>AI-Powered Learning Platform</Text>
          </View>
        </View>

        {/* Headline */}
        <View style={styles.headBlock}>
          <Text style={styles.overline}>WELCOME TO BODHIRA</Text>
          <Text style={styles.headline}>{'Learn smarter\nwith AI by\nyour side 🚀'}</Text>
          <Text style={styles.body}>
            India's most advanced AI-powered LMS. Personalised paths, instant doubt solving,
            real-time analytics.
          </Text>
        </View>

        {/* Feature cards */}
        <View style={styles.features}>
          {features.map((f, i) => (
            <View key={i} style={styles.featureCard}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTA */}
        <View style={styles.cta}>
          <Button
            label="Get Started Free →"
            variant="gold"
            onPress={() => navigation.navigate('SignUp')}
            style={styles.primaryBtn}
          />
          <Button
            label="I already have an account"
            variant="outline"
            onPress={() => navigation.navigate('Login')}
            style={styles.secondaryBtn}
            textStyle={{ color: '#F5E8D0' }}
          />
          <Text style={styles.legal}>
            By continuing you agree to our Terms & Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  </LinearGradient>
);

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe:     { flex: 1 },
  shimmer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(196,149,96,0.06)',
  },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24, gap: 28 },
  logoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  logoBox: {
    width: 46, height: 46, borderRadius: 14,
    backgroundColor: 'rgba(196,149,96,0.18)',
    borderWidth: 1, borderColor: 'rgba(196,149,96,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
  appName: { fontSize: 18, fontWeight: '900', color: '#F5E8D0' },
  appTag:  { fontSize: 10, color: 'rgba(196,149,96,0.75)', fontWeight: '600', marginTop: 2 },
  headBlock: { gap: 10 },
  overline: {
    fontSize: 10, fontWeight: '700', letterSpacing: 3,
    color: 'rgba(196,149,96,0.7)',
  },
  headline: {
    fontSize: 30, fontWeight: '900',
    letterSpacing: -0.02 * 30, lineHeight: 37,
    color: '#F5E8D0',
  },
  body: { fontSize: 12, color: 'rgba(245,232,208,0.8)', lineHeight: 20 },
  features: { gap: 10 },
  featureCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: 'rgba(196,149,96,0.12)',
    borderWidth: 1, borderColor: 'rgba(196,149,96,0.22)',
    borderRadius: Radius.lg, padding: 14,
  },
  featureIcon: { fontSize: 24 },
  featureText: { flex: 1, gap: 2 },
  featureTitle: { fontSize: 13, fontWeight: '700', color: '#F5E8D0' },
  featureDesc:  { fontSize: 11, color: 'rgba(245,232,208,0.65)' },
  cta: { gap: 10 },
  primaryBtn: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 6,
  },
  secondaryBtn: {
    backgroundColor: 'rgba(196,149,96,0.14)',
    borderColor: 'rgba(196,149,96,0.3)',
  },
  legal: {
    fontSize: 10, textAlign: 'center',
    color: 'rgba(245,232,208,0.5)',
  },
});
