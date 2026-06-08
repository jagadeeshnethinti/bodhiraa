import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../types';
import { Colors, Radius, Shadow } from '../../theme';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';

type Props = NativeStackScreenProps<StudentStackParamList, 'QuizResult'>;

export const QuizResultScreen: React.FC<Props> = ({ navigation, route }) => {
  const { result, quizTitle } = route.params;
  const pct = Math.round(result.percent ?? (result.total_marks ? (result.score / result.total_marks) * 100 : 0));
  const grade = pct >= 90 ? 'A+' : pct >= 75 ? 'A' : pct >= 60 ? 'B' : pct >= 40 ? 'C' : 'D';
  const gradeColor = pct >= 75 ? Colors.success : pct >= 60 ? Colors.warning : Colors.danger;
  const passed = pct >= 40;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A0A0C" />

      <LinearGradient colors={['#1A0A0C', '#2A0E13', '#3D1520']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <SafeAreaView edges={['top']} style={styles.header}>
          <Icon name={passed ? 'trophy' : 'book'} size={52} color="#F5E8D0" style={styles.trophy} />
          <Text style={styles.title}>Quiz Complete!</Text>
          {quizTitle ? <Text style={styles.sub}>{quizTitle}</Text> : null}

          <View style={[styles.scoreCircle, { borderColor: gradeColor }]}>
            <Text style={[styles.scoreValue, { color: gradeColor }]}>{pct}%</Text>
            <Text style={styles.scoreLabel}>SCORE</Text>
          </View>

          <View style={styles.gradeRow}>
            <View style={[styles.gradeBadge, { backgroundColor: gradeColor + '22', borderColor: gradeColor }]}>
              <Text style={[styles.gradeText, { color: gradeColor }]}>Grade: {grade}</Text>
            </View>
            <View style={[styles.gradeBadge, { backgroundColor: 'rgba(196,149,96,0.18)', borderColor: Colors.primary }]}>
              <Text style={[styles.gradeText, { color: Colors.primary }]}>{passed ? 'Passed' : 'Keep practising'}</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <SafeAreaView style={styles.body} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Icon name="star" size={20} color={Colors.warning} />
              <Text style={[styles.statValue, { color: Colors.primary }]}>{result.score}</Text>
              <Text style={styles.statLabel}>Marks scored</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="target" size={20} color={Colors.text} />
              <Text style={[styles.statValue, { color: Colors.text }]}>{result.total_marks}</Text>
              <Text style={styles.statLabel}>Total marks</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="chart" size={20} color={gradeColor} />
              <Text style={[styles.statValue, { color: gradeColor }]}>{pct}%</Text>
              <Text style={styles.statLabel}>Percentage</Text>
            </View>
          </View>

          <View style={styles.feedback}>
            <View style={styles.aiHeader}>
              <Icon name="robot" size={18} color={Colors.primary} />
              <Text style={styles.aiTitle}>How you did</Text>
            </View>
            <Text style={styles.aiText}>
              {passed
                ? `Nice work — you scored ${result.score}/${result.total_marks} (${pct}%). Keep the momentum going with another quiz or revisit any tricky topics.`
                : `You scored ${result.score}/${result.total_marks} (${pct}%). Review the chapter and try again — you've got this.`}
            </Text>
          </View>

          <View style={styles.actions}>
            <Button
              label="More quizzes"
              variant="outline"
              fullWidth={false}
              style={styles.actionBtn}
              onPress={() => navigation.replace('QuizList')}
            />
            <Button
              label="Done"
              variant="primary"
              fullWidth={false}
              style={styles.actionBtn}
              onPress={() => navigation.navigate('StudentTabs')}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { alignItems: 'center', paddingBottom: 28, paddingHorizontal: 20, gap: 6 },
  body: { flex: 1 },
  trophy: { marginTop: 12, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.5 },
  sub: { fontSize: 12, color: 'rgba(245,232,208,0.7)' },
  scoreCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 3,
    backgroundColor: 'rgba(196,149,96,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
  },
  scoreValue: { fontSize: 28, fontWeight: '900' },
  scoreLabel: { fontSize: 9, fontWeight: '700', color: 'rgba(245,232,208,0.7)', letterSpacing: 1 },
  gradeRow: { flexDirection: 'row', gap: 10 },
  gradeBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1 },
  gradeText: { fontSize: 13, fontWeight: '700' },
  scroll: { padding: 16, gap: 14, paddingBottom: 32 },
  statsGrid: { flexDirection: 'row', gap: 8 },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border2,
    gap: 3,
    ...Shadow.sm,
  },
  statValue: { fontSize: 20, fontWeight: '900' },
  statLabel: { fontSize: 9, color: Colors.text3, fontWeight: '600', textAlign: 'center' },
  feedback: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(196,149,96,0.2)',
    padding: 14,
  },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  aiTitle: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  aiText: { fontSize: 12, color: Colors.text, lineHeight: 18 },
  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1 },
});
