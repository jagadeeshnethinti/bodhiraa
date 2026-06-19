/**
 * Admin · Dashboard — premium school control center: gradient hero with a glass
 * school-average ring + stat strip, pending-approvals alert, today's snapshot,
 * management quick actions, class performance and an AI insight. Static mock.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../theme';
import { ProgressBar } from '../../components/common/ProgressBar';
import { CircularProgress } from '../../components/common/CircularProgress';
import { AIBubble } from '../../components/common/AIBubble';
import { BoldIcon as Icon, BoldIconName as IconName } from '../../components/common/BoldIcon';
import { Entrance, PressableScale, AnimatedCounter, Pulse, Shimmer } from '../../components/common/anim';
import { GlowBlob } from '../../components/illustrations/OnboardingArt';

const AVG = 74;
const TODAY: { icon: IconName; value: string; label: string; color: string; tint: string }[] = [
  { icon: 'attendance', value: '94%', label: 'Attendance', color: Colors.success, tint: '#EDFAF4' },
  { icon: 'card', value: '88%', label: 'Fees paid', color: Colors.primaryDark, tint: '#FDF4E8' },
  { icon: 'video', value: '12', label: 'Live classes', color: '#2F4DA0', tint: '#EAF2FF' },
];
const ACTIONS: { icon: IconName; label: string; tint: string }[] = [
  { icon: 'user', label: 'Add student', tint: '#FDF4E8' },
  { icon: 'teacher', label: 'Add teacher', tint: '#EDFAF4' },
  { icon: 'school', label: 'Classes', tint: '#EAF2FF' },
  { icon: 'chart', label: 'Analytics', tint: '#F3E8FF' },
  { icon: 'megaphone', label: 'Announce', tint: '#FFF8ED' },
  { icon: 'clipboard', label: 'Reports', tint: '#FEF2F2' },
];
const CLASSES: { cls: string; students: number; avg: number; variant: 'success' | 'warning' | 'teal' }[] = [
  { cls: 'Class 12-A', students: 45, avg: 82, variant: 'success' },
  { cls: 'Class 11-B', students: 42, avg: 74, variant: 'teal' },
  { cls: 'Class 10-C', students: 48, avg: 68, variant: 'warning' },
];

export const AdminHomeScreen: React.FC<{ navigation: any }> = () => (
  <View style={styles.container}>
    <StatusBar barStyle="light-content" backgroundColor="#1A0A0C" />

    <LinearGradient colors={['#1A0A0C', '#2A0E13', '#3D1520']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
      <View style={styles.heroGlow} pointerEvents="none"><GlowBlob size={240} /></View>
      <SafeAreaView edges={['top']}>
        <View style={styles.topRow}>
          <View style={styles.userRow}>
            <View style={styles.avatar}><Text style={styles.avatarText}>DPS</Text></View>
            <View>
              <Text style={styles.helloLabel}>SCHOOL ADMIN</Text>
              <Text style={styles.helloName} numberOfLines={1}>Delhi Public School</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.bellBtn} activeOpacity={0.8}>
            <Icon name="bell" size={18} color={Colors.primary} />
            <View style={styles.bellDot} />
          </TouchableOpacity>
        </View>

        <Entrance index={0} style={styles.heroCard}>
          <Shimmer />
          <CircularProgress size={92} strokeWidth={9} progress={AVG} trackColor="rgba(245,232,208,0.14)">
            <View style={styles.ringCenter}>
              <AnimatedCounter value={`${AVG}%`} style={styles.ringPct} />
              <Text style={styles.ringLbl}>School avg</Text>
            </View>
          </CircularProgress>
          <View style={styles.heroStats}>
            <HeroStat value="1,248" label="Students" />
            <View style={styles.statDivider} />
            <HeroStat value="68" label="Teachers" />
            <View style={styles.statDivider} />
            <HeroStat value="42" label="Classes" />
          </View>
        </Entrance>
      </SafeAreaView>
    </LinearGradient>

    <ScrollView style={styles.sheet} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Pending approvals */}
      <Entrance index={0}>
        <PressableScale style={styles.alertCard}>
          <Pulse style={styles.alertIcon}><Icon name="teacher" size={18} color={Colors.primaryDark} /></Pulse>
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>3 teacher registrations pending</Text>
            <Text style={styles.alertSub}>Approval required · tap to review</Text>
          </View>
          <View style={styles.alertBtn}><Text style={styles.alertBtnTxt}>Review</Text></View>
        </PressableScale>
      </Entrance>

      {/* Today snapshot */}
      <Entrance index={1} style={styles.todayGrid}>
        {TODAY.map(t => (
          <View key={t.label} style={styles.todayTile}>
            <View style={[styles.todayIcon, { backgroundColor: t.tint }]}><Icon name={t.icon} size={15} color={t.color} /></View>
            <Text style={[styles.todayVal, { color: t.color }]}>{t.value}</Text>
            <Text style={styles.todayLbl}>{t.label}</Text>
          </View>
        ))}
      </Entrance>

      {/* Management */}
      <Entrance index={2}><Text style={styles.sectionTitle}>Management</Text></Entrance>
      <Entrance index={3} style={styles.actionsGrid}>
        {ACTIONS.map(a => (
          <PressableScale key={a.label} style={styles.actionTile}>
            <View style={[styles.actionIcon, { backgroundColor: a.tint }]}><Icon name={a.icon} size={22} color={Colors.primaryDark} /></View>
            <Text style={styles.actionLabel}>{a.label}</Text>
          </PressableScale>
        ))}
      </Entrance>

      {/* Class performance */}
      <Entrance index={4}><Text style={[styles.sectionTitle, { marginTop: 4 }]}>Class performance</Text></Entrance>
      {CLASSES.map((c, i) => (
        <Entrance key={c.cls} index={5 + i}>
          <PressableScale style={styles.classCard}>
            <View style={styles.classIcon}><Icon name="library" size={20} color={Colors.primaryDark} /></View>
            <View style={{ flex: 1, gap: 6 }}>
              <View style={styles.classTop}>
                <Text style={styles.className}>{c.cls}</Text>
                <Text style={[styles.classPct, { color: c.avg >= 75 ? Colors.success : Colors.warning }]}>{c.avg}%</Text>
              </View>
              <ProgressBar value={c.avg} variant={c.variant} height={6} />
              <Text style={styles.classMeta}>{c.students} students</Text>
            </View>
          </PressableScale>
        </Entrance>
      ))}

      {/* AI insight */}
      <Entrance index={8}>
        <AIBubble
          title="Bodhira AI · School insight"
          message="Average attendance dipped 4% this week, led by Class 10-C. Fee collection is on track at 88%."
          actions={[{ label: 'View analytics', variant: 'primary' }, { label: 'Dismiss', variant: 'gray' }]}
        />
      </Entrance>
    </ScrollView>
  </View>
);

