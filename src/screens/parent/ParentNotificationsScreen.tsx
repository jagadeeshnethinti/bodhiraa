/**
 * Parent · Contact & notifications — working toggle switches for what the parent
 * is alerted about, plus contact channels. Premium gradient-header sheet. Toggle
 * state is local for now (wires to a preferences endpoint in v1).
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, Switch } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../theme';
import { Entrance } from '../../components/common/anim';
import { GlowBlob } from '../../components/illustrations/OnboardingArt';
import { Icon, IconName } from '../../components/common/Icon';

type Key = 'attendance' | 'grades' | 'fees' | 'announcements' | 'ai' | 'push' | 'email' | 'sms';

const ALERTS: { key: Key; icon: IconName; title: string; sub: string }[] = [
  { key: 'attendance', icon: 'calendar', title: 'Attendance alerts', sub: 'When your child is marked absent or late' },
  { key: 'grades', icon: 'chart', title: 'New grades & reports', sub: 'Quiz scores and term report cards' },
  { key: 'fees', icon: 'card', title: 'Fees & payments', sub: 'Due dates and payment receipts' },
  { key: 'announcements', icon: 'megaphone', title: 'School announcements', sub: 'Notices, holidays and events' },
  { key: 'ai', icon: 'robot', title: 'AI weekly insights', sub: 'Personalised learning suggestions' },
];

const CHANNELS: { key: Key; icon: IconName; title: string }[] = [
  { key: 'push', icon: 'bell', title: 'Push notifications' },
  { key: 'email', icon: 'document', title: 'Email' },
  { key: 'sms', icon: 'phone', title: 'SMS' },
];

export const ParentNotificationsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [on, setOn] = useState<Record<Key, boolean>>({
    attendance: true, grades: true, fees: true, announcements: false, ai: true,
    push: true, email: true, sms: false,
  });
  const toggle = (k: Key) => setOn(prev => ({ ...prev, [k]: !prev[k] }));

  const renderRow = (icon: IconName, title: string, sub: string | null, k: Key) => (
    <View key={k} style={styles.row}>
      <View style={styles.rowIcon}><Icon name={icon} size={17} color={Colors.primaryDark} /></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
      </View>
      <Switch
        value={on[k]}
        onValueChange={() => toggle(k)}
        trackColor={{ false: Colors.border, true: Colors.primary }}
        thumbColor={Colors.white}
        ios_backgroundColor={Colors.border}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A0A0C" />

      <LinearGradient colors={['#1A0A0C', '#2A0E13', '#3D1520']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroGlow} pointerEvents="none"><GlowBlob size={220} /></View>
        <SafeAreaView edges={['top']}>
          <View style={styles.topbar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={8}><Text style={styles.backIcon}>‹</Text></TouchableOpacity>
            <View style={{ width: 40 }} />
          </View>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>Choose what you want to hear about</Text>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.sheet} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Entrance index={0}><Text style={styles.sectionTitle}>Alert me about</Text></Entrance>
        <Entrance index={1} style={styles.card}>
          {ALERTS.map((a, i) => (
            <View key={a.key} style={i < ALERTS.length - 1 ? styles.divider : undefined}>
              {renderRow(a.icon, a.title, a.sub, a.key)}
            </View>
          ))}
        </Entrance>

        <Entrance index={2}><Text style={[styles.sectionTitle, { marginTop: 8 }]}>Delivery channels</Text></Entrance>
        <Entrance index={3} style={styles.card}>
          {CHANNELS.map((c, i) => (
            <View key={c.key} style={i < CHANNELS.length - 1 ? styles.divider : undefined}>
              {renderRow(c.icon, c.title, null, c.key)}
            </View>
          ))}
        </Entrance>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A0A0C' },
  hero: { paddingHorizontal: 16, paddingBottom: 26, overflow: 'hidden' },
  heroGlow: { position: 'absolute', top: -70, right: -40, opacity: 0.8 },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(196,149,96,0.15)', borderWidth: 1, borderColor: 'rgba(196,149,96,0.25)', alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 26, color: Colors.primary, fontWeight: '300', marginTop: -2 },
  title: { fontSize: 22, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.4, marginTop: 8 },
  subtitle: { fontSize: 12.5, color: 'rgba(245,232,208,0.65)', marginTop: 4 },

  sheet: { flex: 1, backgroundColor: Colors.bg, marginTop: -16, borderTopLeftRadius: 26, borderTopRightRadius: 26 },
  content: { padding: 16, paddingTop: 22, gap: 10, paddingBottom: 32 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  card: { backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border2, paddingHorizontal: 14, ...Shadow.sm },
  divider: { borderBottomWidth: 1, borderBottomColor: Colors.border2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  rowIcon: { width: 38, height: 38, borderRadius: 11, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: 13.5, fontWeight: '700', color: Colors.text },
  rowSub: { fontSize: 11, color: Colors.text2, marginTop: 2, lineHeight: 15 },
});
