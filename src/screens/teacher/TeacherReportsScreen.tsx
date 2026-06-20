/**
 * Teacher · Reports — class analytics. The hero ring + per-class list and the
 * headline stats are wired to GET /teacher/home via TeacherApi.home(). The
 * weekly-submissions chart and topic-mastery breakdown remain static: no
 * TeacherApi method aggregates submissions-by-day or topic mastery, and the
 * per-quiz analytics endpoint needs a specific quizId this screen doesn't have.
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Animated, Easing, Alert, RefreshControl } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../theme';
import { Button } from '../../components/common/Button';
import { CircularProgress } from '../../components/common/CircularProgress';
import { LoadingState, ErrorState, EmptyState } from '../../components/common/ScreenStates';
import { Entrance, AnimatedCounter, Shimmer } from '../../components/common/anim';
import { GlowBlob } from '../../components/illustrations/OnboardingArt';
import { Icon } from '../../components/common/Icon';
import { useApi } from '../../hooks/useApi';
import { TeacherApi } from '../../api';

// Static — no TeacherApi method exposes submissions-by-day or topic mastery yet.
const SUBMISSIONS = [32, 41, 28, 45, 38, 22, 12]; // this week
const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const TOPICS_STRONG = ['Kinematics', 'Electrostatics', 'Algebra'];
const TOPICS_WEAK = ['Wave Optics', 'Organic Chemistry', 'Calculus'];

export const TeacherReportsScreen: React.FC<{ navigation: any }> = () => {
  const home = useApi(signal => TeacherApi.home(signal), []);
  const data = home.data;

  const stats = data?.stats;
  const overall = stats?.attendanceToday ?? 0;
  const classes = data?.classes ?? [];
  const submissionsTotal = SUBMISSIONS.reduce((a, b) => a + b, 0);

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
                <Text style={styles.ringLbl}>Attendance</Text>
              </View>
            </CircularProgress>
            <View style={styles.heroInfo}>
              <Text style={styles.heroInfoTitle}>All classes · today</Text>
              <Text style={styles.heroInfoSub}>
                {stats
                  ? `${stats.students} students across ${stats.classes} ${stats.classes === 1 ? 'class' : 'classes'}. ${stats.pending} ${stats.pending === 1 ? 'submission' : 'submissions'} pending review.`
                  : 'Loading class performance…'}
              </Text>
            </View>
          </Entrance>
        </SafeAreaView>
      </LinearGradient>

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
          <Entrance index={0}>
            <Button label="Export report" variant="outline" icon={<Icon name="upload" size={15} color={Colors.brand} />} onPress={() => Alert.alert('Export', 'A PDF/CSV export will be available in v1.')} />
          </Entrance>

          {/* Classes overview (live) */}
          <Entrance index={1} style={styles.card}>
            <Text style={styles.cardTitle}>Classes overview</Text>
            {classes.length === 0 ? (
              <EmptyState icon="library" title="No classes" sub="Classes assigned to you will appear here." />
            ) : (
              classes.map((c, i) => (
                <View key={c.id} style={[styles.classRow, i < classes.length - 1 && styles.divider]}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.classTop}>
                      <Text style={styles.className}>{c.name}</Text>
                      <Text style={styles.classPct}>{c.students} students</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </Entrance>

          {/* Weekly submissions (static — no daily-aggregate endpoint) */}
          <Entrance index={2} style={styles.card}>
            <View style={styles.cardHead}>
              <Text style={styles.cardTitle}>Submissions this week</Text>
              <View style={styles.totalChip}><Text style={styles.totalChipTxt}>{submissionsTotal} total</Text></View>
            </View>
            <View style={styles.barsRow}>
              {SUBMISSIONS.map((v, i) => (
                <Bar key={i} pct={v / Math.max(...SUBMISSIONS)} label={DOW[i]} delay={i * 70} active={i === SUBMISSIONS.length - 1} />
              ))}
            </View>
          </Entrance>

          {/* Topic mastery (static — no topic-mastery endpoint) */}
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
      )}
    </View>
  );
};

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
