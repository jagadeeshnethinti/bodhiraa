import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../types';
import { Colors, Radius, Shadow } from '../../theme';
import { Button } from '../../components/common/Button';
import { Icon, IconName } from '../../components/common/Icon';
import { LoadingState, ErrorState } from '../../components/common/ScreenStates';
import { useApi } from '../../hooks/useApi';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { StudentApi } from '../../api';

type Props = NativeStackScreenProps<StudentStackParamList, 'QuizDetail'>;

export const QuizDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { quizId, title } = route.params;
  const { data, loading, error, refetch } = useApi(signal => StudentApi.quiz(quizId, signal), [quizId]);
  const start = useAsyncAction();

  const handleStart = async () => {
    const attempt = await start.run(() => StudentApi.startQuiz(quizId));
    if (attempt) {
      navigation.replace('QuizActive', {
        attemptId: attempt.id,
        quizId,
        title: data?.title ?? title,
        durationMin: data?.duration_min ?? null,
      });
    }
  };

  const stat = (icon: IconName, value: string | number, label: string) => (
    <View style={styles.statCard}>
      <Icon name={icon} size={18} color={Colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A0A0C" />

      <LinearGradient colors={['#1A0A0C', '#2A0E13', '#3D1520']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <SafeAreaView edges={['top']}>
          <View style={styles.topbar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backIcon}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.topLabel}>QUIZ</Text>
            <View style={{ width: 36 }} />
          </View>
          <View style={styles.heroBody}>
            <Text style={styles.heroTitle}>{data?.title ?? title ?? 'Quiz'}</Text>
            {data?.subject ? <Text style={styles.heroSub}>{data.subject}</Text> : null}
          </View>
        </SafeAreaView>
      </LinearGradient>

      <SafeAreaView style={styles.body} edges={['bottom']}>
        {loading && !data ? (
          <LoadingState />
        ) : error && !data ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : (
          <>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
              <View style={styles.statsRow}>
                {stat('help', data?.questions?.length ?? data?.questions_count ?? 0, 'Questions')}
                {stat('star', data?.total_marks ?? 0, 'Marks')}
                {stat('clock', data?.duration_min ? `${data.duration_min}m` : '—', 'Duration')}
              </View>

              {data?.description ? (
                <View style={styles.descCard}>
                  <Text style={styles.descTitle}>About this quiz</Text>
                  <Text style={styles.descText}>{data.description}</Text>
                </View>
              ) : null}

              <View style={styles.rulesCard}>
                <Text style={styles.descTitle}>Before you start</Text>
                {[
                  'Answers save automatically as you go.',
                  data?.duration_min ? `You have ${data.duration_min} minutes once you begin.` : 'Take your time — there is no timer.',
                  'You can flag questions and review before submitting.',
                ].map((r, i) => (
                  <View key={i} style={styles.ruleRow}>
                    <Text style={styles.ruleDot}>•</Text>
                    <Text style={styles.ruleText}>{r}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>

            <View style={styles.cta}>
              {start.error ? <Text style={styles.ctaError}>{start.error}</Text> : null}
              <Button
                label={start.submitting ? 'Starting…' : 'Start quiz →'}
                variant="primary"
                loading={start.submitting}
                disabled={start.submitting}
                onPress={handleStart}
              />
            </View>
          </>
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(196,149,96,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(196,149,96,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 24, color: '#F5E8D0', fontWeight: '300' },
  topLabel: { fontSize: 11, fontWeight: '800', color: 'rgba(196,149,96,0.8)', letterSpacing: 1 },
  heroBody: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 },
  heroTitle: { fontSize: 22, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.4 },
  heroSub: { fontSize: 12, color: 'rgba(245,232,208,0.7)', marginTop: 4 },
  body: { flex: 1 },
  scroll: { padding: 16, gap: 14, paddingBottom: 24 },
  statsRow: { flexDirection: 'row', gap: 8 },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border2,
    gap: 3,
    ...Shadow.sm,
  },
  statValue: { fontSize: 18, fontWeight: '900', color: Colors.text },
  statLabel: { fontSize: 10, color: Colors.text3, fontWeight: '600' },
  descCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border2,
    padding: 14,
    ...Shadow.sm,
  },
  descTitle: { fontSize: 13, fontWeight: '800', color: Colors.text, marginBottom: 6 },
  descText: { fontSize: 12, color: Colors.text2, lineHeight: 18 },
  rulesCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(196,149,96,0.2)',
    padding: 14,
  },
  ruleRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  ruleDot: { color: Colors.primary, fontSize: 13, fontWeight: '800' },
  ruleText: { flex: 1, fontSize: 12, color: Colors.text, lineHeight: 18 },
  cta: { padding: 16, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border2 },
  ctaError: { fontSize: 12, color: Colors.danger, marginBottom: 8, textAlign: 'center' },
});
