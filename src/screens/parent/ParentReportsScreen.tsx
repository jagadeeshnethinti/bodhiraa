/**
 * Parent · Reports — downloadable term report cards, a term-over-term trend
 * chart, subject grades and a teacher's remark. Premium hero with the latest
 * term percentage ring. Static mock for now (report endpoints land in v1).
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Animated, Easing } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../theme';
import { CircularProgress } from '../../components/common/CircularProgress';
import { Entrance, PressableScale, AnimatedCounter, Pulse, Shimmer } from '../../components/common/anim';
import { GlowBlob } from '../../components/illustrations/OnboardingArt';
import { Icon, IconName } from '../../components/common/Icon';

const LATEST = 79; // latest term percentage

const REPORTS: { term: string; date: string; pct: number; grade: string; ready: boolean }[] = [
  { term: 'Term 2 · Mid-year', date: 'Issued 10 Jun 2026', pct: 79, grade: 'A', ready: true },
  { term: 'Term 1 · Unit Test 2', date: 'Issued 28 Mar 2026', pct: 74, grade: 'B+', ready: true },
  { term: 'Term 1 · Unit Test 1', date: 'Issued 12 Jan 2026', pct: 71, grade: 'B+', ready: true },
];

const TREND = [68, 71, 74, 79]; // UT1 → mid-year
const TREND_LABELS = ['UT1', 'UT2', 'T1', 'T2'];

const GRADES: { icon: IconName; name: string; pct: number; grade: string }[] = [
  { icon: 'book', name: 'English', pct: 91, grade: 'A+' },
  { icon: 'calculator', name: 'Mathematics', pct: 84, grade: 'A' },
  { icon: 'flask', name: 'Chemistry', pct: 62, grade: 'B' },
  { icon: 'microscope', name: 'Physics', pct: 58, grade: 'C+' },
];

const gradeColor = (pct: number) => (pct >= 80 ? Colors.success : pct >= 60 ? Colors.warning : Colors.danger);

export const ParentReportsScreen: React.FC<{ navigation: any }> = () => (
  <View style={styles.container}>
    <StatusBar barStyle="light-content" backgroundColor="#1A0A0C" />

    <LinearGradient colors={['#1A0A0C', '#2A0E13', '#3D1520']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
      <View style={styles.heroGlow} pointerEvents="none"><GlowBlob size={220} /></View>
      <SafeAreaView edges={['top']}>
        <Text style={styles.heading}>Reports</Text>
        <Entrance index={0} style={styles.heroCard}>
          <Shimmer />
          <CircularProgress size={104} strokeWidth={10} progress={LATEST} trackColor="rgba(245,232,208,0.14)">
            <View style={styles.ringCenter}>
              <AnimatedCounter value={`${LATEST}%`} style={styles.ringPct} />
              <Text style={styles.ringLbl}>Grade A</Text>
            </View>
          </CircularProgress>
          <View style={styles.heroInfo}>
            <Text style={styles.heroInfoTitle}>Term 2 · Mid-year</Text>
            <Text style={styles.heroInfoSub}>Overall percentage rose 5 points from the last term — strong, steady improvement.</Text>
          </View>
        </Entrance>
      </SafeAreaView>
    </LinearGradient>

    <ScrollView style={styles.sheet} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Trend */}
      <Entrance index={0} style={styles.card}>
        <Text style={styles.cardTitle}>Performance trend</Text>
        <View style={styles.trendRow}>
          {TREND.map((v, i) => (
            <TrendBar key={i} pct={v} label={TREND_LABELS[i]} delay={i * 80} active={i === TREND.length - 1} />
          ))}
        </View>
      </Entrance>

      {/* Report cards */}
      <Entrance index={1}><Text style={styles.sectionTitle}>Report cards</Text></Entrance>
      {REPORTS.map((r, i) => (
        <Entrance key={r.term} index={2 + i}>
          <PressableScale style={styles.reportCard}>
            <View style={styles.reportIcon}><Icon name="pdf" size={22} color={Colors.danger} /></View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.reportTerm} numberOfLines={1}>{r.term}</Text>
              <Text style={styles.reportDate}>{r.date}</Text>
            </View>
            <View style={styles.reportRight}>
              <View style={[styles.gradePill, { backgroundColor: gradeColor(r.pct) + '1A' }]}>
                <Text style={[styles.gradePillTxt, { color: gradeColor(r.pct) }]}>{r.grade} · {r.pct}%</Text>
              </View>
              <View style={styles.dlBtn}><Icon name="upload" size={13} color={Colors.primaryDark} /><Text style={styles.dlTxt}>PDF</Text></View>
            </View>
          </PressableScale>
        </Entrance>
      ))}

      {/* Subject grades */}
      <Entrance index={6}><Text style={[styles.sectionTitle, { marginTop: 4 }]}>Subject grades · Term 2</Text></Entrance>
      <Entrance index={7} style={styles.gradesCard}>
        {GRADES.map((g, i) => (
          <View key={g.name} style={[styles.gradeRow, i < GRADES.length - 1 && styles.gradeDivider]}>
            <View style={styles.gradeIcon}><Icon name={g.icon} size={18} color={Colors.primaryDark} /></View>
            <Text style={styles.gradeName}>{g.name}</Text>
            <Text style={styles.gradePct}>{g.pct}%</Text>
            <View style={[styles.gradeBadge, { backgroundColor: gradeColor(g.pct) }]}>
              <Text style={styles.gradeBadgeTxt}>{g.grade}</Text>
            </View>
          </View>
        ))}
      </Entrance>

      {/* Teacher remark */}
      <Entrance index={8} style={styles.remarkCard}>
        <Pulse style={styles.remarkIcon}><Icon name="chat" size={18} color={Colors.primaryDark} /></Pulse>
        <View style={{ flex: 1 }}>
          <Text style={styles.remarkLabel}>Class teacher's remark</Text>
          <Text style={styles.remarkText}>
            "Arjun is attentive and consistent. Focus on Physics numericals and Organic Chemistry to push into the top tier next term."
          </Text>
          <Text style={styles.remarkBy}>— Mrs. Nair, Class 11-A</Text>
        </View>
      </Entrance>
    </ScrollView>
  </View>
);

