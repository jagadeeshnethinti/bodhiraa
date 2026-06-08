import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme';
import { Icon } from '../../components/common/Icon';

/**
 * Shown while the app restores the stored token and verifies it against
 * `/auth/me`. Navigation-agnostic — the root navigator renders this directly
 * during the `booting` auth state, then swaps to the right stack.
 */
export const BootScreen: React.FC = () => (
  <LinearGradient
    colors={['#1A0A0C', '#2A0E13', '#3D1520', '#52202E']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.gradient}
  >
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.center}>
        <View style={styles.logoBox}>
          <Icon name="brain" size={48} color={Colors.primary} />
        </View>
        <Text style={styles.brand}>Bodhira</Text>
        <Text style={styles.tagline}>AI-POWERED LEARNING</Text>
        <ActivityIndicator color={Colors.primary} style={styles.spinner} />
      </View>
    </SafeAreaView>
  </LinearGradient>
);

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  logoBox: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: 'rgba(196,149,96,0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(196,149,96,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  brand: { fontSize: 38, fontWeight: '900', color: '#F5E8D0', letterSpacing: -1 },
  tagline: { fontSize: 11, letterSpacing: 4, fontWeight: '700', color: Colors.primary },
  spinner: { marginTop: 24 },
});
