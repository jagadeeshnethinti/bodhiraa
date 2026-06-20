/**
 * Parent · Reports — subject grades and the overall term percentage. Premium hero
 * with the overall-average ring.
 *
 * Live data: ParentApi.performance(studentId). The student id comes from a
 * `childId` route param when present, else the first linked child from
 * ParentApi.home().
 *
 * NOTE: downloadable report-card PDFs, the term-over-term trend chart and the
 * teacher's remark have no backend source yet, so those sections are omitted
 * rather than faked.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, RefreshControl } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../theme';
import { CircularProgress } from '../../components/common/CircularProgress';
import { LoadingState, ErrorState, EmptyState } from '../../components/common/ScreenStates';
import { Entrance, AnimatedCounter, Shimmer } from '../../components/common/anim';
import { GlowBlob } from '../../components/illustrations/OnboardingArt';
import { Icon } from '../../components/common/Icon';
import { useApi } from '../../hooks/useApi';
import { ParentApi } from '../../api';
import { subjectIconName } from '../../utils/ui';

const gradeColor = (pct: number) => (pct >= 80 ? Colors.success : pct >= 60 ? Colors.warning : Colors.danger);

/** Letter grade matching the endpoint's banding for the hero label. */
const letterGrade = (pct: number): string => {
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B+';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C';
  return 'D';
};

export const ParentReportsScreen: React.FC<{ navigation: any; route?: any }> = ({ route }) => {
  const paramId: number | undefined = route?.params?.childId;
  const home = useApi(signal => ParentApi.home(signal), []);
  const resolvedId = paramId ?? home.data?.child?.id ?? null;

  const perf = useApi(
    signal => {
      if (resolvedId == null) return Promise.reject(new Error('No child linked to this account.'));
      return ParentApi.performance(resolvedId, signal);
    },
    [resolvedId],
  );

  const loading = (home.loading && !home.data) || (resolvedId != null && perf.loading && !perf.data);
  const error = home.error ?? (resolvedId != null ? perf.error : null);
  const noChild = !home.loading && resolvedId == null;
  const data = perf.data;
  const overall = data?.overallAvg ?? 0;

  const onRefresh = () => { home.refetch(); perf.refetch(); };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A0A0C" />

      <LinearGradient colors={['#1A0A0C', '#2A0E13', '#3D1520']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroGlow} pointerEvents="none"><GlowBlob size={220} /></View>
        <SafeAreaView edges={['top']}>
          <Text style={styles.heading}>Reports</Text>
          <Entrance index={0} style={styles.heroCard}>
            <Shimmer />
            <CircularProgress size={104} strokeWidth={10} progress={overall} trackColor="rgba(245,232,208,0.14)">
              <View style={styles.ringCenter}>
                <AnimatedCounter value={`${overall}%`} style={styles.ringPct} />
                <Text style={styles.ringLbl}>Grade {letterGrade(overall)}</Text>
              </View>
            </CircularProgress>
            <View style={styles.heroInfo}>
              <Text style={styles.heroInfoTitle}>Overall average</Text>
              <Text style={styles.heroInfoSub}>Average across all quiz subjects for your child this term.</Text>
            </View>
          </Entrance>
        </SafeAreaView>
      </LinearGradient>

      {loading ? (
        <View style={styles.sheet}><LoadingState /></View>
      ) : noChild ? (
        <View style={styles.sheet}>
          <EmptyState icon="child" title="No child linked" sub="Once your child is linked, their reports appear here." />
        </View>
      ) : error ? (
        <View style={styles.sheet}><ErrorState message={error} onRetry={onRefresh} /></View>
      ) : data ? (
        <ScrollView
          style={styles.sheet}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={perf.refreshing || home.refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        >
          {/* Subject grades */}
          <Entrance index={0}><Text style={styles.sectionTitle}>Subject grades</Text></Entrance>
          {data.subjects.length === 0 ? (
            <Entrance index={1}>
              <EmptyState icon="clipboard" title="No grades yet" sub="Subject grades appear once your child attempts quizzes." />
            </Entrance>
          ) : (
            <Entrance index={1} style={styles.gradesCard}>
              {data.subjects.map((g, i) => (
                <View key={g.subjectId} style={[styles.gradeRow, i < data.subjects.length - 1 && styles.gradeDivider]}>
                  <View style={styles.gradeIcon}><Icon name={subjectIconName(g.name)} size={18} color={Colors.primaryDark} /></View>
                  <Text style={styles.gradeName}>{g.name}</Text>
                  <Text style={styles.gradePct}>{g.pct}%</Text>
                  <View style={[styles.gradeBadge, { backgroundColor: gradeColor(g.pct) }]}>
                    <Text style={styles.gradeBadgeTxt}>{g.grade}</Text>
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
  heroGlow: { position: 'absolute', top: -60, right: -40, opacity: 0.8 },
  heading: { fontSize: 22, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.4, paddingTop: 6 },
  heroCard: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 14, backgroundColor: 'rgba(245,232,208,0.07)', borderWidth: 1, borderColor: 'rgba(196,149,96,0.22)', borderRadius: Radius.xl, padding: 16, overflow: 'hidden' },
  ringCenter: { alignItems: 'center', justifyContent: 'center' },
  ringPct: { fontSize: 21, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.6 },
  ringLbl: { fontSize: 9, fontWeight: '700', color: 'rgba(245,232,208,0.6)', letterSpacing: 0.5, marginTop: 1 },
  heroInfo: { flex: 1 },
  heroInfoTitle: { fontSize: 13, fontWeight: '800', color: '#F5E8D0' },
  heroInfoSub: { fontSize: 11, color: 'rgba(245,232,208,0.7)', lineHeight: 16, marginTop: 4 },

  sheet: { flex: 1, backgroundColor: Colors.bg, marginTop: -18, borderTopLeftRadius: 26, borderTopRightRadius: 26 },
  content: { padding: 16, paddingTop: 22, gap: 12, paddingBottom: 32 },

  sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.text },

  gradesCard: { backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border2, paddingHorizontal: 14, ...Shadow.sm },
  gradeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  gradeDivider: { borderBottomWidth: 1, borderBottomColor: Colors.border2 },
  gradeIcon: { width: 38, height: 38, borderRadius: 11, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  gradeName: { flex: 1, fontSize: 13, fontWeight: '700', color: Colors.text },
  gradePct: { fontSize: 13, fontWeight: '800', color: Colors.text2 },
  gradeBadge: { width: 36, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  gradeBadgeTxt: { fontSize: 11, fontWeight: '900', color: Colors.white },
});