const TrendBar: React.FC<{ pct: number; label: string; delay: number; active: boolean }> = ({ pct, label, delay, active }) => {
  const h = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.timing(h, { toValue: pct / 100, duration: 800, delay, easing: Easing.out(Easing.cubic), useNativeDriver: false });
    a.start();
    return () => a.stop();
  }, [h, pct, delay]);
  const height = h.interpolate({ inputRange: [0, 1], outputRange: ['10%', '100%'] });
  return (
    <View style={styles.trendCol}>
      <Text style={styles.trendVal}>{pct}%</Text>
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
  content: { padding: 16, paddingTop: 22, gap: 12, paddingBottom: 32 },

  card: { backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border2, padding: 16, ...Shadow.md },
  cardTitle: { fontSize: 14.5, fontWeight: '800', color: Colors.text, marginBottom: 14 },

  trendRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 116 },
  trendCol: { flex: 1, alignItems: 'center', gap: 6 },
  trendVal: { fontSize: 10.5, fontWeight: '800', color: Colors.text3 },
  trendTrack: { width: 22, height: 74, backgroundColor: Colors.bg2, borderRadius: Radius.full, overflow: 'hidden', justifyContent: 'flex-end' },
  trendFill: { width: '100%', borderRadius: Radius.full, backgroundColor: Colors.primary + '99' },
  trendFillActive: { backgroundColor: Colors.primary },
  trendLbl: { fontSize: 10, fontWeight: '700', color: Colors.text3 },
  trendLblActive: { color: Colors.primaryDark },

  sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.text },

  reportCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border2, padding: 12, ...Shadow.sm },
  reportIcon: { width: 44, height: 44, borderRadius: 13, backgroundColor: Colors.dangerLight, alignItems: 'center', justifyContent: 'center' },
  reportTerm: { fontSize: 13.5, fontWeight: '800', color: Colors.text },
  reportDate: { fontSize: 11, color: Colors.text2, marginTop: 2 },
  reportRight: { alignItems: 'flex-end', gap: 6 },
  gradePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  gradePillTxt: { fontSize: 11, fontWeight: '800' },
  dlBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dlTxt: { fontSize: 11, fontWeight: '800', color: Colors.primaryDark },

  gradesCard: { backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border2, paddingHorizontal: 14, ...Shadow.sm },
  gradeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  gradeDivider: { borderBottomWidth: 1, borderBottomColor: Colors.border2 },
  gradeIcon: { width: 38, height: 38, borderRadius: 11, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  gradeName: { flex: 1, fontSize: 13, fontWeight: '700', color: Colors.text },
  gradePct: { fontSize: 13, fontWeight: '800', color: Colors.text2 },
  gradeBadge: { width: 36, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  gradeBadgeTxt: { fontSize: 11, fontWeight: '900', color: Colors.white },

  remarkCard: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', backgroundColor: Colors.primaryLight, borderRadius: Radius.lg, borderWidth: 1, borderColor: 'rgba(196,149,96,0.25)', padding: 14, marginTop: 4 },
  remarkIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center' },
  remarkLabel: { fontSize: 11, fontWeight: '800', color: Colors.primaryDark, letterSpacing: 0.3 },
  remarkText: { fontSize: 12.5, color: Colors.text, lineHeight: 18, marginTop: 4 },
  remarkBy: { fontSize: 11, fontWeight: '700', color: Colors.text2, marginTop: 6 },
});
