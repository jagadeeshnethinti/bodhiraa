/**
 * Admin · Analytics — school-wide insights: an overall-average ring, KPI tiles,
 * an animated enrolment trend chart, grade-wise performance bars, and top/at-risk
 * classes. Export action. Static mock for now.
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Animated, Easing, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../theme';
import { Button } from '../../components/common/Button';
import { ProgressBar } from '../../components/common/ProgressBar';
import { CircularProgress } from '../../components/common/CircularProgress';
import { Entrance, AnimatedCounter, Shimmer } from '../../components/common/anim';
import { GlowBlob } from '../../components/illustrations/OnboardingArt';
import { BoldIcon as Icon, BoldIconName as IconName } from '../../components/common/BoldIcon';

const AVG = 74;
const KPIS: { icon: IconName; value: string; label: string; color: string; tint: string }[] = [
  { icon: 'attendance', value: '94%', label: 'Attendance', color: Colors.success, tint: '#EDFAF4' },
  { icon: 'card', value: '88%', label: 'Fees paid', color: Colors.primaryDark, tint: '#FDF4E8' },
  { icon: 'rocket', value: '+6%', label: 'vs last term', color: '#2F4DA0', tint: '#EAF2FF' },
];
const ENROL = [980, 1040, 1080, 1130, 1190, 1248]; // last 6 terms
const ENROL_LABELS = ['T1', 'T2', 'T3', 'T4', 'T5', 'Now'];
const GRADES: { name: string; pct: number; variant: 'success' | 'warning' | 'teal' }[] = [
  { name: 'Grade 12', pct: 79, variant: 'success' },
  { name: 'Grade 11', pct: 76, variant: 'teal' },
  { name: 'Grade 10', pct: 68, variant: 'warning' },
  { name: 'Grade 9', pct: 72, variant: 'teal' },
];

export const AdminAnalyticsScreen: React.FC<{ navigation: any }> = () => (
  <View style={styles.container}>
    <StatusBar barStyle="light-content" backgroundColor="#1A0A0C" />

    <LinearGradient colors={['#1A0A0C', '#2A0E13', '#3D1520']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
      <View style={styles.heroGlow} pointerEvents="none"><GlowBlob size={220} /></View>
      <SafeAreaView edges={['top']}>
        <Text style={styles.heading}>Analytics</Text>
        <Entrance index={0} style={styles.heroCard}>
          <Shimmer />
          <CircularProgress size={104} strokeWidth={10} progress={AVG} trackColor="rgba(245,232,208,0.14)">
            <View style={styles.ringCenter}>
              <AnimatedCounter value={`${AVG}%`} style={styles.ringPct} />
              <Text style={styles.ringLbl}>School avg</Text>
            </View>
          </CircularProgress>
          <View style={styles.heroInfo}>
            <Text style={styles.heroInfoTitle}>This term</Text>
            <Text style={styles.heroInfoSub}>1,248 students across 42 classes. Performance is up 6% on last term with strong attendance.</Text>
          </View>
        </Entrance>
      </SafeAreaView>
    </LinearGradient>

    <ScrollView style={styles.sheet} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Entrance index={0}>
        <Button label="Export report" variant="outline" icon={<Icon name="upload" size={15} color={Colors.brand} />} onPress={() => Alert.alert('Export', 'A PDF/CSV export will be available in v1.')} />
      </Entrance>

      {/* KPIs */}
      <Entrance index={1} style={styles.kpiGrid}>
        {KPIS.map(k => (
          <View key={k.label} style={styles.kpiTile}>
            <View style={[styles.kpiIcon, { backgroundColor: k.tint }]}><Icon name={k.icon} size={15} color={k.color} /></View>
            <Text style={[styles.kpiVal, { color: k.color }]}>{k.value}</Text>
            <Text style={styles.kpiLbl}>{k.label}</Text>
          </View>
        ))}
      </Entrance>

      {/* Enrolment trend */}
      <Entrance index={2} style={styles.card}>
        <View style={styles.cardHead}>
          <Text style={styles.cardTitle}>Enrolment trend</Text>
          <View style={styles.totalChip}><Text style={styles.totalChipTxt}>+27% YoY</Text></View>
        </View>
        <View style={styles.barsRow}>
          {ENROL.map((v, i) => (
            <Bar key={i} pct={v / Math.max(...ENROL)} label={ENROL_LABELS[i]} delay={i * 70} active={i === ENROL.length - 1} />
          ))}
        </View>
      </Entrance>

      {/* Grade performance */}
      <Entrance index={3} style={styles.card}>
        <Text style={styles.cardTitle}>Grade-wise performance</Text>
        {GRADES.map((g, i) => (
          <View key={g.name} style={[styles.gradeRow, i < GRADES.length - 1 && styles.divider]}>
            <View style={{ flex: 1, gap: 7 }}>
              <View style={styles.gradeTop}>
                <Text style={styles.gradeName}>{g.name}</Text>
                <Text style={styles.gradePct}>{g.pct}%</Text>
              </View>
              <ProgressBar value={g.pct} variant={g.variant} height={6} />
            </View>
          </View>
        ))}
      </Entrance>

      {/* Highlights */}
      <Entrance index={4} style={styles.card}>
        <Text style={styles.cardTitle}>Highlights</Text>
        <View style={styles.hlRow}>
          <View style={[styles.hlIcon, { backgroundColor: Colors.successLight }]}><Icon name="trophy" size={15} color={Colors.success} /></View>
          <View style={{ flex: 1 }}><Text style={styles.hlTitle}>Top class · 12-A</Text><Text style={styles.hlSub}>82% average · Dr. Meera Sharma</Text></View>
        </View>
        <View style={[styles.hlRow, { marginTop: 10 }]}>
          <View style={[styles.hlIcon, { backgroundColor: Colors.dangerLight }]}><Icon name="warning" size={15} color={Colors.danger} /></View>
          <View style={{ flex: 1 }}><Text style={styles.hlTitle}>Needs attention · 10-C</Text><Text style={styles.hlSub}>68% average · attendance dipping</Text></View>
        </View>
      </Entrance>
    </ScrollView>
  </View>
);