const HeroStat: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <View style={styles.heroStat}>
    <AnimatedCounter value={value} style={styles.heroStatVal} />
    <Text style={styles.heroStatLbl}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A0A0C' },

  hero: { paddingHorizontal: 16, paddingBottom: 34, overflow: 'hidden' },
  heroGlow: { position: 'absolute', top: -70, right: -50, opacity: 0.8 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4, marginBottom: 18 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatar: { height: 46, paddingHorizontal: 12, borderRadius: 15, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 14, fontWeight: '900', color: Colors.brand },
  helloLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(196,149,96,0.8)', letterSpacing: 1 },
  helloName: { fontSize: 18, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.3, marginTop: 1 },
  bellBtn: { width: 42, height: 42, borderRadius: 13, backgroundColor: 'rgba(196,149,96,0.16)', borderWidth: 1, borderColor: 'rgba(196,149,96,0.25)', alignItems: 'center', justifyContent: 'center' },
  bellDot: { position: 'absolute', top: 9, right: 9, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.danger, borderWidth: 1.5, borderColor: '#2A0E13' },

  heroCard: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: 'rgba(245,232,208,0.07)', borderWidth: 1, borderColor: 'rgba(196,149,96,0.22)', borderRadius: Radius.xl, padding: 16, overflow: 'hidden' },
  ringCenter: { alignItems: 'center', justifyContent: 'center' },
  ringPct: { fontSize: 18, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.5 },
  ringLbl: { fontSize: 8.5, fontWeight: '700', color: 'rgba(245,232,208,0.6)', letterSpacing: 0.5, marginTop: 1 },
  heroStats: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatVal: { fontSize: 17, fontWeight: '900', color: '#F5E8D0' },
  heroStatLbl: { fontSize: 9.5, color: 'rgba(245,232,208,0.6)', fontWeight: '600', marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: 'rgba(196,149,96,0.2)' },

  sheet: { flex: 1, backgroundColor: Colors.bg, marginTop: -22, borderTopLeftRadius: 26, borderTopRightRadius: 26 },
  content: { padding: 16, paddingTop: 22, gap: 12, paddingBottom: 28 },

  alertCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.primaryLight, borderRadius: Radius.lg, borderWidth: 1, borderColor: 'rgba(196,149,96,0.3)', padding: 14 },
  alertIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center' },
  alertTitle: { fontSize: 13.5, fontWeight: '800', color: Colors.text },
  alertSub: { fontSize: 11, color: Colors.text2, marginTop: 2 },
  alertBtn: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingHorizontal: 14, paddingVertical: 8 },
  alertBtnTxt: { fontSize: 11, fontWeight: '800', color: Colors.brand },

  todayGrid: { flexDirection: 'row', gap: 8 },
  todayTile: { flex: 1, alignItems: 'center', gap: 5, paddingVertical: 13, backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border2, ...Shadow.sm },
  todayIcon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  todayVal: { fontSize: 17, fontWeight: '900' },
  todayLbl: { fontSize: 9.5, color: Colors.text3, fontWeight: '700' },

  sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.text },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionTile: { width: '31.5%', alignItems: 'center', paddingVertical: 14, gap: 7, backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border2, ...Shadow.sm },
  actionIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 10, fontWeight: '700', color: Colors.text, textAlign: 'center' },

  classCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border2, padding: 12, ...Shadow.sm },
  classIcon: { width: 46, height: 46, borderRadius: 13, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  classTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  className: { fontSize: 13.5, fontWeight: '800', color: Colors.text },
  classPct: { fontSize: 14, fontWeight: '900' },
  classMeta: { fontSize: 11, color: Colors.text2 },
});
