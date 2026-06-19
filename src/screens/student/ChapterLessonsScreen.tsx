import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, RefreshControl, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../types';
import { Colors, Radius, Shadow } from '../../theme';
import { LoadingState, ErrorState, EmptyState } from '../../components/common/ScreenStates';
import { Chip } from '../../components/common/Chip';
import { Icon, IconName } from '../../components/common/Icon';
import { CircularProgress } from '../../components/common/CircularProgress';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Entrance, PressableScale, Shimmer } from '../../components/common/anim';
import { GlowBlob } from '../../components/illustrations/OnboardingArt';
import { useApi } from '../../hooks/useApi';
import { StudentApi, type ApiLesson } from '../../api';
import { durationLabel } from '../../utils/ui';

type Props = NativeStackScreenProps<StudentStackParamList, 'ChapterLessons'>;

const TYPE_ICON: Record<string, IconName> = { video: 'video', text: 'document', pdf: 'pdf', quiz: 'edit' };

export const ChapterLessonsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { chapterId, chapterTitle, subjectName } = route.params;
  const { data, loading, error, refetch, refreshing } = useApi(signal => StudentApi.chapterLessons(chapterId, signal), [chapterId]);

  const lessons = data?.lessons ?? [];
  const total = lessons.length;
  const doneCount = lessons.filter(l => l.progress?.status === 'completed').length;
  const chapterPct = total ? Math.round((doneCount / total) * 100) : 0;
  const currentIndex = lessons.findIndex(l => l.progress?.status !== 'completed');

  const openLesson = (lesson: ApiLesson) => {
    if (lesson.type === 'video' && lesson.content_url) {
      navigation.navigate('LessonVideo', { lessonId: lesson.id, url: lesson.content_url, title: lesson.title, subjectName, durationSec: lesson.duration_sec });
    } else if (lesson.type === 'quiz' && lesson.quiz_id) {
      navigation.navigate('QuizDetail', { quizId: lesson.quiz_id, title: lesson.title });
    } else if (lesson.type === 'quiz') {
      navigation.navigate('QuizList');
    } else {
      navigation.navigate('LessonDetail', { lessonId: lesson.id, title: lesson.title });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A0A0C" />

      {/* ── Gradient hero (fixed) ─────────────────────────────────── */}
      <LinearGradient colors={['#1A0A0C', '#2A0E13', '#3D1520']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={styles.heroGlow} pointerEvents="none"><GlowBlob size={220} /></View>
          <SafeAreaView edges={['top']}>
            <View style={styles.topbar}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Text style={styles.backIcon}>‹</Text>
              </TouchableOpacity>
              <View style={{ width: 40 }} />
            </View>

            <View>
              {subjectName ? <Text style={styles.subjectLabel}>{subjectName.toUpperCase()}</Text> : null}
              <Text style={styles.chapterTitle} numberOfLines={2}>{data?.chapter?.title ?? chapterTitle}</Text>

              <Entrance index={0} style={styles.summaryCard}>
                <Shimmer />
                <CircularProgress size={78} strokeWidth={8} progress={chapterPct} trackColor="rgba(245,232,208,0.14)">
                  <View style={styles.ringCenter}>
                    <Text style={styles.ringFrac}>{doneCount}/{total}</Text>
                    <Text style={styles.ringLbl}>Lessons</Text>
                  </View>
                </CircularProgress>
                <View style={styles.summaryInfo}>
                  <Text style={styles.summaryPct}>{chapterPct}% complete</Text>
                  <ProgressBar value={chapterPct} color={Colors.primary} height={6} style={styles.summaryBar} />
                  <Text style={styles.summarySub}>
                    {total - doneCount > 0 ? `${total - doneCount} lesson${total - doneCount === 1 ? '' : 's'} to go — you've got this!` : 'Chapter complete! 🎉'}
                  </Text>
                </View>
              </Entrance>
            </View>
          </SafeAreaView>
        </LinearGradient>

      {/* ── Body sheet: learning path ─────────────────────────────── */}
      {loading && !data ? (
        <View style={styles.sheet}><LoadingState /></View>
      ) : error && !data ? (
        <View style={styles.sheet}><ErrorState message={error} onRetry={refetch} /></View>
      ) : (
        <ScrollView
          style={styles.sheet}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor={Colors.primary} />}
        >
          {lessons.length === 0 ? (
            <EmptyState icon="folder" title="No lessons yet" sub="This chapter has no published lessons." />
          ) : (
            <>
              <Text style={styles.pathTitle}>Lessons</Text>
              {lessons.map((lesson, i) => {
                const completed = lesson.progress?.status === 'completed';
                const current = i === currentIndex;
                const statusColor = completed ? Colors.success : current ? Colors.primary : Colors.border;
                return (
                  <Entrance key={lesson.id} index={i}>
                    <PressableScale style={[styles.card, current && styles.cardCurrent]} onPress={() => openLesson(lesson)}>
                      <View style={[styles.leftBar, { backgroundColor: statusColor }]} />
                      <View style={[styles.node, completed ? styles.nodeDone : current ? styles.nodeCurrent : styles.nodeUpcoming]}>
                        {completed ? (
                          <Icon name="checkmark" size={15} color={Colors.white} />
                        ) : current ? (
                          <Icon name="play" size={14} color={Colors.brand} />
                        ) : (
                          <Text style={styles.nodeNum}>{i + 1}</Text>
                        )}
                      </View>
                      <View style={styles.info}>
                        <Text style={styles.title} numberOfLines={2}>{lesson.title}</Text>
                        <View style={styles.metaRow}>
                          <View style={styles.typeChip}>
                            <Icon name={TYPE_ICON[lesson.type] ?? 'book'} size={11} color={Colors.text2} />
                            <Text style={styles.typeChipTxt}>{lesson.type.toUpperCase()}</Text>
                          </View>
                          {durationLabel(lesson.duration_label, lesson.duration_sec) ? (
                            <Text style={styles.metaDot}>{durationLabel(lesson.duration_label, lesson.duration_sec)}</Text>
                          ) : null}
                          {lesson.is_free ? <Chip label="FREE" variant="success" small /> : null}
                          {current ? <View style={styles.nowPill}><Text style={styles.nowTxt}>START</Text></View> : null}
                        </View>
                      </View>
                      <Text style={styles.chevron}>›</Text>
                    </PressableScale>
                  </Entrance>
                );
              })}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A0A0C' },

  hero: { paddingHorizontal: 16, paddingBottom: 28, overflow: 'hidden' },
  heroGlow: { position: 'absolute', top: -60, right: -40, opacity: 0.8 },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(196,149,96,0.15)', borderWidth: 1, borderColor: 'rgba(196,149,96,0.25)', alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 28, color: Colors.primary, fontWeight: '300', marginTop: -2 },
  subjectLabel: { fontSize: 10, fontWeight: '800', color: 'rgba(196,149,96,0.8)', letterSpacing: 1.2, marginTop: 10 },
  chapterTitle: { fontSize: 24, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.5, marginTop: 4, lineHeight: 30 },

  summaryCard: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 18, backgroundColor: 'rgba(245,232,208,0.07)', borderWidth: 1, borderColor: 'rgba(196,149,96,0.2)', borderRadius: Radius.xl, padding: 16, overflow: 'hidden' },
  ringCenter: { alignItems: 'center', justifyContent: 'center' },
  ringFrac: { fontSize: 17, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.4 },
  ringLbl: { fontSize: 8.5, fontWeight: '700', color: 'rgba(245,232,208,0.6)', letterSpacing: 0.5, marginTop: 1 },
  summaryInfo: { flex: 1, gap: 7 },
  summaryPct: { fontSize: 15, fontWeight: '800', color: '#F5E8D0' },
  summaryBar: { backgroundColor: 'rgba(245,232,208,0.14)' },
  summarySub: { fontSize: 11, color: 'rgba(245,232,208,0.7)', lineHeight: 15 },

  sheet: { flex: 1, backgroundColor: Colors.bg, marginTop: -18, borderTopLeftRadius: 26, borderTopRightRadius: 26 },
  content: { padding: 16, paddingTop: 20, gap: 10, paddingBottom: 28 },
  pathTitle: { fontSize: 15, fontWeight: '800', color: Colors.text, marginBottom: 2 },

  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border2, padding: 12, paddingLeft: 16, overflow: 'hidden', ...Shadow.sm },
  cardCurrent: { borderColor: Colors.primary, borderWidth: 1.5, ...Shadow.md },
  leftBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5 },
  node: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  nodeDone: { backgroundColor: Colors.success },
  nodeCurrent: { backgroundColor: Colors.primary },
  nodeUpcoming: { backgroundColor: Colors.bg2, borderWidth: 1, borderColor: Colors.border },
  nodeNum: { fontSize: 15, fontWeight: '800', color: Colors.text3 },
  info: { flex: 1 },
  title: { fontSize: 13.5, fontWeight: '700', color: Colors.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5, flexWrap: 'wrap' },
  typeChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.bg2, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  typeChipTxt: { fontSize: 8.5, fontWeight: '800', color: Colors.text2, letterSpacing: 0.4 },
  metaDot: { fontSize: 10.5, color: Colors.text3, fontWeight: '600' },
  nowPill: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  nowTxt: { fontSize: 8.5, fontWeight: '900', color: Colors.brand, letterSpacing: 0.4 },
  chevron: { fontSize: 22, color: Colors.text3 },
});
