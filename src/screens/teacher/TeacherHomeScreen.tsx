import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../theme';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Icon, IconName } from '../../components/common/Icon';

const classes = [
  { name: 'Class 11-A · Physics',   students: 42, pending: 3, pct: 78 },
  { name: 'Class 12-B · Chemistry', students: 38, pending: 7, pct: 65 },
  { name: 'Class 10-C · Maths',     students: 45, pending: 1, pct: 88 },
];

export const TeacherHomeScreen: React.FC = () => (
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
            <Text style={styles.greeting}>Good Morning</Text>
            <Text style={styles.name}>Dr. Meera Sharma</Text>
          </View>
          <View style={styles.avatar}><Text style={styles.avatarText}>M</Text></View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statItem}><Text style={styles.statVal}>3</Text><Text style={styles.statLbl}>CLASSES</Text></View>
          <View style={styles.statSep} />
          <View style={styles.statItem}><Text style={styles.statVal}>125</Text><Text style={styles.statLbl}>STUDENTS</Text></View>
          <View style={styles.statSep} />
          <View style={styles.statItem}><Text style={styles.statVal}>11</Text><Text style={styles.statLbl}>PENDING</Text></View>
          <View style={styles.statSep} />
          <View style={styles.statItem}><Text style={[styles.statVal, { color: Colors.success }]}>76%</Text><Text style={styles.statLbl}>AVG SCORE</Text></View>
        </View>
      </SafeAreaView>
    </LinearGradient>

    {/* Scrollable body with bottom safe area */}
    <SafeAreaView style={styles.body} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Pending tasks */}
        <View style={styles.alertCard}>
          <Icon name="warning" size={18} color={Colors.warning} />
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>11 assignments need review</Text>
            <Text style={styles.alertSub}>3 overdue · Tap to review</Text>
          </View>
          <TouchableOpacity style={styles.alertBtn}>
            <Text style={styles.alertBtnText}>Review</Text>
          </TouchableOpacity>
        </View>

        {/* My Classes */}
        <Text style={styles.sectionTitle}>My Classes</Text>
        {classes.map((c, i) => (
          <TouchableOpacity key={i} style={styles.classCard} activeOpacity={0.85}>
            <View style={styles.classLeft}>
              <View style={styles.classIcon}><Icon name="library" size={20} color={Colors.primary} /></View>
              <View>
                <Text style={styles.className}>{c.name}</Text>
                <Text style={styles.classMeta}>{c.students} students · {c.pending} pending</Text>
                <ProgressBar value={c.pct} variant="primary" height={3} style={{ marginTop: 6, width: 120 }} />
              </View>
            </View>
            <Text style={[styles.classPct, { color: c.pct >= 75 ? Colors.success : Colors.warning }]}>{c.pct}%</Text>
          </TouchableOpacity>
        ))}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {([
            { icon: 'edit',   label: 'Create Quiz' },
            { icon: 'upload', label: 'Upload Content' },
            { icon: 'chart',  label: 'Analytics' },
            { icon: 'chat',   label: 'Announcements' },
          ] as { icon: IconName; label: string }[]).map((a, i) => (
            <TouchableOpacity key={i} style={styles.actionTile}>
              <Icon name={a.icon} size={28} color={Colors.primary} />
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* AI Insights */}
        <View style={styles.aiCard}>
          <Icon name="robot" size={18} color={Colors.primary} />
          <View style={styles.aiContent}>
            <Text style={styles.aiTitle}>AI Class Insights</Text>
            <Text style={styles.aiText}>
              Class 11-A struggles with wave optics. Consider a revision session. 68% of students scored below 60% in last quiz.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header:    { paddingHorizontal: 16, paddingBottom: 20 },
  body:      { flex: 1 },
  topbar:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 8, marginBottom: 20 },
  greeting:  { fontSize: 12, color: 'rgba(245,232,208,0.7)', fontWeight: '600' },
  name:      { fontSize: 20, fontWeight: '900', color: '#F5E8D0' },
  avatar:    { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText:{ fontSize: 16, fontWeight: '900', color: Colors.brand },
  statsRow:  { flexDirection: 'row', gap: 0 },
  statItem:  { flex: 1, alignItems: 'center' },
  statVal:   { fontSize: 18, fontWeight: '900', color: Colors.primary },
  statLbl:   { fontSize: 9, fontWeight: '600', color: 'rgba(245,232,208,0.6)', letterSpacing: 0.3 },
  statSep:   { width: 1, backgroundColor: 'rgba(196,149,96,0.2)', marginVertical: 4 },
  scroll:    { padding: 16, gap: 12, paddingBottom: 32 },
  alertCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.warningLight, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.warning + '44', padding: 14,
  },
  alertContent:  { flex: 1 },
  alertTitle:    { fontSize: 13, fontWeight: '700', color: Colors.text },
  alertSub:      { fontSize: 11, color: Colors.text2, marginTop: 1 },
  alertBtn:      { paddingHorizontal: 12, paddingVertical: 7, backgroundColor: Colors.warning, borderRadius: Radius.full },
  alertBtnText:  { fontSize: 11, fontWeight: '700', color: Colors.white },
  sectionTitle:  { fontSize: 15, fontWeight: '700', color: Colors.text },
  classCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.white, borderRadius: Radius.md, padding: 14,
    borderWidth: 1, borderColor: Colors.border2, ...Shadow.sm,
  },
  classLeft:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  classIcon:   { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  className:   { fontSize: 13, fontWeight: '700', color: Colors.text },
  classMeta:   { fontSize: 11, color: Colors.text2, marginTop: 1 },
  classPct:    { fontSize: 16, fontWeight: '800' },
  actionsGrid: { flexDirection: 'row', gap: 8 },
  actionTile: {
    flex: 1, alignItems: 'center', paddingVertical: 16, gap: 6,
    backgroundColor: Colors.white, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border2, ...Shadow.sm,
  },
  actionLabel: { fontSize: 10, fontWeight: '600', color: Colors.text, textAlign: 'center' },
  aiCard: {
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
    backgroundColor: Colors.primaryLight, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: 'rgba(196,149,96,0.2)', padding: 14,
  },
  aiContent: { flex: 1 },
  aiTitle:   { fontSize: 12, fontWeight: '700', color: Colors.primary, marginBottom: 4 },
  aiText:    { fontSize: 11, color: Colors.text, lineHeight: 17 },
});
