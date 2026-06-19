/**
 * Teacher · Reports — class analytics: an overall-average hero ring, per-class
 * performance bars, a weekly submissions chart, and topic mastery (strong/weak).
 * Export action. Static mock for now.
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
import { Icon } from '../../components/common/Icon';

const OVERALL = 76;
const CLASSES: { name: string; pct: number; variant: 'success' | 'warning' | 'teal' }[] = [
  { name: 'Class 11-A · Physics', pct: 78, variant: 'success' },
  { name: 'Class 12-B · Chemistry', pct: 65, variant: 'warning' },
  { name: 'Class 10-C · Maths', pct: 88, variant: 'teal' },
];
const SUBMISSIONS = [32, 41, 28, 45, 38, 22, 12]; // this week
const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const TOPICS_STRONG = ['Kinematics', 'Electrostatics', 'Algebra'];
const TOPICS_WEAK = ['Wave Optics', 'Organic Chemistry', 'Calculus'];

export const TeacherReportsScreen: React.FC<{ navigation: any }> = () => (
  <View style={styles.container}>
    <StatusBar barStyle="light-content" backgroundColor="#1A0A0C" />

    <LinearGradient colors={['#1A0A0C', '#2A0E13', '#3D1520']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
      <View style={styles.heroGlow} pointerEvents="none"><GlowBlob size={220} /></View>
      <SafeAreaView edges={['top']}>
        <Text style={styles.heading}>Reports</Text>
        <Entrance index={0} style={styles.heroCard}>
          <Shimmer />
          <CircularProgress size={104} strokeWidth={10} progress={OVERALL} trackColor="rgba(245,232,208,0.14)">
            <View style={styles.ringCenter}>
              <AnimatedCounter value={`${OVERALL}%`} style={styles.ringPct} />
              <Text style={styles.ringLbl}>Overall</Text>
            </View>
          </CircularProgress>
          <View style={styles.heroInfo}>
            <Text style={styles.heroInfoTitle}>All classes · this term</Text>
            <Text style={styles.heroInfoSub}>125 students across 3 classes. 10-C is leading at 88%; 12-B needs attention at 65%.</Text>
          </View>
        </Entrance>
      </SafeAreaView>
    </LinearGradient>

    <ScrollView style={styles.sheet} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Entrance index={0}>
        <Button label="Export report" variant="outline" icon={<Icon name="upload" size={15} color={Colors.brand} />} onPress={() => Alert.alert('Export', 'A PDF/CSV export will be available in v1.')} />
      </Entrance>

      {/* Class performance */}
      <Entrance index={1} style={styles.card}>
        <Text style={styles.cardTitle}>Class performance</Text>
        {CLASSES.map((c, i) => (
          <View key={c.name} style={[styles.classRow, i < CLASSES.length - 1 && styles.divider]}>
            <View style={{ flex: 1, gap: 7 }}>
              <View style={styles.classTop}>
                <Text style={styles.className}>{c.name}</Text>
                <Text style={styles.classPct}>{c.pct}%</Text>
              </View>
              <ProgressBar value={c.pct} variant={c.variant} height={6} />
            </View>
          </View>
        ))}
      </Entrance>

      {/* Weekly submissions */}
      <Entrance index={2} style={styles.card}>
        <View style={styles.cardHead}>
          <Text style={styles.cardTitle}>Submissions this week</Text>
          <View style={styles.totalChip}><Text style={styles.totalChipTxt}>218 total</Text></View>
        </View>
        <View style={styles.barsRow}>
          {SUBMISSIONS.map((v, i) => (
            <Bar key={i} pct={v / Math.max(...SUBMISSIONS)} label={DOW[i]} delay={i * 70} active={i === SUBMISSIONS.length - 1} />
          ))}
        </View>
      </Entrance>

      {/* Topic mastery */}
      <Entrance index={3} style={styles.card}>
        <Text style={styles.cardTitle}>Topic mastery</Text>
        <View style={styles.topicBlock}>
          <View style={styles.topicLabelRow}><View style={[styles.topicDot, { backgroundColor: Colors.success }]} /><Text style={styles.topicLabel}>Strong</Text></View>
          <View style={styles.tagWrap}>
            {TOPICS_STRONG.map(t => <View key={t} style={[styles.topicTag, { backgroundColor: Colors.successLight }]}><Text style={[styles.topicTagTxt, { color: Colors.success }]}>{t}</Text></View>)}
          </View>
        </View>
        <View style={[styles.topicBlock, { marginTop: 14 }]}>
          <View style={styles.topicLabelRow}><View style={[styles.topicDot, { backgroundColor: Colors.danger }]} /><Text style={styles.topicLabel}>Needs work</Text></View>
          <View style={styles.tagWrap}>
            {TOPICS_WEAK.map(t => <View key={t} style={[styles.topicTag, { backgroundColor: Colors.dangerLight }]}><Text style={[styles.topicTagTxt, { color: Colors.danger }]}>{t}</Text></View>)}
          </View>
        </View>
      </Entrance>
    </ScrollView>
  </View>
);

const Bar: React.FC<{ pct: number; label: string; delay: number; active: boolean }> = ({ pct, label, delay, active }) => {
  const h = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.timing(h, { toValue: pct, duration: 700, delay, easing: Easing.out(Easing.cubic), useNativeDriver: false });
    a.start();
    return () => a.stop();
  }, [h, pct, delay]);
  const height = h.interpolate({ inputRange: [0, 1], outputRange: ['8%', '100%'] });
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
  card: { backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border2, padding: 16, ...Shadow.sm },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  cardTitle: { fontSize: 14.5, fontWeight: '800', color: Colors.text, marginBottom: 12 },
  totalChip: { backgroundColor: Colors.primaryLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full, marginBottom: 12 },
  totalChipTxt: { fontSize: 11, fontWeight: '800', color: Colors.primaryDark },

  classRow: { paddingVertical: 11 },
  divider: { borderBottomWidth: 1, borderBottomColor: Colors.border2 },
  classTop: { flexDirection: 'row', justifyContent: 'space-between' },
  className: { fontSize: 13, fontWeight: '700', color: Colors.text },
  classPct: { fontSize: 13, fontWeight: '800', color: Colors.text2 },

  barsRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 96 },
  barCol: { flex: 1, alignItems: 'center', gap: 8 },
  barTrack: { width: 16, height: 74, backgroundColor: Colors.bg2, borderRadius: Radius.full, overflow: 'hidden', justifyContent: 'flex-end' },
  barFill: { width: '100%', borderRadius: Radius.full, backgroundColor: Colors.primary + '99' },
  barFillActive: { backgroundColor: Colors.primary },
  barLbl: { fontSize: 10, fontWeight: '700', color: Colors.text3 },
  barLblActive: { color: Colors.primaryDark },

  topicBlock: { gap: 8 },
  topicLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  topicDot: { width: 9, height: 9, borderRadius: 3 },
  topicLabel: { fontSize: 12, fontWeight: '800', color: Colors.text },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  topicTag: { paddingHorizontal: 11, paddingVertical: 6, borderRadius: Radius.full },
  topicTagTxt: { fontSize: 11.5, fontWeight: '700' },
});
