/**
 * Parent · My Child — a rich, premium snapshot of one child's learning life:
 * an avatar hero with a stats strip, a performance overview ring with
 * strength/focus chips, animated subject mastery, a recent-activity timeline and
 * achievement badges. Static mock data for now (parent endpoints land in v1).
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../theme';
import { CircularProgress } from '../../components/common/CircularProgress';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Entrance, PressableScale, AnimatedCounter, Pulse, Shimmer } from '../../components/common/anim';
import { GlowBlob } from '../../components/illustrations/OnboardingArt';
import { Icon, IconName } from '../../components/common/Icon';

const CHILD = { name: 'Arjun Sharma', meta: 'Class 11-A · Delhi Public School', avg: 72, rank: 4, streak: 14, attendance: 92 };

const HERO_STATS: { value: string; label: string }[] = [
  { value: '72%', label: 'Avg score' },
  { value: '#4', label: 'Class rank' },
  { value: '14', label: 'Streak' },
  { value: '92%', label: 'Present' },
];

const SUBJECTS: { icon: IconName; name: string; pct: number; trend: number; variant: 'primary' | 'success' | 'warning' | 'teal' }[] = [
  { icon: 'book', name: 'English', pct: 91, trend: 3, variant: 'teal' },
  { icon: 'calculator', name: 'Mathematics', pct: 78, trend: 8, variant: 'success' },
  { icon: 'flask', name: 'Chemistry', pct: 62, trend: -5, variant: 'warning' },
  { icon: 'microscope', name: 'Physics', pct: 55, trend: -3, variant: 'warning' },
];

const ACTIVITY: { icon: IconName; title: string; meta: string; tint: string; color: string }[] = [
  { icon: 'video', title: 'Watched: Thermodynamics', meta: 'Physics · 2h ago', tint: '#EAF2FF', color: '#2F4DA0' },
  { icon: 'edit', title: 'Quiz: Algebra Basics — 8/10', meta: 'Mathematics · Yesterday', tint: '#F3E8FF', color: '#7C3AED' },
  { icon: 'book', title: 'Completed: Cell Structure', meta: 'Biology · Yesterday', tint: '#EDFAF4', color: Colors.success },
  { icon: 'robot', title: 'Asked AI about balancing equations', meta: 'Chemistry · 2d ago', tint: '#FDF4E8', color: Colors.primaryDark },
];

const ACHIEVEMENTS: { icon: IconName; label: string; unlocked: boolean }[] = [
  { icon: 'fire', label: 'Streak Star', unlocked: true },
  { icon: 'target', label: 'Quiz Ace', unlocked: true },
  { icon: 'trophy', label: 'Top 5', unlocked: true },
  { icon: 'rocket', label: 'Fast Learner', unlocked: false },
  { icon: 'brain', label: 'AI Explorer', unlocked: true },
];

export const ParentChildScreen: React.FC<{ navigation: any }> = () => (
  <View style={styles.container}>
    <StatusBar barStyle="light-content" backgroundColor="#1A0A0C" />

    {/* ── Hero ──────────────────────────────────────────────────── */}
    <LinearGradient colors={['#1A0A0C', '#2A0E13', '#3D1520', '#52202E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
      <View style={styles.heroGlow} pointerEvents="none"><GlowBlob size={260} /></View>
      <SafeAreaView edges={['top']}>
        <Text style={styles.heading}>My Child</Text>

        <Entrance index={0} style={styles.heroProfile}>
          <View style={styles.childAvatar}><Icon name="child" size={34} color={Colors.brand} /></View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.childName} numberOfLines={1}>{CHILD.name}</Text>
            <Text style={styles.childMeta} numberOfLines={1}>{CHILD.meta}</Text>
          </View>
          <TouchableOpacity style={styles.switchChip} activeOpacity={0.8}>
            <Text style={styles.switchTxt}>Switch ▾</Text>
          </TouchableOpacity>
        </Entrance>

        <Entrance index={1} style={styles.statStrip}>
          <Shimmer />
          {HERO_STATS.map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && <View style={styles.statSep} />}
              <View style={styles.statItem}>
                {s.value.startsWith('#') ? (
                  <Text style={styles.statVal}>{s.value}</Text>
                ) : (
                  <AnimatedCounter value={s.value} style={styles.statVal} />
                )}
                <Text style={styles.statLbl}>{s.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </Entrance>
      </SafeAreaView>
    </LinearGradient>

    {/* ── Body sheet ────────────────────────────────────────────── */}
    <ScrollView style={styles.sheet} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Performance overview */}
      <Entrance index={0} style={styles.overviewCard}>
        <CircularProgress size={88} strokeWidth={9} progress={CHILD.avg}>
          <View style={styles.ringCenter}>
            <AnimatedCounter value={`${CHILD.avg}%`} style={styles.ringPct} />
            <Text style={styles.ringLbl}>Overall</Text>
          </View>
        </CircularProgress>
        <View style={{ flex: 1, gap: 8 }}>
          <View style={styles.tagRow}>
            <View style={[styles.tagIcon, { backgroundColor: Colors.successLight }]}><Icon name="star" size={13} color={Colors.success} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tagLabel}>Strongest</Text>
              <Text style={styles.tagValue}>English · 91%</Text>
            </View>
          </View>
          <View style={styles.tagRow}>
            <View style={[styles.tagIcon, { backgroundColor: Colors.warningLight }]}><Icon name="warning" size={13} color={Colors.warning} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tagLabel}>Needs focus</Text>
              <Text style={styles.tagValue}>Physics · 55%</Text>
            </View>
          </View>
        </View>
      </Entrance>

      {/* Subjects */}
      <Entrance index={1}><Text style={styles.sectionTitle}>Subject mastery</Text></Entrance>
      {SUBJECTS.map((s, i) => {
        const up = s.trend >= 0;
        return (
          <Entrance key={s.name} index={2 + i}>
            <PressableScale style={styles.subjectCard}>
              <View style={styles.subjectIcon}><Icon name={s.icon} size={20} color={Colors.primaryDark} /></View>
              <View style={styles.subjectBody}>
                <View style={styles.subjectTop}>
                  <Text style={styles.subjectName}>{s.name}</Text>
                  <View style={[styles.trendChip, { backgroundColor: up ? Colors.successLight : Colors.dangerLight }]}>
                    <Text style={[styles.trendTxt, { color: up ? Colors.success : Colors.danger }]}>{up ? '▲' : '▼'} {Math.abs(s.trend)}%</Text>
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

      {/* Recent activity */}
      <Entrance index={6}><Text style={[styles.sectionTitle, { marginTop: 4 }]}>Recent activity</Text></Entrance>
      <Entrance index={7} style={styles.timelineCard}>
        {ACTIVITY.map((a, i) => (
          <View key={i} style={[styles.activityRow, i < ACTIVITY.length - 1 && styles.activityDivider]}>
            <View style={[styles.activityIcon, { backgroundColor: a.tint }]}><Icon name={a.icon} size={16} color={a.color} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.activityTitle} numberOfLines={1}>{a.title}</Text>
              <Text style={styles.activityMeta}>{a.meta}</Text>
            </View>
          </View>
        ))}
      </Entrance>

      {/* Achievements */}
      <Entrance index={8}><Text style={[styles.sectionTitle, { marginTop: 4 }]}>Achievements</Text></Entrance>
      <Entrance index={9}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgeRow}>
          {ACHIEVEMENTS.map(a => (
            <View key={a.label} style={styles.badge}>
              {a.unlocked ? (
                <Pulse style={styles.badgeIconWrap}>
                  <LinearGradient colors={['#D9AD7A', '#A87840']} style={styles.badgeIcon}>
                    <Icon name={a.icon} size={22} color={Colors.brand} />
                  </LinearGradient>
                </Pulse>
              ) : (
                <View style={[styles.badgeIcon, styles.badgeLocked]}><Icon name={a.icon} size={22} color={Colors.text3} /></View>
              )}
              <Text style={[styles.badgeLabel, !a.unlocked && { color: Colors.text3 }]} numberOfLines={1}>{a.label}</Text>
            </View>
          ))}
        </ScrollView>
      </Entrance>
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A0A0C' },

  hero: { paddingHorizontal: 16, paddingBottom: 30, overflow: 'hidden' },
  heroGlow: { position: 'absolute', top: -80, right: -50, opacity: 0.8 },
  heading: { fontSize: 22, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.4, paddingTop: 6, marginBottom: 16 },

  heroProfile: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  childAvatar: { width: 60, height: 60, borderRadius: 19, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  childName: { fontSize: 19, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.3 },
  childMeta: { fontSize: 12, color: 'rgba(245,232,208,0.6)', fontWeight: '600', marginTop: 3 },
  switchChip: { backgroundColor: 'rgba(196,149,96,0.16)', borderWidth: 1, borderColor: 'rgba(196,149,96,0.3)', borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 7 },
  switchTxt: { fontSize: 11, fontWeight: '800', color: Colors.primary },

  statStrip: { flexDirection: 'row', alignItems: 'center', marginTop: 18, backgroundColor: 'rgba(245,232,208,0.07)', borderWidth: 1, borderColor: 'rgba(196,149,96,0.2)', borderRadius: Radius.lg, paddingVertical: 14, overflow: 'hidden' },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 17, fontWeight: '900', color: '#F5E8D0' },
  statLbl: { fontSize: 9, color: 'rgba(245,232,208,0.6)', fontWeight: '600', marginTop: 3, letterSpacing: 0.3 },
  statSep: { width: 1, height: 28, backgroundColor: 'rgba(196,149,96,0.2)' },

  sheet: { flex: 1, backgroundColor: Colors.bg, marginTop: -18, borderTopLeftRadius: 26, borderTopRightRadius: 26 },
  content: { padding: 16, paddingTop: 22, gap: 12, paddingBottom: 32 },

  overviewCard: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border2, padding: 16, ...Shadow.md },
  ringCenter: { alignItems: 'center', justifyContent: 'center' },
  ringPct: { fontSize: 18, fontWeight: '900', color: Colors.text, letterSpacing: -0.5 },
  ringLbl: { fontSize: 9, fontWeight: '700', color: Colors.text3, letterSpacing: 0.5, marginTop: 1 },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tagIcon: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  tagLabel: { fontSize: 9.5, fontWeight: '700', color: Colors.text3, letterSpacing: 0.4 },
  tagValue: { fontSize: 13, fontWeight: '800', color: Colors.text, marginTop: 1 },

  sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.text },

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

  timelineCard: { backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border2, paddingHorizontal: 14, ...Shadow.sm },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  activityDivider: { borderBottomWidth: 1, borderBottomColor: Colors.border2 },
  activityIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  activityTitle: { fontSize: 13, fontWeight: '700', color: Colors.text },
  activityMeta: { fontSize: 11, color: Colors.text2, marginTop: 2 },

  badgeRow: { gap: 14, paddingRight: 8, paddingVertical: 2 },
  badge: { alignItems: 'center', width: 68, gap: 7 },
  badgeIconWrap: { borderRadius: 18 },
  badgeIcon: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', ...Shadow.sm },
  badgeLocked: { backgroundColor: Colors.bg2, borderWidth: 1, borderColor: Colors.border2 },
  badgeLabel: { fontSize: 10, fontWeight: '700', color: Colors.text2, textAlign: 'center' },
});
