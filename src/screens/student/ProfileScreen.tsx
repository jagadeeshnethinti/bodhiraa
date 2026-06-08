import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, Linking } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../theme';
import { Button } from '../../components/common/Button';
import { useApi } from '../../hooks/useApi';
import { StudentApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Icon, IconName } from '../../components/common/Icon';
import { initials } from '../../utils/ui';
import { Env } from '../../config/env';

const prettify = (key: string) =>
  key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

export const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, role, isB2C, logout } = useAuth();
  const isStudent = role === 'student';

  // Only students have a /student/profile endpoint; other roles just show identity.
  const profile = useApi(signal => (isStudent ? StudentApi.profile(signal) : Promise.resolve(null)), [isStudent]);

  // Render up to 4 numeric stats found in the free-form profile payload.
  const stats = useMemo(() => {
    const obj = (profile.data ?? {}) as Record<string, unknown>;
    return Object.entries(obj)
      .filter(([, v]) => typeof v === 'number')
      .slice(0, 4)
      .map(([k, v]) => ({ key: k, label: prettify(k), value: String(v) }));
  }, [profile.data]);

  const confirmLogout = () =>
    Alert.alert('Sign out?', 'You can sign back in any time.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => void logout() },
    ]);

  const subtitle = user?.school?.name
    ? `${user.role_label ?? role} · ${user.school.name}`
    : user?.grade
    ? `${user.role_label ?? role} · Grade ${user.grade}`
    : user?.role_label ?? role ?? '';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A0A0C" />

      <LinearGradient colors={['#1A0A0C', '#2A0E13', '#3D1520', '#52202E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <SafeAreaView edges={['top']} style={styles.header}>
          <View style={styles.headerTop}>
            <View style={{ width: 40 }} />
            <TouchableOpacity style={styles.bellBtn} onPress={() => isStudent && navigation.navigate('Notifications')}>
              <Icon name="bell" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(user?.name)}</Text>
          </View>
          <Text style={styles.name}>{user?.name ?? 'Bodhira user'}</Text>
          <Text style={styles.schoolInfo}>{subtitle}</Text>

          {stats.length > 0 && (
            <View style={styles.statRow}>
              {stats.map((s, i) => (
                <React.Fragment key={s.key}>
                  {i > 0 && <View style={styles.statSep} />}
                  <View style={styles.statItem}>
                    <Text style={styles.statVal}>{s.value}</Text>
                    <Text style={styles.statLbl} numberOfLines={1}>
                      {s.label}
                    </Text>
                  </View>
                </React.Fragment>
              ))}
            </View>
          )}
        </SafeAreaView>
      </LinearGradient>

      <SafeAreaView style={styles.body} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {isStudent && (
            <View style={styles.actionsGrid}>
              <ActionTile icon="robot" label="AI Tutor" onPress={() => navigation.navigate('AITutor')} />
              <ActionTile icon="edit" label="Quizzes" onPress={() => navigation.navigate('QuizList')} />
              <ActionTile icon="video" label="Live" onPress={() => navigation.navigate('LiveClasses')} />
              <ActionTile icon="bell" label="Alerts" onPress={() => navigation.navigate('Notifications')} />
            </View>
          )}

          {/* B2C billing (students with no school). The pricing/billing endpoints
              are documented as upcoming — link to web for v1. */}
          {isB2C && (
            <TouchableOpacity style={styles.billingCard} onPress={() => Linking.openURL(`${Env.apiOrigin}/pricing`)}>
              <Icon name="card" size={26} color={Colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.billingTitle}>Subscription & billing</Text>
                <Text style={styles.billingSub}>Manage your plan and invoices</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>
            <SettingRow icon="user" label="Account" />
            <SettingRow icon="lock" label="Privacy & security" />
            <SettingRow icon="help" label="Help & support" onPress={() => Linking.openURL(`${Env.apiOrigin}/help`)} />
            <SettingRow icon="document" label="Terms & policies" onPress={() => Linking.openURL(`${Env.apiOrigin}/terms`)} />
          </View>

          <Button label="Sign out" variant="outline" onPress={confirmLogout} style={{ marginTop: 4 }} />

          <Text style={styles.version}>Bodhira · {Env.isLocal ? 'Dev build' : 'v1'}</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const ActionTile: React.FC<{ icon: IconName; label: string; onPress: () => void }> = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.actionTile} onPress={onPress} activeOpacity={0.85}>
    <Icon name={icon} size={26} color={Colors.primary} />
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

const SettingRow: React.FC<{ icon: IconName; label: string; onPress?: () => void }> = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
    <Icon name={icon} size={18} color={Colors.text2} />
    <Text style={styles.settingLabel}>{label}</Text>
    <Text style={styles.chevron}>›</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: 16, paddingBottom: 24, alignItems: 'center' },
  body: { flex: 1 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 12, paddingTop: 8 },
  bellBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(196,149,96,0.15)', alignItems: 'center', justifyContent: 'center' },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(196,149,96,0.4)',
    marginBottom: 10,
  },
  avatarText: { fontSize: 30, fontWeight: '900', color: Colors.brand },
  name: { fontSize: 22, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.4 },
  schoolInfo: { fontSize: 11, color: 'rgba(245,232,208,0.65)', marginTop: 3, marginBottom: 16, textTransform: 'capitalize' },
  statRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { alignItems: 'center', paddingHorizontal: 16, maxWidth: 110 },
  statVal: { fontSize: 18, fontWeight: '900', color: Colors.primary },
  statLbl: { fontSize: 9, color: 'rgba(245,232,208,0.6)', marginTop: 2, fontWeight: '500' },
  statSep: { width: 1, height: 28, backgroundColor: 'rgba(196,149,96,0.25)' },
  scroll: { padding: 16, gap: 16, paddingBottom: 32 },
  actionsGrid: { flexDirection: 'row', gap: 8 },
  actionTile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    gap: 6,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border2,
    ...Shadow.sm,
  },
  actionLabel: { fontSize: 11, fontWeight: '600', color: Colors.text },
  billingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(196,149,96,0.25)',
    padding: 14,
  },
  billingTitle: { fontSize: 13, fontWeight: '800', color: Colors.text },
  billingSub: { fontSize: 11, color: Colors.text2, marginTop: 2 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border2,
    paddingVertical: 14,
    paddingHorizontal: 14,
    ...Shadow.sm,
  },
  settingLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: Colors.text },
  chevron: { fontSize: 20, color: Colors.text3 },
  version: { fontSize: 11, color: Colors.text3, textAlign: 'center', marginTop: 8 },
});
