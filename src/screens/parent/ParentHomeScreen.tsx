/**
 * Parent dashboard — a premium, at-a-glance view of one child's learning.
 *
 * Visual language matches the student Home: a dark gold-on-maroon gradient hero
 * with a soft glow and a glass summary card (animated performance ring + shimmer),
 * sitting under a rounded sheet of content. Everything animates in: the ring draws
 * on, numbers count up, progress bars and the weekly-activity chart grow from zero,
 * cards stagger in, and tappable tiles spring on press.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, RefreshControl } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../theme';
import { ProgressBar } from '../../components/common/ProgressBar';
import { CircularProgress } from '../../components/common/CircularProgress';
import { AIBubble } from '../../components/common/AIBubble';
import { Icon, IconName } from '../../components/common/Icon';
import { LoadingState, ErrorState, EmptyState } from '../../components/common/ScreenStates';
import { Entrance, PressableScale, AnimatedCounter, Shimmer } from '../../components/common/anim';
import { GlowBlob } from '../../components/illustrations/OnboardingArt';
import { useApi } from '../../hooks/useApi';
import { ParentApi, type ParentChildSummary } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { initials } from '../../utils/ui';

const greeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const ACTIONS: { icon: IconName; label: string; tint: string; route?: string }[] = [
  { icon: 'chart', label: 'Progress', tint: '#FDF4E8', route: 'PChild' },
  { icon: 'calendar', label: 'Attendance', tint: '#EDFAF4', route: 'PAttendance' },
  { icon: 'clipboard', label: 'Reports', tint: '#F3E8FF', route: 'PReports' },
  { icon: 'chat', label: 'Teacher', tint: '#EAF2FF' },
  { icon: 'card', label: 'Fees', tint: '#FFF8ED', route: 'ParentFees' },
  { icon: 'megaphone', label: 'Notices', tint: '#FEF2F2', route: 'ParentNotifications' },
];

export const ParentHomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const home = useApi(signal => ParentApi.home(signal), []);

  const parentName = home.data?.parentName || user?.name || 'Parent';
  const child = home.data?.child ?? null;
  const alerts = home.data?.alerts ?? [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A0A0C" />

      {/* ── Gradient hero ─────────────────────────────────────────── */}
      <LinearGradient colors={['#1A0A0C', '#2A0E13', '#3D1520']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroGlow} pointerEvents="none"><GlowBlob size={240} /></View>

        <SafeAreaView edges={['top']}>
          <View style={styles.topRow}>
            <View style={styles.userRow}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{initials(parentName)}</Text></View>
              <View>
                <Text style={styles.helloLabel}>{greeting().toUpperCase()}</Text>
                <Text style={styles.helloName} numberOfLines={1}>{parentName}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.bellBtn} activeOpacity={0.8} onPress={() => navigation.navigate('ParentNotifications')}>
              <Icon name="bell" size={18} color={Colors.primary} />
              {alerts.length > 0 && <View style={styles.bellDot} />}
            </TouchableOpacity>
          </View>

          {/* Glass child-summary card with the performance ring */}
          <Entrance index={0} style={styles.heroCard}>
            <Shimmer />
            <CircularProgress size={92} strokeWidth={9} progress={child?.avgScore ?? 0} trackColor="rgba(245,232,208,0.14)">
              <View style={styles.ringCenter}>
                <AnimatedCounter value={`${child?.avgScore ?? 0}%`} style={styles.ringPct} />
                <Text style={styles.ringLbl}>Avg score</Text>
              </View>
            </CircularProgress>

            <View style={styles.heroInfo}>
              <Text style={styles.childName} numberOfLines={1}>{child?.name ?? 'No child linked'}</Text>
              <Text style={styles.childMeta} numberOfLines={1}>{child?.meta ?? '—'}</Text>
              <View style={styles.heroPills}>
                <View style={styles.pill}>
                  <Icon name="edit" size={12} color={Colors.warning} />
                  <AnimatedCounter value={child?.quizzesAttempted ?? 0} style={styles.pillVal} />
                  <Text style={styles.pillLbl}>quizzes</Text>
                </View>
                <View style={styles.pill}>
                  <Icon name="calendar" size={12} color={Colors.success} />
                  <AnimatedCounter value={`${child?.attendance ?? 0}%`} style={styles.pillVal} />
                  <Text style={styles.pillLbl}>present</Text>
                </View>
              </View>
            </View>
          </Entrance>
        </SafeAreaView>
      </LinearGradient>

      {/* ── Body sheet ────────────────────────────────────────────── */}
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
          {/* Alerts from the backend */}
          {alerts.length > 0 && alerts.map((a, i) => (
            <Entrance key={i} index={i}>
              <AIBubble
                title={`Alert · ${a.child}`}
                message={a.message}
              />
            </Entrance>
          ))}

          {/* This-week stat row (from child stats) */}
          <Entrance index={1} style={styles.statRow}>
            <StatTile icon="book" value={child?.lessonsCompleted ?? 0} label="Lessons done" tint="#FDF4E8" color={Colors.primaryDark} />
            <StatTile icon="edit" value={child?.quizzesAttempted ?? 0} label="Quizzes" tint="#F3E8FF" color="#7C3AED" />
            <StatTile icon="clipboard" value={child?.pendingAssignments ?? 0} label="Pending" tint="#EDFAF4" color={Colors.success} />
          </Entrance>

          {/* Lessons progress */}
          {child && (
            <Entrance index={2} style={styles.card}>
              <View style={styles.cardHead}>
                <View>
                  <Text style={styles.cardTitle}>Lessons progress</Text>
                  <Text style={styles.cardSub}>{child.lessonsCompleted} of {child.lessonsStarted} started lessons completed</Text>
                </View>
              </View>
              <View style={styles.subjectBarRow}>
                <ProgressBar
                  value={child.lessonsStarted > 0 ? Math.round((child.lessonsCompleted / child.lessonsStarted) * 100) : 0}
                  variant="primary"
                  height={8}
                  style={styles.subjectTrack}
                />
                <Text style={styles.subjectPct}>
                  {child.lessonsStarted > 0 ? Math.round((child.lessonsCompleted / child.lessonsStarted) * 100) : 0}%
                </Text>
              </View>
            </Entrance>
          )}

          {!child && (
            <EmptyState icon="child" title="No child linked" sub="Once your child is linked, their dashboard appears here." />
          )}

          {/* Quick actions */}
          <Entrance index={3}>
            <Text style={[styles.sectionTitle, { marginTop: 4 }]}>Quick actions</Text>
          </Entrance>
          <Entrance index={4} style={styles.actionsGrid}>
            {ACTIONS.map(a => (
              <PressableScale
                key={a.label}
                style={styles.actionTile}
                onPress={() => { if (a.route) navigation.navigate(a.route); }}
              >
                <View style={[styles.actionIcon, { backgroundColor: a.tint }]}>
                  <Icon name={a.icon} size={22} color={Colors.primaryDark} />
                </View>
                <Text style={styles.actionLabel}>{a.label}</Text>
              </PressableScale>
            ))}
          </Entrance>
        </ScrollView>
      )}
    </View>
  );
};

