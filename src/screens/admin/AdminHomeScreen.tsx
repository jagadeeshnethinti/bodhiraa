/**
 * Admin · Dashboard — premium school control center: gradient hero with a glass
 * school-average ring + stat strip, recent-signups alert, today's snapshot,
 * management quick actions, recent quiz attempts and an AI insight.
 * Wired to GET /admin/home.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, RefreshControl, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../theme';
import { ProgressBar } from '../../components/common/ProgressBar';
import { CircularProgress } from '../../components/common/CircularProgress';
import { AIBubble } from '../../components/common/AIBubble';
import { LoadingState, ErrorState } from '../../components/common/ScreenStates';
import { BoldIcon as Icon, BoldIconName as IconName } from '../../components/common/BoldIcon';
import { Entrance, PressableScale, AnimatedCounter, Pulse, Shimmer } from '../../components/common/anim';
import { GlowBlob } from '../../components/illustrations/OnboardingArt';
import { useApi } from '../../hooks/useApi';
import { AdminApi } from '../../api/endpoints/admin';
import { initials } from '../../utils/ui';

const ACTIONS: { icon: IconName; label: string; route?: string }[] = [
  { icon: 'user', label: 'Users', route: 'AUsers' },
  { icon: 'school', label: 'Classes', route: 'AClasses' },
  { icon: 'chart', label: 'Analytics', route: 'AAnalytics' },
];
const ACTION_TINTS = ['#FDF4E8', '#EAF2FF', '#F3E8FF'];

export const AdminHomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const home = useApi(signal => AdminApi.home(signal), []);
  const hd = home.data;

  const stats = hd?.stats;
  const avg = stats?.attendance_percent ?? 0;
  const schoolName = hd?.admin?.school ?? 'My School';
  const schoolCode = hd?.admin?.school_code ?? 'SCH';
  const signups = hd?.recent_signups ?? [];
  const attempts = hd?.recent_attempts ?? [];

  const today: { icon: IconName; value: string; label: string; color: string; tint: string }[] = [
    { icon: 'attendance', value: `${avg}%`, label: 'Attendance', color: Colors.success, tint: '#EDFAF4' },
    { icon: 'library', value: String(stats?.subjects ?? 0), label: 'Subjects', color: Colors.primaryDark, tint: '#FDF4E8' },
    { icon: 'clipboard', value: String(stats?.active_assignments ?? 0), label: 'Assignments', color: '#2F4DA0', tint: '#EAF2FF' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A0A0C" />

      <LinearGradient colors={['#1A0A0C', '#2A0E13', '#3D1520']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroGlow} pointerEvents="none"><GlowBlob size={240} /></View>
        <SafeAreaView edges={['top']}>
          <View style={styles.topRow}>
            <View style={styles.userRow}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{initials(schoolName)}</Text></View>
              <View>
                <Text style={styles.helloLabel}>SCHOOL ADMIN · {schoolCode}</Text>
                <Text style={styles.helloName} numberOfLines={1}>{schoolName}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.bellBtn} activeOpacity={0.8}>
              <Icon name="bell" size={18} color={Colors.primary} />
              <View style={styles.bellDot} />
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
              <HeroStat value={(stats?.students ?? 0).toLocaleString('en-IN')} label="Students" />
              <View style={styles.statDivider} />
              <HeroStat value={String(stats?.teachers ?? 0)} label="Teachers" />
              <View style={styles.statDivider} />
              <HeroStat value={String(stats?.classes ?? 0)} label="Classes" />
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
          {/* Recent signups */}
          {signups.length > 0 && (
            <Entrance index={0}>
              <PressableScale style={styles.alertCard} onPress={() => navigation.navigate('AUsers')}>
                <Pulse style={styles.alertIcon}><Icon name="user" size={18} color={Colors.primaryDark} /></Pulse>
                <View style={{ flex: 1 }}>
                  <Text style={styles.alertTitle}>{signups.length} recent sign-ups</Text>
                  <Text style={styles.alertSub} numberOfLines={1}>{signups[0].name} ({signups[0].role_label ?? signups[0].role}) · {signups[0].created_at}</Text>
                </View>
                <View style={styles.alertBtn}><Text style={styles.alertBtnTxt}>View</Text></View>
              </PressableScale>
            </Entrance>
          )}

          {/* Today snapshot */}
          <Entrance index={1} style={styles.todayGrid}>
            {today.map(t => (
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
            {ACTIONS.map((a, i) => (
              <PressableScale key={a.label} style={styles.actionTile} onPress={() => a.route && navigation.navigate(a.route)}>
                <View style={[styles.actionIcon, { backgroundColor: ACTION_TINTS[i % ACTION_TINTS.length] }]}><Icon name={a.icon} size={22} color={Colors.primaryDark} /></View>
                <Text style={styles.actionLabel}>{a.label}</Text>
              </PressableScale>
            ))}
          </Entrance>

          {/* Recent quiz attempts */}
          {attempts.length > 0 && (
            <>
              <Entrance index={4}><Text style={[styles.sectionTitle, { marginTop: 4 }]}>Recent quiz attempts</Text></Entrance>
              {attempts.map((a, i) => (
                <Entrance key={`${a.student}-${i}`} index={5 + i}>
                  <PressableScale style={styles.classCard}>
                    <View style={styles.classIcon}><Icon name="library" size={20} color={Colors.primaryDark} /></View>
                    <View style={{ flex: 1, gap: 6 }}>
                      <View style={styles.classTop}>
                        <Text style={styles.className} numberOfLines={1}>{a.student ?? 'Student'}</Text>
                        <Text style={[styles.classPct, { color: a.percent >= 75 ? Colors.success : Colors.warning }]}>{a.percent}%</Text>
                      </View>
                      <ProgressBar value={a.percent} variant={a.percent >= 75 ? 'success' : 'warning'} height={6} />
                      <Text style={styles.classMeta} numberOfLines={1}>{a.subject ?? a.quiz ?? 'Quiz'} · {a.submitted_at ?? ''}</Text>
                    </View>
                  </PressableScale>
                </Entrance>
              ))}
            </>
          )}

          {/* AI insight */}
          <Entrance index={9}>
            <AIBubble
              title="Bodhira AI · School insight"
              message={`Today's attendance is at ${avg}%. You have ${stats?.students ?? 0} students across ${stats?.classes ?? 0} classes and ${stats?.active_assignments ?? 0} active assignments.`}
              actions={[{ label: 'View analytics', variant: 'primary', onPress: () => navigation.navigate('AAnalytics') }, { label: 'Dismiss', variant: 'gray' }]}
            />
          </Entrance>
        </ScrollView>
      )}
    </View>
  );
};

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
