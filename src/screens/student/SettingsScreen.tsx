import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, Switch, Alert, Linking } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../theme';
import { Icon, IconName } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';
import { Entrance, PressableScale } from '../../components/common/anim';
import { GlowBlob } from '../../components/illustrations/OnboardingArt';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { initials } from '../../utils/ui';
import { Env } from '../../config/env';

export const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, role, logout } = useAuth();
  const { label: languageLabel } = useLanguage();

  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const confirmLogout = () =>
    Alert.alert('Sign out?', 'You can sign back in any time.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => void logout() },
    ]);

  const sw = (value: boolean, onChange: (v: boolean) => void) => (
    <Switch value={value} onValueChange={onChange} trackColor={{ false: Colors.border, true: Colors.primary }} thumbColor={Colors.white} ios_backgroundColor={Colors.border} />
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A0A0C" />

      <LinearGradient colors={['#1A0A0C', '#2A0E13', '#3D1520']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroGlow} pointerEvents="none"><GlowBlob size={220} /></View>
        <SafeAreaView edges={['top']}>
          <View style={styles.topbar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Text style={styles.backIcon}>‹</Text></TouchableOpacity>
            <View style={{ width: 40 }} />
          </View>
          <Text style={styles.title}>Settings</Text>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.sheet} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile card */}
        <Entrance index={0}>
          <PressableScale style={styles.profileCard} onPress={() => navigation.navigate('Account')}>
            <View style={styles.avatar}><Text style={styles.avatarTxt}>{initials(user?.name)}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{user?.name ?? 'Bodhira user'}</Text>
              <Text style={styles.profileSub}>{user?.email ?? user?.phone ?? (user?.role_label ?? role)}</Text>
            </View>
            <View style={styles.editPill}><Text style={styles.editTxt}>Edit</Text></View>
          </PressableScale>
        </Entrance>

        {/* Preferences */}
        <Entrance index={1}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.group}>
            <Row icon="flag" label="Language" value={languageLabel} onPress={() => navigation.navigate('Language')} />
            <Divider />
            <Row icon="bell" label="Push notifications" right={sw(notifications, setNotifications)} />
            <Divider />
            <Row icon="volume" label="Sounds & haptics" right={sw(sounds, setSounds)} />
            <Divider />
            <Row icon="brain" label="Dark mode" value="Soon" right={sw(darkMode, setDarkMode)} />
          </View>
        </Entrance>

        {/* Support */}
        <Entrance index={2}>
          <Text style={styles.sectionTitle}>Support & legal</Text>
          <View style={styles.group}>
            <Row icon="help" label="Help & support" onPress={() => Linking.openURL(`${Env.apiOrigin}/help`)} />
            <Divider />
            <Row icon="lock" label="Privacy & security" onPress={() => Linking.openURL(`${Env.apiOrigin}/privacy`)} />
            <Divider />
            <Row icon="document" label="Terms & policies" onPress={() => Linking.openURL(`${Env.apiOrigin}/terms`)} />
          </View>
        </Entrance>

        <Entrance index={3}>
          <Button label="Sign out" variant="outline" onPress={confirmLogout} style={{ marginTop: 4 }} />
          <Text style={styles.version}>Bodhira · {Env.isLocal ? 'Dev build' : 'v1.0.0'}</Text>
        </Entrance>
      </ScrollView>
    </View>
  );
};

const Row: React.FC<{ icon: IconName; label: string; value?: string; right?: React.ReactNode; onPress?: () => void }> = ({ icon, label, value, right, onPress }) => (
  <PressableScale style={styles.row} onPress={onPress} disabled={!onPress}>
    <View style={styles.rowIcon}><Icon name={icon} size={17} color={Colors.text2} /></View>
    <Text style={styles.rowLabel}>{label}</Text>
    {value ? <Text style={styles.rowValue}>{value}</Text> : null}
    {right ? right : onPress ? <Text style={styles.chevron}>›</Text> : null}
  </PressableScale>
);

const Divider = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A0A0C' },
  hero: { paddingHorizontal: 16, paddingBottom: 26, overflow: 'hidden' },
  heroGlow: { position: 'absolute', top: -60, right: -40, opacity: 0.8 },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(196,149,96,0.15)', borderWidth: 1, borderColor: 'rgba(196,149,96,0.25)', alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 28, color: Colors.primary, fontWeight: '300', marginTop: -2 },
  title: { fontSize: 26, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.5, marginTop: 8 },

  sheet: { flex: 1, backgroundColor: Colors.bg, marginTop: -16, borderTopLeftRadius: 26, borderTopRightRadius: 26 },
  content: { padding: 16, paddingTop: 22, gap: 18, paddingBottom: 32 },

  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border2, padding: 14, ...Shadow.sm },
  avatar: { width: 52, height: 52, borderRadius: 17, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontSize: 20, fontWeight: '900', color: Colors.brand },
  profileName: { fontSize: 15.5, fontWeight: '800', color: Colors.text },
  profileSub: { fontSize: 12, color: Colors.text2, marginTop: 2 },
  editPill: { backgroundColor: Colors.primaryLight, borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 6 },
  editTxt: { fontSize: 11, fontWeight: '800', color: Colors.primaryDark },

  sectionTitle: { fontSize: 12, fontWeight: '800', color: Colors.text3, letterSpacing: 0.6, marginBottom: 8, marginLeft: 4 },
  group: { backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border2, overflow: 'hidden', ...Shadow.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 13, minHeight: 54 },
  rowIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: Colors.bg2, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, fontSize: 13.5, fontWeight: '600', color: Colors.text },
  rowValue: { fontSize: 12.5, color: Colors.text3, fontWeight: '600', marginRight: 4 },
  chevron: { fontSize: 20, color: Colors.text3 },
  divider: { height: 1, backgroundColor: Colors.border2, marginLeft: 60 },

  version: { fontSize: 11, color: Colors.text3, textAlign: 'center', marginTop: 12 },
});
