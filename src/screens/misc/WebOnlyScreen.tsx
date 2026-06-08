import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius } from '../../theme';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { useAuth } from '../../context/AuthContext';

/**
 * Admin / super-admin have full tooling on the web; the mobile app routes them
 * here (webapp-flows §1, §9) with a single way out: sign out.
 */
export const WebOnlyScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const label = user?.role === 'super_admin' ? 'Super Admin' : 'Admin';

  return (
    <LinearGradient colors={Colors.heroGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.bg}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.card}>
          <Icon name="desktop" size={48} color={Colors.primary} style={styles.icon} />
          <Text style={styles.title}>{label} tools are on web</Text>
          <Text style={styles.body}>
            Manage users, classes, billing and analytics from{' '}
            <Text style={styles.link}>bodhira.ai/login</Text>. The mobile app is built for students,
            teachers and parents.
          </Text>
          <Button label="Sign out" variant="gold" onPress={logout} style={styles.btn} />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: {
    backgroundColor: 'rgba(196,149,96,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(196,149,96,0.25)',
    borderRadius: Radius.xl,
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  icon: { marginBottom: 4 },
  title: { fontSize: 20, fontWeight: '900', color: '#F5E8D0', textAlign: 'center' },
  body: { fontSize: 13, color: 'rgba(245,232,208,0.75)', textAlign: 'center', lineHeight: 20 },
  link: { color: Colors.primary, fontWeight: '700' },
  btn: { marginTop: 14, minWidth: 200 },
});
