/**
 * Parent · My Child — a rich, premium snapshot of one child's learning life:
 * an avatar hero with a stats strip, a performance overview ring with
 * strength/focus chips, animated subject mastery and a recent-activity timeline.
 *
 * Live data: ParentApi.child(studentId). The student id comes from a `childId`
 * route param when present, else the first linked child from ParentApi.home().
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../theme';
import { CircularProgress } from '../../components/common/CircularProgress';
import { ProgressBar } from '../../components/common/ProgressBar';
import { LoadingState, ErrorState, EmptyState } from '../../components/common/ScreenStates';
import { Entrance, PressableScale, AnimatedCounter, Shimmer } from '../../components/common/anim';
import { GlowBlob } from '../../components/illustrations/OnboardingArt';
import { Icon } from '../../components/common/Icon';
import { useApi } from '../../hooks/useApi';
import { ParentApi, type ParentSubjectMastery } from '../../api';
import { subjectIconName } from '../../utils/ui';

const ratingVariant = (rating: string): 'success' | 'primary' | 'warning' =>
  rating === 'strong' ? 'success' : rating === 'average' ? 'primary' : 'warning';

export const ParentChildScreen: React.FC<{ navigation: any; route?: any }> = ({ route }) => {
  // Resolve a child id: explicit route param, else the first linked child.
  const paramId: number | undefined = route?.params?.childId;
  const home = useApi(signal => ParentApi.home(signal), []);
  const resolvedId = paramId ?? home.data?.child?.id ?? null;

  const detail = useApi(
    signal => {
      if (resolvedId == null) return Promise.reject(new Error('No child linked to this account.'));
      return ParentApi.child(resolvedId, signal);
    },
    [resolvedId],
  );

  const loading = (home.loading && !home.data) || (resolvedId != null && detail.loading && !detail.data);
  const error = home.error ?? (resolvedId != null ? detail.error : null);
  const noChild = !home.loading && resolvedId == null;
  const child = detail.data;

  // Strongest / needs-focus from the subject mastery list.
  const sorted: ParentSubjectMastery[] = [...(child?.subjects ?? [])].sort((a, b) => b.pct - a.pct);
  const strongest = sorted[0] ?? null;
  const weakest = sorted.length > 1 ? sorted[sorted.length - 1] : null;

  const onRefresh = () => { home.refetch(); detail.refetch(); };

  return (
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
              <Text style={styles.childName} numberOfLines={1}>{child?.name ?? 'My Child'}</Text>
              <Text style={styles.childMeta} numberOfLines={1}>{child?.meta ?? '—'}</Text>
            </View>
          </Entrance>

          <Entrance index={1} style={styles.statStrip}>
            <Shimmer />
            <View style={styles.statItem}>
              <AnimatedCounter value={`${child?.avg ?? 0}%`} style={styles.statVal} />
              <Text style={styles.statLbl}>Avg score</Text>
            </View>
            <View style={styles.statSep} />
            <View style={styles.statItem}>
              <AnimatedCounter value={`${child?.attendance ?? 0}%`} style={styles.statVal} />
              <Text style={styles.statLbl}>Present</Text>
            </View>
            <View style={styles.statSep} />
            <View style={styles.statItem}>
              <AnimatedCounter value={child?.pendingAssignments ?? 0} style={styles.statVal} />
              <Text style={styles.statLbl}>Pending</Text>
            </View>
          </Entrance>
        </SafeAreaView>
      </LinearGradient>

      {/* ── Body sheet ────────────────────────────────────────────── */}
      {loading ? (
        <View style={styles.sheet}><LoadingState /></View>
      ) : noChild ? (
        <View style={styles.sheet}>
          <EmptyState icon="child" title="No child linked" sub="Once your child is linked, their snapshot appears here." />
        </View>
      ) : error ? (
        <View style={styles.sheet}><ErrorState message={error} onRetry={onRefresh} /></View>
      ) : child ? (
        <ScrollView style={styles.sheet} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Performance overview */}
          <Entrance index={0} style={styles.overviewCard}>
            <CircularProgress size={88} strokeWidth={9} progress={child.avg}>
              <View style={styles.ringCenter}>
                <AnimatedCounter value={`${child.avg}%`} style={styles.ringPct} />
                <Text style={styles.ringLbl}>Overall</Text>
              </View>
            </CircularProgress>
            <View style={{ flex: 1, gap: 8 }}>
              <View style={styles.tagRow}>
                <View style={[styles.tagIcon, { backgroundColor: Colors.successLight }]}><Icon name="star" size={13} color={Colors.success} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tagLabel}>Strongest</Text>
                  <Text style={styles.tagValue}>{strongest ? `${strongest.name} · ${strongest.pct}%` : '—'}</Text>
                </View>
              </View>
              <View style={styles.tagRow}>
                <View style={[styles.tagIcon, { backgroundColor: Colors.warningLight }]}><Icon name="warning" size={13} color={Colors.warning} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tagLabel}>Needs focus</Text>
                  <Text style={styles.tagValue}>{weakest ? `${weakest.name} · ${weakest.pct}%` : '—'}</Text>
                </View>
              </View>
            </View>
          </Entrance>

          {/* Subjects */}
          <Entrance index={1}><Text style={styles.sectionTitle}>Subject mastery</Text></Entrance>
          {child.subjects.length === 0 ? (
            <Entrance index={2}>
              <EmptyState icon="chart" title="No quiz data yet" sub="Subject mastery appears once your child attempts quizzes." />
            </Entrance>
          ) : (
            child.subjects.map((s, i) => (
              <Entrance key={s.subjectId} index={2 + i}>
                <PressableScale style={styles.subjectCard}>
                  <View style={styles.subjectIcon}><Icon name={subjectIconName(s.name)} size={20} color={Colors.primaryDark} /></View>
                  <View style={styles.subjectBody}>
                    <View style={styles.subjectTop}>
                      <Text style={styles.subjectName}>{s.name}</Text>
                      <View style={[styles.trendChip, { backgroundColor: Colors.bg2 }]}>
                        <Text style={[styles.trendTxt, { color: Colors.text2 }]}>{s.rating}</Text>
                      </View>
                    </View>
                    <View style={styles.subjectBarRow}>
                      <ProgressBar value={s.pct} variant={ratingVariant(s.rating)} height={6} style={styles.subjectTrack} />
                      <Text style={styles.subjectPct}>{s.pct}%</Text>
                    </View>
                  </View>
                </PressableScale>
              </Entrance>
            ))
          )}

          {/* Recent activity */}
          <Entrance index={8}><Text style={[styles.sectionTitle, { marginTop: 4 }]}>Recent activity</Text></Entrance>
          {child.activity.length === 0 ? (
            <Entrance index={9}>
              <EmptyState icon="clock" title="No recent activity" sub="Lessons and quizzes will show up here." />
            </Entrance>
          ) : (
            <Entrance index={9} style={styles.timelineCard}>
              {child.activity.map((a, i) => (
                <View key={i} style={[styles.activityRow, i < child.activity.length - 1 && styles.activityDivider]}>
                  <View style={[styles.activityIcon, { backgroundColor: '#FDF4E8' }]}><Icon name="book" size={16} color={Colors.primaryDark} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.activityTitle} numberOfLines={1}>{a.title}</Text>
                    <Text style={styles.activityMeta}>{a.meta}</Text>
                  </View>
                </View>
              ))}
            </Entrance>
          )}
        </ScrollView>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A0A0C' },

  hero: { paddingHorizontal: 16, paddingBottom: 30, overflow: 'hidden' },
  heroGlow: { position: 'absolute', top: -80, right: -50, opacity: 0.8 },
  heading: { fontSize: 22, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.4, paddingTop: 6, marginBottom: 16 },

  heroProfile: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  childAvatar: { width: 60, height: 60, borderRadius: 19, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  childName: { fontSize: 19, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.3 },
  childMeta: { fontSize: 12, color: 'rgba(245,232,208,0.6)', fontWeight: '600', marginTop: 3 },

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
  trendTxt: { fontSize: 10, fontWeight: '800', textTransform: 'capitalize' },
  subjectBarRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  subjectTrack: { flex: 1, height: 6, borderRadius: 3 },
  subjectPct: { fontSize: 12, fontWeight: '800', color: Colors.text2, width: 34, textAlign: 'right' },

  timelineCard: { backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border2, paddingHorizontal: 14, ...Shadow.sm },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  activityDivider: { borderBottomWidth: 1, borderBottomColor: Colors.border2 },
  activityIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  activityTitle: { fontSize: 13, fontWeight: '700', color: Colors.text },
  activityMeta: { fontSize: 11, color: Colors.text2, marginTop: 2 },
});
