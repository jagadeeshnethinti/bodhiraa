/**
 * Parent · Profile — the parent's account hub. Premium gradient hero with an
 * editable avatar and a snapshot chip row, a working child switcher, and grouped
 * settings rows that all navigate to real screens. Sign-out confirms first.
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
import { useApi } from '../../hooks/useApi';
import { ParentApi } from '../../api';
import { initials } from '../../utils/ui';
import { Env } from '../../config/env';

export const ParentProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const name = user?.name ?? 'Parent';
  // Live linked children for the switcher.
  const childrenApi = useApi(signal => ParentApi.children(signal), []);
  const children = childrenApi.data ?? [];
  const [activeChild, setActiveChild] = useState(0);

  const [logoutOpen, setLogoutOpen] = useState(false);

  const switchChild = (i: number) => {
    const wasActive = i === activeChild;
    setActiveChild(i);
    if (!wasActive && children[i]) Alert.alert('Switched', `Now viewing ${children[i].name}'s dashboard.`);
  };

  const linkChild = () =>
    Alert.alert('Link a child', 'Enter the student ID shared by your school to link another child. Available in v1.');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A0A0C" />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <LinearGradient colors={['#1A0A0C', '#2A0E13', '#3D1520', '#52202E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroGlow} pointerEvents="none"><GlowBlob size={260} /></View>
        <SafeAreaView edges={['top']}>
          <View style={styles.heroTop}>
            <View style={{ width: 40 }} />
            <Text style={styles.heroTitle}>Profile</Text>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('ParentNotifications')} hitSlop={6}>
              <Icon name="bell" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <Entrance index={0} style={styles.heroInner}>
            <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('ParentEditProfile')} style={styles.avatarWrap}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{initials(name)}</Text></View>
              <View style={styles.editDot}><Icon name="edit" size={11} color={Colors.brand} /></View>
            </TouchableOpacity>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.subtitle}>{user?.school ? `Parent · ${user.school.name}` : 'Parent'}</Text>

            <View style={styles.chipRow}>
              <View style={styles.chip}><Icon name="child" size={11} color={Colors.primary} /><Text style={styles.chipTxt}>{children.length} {children.length === 1 ? 'child' : 'children'}</Text></View>
              {user?.email_verified ? (
                <View style={styles.chip}><Icon name="checkmark" size={11} color={Colors.success} /><Text style={styles.chipTxt}>Verified</Text></View>
              ) : null}
            </View>
          </Entrance>
        </SafeAreaView>
      </LinearGradient>

      {/* ── Body sheet ────────────────────────────────────────────── */}
      <ScrollView style={styles.sheet} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Edit profile CTA */}
        <Entrance index={0}>
          <Button
            label="Edit profile"
            variant="outline"
            icon={<Icon name="user" size={15} color={Colors.brand} />}
            onPress={() => navigation.navigate('ParentEditProfile')}
          />
        </Entrance>

        {/* Children switcher */}
        <Entrance index={1}><Text style={styles.sectionTitle}>Your children</Text></Entrance>
        <Entrance index={2} style={{ gap: 8 }}>
          {children.length === 0 && !childrenApi.loading ? (
            <Text style={styles.childMeta}>No children linked yet.</Text>
          ) : null}
          {children.map((c, i) => {
            const active = i === activeChild;
            return (
              <PressableScale key={c.id} style={[styles.childCard, active && styles.childCardActive]} onPress={() => switchChild(i)}>
                <View style={[styles.childAvatar, active && styles.childAvatarActive]}>
                  <Text style={[styles.childInitials, active && { color: Colors.brand }]}>{initials(c.name)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.childName}>{c.name}</Text>
                  <Text style={styles.childMeta}>{c.meta}</Text>
                </View>
                {active ? (
                  <View style={styles.activeTag}><Text style={styles.activeTagTxt}>Viewing</Text></View>
                ) : (
                  <View style={styles.switchTag}><Text style={styles.switchTagTxt}>Switch</Text></View>
                )}
              </PressableScale>
            );
          })}
          <PressableScale style={styles.addChild} onPress={linkChild}>
            <Icon name="group" size={16} color={Colors.primaryDark} />
            <Text style={styles.addChildTxt}>Link another child</Text>
          </PressableScale>
        </Entrance>

        {/* Account */}
        <Entrance index={3} style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingRow icon="user" label="Personal details" sub="Name, email, phone" onPress={() => navigation.navigate('ParentEditProfile')} />
          <SettingRow icon="bell" label="Contact & notifications" sub="What you get alerted about" onPress={() => navigation.navigate('ParentNotifications')} />
          <SettingRow icon="card" label="Fees & payments" sub="View dues and history" onPress={() => navigation.navigate('ParentFees')} />
          <SettingRow icon="flag" label="Language" sub="English" onPress={() => navigation.navigate('Language')} />
        </Entrance>

        {/* Support */}
        <Entrance index={4} style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <SettingRow icon="help" label="Help & support" onPress={() => Linking.openURL(`${Env.apiOrigin}/help`)} />
          <SettingRow icon="document" label="Terms & policies" onPress={() => Linking.openURL(`${Env.apiOrigin}/terms`)} />
          <SettingRow icon="chat" label="Contact school" onPress={() => Linking.openURL('tel:+911140000000')} />
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
  iconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(196,149,96,0.15)', borderWidth: 1, borderColor: 'rgba(196,149,96,0.25)', alignItems: 'center', justifyContent: 'center' },

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

  childCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border2, padding: 12, ...Shadow.sm },
  childCardActive: { borderColor: 'rgba(196,149,96,0.45)', backgroundColor: Colors.primaryLight },
  childAvatar: { width: 46, height: 46, borderRadius: 14, backgroundColor: Colors.bg2, alignItems: 'center', justifyContent: 'center' },
  childAvatarActive: { backgroundColor: Colors.primary },
  childInitials: { fontSize: 15, fontWeight: '900', color: Colors.text2 },
  childName: { fontSize: 14, fontWeight: '800', color: Colors.text },
  childMeta: { fontSize: 11, color: Colors.text2, marginTop: 2 },
  activeTag: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  activeTagTxt: { fontSize: 10, fontWeight: '800', color: Colors.brand },
  switchTag: { backgroundColor: Colors.bg2, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  switchTagTxt: { fontSize: 10, fontWeight: '800', color: Colors.text2 },
  addChild: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13, borderRadius: Radius.md, borderWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(196,149,96,0.4)' },
  addChildTxt: { fontSize: 12.5, fontWeight: '800', color: Colors.primaryDark },

  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border2, paddingVertical: 12, paddingHorizontal: 12, ...Shadow.sm },
  settingIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: Colors.bg2, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { fontSize: 13, fontWeight: '700', color: Colors.text },
  settingSub: { fontSize: 11, color: Colors.text2, marginTop: 1 },
  chevron: { fontSize: 20, color: Colors.text3 },
  version: { fontSize: 11, color: Colors.text3, textAlign: 'center', marginTop: 8 },
});
