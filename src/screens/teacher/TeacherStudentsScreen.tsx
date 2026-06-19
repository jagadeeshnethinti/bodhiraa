/**
 * Teacher · Students — class roster with per-student performance. A hero with a
 * class selector and the class-average ring, summary tiles, and a sortable-looking
 * student list (score, trend, attendance). Static mock for now.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow, useTheme } from '../../theme';
import { CircularProgress } from '../../components/common/CircularProgress';
import { Entrance, PressableScale, AnimatedCounter, Shimmer } from '../../components/common/anim';
import { GlowBlob } from '../../components/illustrations/OnboardingArt';
import { Icon, IconName } from '../../components/common/Icon';

const CLASSES = ['11-A Physics', '12-B Chemistry', '10-C Maths'];

const SUMMARY: { icon: IconName; value: string; label: string; color: string; tint: string }[] = [
  { icon: 'group', value: '42', label: 'Students', color: Colors.primaryDark, tint: '#FDF4E8' },
  { icon: 'chart', value: '78%', label: 'Class avg', color: Colors.success, tint: '#EDFAF4' },
  { icon: 'warning', value: '6', label: 'At risk', color: Colors.danger, tint: '#FEF2F2' },
];

// `private` learners signed in with a personal account — their performance is
// hidden from school staff, so the roster shows a lock instead of a score.
const STUDENTS: { name: string; roll: string; score: number; trend: number; present: boolean; private?: boolean }[] = [
  { name: 'Aarav Mehta', roll: '11A-01', score: 94, trend: 4, present: true },
  { name: 'Diya Patel', roll: '11A-02', score: 88, trend: 2, present: true },
  { name: 'Kabir Singh', roll: '11A-03', score: 81, trend: -3, present: false, private: true },
  { name: 'Ishita Rao', roll: '11A-04', score: 76, trend: 6, present: true },
  { name: 'Rohan Verma', roll: '11A-05', score: 58, trend: -8, present: true },
  { name: 'Sara Khan', roll: '11A-06', score: 47, trend: -2, present: false, private: true },
];

const scoreColor = (s: number) => (s >= 75 ? Colors.success : s >= 50 ? Colors.warning : Colors.danger);
const ini = (n: string) => n.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

export const TeacherStudentsScreen: React.FC<{ navigation: any }> = () => {
  const [cls, setCls] = useState(0);
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.heroSolid }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.heroSolid} />

      <LinearGradient colors={theme.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroGlow} pointerEvents="none"><GlowBlob size={220} color={theme.accent} /></View>
        <SafeAreaView edges={['top']}>
          <Text style={styles.heading}>Students</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {CLASSES.map((c, i) => {
              const active = i === cls;
              return (
                <PressableScale key={c} onPress={() => setCls(i)} style={[styles.classChip, active && { backgroundColor: theme.accent, borderColor: theme.accent }]}>
                  <Text style={[styles.classChipTxt, active && { color: theme.onAccent }]}>{c}</Text>
                </PressableScale>
              );
            })}
          </ScrollView>

          <Entrance index={0} style={styles.heroCard}>
            <Shimmer />
            <CircularProgress size={84} strokeWidth={8} progress={78} trackColor="rgba(245,232,208,0.14)">
              <View style={styles.ringCenter}>
                <AnimatedCounter value="78%" style={styles.ringPct} />
                <Text style={styles.ringLbl}>Avg</Text>
              </View>
            </CircularProgress>
            <View style={styles.heroInfo}>
              <Text style={styles.heroInfoTitle}>{CLASSES[cls]}</Text>
              <Text style={styles.heroInfoSub}>42 students · 36 present today. Top scorer: Aarav Mehta (94%).</Text>
            </View>
          </Entrance>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.sheet} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Entrance index={0} style={styles.summaryGrid}>
          {SUMMARY.map(s => (
            <View key={s.label} style={styles.summaryTile}>
              <View style={[styles.summaryIcon, { backgroundColor: s.tint }]}><Icon name={s.icon} size={15} color={s.color} /></View>
              <Text style={[styles.summaryVal, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.summaryLbl}>{s.label}</Text>
            </View>
          ))}
        </Entrance>

        <Entrance index={1}>
          <View style={styles.searchBar}>
            <Icon name="search" size={16} color={Colors.text3} />
            <Text style={styles.searchPlaceholder}>Search students…</Text>
          </View>
        </Entrance>

        <Entrance index={2} style={styles.listHeaderRow}>
          <Text style={styles.sectionTitle}>Roster</Text>
          <View style={styles.sortChip}><Icon name="chart" size={12} color={Colors.primaryDark} /><Text style={styles.sortTxt}>By score</Text></View>
        </Entrance>

        {STUDENTS.map((s, i) => {
          const up = s.trend >= 0;
          return (
            <Entrance key={s.roll} index={3 + i}>
              <PressableScale style={styles.studentRow}>
                <View style={styles.studentAvatar}><Text style={styles.studentInitials}>{ini(s.name)}</Text></View>
                <View style={{ flex: 1 }}>
                  <View style={styles.studentTop}>
                    <Text style={styles.studentName}>{s.name}</Text>
                    {s.private && (
                      <View style={styles.privateBadge}>
                        <Icon name="lock" size={9} color={Colors.text2} />
                        <Text style={styles.privateBadgeTxt}>Private</Text>
                      </View>
                    )}
                    <View style={[styles.presentDot, { backgroundColor: s.present ? Colors.success : Colors.danger }]} />
                  </View>
                  <Text style={styles.studentRoll}>
                    {s.roll} · {s.private ? 'Performance hidden' : s.present ? 'Present' : 'Absent'}
                  </Text>
                </View>
                {s.private ? (
                  <View style={styles.scoreCol}>
                    <Icon name="lock" size={16} color={Colors.text3} />
                    <Text style={styles.privateScoreTxt}>Hidden</Text>
                  </View>
                ) : (
                  <View style={styles.scoreCol}>
                    <Text style={[styles.scoreVal, { color: scoreColor(s.score) }]}>{s.score}%</Text>
                    <Text style={[styles.trendTxt, { color: up ? Colors.success : Colors.danger }]}>{up ? '▲' : '▼'} {Math.abs(s.trend)}</Text>
                  </View>
                )}
              </PressableScale>
            </Entrance>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A0A0C' },
  hero: { paddingHorizontal: 16, paddingBottom: 28, overflow: 'hidden' },
  heroGlow: { position: 'absolute', top: -60, right: -40, opacity: 0.8 },
  heading: { fontSize: 22, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.4, paddingTop: 6 },
  chipRow: { gap: 8, paddingVertical: 14 },
  classChip: { backgroundColor: 'rgba(245,232,208,0.08)', borderWidth: 1, borderColor: 'rgba(196,149,96,0.2)', borderRadius: Radius.full, paddingHorizontal: 14, paddingVertical: 8 },
  classChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  classChipTxt: { fontSize: 12, fontWeight: '700', color: 'rgba(245,232,208,0.8)' },
  classChipTxtActive: { color: Colors.brand },
  heroCard: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: 'rgba(245,232,208,0.07)', borderWidth: 1, borderColor: 'rgba(196,149,96,0.22)', borderRadius: Radius.xl, padding: 16, overflow: 'hidden' },
  ringCenter: { alignItems: 'center', justifyContent: 'center' },
  ringPct: { fontSize: 17, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.5 },
  ringLbl: { fontSize: 9, fontWeight: '700', color: 'rgba(245,232,208,0.6)', marginTop: 1 },
  heroInfo: { flex: 1 },
  heroInfoTitle: { fontSize: 13.5, fontWeight: '800', color: '#F5E8D0' },
  heroInfoSub: { fontSize: 11, color: 'rgba(245,232,208,0.7)', lineHeight: 16, marginTop: 4 },

  sheet: { flex: 1, backgroundColor: Colors.bg, marginTop: -16, borderTopLeftRadius: 26, borderTopRightRadius: 26 },
  content: { padding: 16, paddingTop: 22, gap: 12, paddingBottom: 32 },
  summaryGrid: { flexDirection: 'row', gap: 8 },
  summaryTile: { flex: 1, alignItems: 'center', gap: 5, paddingVertical: 13, backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border2, ...Shadow.sm },
  summaryIcon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  summaryVal: { fontSize: 18, fontWeight: '900' },
  summaryLbl: { fontSize: 9.5, color: Colors.text3, fontWeight: '700' },

  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border2, paddingHorizontal: 14, paddingVertical: 12 },
  searchPlaceholder: { fontSize: 13, color: Colors.text3 },

  listHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.text },
  sortChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.primaryLight, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 5 },
  sortTxt: { fontSize: 11, fontWeight: '700', color: Colors.primaryDark },

  studentRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border2, padding: 11, ...Shadow.sm },
  studentAvatar: { width: 42, height: 42, borderRadius: 13, backgroundColor: Colors.bg2, alignItems: 'center', justifyContent: 'center' },
  studentInitials: { fontSize: 14, fontWeight: '900', color: Colors.text2 },
  studentTop: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  studentName: { fontSize: 13.5, fontWeight: '700', color: Colors.text },
  presentDot: { width: 7, height: 7, borderRadius: 4 },
  studentRoll: { fontSize: 11, color: Colors.text2, marginTop: 2 },
  scoreCol: { alignItems: 'flex-end' },
  scoreVal: { fontSize: 15, fontWeight: '900' },
  trendTxt: { fontSize: 10, fontWeight: '800', marginTop: 1 },
  privateBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.bg2, borderRadius: Radius.full, paddingHorizontal: 7, paddingVertical: 2 },
  privateBadgeTxt: { fontSize: 9, fontWeight: '800', color: Colors.text2, letterSpacing: 0.2 },
  privateScoreTxt: { fontSize: 9.5, fontWeight: '700', color: Colors.text3, marginTop: 2 },
});
