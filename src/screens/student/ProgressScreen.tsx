import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../theme';
import { ProgressBar } from '../../components/common/ProgressBar';
import { StatCard } from '../../components/common/StatCard';

const weeks = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const studyData = [45, 90, 60, 120, 75, 150, 30];
const maxStudy = 150;

const subjectProgress = [
  { emoji: '⚗️', name: 'Chemistry', progress: 62, variant: 'warning'  as const },
  { emoji: '📐', name: 'Maths',     progress: 38, variant: 'primary'  as const },
  { emoji: '🔬', name: 'Physics',   progress: 78, variant: 'success'  as const },
  { emoji: '🧬', name: 'Biology',   progress: 45, variant: 'primary'  as const },
  { emoji: '📖', name: 'English',   progress: 91, variant: 'teal'     as const },
];

export const ProgressScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [period, setPeriod] = useState<'week' | 'month'>('week');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      <View style={styles.header}>
        <Text style={styles.heading}>My Progress</Text>
        <View style={styles.periodSwitch}>
          <TouchableOpacity
            style={[styles.periodBtn, period === 'week' && styles.periodActive]}
            onPress={() => setPeriod('week')}
          >
            <Text style={[styles.periodText, period === 'week' && styles.periodTextActive]}>Week</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodBtn, period === 'month' && styles.periodActive]}
            onPress={() => setPeriod('month')}
          >
            <Text style={[styles.periodText, period === 'month' && styles.periodTextActive]}>Month</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Overall stats */}
        <View style={styles.statsRow}>
          <StatCard emoji="🔥" value="14" label="DAY STREAK" valueColor={Colors.warning} />
          <StatCard emoji="📚" value="42" label="LESSONS DONE" valueColor={Colors.primary} />
          <StatCard emoji="⏱" value="18h" label="STUDY TIME" valueColor={Colors.success} />
        </View>

        {/* Study chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Study Time (minutes/day)</Text>
          <View style={styles.chart}>
            {studyData.map((val, i) => (
              <View key={i} style={styles.barWrap}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.bar,
                      { height: `${(val / maxStudy) * 100}%` as any },
                      i === 5 && { backgroundColor: Colors.primary },
                    ]}
                  />
                </View>
                <Text style={styles.dayLabel}>{weeks[i]}</Text>
                <Text style={styles.valLabel}>{val}m</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Subject progress */}
        <Text style={styles.sectionTitle}>Subject Progress</Text>
        {subjectProgress.map((s, i) => (
          <View key={i} style={styles.progressRow}>
            <View style={styles.subjectLeft}>
              <Text style={{ fontSize: 22 }}>{s.emoji}</Text>
              <Text style={styles.subjectName}>{s.name}</Text>
            </View>
            <View style={styles.progressRight}>
              <ProgressBar value={s.progress} variant={s.variant} height={6} style={{ flex: 1 }} />
              <Text style={[styles.progressPct, {
                color: s.variant === 'warning' ? Colors.warning
                     : s.variant === 'success' ? Colors.success
                     : s.variant === 'teal'    ? '#0E7490'
                     : Colors.primary
              }]}>
                {s.progress}%
              </Text>
            </View>
          </View>
        ))}

        {/* Recent activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {[
          { icon: '⚗️', title: 'Completed Organic Chemistry Quiz', sub: 'Score: 80% · 2 hours ago', color: Colors.successLight },
          { icon: '📐', title: 'Watched Calculus Video', sub: 'Chapter 3 · Yesterday', color: Colors.primaryLight },
          { icon: '🤖', title: 'AI Session — 12 doubts solved', sub: '3 days ago', color: '#FDF4FF' },
        ].map((a, i) => (
          <View key={i} style={[styles.activityCard, { backgroundColor: a.color }]}>
            <Text style={{ fontSize: 22 }}>{a.icon}</Text>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>{a.title}</Text>
              <Text style={styles.activitySub}>{a.sub}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border2,
  },
  heading: { fontSize: 20, fontWeight: '800', color: Colors.text },
  periodSwitch: {
    flexDirection: 'row',
    backgroundColor: Colors.bg2, borderRadius: Radius.full, padding: 2,
  },
  periodBtn:        { paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.full },
  periodActive:     { backgroundColor: Colors.white, ...Shadow.sm },
  periodText:       { fontSize: 12, fontWeight: '600', color: Colors.text2 },
  periodTextActive: { color: Colors.brand, fontWeight: '700' },
  scroll:           { padding: 16, gap: 14, paddingBottom: 32 },
  statsRow:         { flexDirection: 'row', gap: 8 },
  chartCard: {
    backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 14,
    borderWidth: 1, borderColor: Colors.border2, ...Shadow.sm,
  },
  chartTitle: { fontSize: 13, fontWeight: '700', color: Colors.text, marginBottom: 16 },
  chart:      { flexDirection: 'row', gap: 4, height: 120, alignItems: 'flex-end' },
  barWrap:    { flex: 1, alignItems: 'center', gap: 4 },
  barTrack:   { flex: 1, width: '100%', backgroundColor: Colors.bg2, borderRadius: 4, overflow: 'hidden', justifyContent: 'flex-end' },
  bar:        { width: '100%', backgroundColor: Colors.primaryLight, borderRadius: 4, minHeight: 4 },
  dayLabel:   { fontSize: 9, color: Colors.text3, fontWeight: '500' },
  valLabel:   { fontSize: 8, color: Colors.text3 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  progressRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.white, borderRadius: Radius.md, padding: 12,
    borderWidth: 1, borderColor: Colors.border2, ...Shadow.sm,
  },
  subjectLeft:  { flexDirection: 'row', alignItems: 'center', gap: 8, width: 100 },
  subjectName:  { fontSize: 12, fontWeight: '600', color: Colors.text },
  progressRight:{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressPct:  { fontSize: 12, fontWeight: '700', width: 32, textAlign: 'right' },
  activityCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: Radius.md, padding: 12,
    borderWidth: 1, borderColor: Colors.border2,
  },
  activityInfo:  { flex: 1 },
  activityTitle: { fontSize: 12, fontWeight: '700', color: Colors.text },
  activitySub:   { fontSize: 11, color: Colors.text2, marginTop: 2 },
});
