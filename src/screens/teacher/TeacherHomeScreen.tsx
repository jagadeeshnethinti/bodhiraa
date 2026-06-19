/**
 * Teacher · Dashboard — premium home: a gradient hero with a glass class-average
 * ring + stat strip, a pending-review alert, today's schedule, class cards,
 * quick actions and an AI class insight. Animated throughout. Static mock data.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../theme';
import { ProgressBar } from '../../components/common/ProgressBar';
import { CircularProgress } from '../../components/common/CircularProgress';
import { AIBubble } from '../../components/common/AIBubble';
import { Icon, IconName } from '../../components/common/Icon';
import { Entrance, PressableScale, AnimatedCounter, Pulse, Shimmer } from '../../components/common/anim';
import { GlowBlob } from '../../components/illustrations/OnboardingArt';
import { useAuth } from '../../context/AuthContext';
import { initials } from '../../utils/ui';

const AVG = 76;
const SCHEDULE: { time: string; cls: string; room: string; live: boolean }[] = [
  { time: '09:00', cls: 'Physics · 11-A', room: 'Lab 2', live: true },
  { time: '11:30', cls: 'Chemistry · 12-B', room: 'Room 14', live: false },
  { time: '02:00', cls: 'Maths · 10-C', room: 'Room 7', live: false },
];
const CLASSES: { name: string; students: number; pending: number; pct: number }[] = [
  { name: 'Class 11-A · Physics', students: 42, pending: 3, pct: 78 },
  { name: 'Class 12-B · Chemistry', students: 38, pending: 7, pct: 65 },
  { name: 'Class 10-C · Maths', students: 45, pending: 1, pct: 88 },
];
const ACTIONS: { icon: IconName; label: string; tint: string }[] = [
  { icon: 'edit', label: 'Create quiz', tint: '#F3E8FF' },
  { icon: 'upload', label: 'Upload', tint: '#EDFAF4' },
  { icon: 'chart', label: 'Analytics', tint: '#EAF2FF' },
  { icon: 'megaphone', label: 'Announce', tint: '#FFF8ED' },
];

export const TeacherHomeScreen: React.FC<{ navigation: any }> = () => {
  const { user } = useAuth();
  const name = user?.name ?? 'Dr. Meera Sharma';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A0A0C" />

      <LinearGradient colors={['#1A0A0C', '#2A0E13', '#3D1520']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroGlow} pointerEvents="none"><GlowBlob size={240} /></View>
        <SafeAreaView edges={['top']}>
          <View style={styles.topRow}>
            <View style={styles.userRow}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{initials(name)}</Text></View>
              <View>
                <Text style={styles.helloLabel}>GOOD MORNING</Text>
                <Text style={styles.helloName} numberOfLines={1}>{name}</Text>
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
                <Text style={styles.ringLbl}>Class avg</Text>
              </View>
            </CircularProgress>
            <View style={styles.heroStats}>
              <HeroStat value="3" label="Classes" />
              <View style={styles.statDivider} />
              <HeroStat value="125" label="Students" />
              <View style={styles.statDivider} />
              <HeroStat value="11" label="Pending" warn />
            </View>
          </Entrance>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.sheet} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Pending alert */}
        <Entrance index={0}>
          <PressableScale style={styles.alertCard}>
            <Pulse style={styles.alertIcon}><Icon name="clipboard" size={18} color={Colors.warning} /></Pulse>
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>11 assignments need review</Text>
              <Text style={styles.alertSub}>3 overdue · tap to grade</Text>
            </View>
            <View style={styles.alertBtn}><Text style={styles.alertBtnTxt}>Review</Text></View>
          </PressableScale>
        </Entrance>

        {/* Today's schedule */}
        <Entrance index={1}><Text style={styles.sectionTitle}>Today's schedule</Text></Entrance>
        <Entrance index={2} style={styles.scheduleCard}>
          {SCHEDULE.map((s, i) => (
            <View key={i} style={[styles.periodRow, i < SCHEDULE.length - 1 && styles.divider]}>
              <View style={styles.timeCol}><Text style={styles.timeTxt}>{s.time}</Text></View>
              <View style={styles.periodBar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.periodCls}>{s.cls}</Text>
                <Text style={styles.periodRoom}>{s.room}</Text>
              </View>
              {s.live ? (
                <View style={styles.liveBadge}><Text style={styles.liveTxt}>LIVE</Text></View>
              ) : (
                <Text style={styles.chevron}>›</Text>
              )}
            </View>
          ))}
        </Entrance>

        {/* Classes */}
        <Entrance index={3}><Text style={[styles.sectionTitle, { marginTop: 4 }]}>My classes</Text></Entrance>
        {CLASSES.map((c, i) => (
          <Entrance key={c.name} index={4 + i}>
            <PressableScale style={styles.classCard}>
              <View style={styles.classIcon}><Icon name="library" size={20} color={Colors.primaryDark} /></View>
              <View style={{ flex: 1, gap: 6 }}>
                <View style={styles.classTop}>
                  <Text style={styles.className}>{c.name}</Text>
                  {c.pending > 0 && <View style={styles.pendingPill}><Text style={styles.pendingTxt}>{c.pending}</Text></View>}
                </View>
                <View style={styles.classBarRow}>
                  <ProgressBar value={c.pct} variant={c.pct >= 75 ? 'success' : 'warning'} height={6} style={styles.classTrack} />
                  <Text style={[styles.classPct, { color: c.pct >= 75 ? Colors.success : Colors.warning }]}>{c.pct}%</Text>
                </View>
                <Text style={styles.classMeta}>{c.students} students</Text>
              </View>
            </PressableScale>
          </Entrance>
        ))}

        {/* Quick actions */}
        <Entrance index={7}><Text style={[styles.sectionTitle, { marginTop: 4 }]}>Quick actions</Text></Entrance>
        <Entrance index={8} style={styles.actionsGrid}>
          {ACTIONS.map(a => (
            <PressableScale key={a.label} style={styles.actionTile}>
              <View style={[styles.actionIcon, { backgroundColor: a.tint }]}><Icon name={a.icon} size={22} color={Colors.primaryDark} /></View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </PressableScale>
          ))}
        </Entrance>

        {/* AI insight */}
        <Entrance index={9}>
          <AIBubble
            title="Bodhira AI · Class insight"
            message="Class 11-A is struggling with wave optics — 68% scored below 60% in the last quiz. A short revision session could help."
            actions={[{ label: 'Plan revision', variant: 'primary' }, { label: 'Dismiss', variant: 'gray' }]}
          />
        </Entrance>
      </ScrollView>
    </View>
  );
};

