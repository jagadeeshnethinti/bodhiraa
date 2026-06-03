import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../theme';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Button } from '../../components/common/Button';

const badges = [
  { emoji: '🏅', label: 'Top Scorer',    unlocked: true },
  { emoji: '🔥', label: '14-Day Streak', unlocked: true },
  { emoji: '⚗️', label: 'Chem Expert',  unlocked: true },
  { emoji: '🤖', label: 'AI Explorer',   unlocked: false },
  { emoji: '📊', label: 'Analyzer',      unlocked: false },
  { emoji: '🎓', label: 'Graduate',      unlocked: false },
];

const weakSubjects = [
  { name: 'Organic Chemistry', topic: 'Functional Groups', pct: 42, color: Colors.danger },
  { name: 'Mathematics',       topic: 'Integration',       pct: 56, color: Colors.warning },
  { name: 'Physics',           topic: 'Optics',            pct: 61, color: Colors.warning },
];

export const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => (
  <View style={styles.container}>
    <StatusBar barStyle="light-content" backgroundColor="#1A0A0C" />

    {/* Gradient header with top safe area */}
    <LinearGradient
      colors={['#1A0A0C', '#2A0E13', '#3D1520', '#52202E']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.settingsBtn}>
            <Text style={{ fontSize: 18 }}>⚙️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.editBtn}>
            <Text style={{ fontSize: 13, color: Colors.primary, fontWeight: '600' }}>Edit</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>A</Text>
          </View>
          <View style={styles.levelBadge}><Text style={styles.levelText}>Lvl 7</Text></View>
        </View>
        <Text style={styles.name}>Arjun Sharma</Text>
        <Text style={styles.schoolInfo}>Class 11 — Science · Delhi Public School</Text>
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>2480</Text>
            <Text style={styles.statLbl}>XP Points</Text>
          </View>
          <View style={styles.statSep} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>14</Text>
            <Text style={styles.statLbl}>Day Streak 🔥</Text>
          </View>
          <View style={styles.statSep} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>72%</Text>
            <Text style={styles.statLbl}>Avg Score</Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>

    {/* Scrollable body with bottom safe area */}
    <SafeAreaView style={styles.body} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Achievements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <TouchableOpacity><Text style={styles.seeAll}>See all →</Text></TouchableOpacity>
          </View>
          <View style={styles.badgesGrid}>
            {badges.map((b, i) => (
              <View key={i} style={[styles.badgeCard, !b.unlocked && styles.badgeLocked]}>
                <View style={[styles.badgeIcon, !b.unlocked && styles.badgeIconLocked]}>
                  <Text style={{ fontSize: 22, opacity: b.unlocked ? 1 : 0.4 }}>{b.emoji}</Text>
                </View>
                <Text style={[styles.badgeLabel, !b.unlocked && { opacity: 0.4 }]}>{b.label}</Text>
                {!b.unlocked && <Text style={styles.lockText}>🔒</Text>}
              </View>
            ))}
          </View>
        </View>

        {/* Weak Areas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Needs Improvement 📈</Text>
            <TouchableOpacity><Text style={styles.seeAll}>Full report →</Text></TouchableOpacity>
          </View>
          {weakSubjects.map((w, i) => (
            <View key={i} style={styles.weakCard}>
              <View style={styles.weakHeader}>
                <Text style={styles.weakSubject}>{w.name}</Text>
                <Text style={[styles.weakPct, { color: w.color }]}>{w.pct}%</Text>
              </View>
              <Text style={styles.weakTopic}>Weak: {w.topic}</Text>
              <ProgressBar
                value={w.pct}
                variant={w.pct < 50 ? 'danger' : 'warning'}
                height={5}
                style={{ marginTop: 6 }}
              />
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionTile} onPress={() => navigation.navigate('AITutor')}>
            <Text style={{ fontSize: 28 }}>🤖</Text>
            <Text style={styles.actionLabel}>AI Tutor</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionTile} onPress={() => navigation.navigate('QuizActive', {})}>
            <Text style={{ fontSize: 28 }}>✏️</Text>
            <Text style={styles.actionLabel}>Take Quiz</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionTile}>
            <Text style={{ fontSize: 28 }}>📊</Text>
            <Text style={styles.actionLabel}>Progress</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionTile}>
            <Text style={{ fontSize: 28 }}>⚙️</Text>
            <Text style={styles.actionLabel}>Settings</Text>
          </TouchableOpacity>
        </View>

        <Button
          label="Sign Out"
          variant="outline"
          onPress={() => {
            const root = navigation.getParent()?.getParent?.();
            if (root) root.navigate('Auth');
            else navigation.getParent()?.navigate('Auth');
          }}
          style={{ marginHorizontal: 0 }}
        />
      </ScrollView>
    </SafeAreaView>
  </View>
);

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: Colors.bg },
  header:     { paddingHorizontal: 16, paddingBottom: 24, alignItems: 'center' },
  body:       { flex: 1 },
  headerTop:  { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 16, paddingTop: 8 },
  settingsBtn:{ padding: 4 },
  editBtn:    { paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: 'rgba(196,149,96,0.15)' },
  avatarWrap: { marginBottom: 10, position: 'relative' },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: 'rgba(196,149,96,0.4)',
  },
  avatarText: { fontSize: 28, fontWeight: '900', color: Colors.brand },
  levelBadge: {
    position: 'absolute', bottom: -4, right: -4,
    backgroundColor: Colors.primary, borderRadius: Radius.full,
    paddingHorizontal: 8, paddingVertical: 2,
    borderWidth: 2, borderColor: Colors.brand,
  },
  levelText:  { fontSize: 9, fontWeight: '800', color: Colors.brand },
  name:       { fontSize: 22, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.02 * 22 },
  schoolInfo: { fontSize: 11, color: 'rgba(245,232,208,0.65)', marginTop: 3, marginBottom: 16 },
  statRow:    { flexDirection: 'row', gap: 0 },
  statItem:   { alignItems: 'center', paddingHorizontal: 20 },
  statVal:    { fontSize: 18, fontWeight: '900', color: Colors.primary },
  statLbl:    { fontSize: 10, color: 'rgba(245,232,208,0.6)', marginTop: 2, fontWeight: '500' },
  statSep:    { width: 1, backgroundColor: 'rgba(196,149,96,0.2)', marginVertical: 4 },
  scroll:     { padding: 16, gap: 16, paddingBottom: 32 },
  section:    { gap: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle:  { fontSize: 15, fontWeight: '700', color: Colors.text },
  seeAll:        { fontSize: 11, fontWeight: '600', color: Colors.primary },
  badgesGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badgeCard: {
    width: '30%', alignItems: 'center', gap: 4, paddingVertical: 12, paddingHorizontal: 6,
    backgroundColor: Colors.white, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border2,
    ...Shadow.sm,
  },
  badgeLocked:     { opacity: 0.7 },
  badgeIcon:       { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center' },
  badgeIconLocked: { backgroundColor: Colors.bg2 },
  badgeLabel:      { fontSize: 10, fontWeight: '600', color: Colors.text, textAlign: 'center' },
  lockText:        { fontSize: 10 },
  weakCard: {
    backgroundColor: Colors.white, borderRadius: Radius.md, padding: 14,
    borderWidth: 1, borderColor: Colors.border2, ...Shadow.sm,
  },
  weakHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  weakSubject: { fontSize: 13, fontWeight: '700', color: Colors.text },
  weakPct:     { fontSize: 14, fontWeight: '800' },
  weakTopic:   { fontSize: 11, color: Colors.text2 },
  actionsGrid: { flexDirection: 'row', gap: 8 },
  actionTile: {
    flex: 1, alignItems: 'center', paddingVertical: 16, gap: 6,
    backgroundColor: Colors.white, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border2,
    ...Shadow.sm,
  },
  actionLabel: { fontSize: 11, fontWeight: '600', color: Colors.text },
});
