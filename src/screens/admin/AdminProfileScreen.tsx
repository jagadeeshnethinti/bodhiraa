/**
 * Admin · Profile — administrator account + school identity. Editable avatar,
 * live school snapshot chips (GET /admin/home), a school info card from the auth
 * user, and settings rows. Sign-out confirms first.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Alert, Linking, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../theme';
import { Button } from '../../components/common/Button';
import { Entrance, PressableScale } from '../../components/common/anim';
import { GlowBlob } from '../../components/illustrations/OnboardingArt';
import { BoldIcon as Icon, BoldIconName as IconName } from '../../components/common/BoldIcon';
import { ConfirmDialog } from '../../components/common/PremiumModals';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { AdminApi } from '../../api/endpoints/admin';
import { initials } from '../../utils/ui';
import { Env } from '../../config/env';

export const AdminProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const name = user?.name ?? 'Administrator';
  const home = useApi(signal => AdminApi.home(signal), []);
  const stats = home.data?.stats;

  const schoolInfo: { icon: IconName; label: string; value: string }[] = [
    { icon: 'school', label: 'School', value: user?.school?.name ?? home.data?.admin?.school ?? '—' },
    { icon: 'flag', label: 'Code', value: user?.school?.code ?? home.data?.admin?.school_code ?? '—' },
    { icon: 'phone', label: 'Email', value: user?.email ?? '—' },
  ];

  const [logoutOpen, setLogoutOpen] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A0A0C" />

      <LinearGradient colors={['#1A0A0C', '#2A0E13', '#3D1520', '#52202E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroGlow} pointerEvents="none"><GlowBlob size={260} /></View>
        <SafeAreaView edges={['top']}>
          <View style={styles.heroTop}>
            <View style={{ width: 40 }} />
            <Text style={styles.heroTitle}>Profile</Text>
            <View style={{ width: 40 }} />
          </View>
          <Entrance index={0} style={styles.heroInner}>
            <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('AdminEditProfile')} style={styles.avatarWrap}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{initials(name)}</Text></View>
              <View style={styles.editDot}><Icon name="edit" size={11} color={Colors.brand} /></View>
            </TouchableOpacity>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.subtitle}>{user?.role_label ?? 'School Administrator'}{user?.school?.code ? ` · ${user.school.code}` : ''}</Text>
            <View style={styles.chipRow}>
              <View style={styles.chip}><Icon name="school" size={11} color={Colors.primary} /><Text style={styles.chipTxt}>{stats?.students ?? 0} students</Text></View>
              <View style={styles.chip}><Icon name="teacher" size={11} color={Colors.primary} /><Text style={styles.chipTxt}>{stats?.teachers ?? 0} teachers</Text></View>
              <View style={styles.chip}><Icon name="library" size={11} color={Colors.primary} /><Text style={styles.chipTxt}>{stats?.classes ?? 0} classes</Text></View>
            </View>
          </Entrance>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.sheet} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Entrance index={0}>
          <Button label="Edit profile" variant="outline" icon={<Icon name="user" size={15} color={Colors.brand} />} onPress={() => navigation.navigate('AdminEditProfile')} />
        </Entrance>

        {/* School info */}
        <Entrance index={1}><Text style={styles.sectionTitle}>School</Text></Entrance>
        <Entrance index={2} style={styles.infoCard}>
          {schoolInfo.map((s, i) => (
            <View key={s.label} style={[styles.infoRow, i < schoolInfo.length - 1 && styles.divider]}>
              <View style={styles.infoIcon}><Icon name={s.icon} size={16} color={Colors.primaryDark} /></View>
              <Text style={styles.infoLabel}>{s.label}</Text>
              <Text style={styles.infoValue} numberOfLines={1}>{s.value}</Text>
            </View>
          ))}
        </Entrance>

        {/* Account */}
        <Entrance index={3} style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingRow icon="user" label="Personal details" sub="Name, email, phone" onPress={() => navigation.navigate('AdminEditProfile')} />
          <SettingRow icon="lock" label="Roles & permissions" sub="Manage admin access" onPress={() => Alert.alert('Permissions', 'Role management arrives in v1.')} />
          <SettingRow icon="flag" label="Language" sub="English" onPress={() => navigation.navigate('Language')} />
        </Entrance>

        {/* Support */}
        <Entrance index={4} style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <SettingRow icon="help" label="Help & support" onPress={() => Linking.openURL(`${Env.apiOrigin}/help`)} />
          <SettingRow icon="document" label="Terms & policies" onPress={() => Linking.openURL(`${Env.apiOrigin}/terms`)} />
        </Entrance>

        <Button label="Sign out" variant="outline" onPress={() => setLogoutOpen(true)} style={{ marginTop: 4 }} />
        <Text style={styles.version}>Bodhira · {Env.isLocal ? 'Dev build' : 'v1'}</Text>
      </ScrollView>

      <ConfirmDialog
        visible={logoutOpen}
        icon="logout"
        tone="danger"
        title="Sign out?"
        message="You can sign back in any time."
        confirmLabel="Sign out"
        cancelLabel="Cancel"
        onConfirm={() => { setLogoutOpen(false); void logout(); }}
        onCancel={() => setLogoutOpen(false)}
      />
    </View>
  );
};

