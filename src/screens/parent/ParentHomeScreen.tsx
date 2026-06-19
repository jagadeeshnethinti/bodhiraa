/**
 * Parent dashboard — a premium, at-a-glance view of one child's learning.
 *
 * Visual language matches the student Home: a dark gold-on-maroon gradient hero
 * with a soft glow and a glass summary card (animated performance ring + shimmer),
 * sitting under a rounded sheet of content. Everything animates in: the ring draws
 * on, numbers count up, progress bars and the weekly-activity chart grow from zero,
 * cards stagger in, and tappable tiles spring on press.
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, Animated, Easing } from 'react-native';
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

// ── Mock child snapshot (parent endpoints land in v1; static for now) ──────────
const CHILD = {
  name: 'Arjun Sharma',
  meta: 'Class 11-A · Delhi Public School',
  avgScore: 72,
  streak: 14,
  attendance: 92,
  lessonsWeek: 18,
  quizzesWeek: 5,
  rank: 4,
};

const SUBJECTS: { icon: IconName; name: string; pct: number; trend: number; variant: 'primary' | 'success' | 'warning' | 'teal' }[] = [
  { icon: 'calculator', name: 'Mathematics', pct: 78, trend: 8, variant: 'success' },
  { icon: 'book', name: 'English', pct: 91, trend: 3, variant: 'teal' },
  { icon: 'flask', name: 'Chemistry', pct: 62, trend: -5, variant: 'warning' },
  { icon: 'microscope', name: 'Physics', pct: 55, trend: -3, variant: 'warning' },
];

// Minutes studied per day this week (Mon–Sun); last entry is "today".
const WEEK = [40, 65, 30, 80, 55, 90, 48];
const WEEK_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const ACTIONS: { icon: IconName; label: string; tint: string }[] = [
  { icon: 'chart', label: "Progress", tint: '#FDF4E8' },
  { icon: 'calendar', label: 'Attendance', tint: '#EDFAF4' },
  { icon: 'clipboard', label: 'Reports', tint: '#F3E8FF' },
  { icon: 'chat', label: 'Teacher', tint: '#EAF2FF' },
  { icon: 'card', label: 'Fees', tint: '#FFF8ED' },
  { icon: 'megaphone', label: 'Notices', tint: '#FEF2F2' },
];

const greeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

export const ParentHomeScreen: React.FC = () => {
  const { user } = useAuth();
  const parentName = user?.name ?? 'Parent';

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
            <TouchableOpacity style={styles.bellBtn} activeOpacity={0.8}>
              <Icon name="bell" size={18} color={Colors.primary} />
              <View style={styles.bellDot} />
            </TouchableOpacity>
          </View>

          {/* Glass child-summary card with the performance ring */}
          <Entrance index={0} style={styles.heroCard}>
            <Shimmer />
            <CircularProgress size={92} strokeWidth={9} progress={CHILD.avgScore} trackColor="rgba(245,232,208,0.14)">
              <View style={styles.ringCenter}>
                <AnimatedCounter value={`${CHILD.avgScore}%`} style={styles.ringPct} />
                <Text style={styles.ringLbl}>Avg score</Text>
              </View>
            </CircularProgress>

            <View style={styles.heroInfo}>
              <Text style={styles.childName} numberOfLines={1}>{CHILD.name}</Text>
              <Text style={styles.childMeta} numberOfLines={1}>{CHILD.meta}</Text>
              <View style={styles.heroPills}>
                <View style={styles.pill}>
                  <Pulse><Icon name="fire" size={13} color={Colors.warning} /></Pulse>
                  <AnimatedCounter value={CHILD.streak} style={styles.pillVal} />
                  <Text style={styles.pillLbl}>streak</Text>
                </View>
                <View style={styles.pill}>
                  <Icon name="calendar" size={12} color={Colors.success} />
                  <AnimatedCounter value={`${CHILD.attendance}%`} style={styles.pillVal} />
                  <Text style={styles.pillLbl}>present</Text>
                </View>
              </View>
            </View>
          </Entrance>
        </SafeAreaView>
      </LinearGradient>

      {/* ── Body sheet ────────────────────────────────────────────── */}
      <ScrollView style={styles.sheet} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* AI insight */}
        <Entrance index={0}>
          <AIBubble
            title="Bodhira AI · Weekly insight"
            message={`${CHILD.name.split(' ')[0]} improved in Maths (+8%) this week but is slipping in Organic Chemistry. A short daily practice plan could help.`}
            actions={[{ label: 'View study plan', variant: 'primary' }, { label: 'Dismiss', variant: 'gray' }]}
          />
        </Entrance>

        {/* This-week stat row */}
        <Entrance index={1} style={styles.statRow}>
          <StatTile icon="book" value={CHILD.lessonsWeek} label="Lessons" tint="#FDF4E8" color={Colors.primaryDark} />
          <StatTile icon="edit" value={CHILD.quizzesWeek} label="Quizzes" tint="#F3E8FF" color="#7C3AED" />
          <StatTile icon="trophy" value={`#${CHILD.rank}`} label="Class rank" tint="#EDFAF4" color={Colors.success} />
        </Entrance>

        {/* Weekly activity chart */}
        <Entrance index={2} style={styles.card}>
          <View style={styles.cardHead}>
            <View>
              <Text style={styles.cardTitle}>Study activity</Text>
              <Text style={styles.cardSub}>Minutes learned this week</Text>
            </View>
            <View style={styles.totalChip}>
              <Text style={styles.totalChipTxt}>{Math.round(WEEK.reduce((a, b) => a + b, 0) / 60 * 10) / 10}h total</Text>
            </View>
          </View>
          <WeeklyBars data={WEEK} labels={WEEK_LABELS} />
        </Entrance>

        {/* Subject performance */}
        <Entrance index={3}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Subject performance</Text>
            <TouchableOpacity><Text style={styles.sectionAction}>All</Text></TouchableOpacity>
          </View>
        </Entrance>
        {SUBJECTS.map((s, i) => {
          const up = s.trend >= 0;
          return (
            <Entrance key={s.name} index={4 + i}>
              <PressableScale style={styles.subjectCard}>
                <View style={styles.subjectIcon}><Icon name={s.icon} size={20} color={Colors.primaryDark} /></View>
                <View style={styles.subjectBody}>
                  <View style={styles.subjectTop}>
                    <Text style={styles.subjectName}>{s.name}</Text>
                    <View style={[styles.trendChip, { backgroundColor: up ? Colors.successLight : Colors.dangerLight }]}>
                      <Text style={[styles.trendTxt, { color: up ? Colors.success : Colors.danger }]}>
                        {up ? '▲' : '▼'} {Math.abs(s.trend)}%
                      </Text>
                    </View>
                  </View>
                  <View style={styles.subjectBarRow}>
                    <ProgressBar value={s.pct} variant={s.variant} height={6} style={styles.subjectTrack} />
                    <Text style={styles.subjectPct}>{s.pct}%</Text>
                  </View>
                </View>
              </PressableScale>
            </Entrance>
          );
        })}

        {/* Quick actions */}
        <Entrance index={8}>
          <Text style={[styles.sectionTitle, { marginTop: 4 }]}>Quick actions</Text>
        </Entrance>
        <Entrance index={9} style={styles.actionsGrid}>
          {ACTIONS.map((a, i) => (
            <PressableScale key={a.label} style={styles.actionTile}>
              <View style={[styles.actionIcon, { backgroundColor: a.tint }]}>
                <Icon name={a.icon} size={22} color={Colors.primaryDark} />
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </PressableScale>
          ))}
        </Entrance>
      </ScrollView>
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

