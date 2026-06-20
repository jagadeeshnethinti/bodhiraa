/**
 * Parent · Attendance — a premium attendance view: a hero ring for the month's
 * present-rate, present/absent/late summary tiles, a colour-coded month calendar
 * heatmap and a recent-days list.
 *
 * Live data: ParentApi.attendance(studentId, month). The student id comes from a
 * `childId` route param when present, else the first linked child from
 * ParentApi.home(); the month defaults to the current calendar month.
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
import { Icon, IconName } from '../../components/common/Icon';
import { useApi } from '../../hooks/useApi';
import { ParentApi, type ParentDayStatus } from '../../api';

const STATUS_COLOR: Record<ParentDayStatus, string> = {
  present: Colors.success,
  absent: Colors.danger,
  late: Colors.warning,
  off: Colors.border,
  future: Colors.bg2,
};
const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const STATUS_META: Record<ParentDayStatus, { label: string; color: string; tint: string }> = {
  present: { label: 'Present', color: Colors.success, tint: Colors.successLight },
  absent: { label: 'Absent', color: Colors.danger, tint: Colors.dangerLight },
  late: { label: 'Late', color: Colors.warning, tint: Colors.warningLight },
  off: { label: 'Holiday', color: Colors.text2, tint: Colors.bg2 },
  future: { label: '—', color: Colors.text3, tint: Colors.bg2 },
};

/** Current month as "YYYY-MM". */
const currentMonth = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const ParentAttendanceScreen: React.FC<{ navigation: any; route?: any }> = ({ route }) => {
  const paramId: number | undefined = route?.params?.childId;
  const month = currentMonth();

  const home = useApi(signal => ParentApi.home(signal), []);
  const resolvedId = paramId ?? home.data?.child?.id ?? null;

  const att = useApi(
    signal => {
      if (resolvedId == null) return Promise.reject(new Error('No child linked to this account.'));
      return ParentApi.attendance(resolvedId, month, signal);
    },
    [resolvedId, month],
  );

  const loading = (home.loading && !home.data) || (resolvedId != null && att.loading && !att.data);
  const error = home.error ?? (resolvedId != null ? att.error : null);
  const noChild = !home.loading && resolvedId == null;
  const data = att.data;

  const summaryTiles: { icon: IconName; value: number; label: string; color: string; tint: string }[] = data
    ? [
        { icon: 'checkmark', value: data.summary.present, label: 'Present', color: Colors.success, tint: Colors.successLight },
        { icon: 'close', value: data.summary.absent, label: 'Absent', color: Colors.danger, tint: Colors.dangerLight },
        { icon: 'clock', value: data.summary.late, label: 'Late', color: Colors.warning, tint: Colors.warningLight },
        { icon: 'calendar', value: data.summary.excused, label: 'Excused', color: Colors.text2, tint: Colors.bg2 },
      ]
    : [];

  const onRefresh = () => { home.refetch(); att.refetch(); };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A0A0C" />

      <LinearGradient colors={['#1A0A0C', '#2A0E13', '#3D1520']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroGlow} pointerEvents="none"><GlowBlob size={220} /></View>
        <SafeAreaView edges={['top']}>
          <Text style={styles.heading}>Attendance</Text>
          <Entrance index={0} style={styles.heroCard}>
            <Shimmer />
            <CircularProgress size={104} strokeWidth={10} progress={data?.presentRate ?? 0} trackColor="rgba(245,232,208,0.14)">
              <View style={styles.ringCenter}>
                <AnimatedCounter value={`${data?.presentRate ?? 0}%`} style={styles.ringPct} />
                <Text style={styles.ringLbl}>Present</Text>
              </View>
            </CircularProgress>
            <View style={styles.heroInfo}>
              <Text style={styles.heroInfoTitle}>{data?.monthLabel ?? 'This month'}</Text>
              <Text style={styles.heroInfoSub}>
                {data
                  ? `Present on ${data.summary.present} of ${data.summary.total} school days.`
                  : 'Loading attendance…'}
              </Text>
            </View>
          </Entrance>
        </SafeAreaView>
      </LinearGradient>

      {loading ? (
        <View style={styles.sheet}><LoadingState /></View>
      ) : noChild ? (
        <View style={styles.sheet}>
          <EmptyState icon="child" title="No child linked" sub="Once your child is linked, their attendance appears here." />
        </View>
      ) : error ? (
        <View style={styles.sheet}><ErrorState message={error} onRetry={onRefresh} /></View>
      ) : data ? (
        <ScrollView
          style={styles.sheet}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={att.refreshing || home.refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        >
          {/* Summary tiles */}
          <Entrance index={0} style={styles.summaryGrid}>
            {summaryTiles.map(s => (
              <View key={s.label} style={styles.summaryTile}>
                <View style={[styles.summaryIcon, { backgroundColor: s.tint }]}><Icon name={s.icon} size={15} color={s.color} /></View>
                <AnimatedCounter value={s.value} style={[styles.summaryVal, { color: s.color }]} />
                <Text style={styles.summaryLbl}>{s.label}</Text>
              </View>
            ))}
          </Entrance>

          {/* Month calendar heatmap */}
          {data.days.length === 0 ? (
            <Entrance index={1}>
              <EmptyState icon="calendar" title="No attendance records" sub="Records for this month will appear here." />
            </Entrance>
          ) : (
            <Entrance index={1} style={styles.card}>
              <Text style={styles.cardTitle}>{data.monthLabel}</Text>
              <View style={styles.dowRow}>
                {DOW.map((d, i) => <Text key={i} style={styles.dowTxt}>{d}</Text>)}
              </View>
              <View style={styles.calGrid}>
                {data.days.map(d => (
                  <View key={d.date} style={styles.calCell}>
                    <View style={[styles.calDot, { backgroundColor: STATUS_COLOR[d.status] }, d.status === 'future' && styles.calFuture]}>
                      <Text style={[styles.calDay, (d.status === 'present' || d.status === 'absent' || d.status === 'late') && styles.calDayOn]}>{d.day}</Text>
                    </View>
                  </View>
                ))}
              </View>
              <View style={styles.legend}>
                <Legend color={Colors.success} label="Present" />
                <Legend color={Colors.danger} label="Absent" />
                <Legend color={Colors.warning} label="Late" />
                <Legend color={Colors.border} label="Holiday" />
              </View>
            </Entrance>
          )}

          {/* Recent days */}
          {data.recent.length > 0 && (
            <>
              <Entrance index={2}><Text style={[styles.sectionTitle, { marginTop: 4 }]}>Recent days</Text></Entrance>
              <Entrance index={3} style={styles.listCard}>
                {data.recent.map((r, i) => {
                  const m = STATUS_META[r.status];
                  return (
                    <View key={i} style={[styles.recentRow, i < data.recent.length - 1 && styles.recentDivider]}>
                      <View style={[styles.recentDot, { backgroundColor: m.color }]} />
                      <Text style={styles.recentDate}>{r.date}</Text>
                      <View style={[styles.recentBadge, { backgroundColor: m.tint }]}>
                        <Text style={[styles.recentBadgeTxt, { color: m.color }]}>{m.label}</Text>
                      </View>
                    </View>
                  );
                })}
              </Entrance>
            </>
          )}
        </ScrollView>
      ) : null}
    </View>
  );
};

