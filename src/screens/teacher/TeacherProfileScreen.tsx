/**
 * Teacher · Profile — account hub with an editable avatar, teaching snapshot
 * chips, the classes taught, and grouped settings rows that navigate to real
 * screens. Sign-out confirms first.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Alert, Linking, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../theme';
import { Button } from '../../components/common/Button';
import { Entrance, PressableScale } from '../../components/common/anim';
import { GlowBlob } from '../../components/illustrations/OnboardingArt';
import { Icon, IconName } from '../../components/common/Icon';
import { ConfirmDialog } from '../../components/common/PremiumModals';
import { useAuth } from '../../context/AuthContext';
import { initials } from '../../utils/ui';
import { Env } from '../../config/env';

const CLASSES = [
  { name: 'Class 11-A · Physics', students: 42 },
  { name: 'Class 12-B · Chemistry', students: 38 },
  { name: 'Class 10-C · Mathematics', students: 45 },
];

export const TeacherProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const name = user?.name ?? 'Dr. Meera Sharma';

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
            <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('TeacherEditProfile')} style={styles.avatarWrap}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{initials(name)}</Text></View>
              <View style={styles.editDot}><Icon name="edit" size={11} color={Colors.brand} /></View>
            </TouchableOpacity>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.subtitle}>Physics Teacher · Delhi Public School</Text>
            <View style={styles.chipRow}>
              <View style={styles.chip}><Icon name="library" size={11} color={Colors.primary} /><Text style={styles.chipTxt}>3 classes</Text></View>
              <View style={styles.chip}><Icon name="group" size={11} color={Colors.primary} /><Text style={styles.chipTxt}>125 students</Text></View>
              <View style={styles.chip}><Icon name="star" size={11} color={Colors.primary} /><Text style={styles.chipTxt}>Since 2019</Text></View>
            </View>
          </Entrance>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.sheet} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Entrance index={0}>
          <Button label="Edit profile" variant="outline" icon={<Icon name="user" size={15} color={Colors.brand} />} onPress={() => navigation.navigate('TeacherEditProfile')} />
        </Entrance>

        {/* Classes */}
        <Entrance index={1}><Text style={styles.sectionTitle}>Classes you teach</Text></Entrance>
        <Entrance index={2} style={{ gap: 8 }}>
          {CLASSES.map(c => (
            <PressableScale key={c.name} style={styles.classCard} onPress={() => Alert.alert(c.name, `${c.students} students. Full class management arrives in v1.`)}>
              <View style={styles.classIcon}><Icon name="library" size={18} color={Colors.primaryDark} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.className}>{c.name}</Text>
                <Text style={styles.classMeta}>{c.students} students</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </PressableScale>
          ))}
        </Entrance>

        {/* Account */}
        <Entrance index={3} style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingRow icon="user" label="Personal details" sub="Name, email, phone, subject" onPress={() => navigation.navigate('TeacherEditProfile')} />
          <SettingRow icon="flag" label="Language" sub="English" onPress={() => navigation.navigate('Language')} />
          <SettingRow icon="bell" label="Notifications" sub="Submissions, reminders" onPress={() => Alert.alert('Notifications', 'Notification preferences arrive in v1.')} />
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

  classCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border2, padding: 12, ...Shadow.sm },
  classIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  className: { fontSize: 13, fontWeight: '800', color: Colors.text },
  classMeta: { fontSize: 11, color: Colors.text2, marginTop: 2 },

  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border2, paddingVertical: 12, paddingHorizontal: 12, ...Shadow.sm },
  settingIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: Colors.bg2, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { fontSize: 13, fontWeight: '700', color: Colors.text },
  settingSub: { fontSize: 11, color: Colors.text2, marginTop: 1 },
  chevron: { fontSize: 20, color: Colors.text3 },
  version: { fontSize: 11, color: Colors.text3, textAlign: 'center', marginTop: 8 },
});