/** Animated weekly bar chart — each bar grows from zero, staggered. */
const WeeklyBars: React.FC<{ data: number[]; labels: string[] }> = ({ data, labels }) => {
  const max = Math.max(...data, 1);
  return (
    <View style={styles.weekRow}>
      {data.map((v, i) => (
        <WeekBar key={i} pct={v / max} label={labels[i]} delay={i * 70} today={i === data.length - 1} />
      ))}
    </View>
  );
};

const WeekBar: React.FC<{ pct: number; label: string; delay: number; today: boolean }> = ({ pct, label, delay, today }) => {
  const h = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.timing(h, { toValue: pct, duration: 700, delay, easing: Easing.out(Easing.cubic), useNativeDriver: false });
    a.start();
    return () => a.stop();
  }, [h, pct, delay]);
  const height = h.interpolate({ inputRange: [0, 1], outputRange: ['8%', '100%'] });
  return (
    <View style={styles.weekCol}>
      <View style={styles.weekTrack}>
        <Animated.View style={[styles.weekFill, { height }, today && styles.weekFillToday]} />
      </View>
      <Text style={[styles.weekLabel, today && styles.weekLabelToday]}>{label}</Text>
    </View>
  );
};

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
  totalChip: { backgroundColor: Colors.primaryLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full },
  totalChipTxt: { fontSize: 11, fontWeight: '800', color: Colors.primaryDark },

  // Weekly bars
  weekRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 96 },
  weekCol: { flex: 1, alignItems: 'center', gap: 8 },
  weekTrack: { width: 14, height: 76, backgroundColor: Colors.bg2, borderRadius: Radius.full, overflow: 'hidden', justifyContent: 'flex-end' },
  weekFill: { width: '100%', borderRadius: Radius.full, backgroundColor: Colors.primary + '99' },
  weekFillToday: { backgroundColor: Colors.primary },
  weekLabel: { fontSize: 10, fontWeight: '700', color: Colors.text3 },
  weekLabelToday: { color: Colors.primaryDark },

  // Sections
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.text },
  sectionAction: { fontSize: 12, fontWeight: '700', color: Colors.primaryDark },

  // Subject cards
  subjectCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border2, padding: 12, ...Shadow.sm },
  subjectIcon: { width: 44, height: 44, borderRadius: 13, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  subjectBody: { flex: 1, gap: 8 },
  subjectTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subjectName: { fontSize: 13.5, fontWeight: '800', color: Colors.text },
  trendChip: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: Radius.full },
  trendTxt: { fontSize: 10, fontWeight: '800' },
  subjectBarRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  subjectTrack: { flex: 1, height: 6, borderRadius: 3 },
  subjectPct: { fontSize: 12, fontWeight: '800', color: Colors.text2, width: 34, textAlign: 'right' },

  // Quick actions
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionTile: { width: '30.5%', alignItems: 'center', gap: 7, paddingVertical: 16, backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border2, ...Shadow.sm },
  actionIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 11, fontWeight: '700', color: Colors.text },
});
