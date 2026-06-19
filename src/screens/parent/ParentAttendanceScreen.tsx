/**
 * Parent · Attendance — a premium attendance view: a hero ring for the month's
 * present-rate, present/absent/late summary tiles, a colour-coded month calendar
 * heatmap, a 6-month trend chart, and a recent-days list. Static mock for now.
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Animated, Easing } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../theme';
import { CircularProgress } from '../../components/common/CircularProgress';
import { Entrance, AnimatedCounter, Shimmer } from '../../components/common/anim';
import { GlowBlob } from '../../components/illustrations/OnboardingArt';
import { Icon, IconName } from '../../components/common/Icon';

type Status = 'present' | 'absent' | 'late' | 'off' | 'future';

const PRESENT_RATE = 92;
const SUMMARY: { icon: IconName; value: number; label: string; color: string; tint: string }[] = [
  { icon: 'checkmark', value: 22, label: 'Present', color: Colors.success, tint: Colors.successLight },
  { icon: 'close', value: 2, label: 'Absent', color: Colors.danger, tint: Colors.dangerLight },
  { icon: 'clock', value: 1, label: 'Late', color: Colors.warning, tint: Colors.warningLight },
  { icon: 'calendar', value: 5, label: 'Holidays', color: Colors.text2, tint: Colors.bg2 },
];

// One demo month (status per day-of-month, 1-indexed). Sundays = off.
const MONTH: Status[] = [
  'present', 'present', 'off', 'present', 'present', 'late', 'present',
  'present', 'present', 'off', 'absent', 'present', 'present', 'present',
  'present', 'present', 'off', 'present', 'present', 'present', 'absent',
  'present', 'present', 'off', 'present', 'present', 'present', 'present',
  'future', 'future',
];
const STATUS_COLOR: Record<Status, string> = {
  present: Colors.success,
  absent: Colors.danger,
  late: Colors.warning,
  off: Colors.border,
  future: Colors.bg2,
};
const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const TREND = [88, 94, 90, 96, 91, 92]; // last 6 months
const TREND_LABELS = ['J', 'F', 'M', 'A', 'M', 'J'];

const RECENT: { date: string; status: Status }[] = [
  { date: 'Mon, 16 Jun', status: 'present' },
  { date: 'Fri, 13 Jun', status: 'late' },
  { date: 'Thu, 12 Jun', status: 'present' },
  { date: 'Wed, 11 Jun', status: 'absent' },
  { date: 'Tue, 10 Jun', status: 'present' },
];
const STATUS_META: Record<Status, { label: string; color: string; tint: string }> = {
  present: { label: 'Present', color: Colors.success, tint: Colors.successLight },
  absent: { label: 'Absent', color: Colors.danger, tint: Colors.dangerLight },
  late: { label: 'Late', color: Colors.warning, tint: Colors.warningLight },
  off: { label: 'Holiday', color: Colors.text2, tint: Colors.bg2 },
  future: { label: '—', color: Colors.text3, tint: Colors.bg2 },
};

export const ParentAttendanceScreen: React.FC<{ navigation: any }> = () => (
  <View style={styles.container}>
    <StatusBar barStyle="light-content" backgroundColor="#1A0A0C" />

    <LinearGradient colors={['#1A0A0C', '#2A0E13', '#3D1520']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
      <View style={styles.heroGlow} pointerEvents="none"><GlowBlob size={220} /></View>
      <SafeAreaView edges={['top']}>
        <Text style={styles.heading}>Attendance</Text>
        <Entrance index={0} style={styles.heroCard}>
          <Shimmer />
          <CircularProgress size={104} strokeWidth={10} progress={PRESENT_RATE} trackColor="rgba(245,232,208,0.14)">
            <View style={styles.ringCenter}>
              <AnimatedCounter value={`${PRESENT_RATE}%`} style={styles.ringPct} />
              <Text style={styles.ringLbl}>Present</Text>
            </View>
          </CircularProgress>
          <View style={styles.heroInfo}>
            <Text style={styles.heroInfoTitle}>This month · June</Text>
            <Text style={styles.heroInfoSub}>Arjun attended 22 of 24 school days. Attendance is above the 85% class requirement.</Text>
          </View>
        </Entrance>
      </SafeAreaView>
    </LinearGradient>

    <ScrollView style={styles.sheet} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Summary tiles */}
      <Entrance index={0} style={styles.summaryGrid}>
        {SUMMARY.map(s => (
          <View key={s.label} style={styles.summaryTile}>
            <View style={[styles.summaryIcon, { backgroundColor: s.tint }]}><Icon name={s.icon} size={15} color={s.color} /></View>
            <AnimatedCounter value={s.value} style={[styles.summaryVal, { color: s.color }]} />
            <Text style={styles.summaryLbl}>{s.label}</Text>
          </View>
        ))}
      </Entrance>

      {/* Month calendar heatmap */}
      <Entrance index={1} style={styles.card}>
        <Text style={styles.cardTitle}>June 2026</Text>
        <View style={styles.dowRow}>
          {DOW.map((d, i) => <Text key={i} style={styles.dowTxt}>{d}</Text>)}
        </View>
        <View style={styles.calGrid}>
          {MONTH.map((st, i) => (
            <View key={i} style={styles.calCell}>
              <View style={[styles.calDot, { backgroundColor: STATUS_COLOR[st] }, st === 'future' && styles.calFuture]}>
                <Text style={[styles.calDay, (st === 'present' || st === 'absent' || st === 'late') && styles.calDayOn]}>{i + 1}</Text>
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

      {/* 6-month trend */}
      <Entrance index={2} style={styles.card}>
        <Text style={styles.cardTitle}>6-month trend</Text>
        <View style={styles.trendRow}>
          {TREND.map((v, i) => (
            <TrendBar key={i} pct={v} label={TREND_LABELS[i]} delay={i * 70} active={i === TREND.length - 1} />
          ))}
        </View>
      </Entrance>

      {/* Recent days */}
      <Entrance index={3}><Text style={[styles.sectionTitle, { marginTop: 4 }]}>Recent days</Text></Entrance>
      <Entrance index={4} style={styles.listCard}>
        {RECENT.map((r, i) => {
          const m = STATUS_META[r.status];
          return (
            <View key={i} style={[styles.recentRow, i < RECENT.length - 1 && styles.recentDivider]}>
              <View style={[styles.recentDot, { backgroundColor: m.color }]} />
              <Text style={styles.recentDate}>{r.date}</Text>
              <View style={[styles.recentBadge, { backgroundColor: m.tint }]}>
                <Text style={[styles.recentBadgeTxt, { color: m.color }]}>{m.label}</Text>
              </View>
            </View>
          );
        })}
      </Entrance>
    </ScrollView>
  </View>
);

const Legend: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <View style={styles.legendItem}>
    <View style={[styles.legendDot, { backgroundColor: color }]} />
    <Text style={styles.legendTxt}>{label}</Text>
  </View>
);

const TrendBar: React.FC<{ pct: number; label: string; delay: number; active: boolean }> = ({ pct, label, delay, active }) => {
  const h = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.timing(h, { toValue: pct / 100, duration: 750, delay, easing: Easing.out(Easing.cubic), useNativeDriver: false });
    a.start();
    return () => a.stop();
  }, [h, pct, delay]);
  const height = h.interpolate({ inputRange: [0, 1], outputRange: ['8%', '100%'] });
  return (
    <View style={styles.trendCol}>
      <Text style={styles.trendVal}>{pct}</Text>
      <View style={styles.trendTrack}>
        <Animated.View style={[styles.trendFill, { height }, active && styles.trendFillActive]} />
      </View>
      <Text style={[styles.trendLbl, active && styles.trendLblActive]}>{label}</Text>
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

  trendRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 110 },
  trendCol: { flex: 1, alignItems: 'center', gap: 5 },
  trendVal: { fontSize: 10, fontWeight: '700', color: Colors.text3 },
  trendTrack: { width: 18, height: 72, backgroundColor: Colors.bg2, borderRadius: Radius.full, overflow: 'hidden', justifyContent: 'flex-end' },
  trendFill: { width: '100%', borderRadius: Radius.full, backgroundColor: Colors.primary + '99' },
  trendFillActive: { backgroundColor: Colors.primary },
  trendLbl: { fontSize: 10, fontWeight: '700', color: Colors.text3 },
  trendLblActive: { color: Colors.primaryDark },

  sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.text },
  listCard: { backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border2, paddingHorizontal: 14, ...Shadow.sm },
  recentRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  recentDivider: { borderBottomWidth: 1, borderBottomColor: Colors.border2 },
  recentDot: { width: 10, height: 10, borderRadius: 5 },
  recentDate: { flex: 1, fontSize: 13, fontWeight: '700', color: Colors.text },
  recentBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  recentBadgeTxt: { fontSize: 11, fontWeight: '800' },
});
