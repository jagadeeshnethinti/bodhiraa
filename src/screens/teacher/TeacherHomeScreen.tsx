/**
 * Teacher · Dashboard — premium home: a gradient hero with a glass class-average
 * ring + stat strip, a pending-review alert, class cards, quick actions and an AI
 * class insight. Animated throughout. Wired to GET /teacher/home via
 * TeacherApi.home().
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, RefreshControl } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../theme';
import { CircularProgress } from '../../components/common/CircularProgress';
import { AIBubble } from '../../components/common/AIBubble';
import { Icon, IconName } from '../../components/common/Icon';
import { LoadingState, ErrorState, EmptyState } from '../../components/common/ScreenStates';
import { Entrance, PressableScale, AnimatedCounter, Pulse, Shimmer } from '../../components/common/anim';
import { GlowBlob } from '../../components/illustrations/OnboardingArt';
import { useApi } from '../../hooks/useApi';
import { TeacherApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { initials } from '../../utils/ui';

const ACTIONS: { icon: IconName; label: string; tint: string }[] = [
  { icon: 'edit', label: 'Create quiz', tint: '#F3E8FF' },
  { icon: 'upload', label: 'Upload', tint: '#EDFAF4' },
  { icon: 'chart', label: 'Analytics', tint: '#EAF2FF' },
  { icon: 'megaphone', label: 'Announce', tint: '#FFF8ED' },
];

export const TeacherHomeScreen: React.FC<{ navigation: any }> = () => {
  const { user } = useAuth();
  const home = useApi(signal => TeacherApi.home(signal), []);
  const data = home.data;

  const name = data?.teacher.name ?? user?.name ?? 'Teacher';
  const stats = data?.stats;
  // Attendance-today is the closest signal to an aggregate "class average" the
  // backend exposes; fall back to 0 until home loads.
  const avg = stats?.attendanceToday ?? 0;
  const classes = data?.classes ?? [];
  const pending = stats?.pending ?? 0;
  const recent = data?.recentSubmissions ?? [];
  const ungraded = recent.filter(r => !r.graded).length;

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
              {pending > 0 && <View style={styles.bellDot} />}
            </TouchableOpacity>
          </View>

          <Entrance index={0} style={styles.heroCard}>
            <Shimmer />
            <CircularProgress size={92} strokeWidth={9} progress={avg} trackColor="rgba(245,232,208,0.14)">
              <View style={styles.ringCenter}>
                <AnimatedCounter value={`${avg}%`} style={styles.ringPct} />
                <Text style={styles.ringLbl}>Attendance</Text>
              </View>
            </CircularProgress>
            <View style={styles.heroStats}>
              <HeroStat value={String(stats?.classes ?? 0)} label="Classes" />
              <View style={styles.statDivider} />
              <HeroStat value={String(stats?.students ?? 0)} label="Students" />
              <View style={styles.statDivider} />
              <HeroStat value={String(pending)} label="Pending" warn />
            </View>
          </Entrance>
        </SafeAreaView>
      </LinearGradient>

      {home.loading && !home.data ? (
        <View style={styles.sheet}><LoadingState /></View>
      ) : home.error && !home.data ? (
        <View style={styles.sheet}><ErrorState message={home.error} onRetry={home.refetch} /></View>
      ) : (
        <ScrollView
          style={styles.sheet}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={home.refreshing} onRefresh={home.refetch} tintColor={Colors.primary} />}
        >
          {/* Pending alert */}
          {pending > 0 && (
            <Entrance index={0}>
              <PressableScale style={styles.alertCard}>
                <Pulse style={styles.alertIcon}><Icon name="clipboard" size={18} color={Colors.warning} /></Pulse>
                <View style={{ flex: 1 }}>
                  <Text style={styles.alertTitle}>{pending} {pending === 1 ? 'assignment needs' : 'assignments need'} review</Text>
                  <Text style={styles.alertSub}>Tap to grade pending submissions</Text>
                </View>
                <View style={styles.alertBtn}><Text style={styles.alertBtnTxt}>Review</Text></View>
              </PressableScale>
            </Entrance>
          )}

          {/* Recent submissions */}
          {recent.length > 0 && (
            <>
              <Entrance index={1}><Text style={styles.sectionTitle}>Recent submissions</Text></Entrance>
              <Entrance index={2} style={styles.scheduleCard}>
                {recent.slice(0, 5).map((r, i) => (
                  <View key={r.id} style={[styles.periodRow, i < Math.min(recent.length, 5) - 1 && styles.divider]}>
                    <View style={styles.periodBar} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.periodCls} numberOfLines={1}>{r.assignmentTitle}</Text>
                      <Text style={styles.periodRoom} numberOfLines={1}>{r.student} · {r.className}</Text>
                    </View>
                    {r.graded ? (
                      <Text style={styles.chevron}>›</Text>
                    ) : (
                      <View style={styles.liveBadge}><Text style={styles.liveTxt}>NEW</Text></View>
                    )}
                  </View>
                ))}
              </Entrance>
            </>
          )}

          {/* Classes */}
          <Entrance index={3}><Text style={[styles.sectionTitle, { marginTop: 4 }]}>My classes</Text></Entrance>
          {classes.length === 0 ? (
            <EmptyState icon="library" title="No classes yet" sub="Classes assigned to you will appear here." />
          ) : (
            classes.map((c, i) => (
              <Entrance key={c.id} index={4 + i}>
                <PressableScale style={styles.classCard}>
                  <View style={styles.classIcon}><Icon name="library" size={20} color={Colors.primaryDark} /></View>
                  <View style={{ flex: 1, gap: 6 }}>
                    <View style={styles.classTop}>
                      <Text style={styles.className}>{c.name}</Text>
                    </View>
                    <Text style={styles.classMeta}>{c.students} students</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </PressableScale>
              </Entrance>
            ))
          )}

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
              message={
                ungraded > 0
                  ? `You have ${ungraded} ungraded submission${ungraded === 1 ? '' : 's'} waiting. Grading them keeps your class analytics fresh.`
                  : 'Ask Bodhira AI to summarise class performance or draft a revision plan in seconds.'
              }
              actions={[{ label: 'Plan revision', variant: 'primary' }, { label: 'Dismiss', variant: 'gray' }]}
            />
          </Entrance>
        </ScrollView>
      )}
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