const HeroStat: React.FC<{ value: string; label: string; warn?: boolean }> = ({ value, label, warn }) => (
  <View style={styles.heroStat}>
    <AnimatedCounter value={value} style={[styles.heroStatVal, warn && { color: Colors.warning }]} />
    <Text style={styles.heroStatLbl}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A0A0C' },

  hero: { paddingHorizontal: 16, paddingBottom: 34, overflow: 'hidden' },
  heroGlow: { position: 'absolute', top: -70, right: -50, opacity: 0.8 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4, marginBottom: 18 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatar: { width: 46, height: 46, borderRadius: 15, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '900', color: Colors.brand },
  helloLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(196,149,96,0.8)', letterSpacing: 1 },
  helloName: { fontSize: 18, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.3, marginTop: 1 },
  bellBtn: { width: 42, height: 42, borderRadius: 13, backgroundColor: 'rgba(196,149,96,0.16)', borderWidth: 1, borderColor: 'rgba(196,149,96,0.25)', alignItems: 'center', justifyContent: 'center' },
  bellDot: { position: 'absolute', top: 9, right: 9, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.danger, borderWidth: 1.5, borderColor: '#2A0E13' },

  heroCard: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: 'rgba(245,232,208,0.07)', borderWidth: 1, borderColor: 'rgba(196,149,96,0.22)', borderRadius: Radius.xl, padding: 16, overflow: 'hidden' },
  ringCenter: { alignItems: 'center', justifyContent: 'center' },
  ringPct: { fontSize: 19, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.5 },
  ringLbl: { fontSize: 9, fontWeight: '700', color: 'rgba(245,232,208,0.6)', letterSpacing: 0.5, marginTop: 1 },
  heroStats: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatVal: { fontSize: 18, fontWeight: '900', color: '#F5E8D0' },
  heroStatLbl: { fontSize: 9.5, color: 'rgba(245,232,208,0.6)', fontWeight: '600', marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: 'rgba(196,149,96,0.2)' },

  sheet: { flex: 1, backgroundColor: Colors.bg, marginTop: -22, borderTopLeftRadius: 26, borderTopRightRadius: 26 },
  content: { padding: 16, paddingTop: 22, gap: 12, paddingBottom: 28 },

  alertCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.warningLight, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.warning + '40', padding: 14 },
  alertIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center' },
  alertTitle: { fontSize: 13.5, fontWeight: '800', color: Colors.text },
  alertSub: { fontSize: 11, color: Colors.text2, marginTop: 2 },
  alertBtn: { backgroundColor: Colors.warning, borderRadius: Radius.full, paddingHorizontal: 14, paddingVertical: 8 },
  alertBtnTxt: { fontSize: 11, fontWeight: '800', color: Colors.white },

  sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.text },

  scheduleCard: { backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border2, paddingHorizontal: 14, ...Shadow.sm },
  periodRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  divider: { borderBottomWidth: 1, borderBottomColor: Colors.border2 },
  timeCol: { width: 46 },
  timeTxt: { fontSize: 12, fontWeight: '800', color: Colors.primaryDark },
  periodBar: { width: 3, height: 30, borderRadius: 2, backgroundColor: Colors.primary },
  periodCls: { fontSize: 13, fontWeight: '700', color: Colors.text },
  periodRoom: { fontSize: 11, color: Colors.text2, marginTop: 2 },
  liveBadge: { backgroundColor: Colors.danger, borderRadius: Radius.full, paddingHorizontal: 9, paddingVertical: 4 },
  liveTxt: { fontSize: 10, fontWeight: '800', color: Colors.white },
  chevron: { fontSize: 22, color: Colors.text3 },

  classCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border2, padding: 12, ...Shadow.sm },
  classIcon: { width: 46, height: 46, borderRadius: 13, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  classTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  className: { fontSize: 13.5, fontWeight: '800', color: Colors.text },
  pendingPill: { backgroundColor: Colors.warningLight, borderRadius: Radius.full, minWidth: 22, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  pendingTxt: { fontSize: 11, fontWeight: '800', color: Colors.warning },
  classBarRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  classTrack: { flex: 1, height: 6, borderRadius: 3 },
  classPct: { fontSize: 12, fontWeight: '800', width: 34, textAlign: 'right' },
  classMeta: { fontSize: 11, color: Colors.text2 },

  actionsGrid: { flexDirection: 'row', gap: 8 },
  actionTile: { flex: 1, alignItems: 'center', paddingVertical: 14, gap: 7, backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border2, ...Shadow.sm },
  actionIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 10, fontWeight: '700', color: Colors.text, textAlign: 'center' },
});