const Legend: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <View style={styles.legendItem}>
    <View style={[styles.legendDot, { backgroundColor: color }]} />
    <Text style={styles.legendTxt}>{label}</Text>
  </View>
);

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
  content: { padding: 16, paddingTop: 22, gap: 14, paddingBottom: 32 },

  summaryGrid: { flexDirection: 'row', gap: 8 },
  summaryTile: { flex: 1, alignItems: 'center', gap: 5, paddingVertical: 13, backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border2, ...Shadow.sm },
  summaryIcon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  summaryVal: { fontSize: 18, fontWeight: '900' },
  summaryLbl: { fontSize: 9, color: Colors.text3, fontWeight: '700', letterSpacing: 0.3 },

  card: { backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border2, padding: 16, ...Shadow.md },
  cardTitle: { fontSize: 14.5, fontWeight: '800', color: Colors.text, marginBottom: 14 },
  dowRow: { flexDirection: 'row', marginBottom: 8 },
  dowTxt: { flex: 1, textAlign: 'center', fontSize: 10, fontWeight: '700', color: Colors.text3 },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 3 },
  calDot: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  calFuture: { borderWidth: 1, borderColor: Colors.border2 },
  calDay: { fontSize: 11, fontWeight: '700', color: Colors.text2 },
  calDayOn: { color: Colors.white },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 10, height: 10, borderRadius: 3 },
  legendTxt: { fontSize: 10.5, color: Colors.text2, fontWeight: '600' },

  sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.text },
  listCard: { backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border2, paddingHorizontal: 14, ...Shadow.sm },
  recentRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  recentDivider: { borderBottomWidth: 1, borderBottomColor: Colors.border2 },
  recentDot: { width: 10, height: 10, borderRadius: 5 },
  recentDate: { flex: 1, fontSize: 13, fontWeight: '700', color: Colors.text },
  recentBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  recentBadgeTxt: { fontSize: 11, fontWeight: '800' },
});
