import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../theme';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Icon, IconName } from '../../components/common/Icon';

export const ParentHomeScreen: React.FC = () => (
  <View style={styles.container}>
    <StatusBar barStyle="light-content" backgroundColor="#1A0A0C" />

    {/* Gradient header with top safe area */}
    <LinearGradient
      colors={['#1A0A0C', '#2A0E13', '#3D1520']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.topbar}>
          <View>
            <Text style={styles.greeting}>Hello</Text>
            <Text style={styles.name}>Rajesh Sharma</Text>
          </View>
          <View style={styles.avatar}><Text style={styles.avatarText}>R</Text></View>
        </View>
      </SafeAreaView>
    </LinearGradient>

    {/* Scrollable body with bottom safe area */}
    <SafeAreaView style={styles.body} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Child card */}
        <View style={styles.childCard}>
          <View style={styles.childAvatar}><Icon name="school" size={28} color={Colors.primary} /></View>
          <View style={styles.childInfo}>
            <Text style={styles.childName}>Arjun Sharma</Text>
            <Text style={styles.childMeta}>Class 11-A · Delhi Public School</Text>
            <View style={styles.childStats}>
              <View style={styles.childStat}>
                <Text style={styles.childStatVal}>72%</Text>
                <Text style={styles.childStatLbl}>Avg Score</Text>
              </View>
              <View style={styles.childStat}>
                <View style={styles.streakRow}>
                  <Icon name="fire" size={14} color={Colors.warning} />
                  <Text style={styles.childStatVal}>14</Text>
                </View>
                <Text style={styles.childStatLbl}>Streak</Text>
              </View>
              <View style={styles.childStat}>
                <Text style={styles.childStatVal}>92%</Text>
                <Text style={styles.childStatLbl}>Attendance</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Alerts */}
        <View style={styles.alertCard}>
          <Icon name="warning" size={18} color={Colors.warning} />
          <View style={styles.alertInfo}>
            <Text style={styles.alertTitle}>Weak in Organic Chemistry</Text>
            <Text style={styles.alertSub}>AI suggests extra practice sessions</Text>
          </View>
          <TouchableOpacity style={styles.alertBtn}>
            <Text style={styles.alertBtnTxt}>View</Text>
          </TouchableOpacity>
        </View>

        {/* Subject progress */}
        <Text style={styles.sectionTitle}>Subject Performance</Text>
        {[
          { icon: 'flask'      as IconName, name: 'Chemistry',  pct: 62, variant: 'warning' as const },
          { icon: 'calculator' as IconName, name: 'Mathematics', pct: 78, variant: 'success' as const },
          { icon: 'microscope' as IconName, name: 'Physics',     pct: 55, variant: 'warning' as const },
          { icon: 'book'       as IconName, name: 'English',     pct: 91, variant: 'teal'    as const },
        ].map((s, i) => (
          <View key={i} style={styles.subjectRow}>
            <Icon name={s.icon} size={20} color={Colors.primary} />
            <View style={styles.subjectContent}>
              <View style={styles.subjectHeader}>
                <Text style={styles.subjectName}>{s.name}</Text>
                <Text style={[styles.subjectPct, {
                  color: s.pct >= 70 ? Colors.success : Colors.warning
                }]}>{s.pct}%</Text>
              </View>
              <ProgressBar value={s.pct} variant={s.variant} height={4} />
            </View>
          </View>
        ))}

        {/* Quick actions */}
        <View style={styles.actionsGrid}>
          {([
            { icon: 'chart',     label: "Child's Progress" },
            { icon: 'calendar',  label: 'Attendance' },
            { icon: 'clipboard', label: 'Reports' },
            { icon: 'chat',      label: 'Contact Teacher' },
          ] as { icon: IconName; label: string }[]).map((a, i) => (
            <TouchableOpacity key={i} style={styles.actionTile}>
              <Icon name={a.icon} size={28} color={Colors.primary} />
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header:    { paddingHorizontal: 16, paddingBottom: 20 },
  body:      { flex: 1 },
  topbar:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 8 },
  greeting:  { fontSize: 12, color: 'rgba(245,232,208,0.7)', fontWeight: '600' },
  name:      { fontSize: 20, fontWeight: '900', color: '#F5E8D0' },
  avatar:    { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText:{ fontSize: 16, fontWeight: '900', color: Colors.brand },
  scroll:    { padding: 16, gap: 12, paddingBottom: 32 },
  childCard: {
    flexDirection: 'row', gap: 14,
    backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 16,
    borderWidth: 1, borderColor: Colors.border2, ...Shadow.md,
  },
  childAvatar: {
    width: 60, height: 60, borderRadius: 16,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  childInfo:     { flex: 1 },
  childName:     { fontSize: 16, fontWeight: '800', color: Colors.text },
  childMeta:     { fontSize: 11, color: Colors.text2, marginTop: 2, marginBottom: 10 },
  childStats:    { flexDirection: 'row', gap: 16 },
  childStat:     { alignItems: 'center' },
  streakRow:     { flexDirection: 'row', alignItems: 'center', gap: 3 },
  childStatVal:  { fontSize: 15, fontWeight: '800', color: Colors.text },
  childStatLbl:  { fontSize: 9, color: Colors.text3, fontWeight: '600', marginTop: 2 },
  alertCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.warningLight, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.warning + '44', padding: 12,
  },
  alertInfo:    { flex: 1 },
  alertTitle:   { fontSize: 13, fontWeight: '700', color: Colors.text },
  alertSub:     { fontSize: 11, color: Colors.text2 },
  alertBtn:     { paddingHorizontal: 10, paddingVertical: 5, backgroundColor: Colors.warning, borderRadius: Radius.full },
  alertBtnTxt:  { fontSize: 11, fontWeight: '700', color: Colors.white },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  subjectRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.white, borderRadius: Radius.md, padding: 12,
    borderWidth: 1, borderColor: Colors.border2, ...Shadow.sm,
  },
  subjectContent: { flex: 1, gap: 6 },
  subjectHeader:  { flexDirection: 'row', justifyContent: 'space-between' },
  subjectName:    { fontSize: 13, fontWeight: '700', color: Colors.text },
  subjectPct:     { fontSize: 13, fontWeight: '800' },
  actionsGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionTile: {
    width: '47%', alignItems: 'center', paddingVertical: 16, gap: 6,
    backgroundColor: Colors.white, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border2, ...Shadow.sm,
  },
  actionLabel: { fontSize: 11, fontWeight: '600', color: Colors.text, textAlign: 'center' },
});