const Bar: React.FC<{ pct: number; label: string; delay: number; active: boolean }> = ({ pct, label, delay, active }) => {
  const h = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.timing(h, { toValue: pct, duration: 750, delay, easing: Easing.out(Easing.cubic), useNativeDriver: false });
    a.start();
    return () => a.stop();
  }, [h, pct, delay]);
  const height = h.interpolate({ inputRange: [0, 1], outputRange: ['12%', '100%'] });
  return (
    <View style={styles.barCol}>
      <View style={styles.barTrack}><Animated.View style={[styles.barFill, { height }, active && styles.barFillActive]} /></View>
      <Text style={[styles.barLbl, active && styles.barLblActive]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A0A0C' },
  hero: { paddingHorizontal: 16, paddingBottom: 28, overflow: 'hidden' },
  heroGlow: { position: 'absolute', top: -60, right: -40, opacity: 0.8 },
  heading: { fontSize: 22, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.4, paddingTop: 6 },
  heroCard: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 14, backgroundColor: 'rgba(245,232,208,0.07)', borderWidth: 1, borderColor: 'rgba(196,149,96,0.22)', borderRadius: Radius.xl, padding: 16, overflow: 'hidden' },
  ringCenter: { alignItems: 'center', justifyContent: 'center' },
  ringPct: { fontSize: 21, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.6 },
  ringLbl: { fontSize: 9, fontWeight: '700', color: 'rgba(245,232,208,0.6)', marginTop: 1 },
  heroInfo: { flex: 1 },
  heroInfoTitle: { fontSize: 13, fontWeight: '800', color: '#F5E8D0' },
  heroInfoSub: { fontSize: 11, color: 'rgba(245,232,208,0.7)', lineHeight: 16, marginTop: 4 },

  sheet: { flex: 1, backgroundColor: Colors.bg, marginTop: -16, borderTopLeftRadius: 26, borderTopRightRadius: 26 },
  content: { padding: 16, paddingTop: 22, gap: 12, paddingBottom: 32 },

  kpiGrid: { flexDirection: 'row', gap: 8 },
  kpiTile: { flex: 1, alignItems: 'center', gap: 5, paddingVertical: 13, backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border2, ...Shadow.sm },
  kpiIcon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  kpiVal: { fontSize: 17, fontWeight: '900' },
  kpiLbl: { fontSize: 9.5, color: Colors.text3, fontWeight: '700' },

  card: { backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border2, padding: 16, ...Shadow.sm },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  cardTitle: { fontSize: 14.5, fontWeight: '800', color: Colors.text, marginBottom: 12 },
  totalChip: { backgroundColor: Colors.successLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full, marginBottom: 12 },
  totalChipTxt: { fontSize: 11, fontWeight: '800', color: Colors.success },

  barsRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 100 },
  barCol: { flex: 1, alignItems: 'center', gap: 8 },
  barTrack: { width: 16, height: 78, backgroundColor: Colors.bg2, borderRadius: Radius.full, overflow: 'hidden', justifyContent: 'flex-end' },
  barFill: { width: '100%', borderRadius: Radius.full, backgroundColor: Colors.primary + '99' },
  barFillActive: { backgroundColor: Colors.primary },
  barLbl: { fontSize: 10, fontWeight: '700', color: Colors.text3 },
  barLblActive: { color: Colors.primaryDark },

  gradeRow: { paddingVertical: 11 },
  divider: { borderBottomWidth: 1, borderBottomColor: Colors.border2 },
  gradeTop: { flexDirection: 'row', justifyContent: 'space-between' },
  gradeName: { fontSize: 13, fontWeight: '700', color: Colors.text },
  gradePct: { fontSize: 13, fontWeight: '800', color: Colors.text2 },

  hlRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  hlIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  hlTitle: { fontSize: 13, fontWeight: '800', color: Colors.text },
  hlSub: { fontSize: 11, color: Colors.text2, marginTop: 2 },
});
