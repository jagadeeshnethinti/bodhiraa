import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../theme';
import { StatCard } from '../../components/common/StatCard';
import { AIBubble } from '../../components/common/AIBubble';
import { ProgressBar } from '../../components/common/ProgressBar';
import { SectionHeader } from '../../components/common/SectionHeader';

const subjects = [
  { emoji: '⚗️', name: 'Chemistry', bg: '#FEF3C7' },
  { emoji: '📐', name: 'Maths',     bg: '#FDF4E8' },
  { emoji: '🔬', name: 'Physics',   bg: '#ECFDF5' },
  { emoji: '🧬', name: 'Biology',   bg: '#FDF4FF' },
];

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => (
  <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
    <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

    {/* Top bar */}
    <View style={styles.topbar}>
      <View style={styles.locationPill}>
        <View style={styles.locIcon}><Text>📍</Text></View>
        <View>
          <Text style={styles.locLabel}>YOUR SCHOOL</Text>
          <Text style={styles.locValue}>Delhi Public School ▾</Text>
        </View>
      </View>
      <View style={styles.topRight}>
        <TouchableOpacity
          style={styles.notifBtn}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Text style={{ fontSize: 18 }}>🔔</Text>
          <View style={styles.notifDot} />
        </TouchableOpacity>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>A</Text>
        </View>
      </View>
    </View>

    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Greeting */}
      <View>
        <Text style={styles.greetLabel}>GOOD MORNING</Text>
        <Text style={styles.greetName}>Arjun Sharma 👋</Text>
      </View>

      {/* AI Suggestion */}
      <AIBubble
        title="AI Recommendation"
        message="You're weak in Organic Chemistry — 2 new practice sets ready for you."
        actions={[
          { label: 'Start Practice', variant: 'primary', onPress: () => navigation.navigate('QuizActive', {}) },
          { label: 'Dismiss', variant: 'gray' },
        ]}
      />

      {/* Stats strip */}
      <View style={styles.statsRow}>
        <StatCard emoji="🔥" value="14"   label="DAY STREAK" valueColor={Colors.warning} />
        <StatCard emoji="📚" value="7"    label="SUBJECTS"   valueColor={Colors.primary} />
        <StatCard emoji="⭐" value="2480" label="XP POINTS"  valueColor="#8B5CF6" />
      </View>

      {/* Continue Learning */}
      <SectionHeader title="Continue Learning" actionLabel="See all" onAction={() => navigation.navigate('Courses')} />

      {[
        { emoji: '⚗️', title: 'Organic Chemistry — Ch 5', sub: 'Reactions & Mechanisms · 34 min left', pct: 62, bg: '#FEF3C7', v: 'warning' as const, color: Colors.warning },
        { emoji: '📐', title: 'Mathematics — Calculus',   sub: 'Limits & Derivatives · 52 min left',  pct: 38, bg: '#FDF4E8', v: 'primary' as const, color: Colors.primary },
      ].map((c, i) => (
        <TouchableOpacity
          key={i}
          style={styles.courseCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('SubjectList')}
        >
          <View style={[styles.courseIcon, { backgroundColor: c.bg }]}>
            <Text style={{ fontSize: 22 }}>{c.emoji}</Text>
          </View>
          <View style={styles.courseContent}>
            <Text style={styles.courseTitle} numberOfLines={1}>{c.title}</Text>
            <Text style={styles.courseSub}>{c.sub}</Text>
            <ProgressBar value={c.pct} variant={c.v} height={4} style={{ marginTop: 6 }} />
          </View>
          <Text style={[styles.coursePct, { color: c.color }]}>{c.pct}%</Text>
        </TouchableOpacity>
      ))}

      {/* Subjects grid */}
      <SectionHeader title="Subjects" actionLabel="View all" onAction={() => navigation.navigate('SubjectList')} />
      <View style={styles.subjectsGrid}>
        {subjects.map(s => (
          <TouchableOpacity
            key={s.name}
            style={styles.subjectTile}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('SubjectList')}
          >
            <View style={[styles.subjectIcon, { backgroundColor: s.bg }]}>
              <Text style={{ fontSize: 20 }}>{s.emoji}</Text>
            </View>
            <Text style={styles.subjectName}>{s.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.bg },
  topbar:  {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8,
    borderBottomWidth: 1, borderBottomColor: Colors.border2,
    backgroundColor: Colors.bg,
  },
  locationPill: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  locIcon: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  locLabel: { fontSize: 10, fontWeight: '700', color: Colors.text3, letterSpacing: 0.4 },
  locValue: { fontSize: 13, fontWeight: '700', color: Colors.text },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  notifBtn: {
    width: 38, height: 38, borderRadius: 11,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  notifDot: {
    position: 'absolute', top: 7, right: 7,
    width: 8, height: 8, backgroundColor: Colors.danger,
    borderRadius: 4, borderWidth: 2, borderColor: Colors.white,
  },
  avatarCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '800', color: Colors.brand },
  scroll:  { flex: 1 },
  content: { padding: 16, gap: 14, paddingBottom: 8 },
  greetLabel: { fontSize: 11, fontWeight: '600', color: Colors.text3, letterSpacing: 0.5 },
  greetName:  { fontSize: 22, fontWeight: '800', color: Colors.text, letterSpacing: -0.44 },
  statsRow:   { flexDirection: 'row', gap: 6 },
  courseCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.white, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border2,
    padding: 10, ...Shadow.sm,
  },
  courseIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  courseContent: { flex: 1, minWidth: 0 },
  courseTitle:   { fontSize: 13, fontWeight: '700', color: Colors.text },
  courseSub:     { fontSize: 11, color: Colors.text2, marginTop: 2 },
  coursePct:     { fontSize: 11, fontWeight: '700', flexShrink: 0 },
  subjectsGrid:  { flexDirection: 'row', gap: 8 },
  subjectTile: {
    flex: 1, alignItems: 'center', gap: 6, paddingVertical: 14,
    backgroundColor: Colors.white, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border2, ...Shadow.sm,
  },
  subjectIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  subjectName: { fontSize: 10, fontWeight: '600', color: Colors.text, textAlign: 'center' },
});
