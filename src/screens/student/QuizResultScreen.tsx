import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../theme';
import { Button } from '../../components/common/Button';

export const QuizResultScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const result = route.params?.result ?? { totalQuestions: 10, correct: 8, incorrect: 1, skipped: 1, score: 80, timeTaken: '12:45' };
  const pct = Math.round((result.correct / result.totalQuestions) * 100);
  const grade = pct >= 90 ? 'A+' : pct >= 75 ? 'A' : pct >= 60 ? 'B' : pct >= 40 ? 'C' : 'D';
  const gradeColor = pct >= 75 ? Colors.success : pct >= 60 ? Colors.warning : Colors.danger;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A0A0C" />

      {/* Gradient header with top safe area */}
      <LinearGradient
        colors={['#1A0A0C', '#2A0E13', '#3D1520']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView edges={['top']} style={styles.header}>
          <View style={styles.trophy}><Text style={{ fontSize: 56 }}>🏆</Text></View>
          <Text style={styles.title}>Quiz Complete!</Text>
          <Text style={styles.sub}>Organic Chemistry · Ch 5 Quiz</Text>

          {/* Score circle */}
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreValue}>{pct}%</Text>
            <Text style={styles.scoreLabel}>SCORE</Text>
          </View>

          <View style={styles.gradeRow}>
            <View style={[styles.gradeBadge, { backgroundColor: gradeColor + '22', borderColor: gradeColor }]}>
              <Text style={[styles.gradeText, { color: gradeColor }]}>Grade: {grade}</Text>
            </View>
            <View style={styles.xpBadge}>
              <Text style={styles.xpText}>+80 XP Earned! ⭐</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Scrollable body with bottom safe area */}
      <SafeAreaView style={styles.body} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Stats */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { borderColor: Colors.successLight }]}>
              <Text style={styles.statEmoji}>✅</Text>
              <Text style={[styles.statValue, { color: Colors.success }]}>{result.correct}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            <View style={[styles.statCard, { borderColor: Colors.dangerLight }]}>
              <Text style={styles.statEmoji}>❌</Text>
              <Text style={[styles.statValue, { color: Colors.danger }]}>{result.incorrect}</Text>
              <Text style={styles.statLabel}>Wrong</Text>
            </View>
            <View style={[styles.statCard, { borderColor: Colors.warningLight }]}>
              <Text style={styles.statEmoji}>⏭</Text>
              <Text style={[styles.statValue, { color: Colors.warning }]}>{result.skipped}</Text>
              <Text style={styles.statLabel}>Skipped</Text>
            </View>
            <View style={[styles.statCard, { borderColor: Colors.border2 }]}>
              <Text style={styles.statEmoji}>⏱</Text>
              <Text style={[styles.statValue, { color: Colors.primary }]}>{result.timeTaken}</Text>
              <Text style={styles.statLabel}>Time</Text>
            </View>
          </View>

          {/* AI Feedback */}
          <View style={styles.aiFeedback}>
            <View style={styles.aiHeader}>
              <Text style={{ fontSize: 18 }}>🤖</Text>
              <Text style={styles.aiTitle}>AI Performance Analysis</Text>
            </View>
            <Text style={styles.aiText}>
              Excellent work! 🌟 You scored {pct}% which is above class average. Your strength is in reaction mechanisms. Focus on functional group identification — you missed 1 question there.
            </Text>
            <TouchableOpacity style={styles.practiceBtn} onPress={() => navigation.navigate('QuizActive', {})}>
              <Text style={styles.practiceBtnText}>Practice Weak Areas →</Text>
            </TouchableOpacity>
          </View>

          {/* Achievement */}
          {pct >= 70 && (
            <View style={styles.achievementCard}>
              <Text style={{ fontSize: 32 }}>🏅</Text>
              <View>
                <Text style={styles.achieveTitle}>Achievement Unlocked!</Text>
                <Text style={styles.achieveSub}>Chemistry Master — Score 70%+ in quiz</Text>
              </View>
            </View>
          )}

          <View style={styles.actions}>
            <Button
              label="Review Answers"
              variant="outline"
              fullWidth={false}
              style={styles.actionBtn}
              onPress={() => navigation.goBack()}
            />
            <Button
              label="Next Chapter →"
              variant="primary"
              fullWidth={false}
              style={styles.actionBtn}
              onPress={() => navigation.navigate('Courses')}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header:    { alignItems: 'center', paddingBottom: 32, paddingHorizontal: 20, gap: 8 },
  body:      { flex: 1 },
  trophy:    { marginTop: 16, marginBottom: 8 },
  title:     { fontSize: 24, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.02 * 24 },
  sub:       { fontSize: 12, color: 'rgba(245,232,208,0.7)' },
  scoreCircle: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 3, borderColor: Colors.primary,
    backgroundColor: 'rgba(196,149,96,0.1)',
    alignItems: 'center', justifyContent: 'center',
    marginVertical: 12,
  },
  scoreValue: { fontSize: 28, fontWeight: '900', color: Colors.primary },
  scoreLabel: { fontSize: 9, fontWeight: '700', color: 'rgba(196,149,96,0.7)', letterSpacing: 1 },
  gradeRow:   { flexDirection: 'row', gap: 10 },
  gradeBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1 },
  gradeText:  { fontSize: 13, fontWeight: '700' },
  xpBadge:    { paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.primary + '22' },
  xpText:     { fontSize: 13, fontWeight: '700', color: Colors.primary },
  scroll:     { padding: 16, gap: 14, paddingBottom: 32 },
  statsGrid:  { flexDirection: 'row', gap: 8 },
  statCard: {
    flex: 1, alignItems: 'center', paddingVertical: 14,
    backgroundColor: Colors.white, borderRadius: Radius.md, borderWidth: 1.5, ...Shadow.sm,
  },
  statEmoji:  { fontSize: 20, marginBottom: 4 },
  statValue:  { fontSize: 20, fontWeight: '900' },
  statLabel:  { fontSize: 10, color: Colors.text3, fontWeight: '600' },
  aiFeedback: {
    backgroundColor: Colors.primaryLight, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: 'rgba(196,149,96,0.2)', padding: 14,
  },
  aiHeader:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  aiTitle:    { fontSize: 13, fontWeight: '700', color: Colors.primary },
  aiText:     { fontSize: 12, color: Colors.text, lineHeight: 18, marginBottom: 12 },
  practiceBtn: {
    alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: Colors.primary, borderRadius: Radius.full,
  },
  practiceBtnText:  { fontSize: 11, fontWeight: '700', color: Colors.brand },
  achievementCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.primaryLight, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.primary, padding: 14,
  },
  achieveTitle: { fontSize: 13, fontWeight: '800', color: Colors.text },
  achieveSub:   { fontSize: 11, color: Colors.text2, marginTop: 2 },
  actions:      { flexDirection: 'row', gap: 10 },
  actionBtn:    { flex: 1 },
});