const SettingRow: React.FC<{ icon: IconName; label: string; sub?: string; onPress?: () => void }> = ({ icon, label, sub, onPress }) => (
  <PressableScale style={styles.settingRow} onPress={onPress} disabled={!onPress}>
    <View style={styles.settingIcon}><Icon name={icon} size={17} color={Colors.text2} /></View>
    <View style={{ flex: 1 }}>
      <Text style={styles.settingLabel}>{label}</Text>
      {sub ? <Text style={styles.settingSub}>{sub}</Text> : null}
    </View>
    <Text style={styles.chevron}>›</Text>
  </PressableScale>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A0A0C' },
  hero: { paddingHorizontal: 16, paddingBottom: 28, overflow: 'hidden' },
  heroGlow: { position: 'absolute', top: -80, alignSelf: 'center', opacity: 0.8 },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 },
  heroTitle: { fontSize: 16, fontWeight: '800', color: '#F5E8D0' },
  heroInner: { alignItems: 'center', marginTop: 8 },
  avatarWrap: { width: 88, height: 88 },
  avatar: { width: 88, height: 88, borderRadius: 28, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(196,149,96,0.4)' },
  avatarText: { fontSize: 30, fontWeight: '900', color: Colors.brand },
  editDot: { position: 'absolute', right: -2, bottom: -2, width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2.5, borderColor: '#2A0E13' },
  name: { fontSize: 22, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.5, marginTop: 14 },
  subtitle: { fontSize: 12, color: 'rgba(245,232,208,0.65)', marginTop: 4 },
  chipRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(245,232,208,0.08)', borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 6 },
  chipTxt: { fontSize: 10.5, color: '#F5E8D0', fontWeight: '700' },

  sheet: { flex: 1, backgroundColor: Colors.bg, marginTop: -18, borderTopLeftRadius: 26, borderTopRightRadius: 26 },
  content: { padding: 16, paddingTop: 22, gap: 18, paddingBottom: 32 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.text, marginBottom: 10 },
  section: { gap: 8 },

  infoCard: { backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border2, paddingHorizontal: 14, ...Shadow.sm },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  divider: { borderBottomWidth: 1, borderBottomColor: Colors.border2 },
  infoIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  infoLabel: { fontSize: 12.5, color: Colors.text2, fontWeight: '600' },
  infoValue: { flex: 1, fontSize: 12.5, fontWeight: '700', color: Colors.text, textAlign: 'right' },

  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border2, paddingVertical: 12, paddingHorizontal: 12, ...Shadow.sm },
  settingIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: Colors.bg2, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { fontSize: 13, fontWeight: '700', color: Colors.text },
  settingSub: { fontSize: 11, color: Colors.text2, marginTop: 1 },
  chevron: { fontSize: 20, color: Colors.text3 },
  version: { fontSize: 11, color: Colors.text3, textAlign: 'center', marginTop: 8 },
});