// ── Small pieces ───────────────────────────────────────────────────────────────

const StatTile: React.FC<{ icon: IconName; value: string | number; label: string; tint: string; color: string }> = ({
  icon, value, label, tint, color,
}) => (
  <View style={styles.statTile}>
    <View style={[styles.statIcon, { backgroundColor: tint }]}><Icon name={icon} size={16} color={color} /></View>
    <AnimatedCounter value={value} style={[styles.statVal, { color }]} />
    <Text style={styles.statLbl}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A0A0C' },

  // Hero
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

  heroCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: 'rgba(245,232,208,0.07)',
    borderWidth: 1, borderColor: 'rgba(196,149,96,0.22)',
    borderRadius: Radius.xl, padding: 16, overflow: 'hidden',
  },
  ringCenter: { alignItems: 'center', justifyContent: 'center' },
  ringPct: { fontSize: 19, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.5 },
  ringLbl: { fontSize: 9, fontWeight: '700', color: 'rgba(245,232,208,0.6)', letterSpacing: 0.5, marginTop: 1 },
  heroInfo: { flex: 1, minWidth: 0 },
  childName: { fontSize: 17, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.3 },
  childMeta: { fontSize: 11, color: 'rgba(245,232,208,0.6)', fontWeight: '600', marginTop: 2, marginBottom: 10 },
  heroPills: { flexDirection: 'row', gap: 8 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(245,232,208,0.08)', paddingHorizontal: 9, paddingVertical: 5, borderRadius: Radius.full },
  pillVal: { fontSize: 12.5, fontWeight: '900', color: '#F5E8D0' },
  pillLbl: { fontSize: 10, color: 'rgba(245,232,208,0.6)', fontWeight: '600' },

  // Body sheet
  sheet: { flex: 1, backgroundColor: Colors.bg, marginTop: -22, borderTopLeftRadius: 26, borderTopRightRadius: 26 },
  content: { padding: 16, paddingTop: 22, gap: 14, paddingBottom: 28 },

  // Stat row
  statRow: { flexDirection: 'row', gap: 10 },
  statTile: { flex: 1, alignItems: 'center', gap: 5, paddingVertical: 14, backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border2, ...Shadow.sm },
  statIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  statVal: { fontSize: 18, fontWeight: '900', letterSpacing: -0.3 },
  statLbl: { fontSize: 9.5, color: Colors.text3, fontWeight: '700', letterSpacing: 0.4 },

  // Generic card
  card: { backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border2, padding: 16, ...Shadow.md },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  cardTitle: { fontSize: 14.5, fontWeight: '800', color: Colors.text },
  cardSub: { fontSize: 11, color: Colors.text2, marginTop: 2 },

  // Sections
  sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.text },

  // Subject bar
  subjectBarRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  subjectTrack: { flex: 1, height: 8, borderRadius: 4 },
  subjectPct: { fontSize: 12, fontWeight: '800', color: Colors.text2, width: 40, textAlign: 'right' },

  // Quick actions
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionTile: { width: '30.5%', alignItems: 'center', gap: 7, paddingVertical: 16, backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border2, ...Shadow.sm },
  actionIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 11, fontWeight: '700', color: Colors.text },
});
