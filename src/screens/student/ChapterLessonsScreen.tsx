import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../types';
import { Colors, Radius, Shadow } from '../../theme';
import { LoadingState, ErrorState, EmptyState } from '../../components/common/ScreenStates';
import { Chip } from '../../components/common/Chip';
import { Icon, IconName } from '../../components/common/Icon';
import { useApi } from '../../hooks/useApi';
import { StudentApi, type ApiLesson } from '../../api';
import { durationLabel } from '../../utils/ui';

type Props = NativeStackScreenProps<StudentStackParamList, 'ChapterLessons'>;

const TYPE_ICON: Record<string, IconName> = { video: 'video', text: 'document', pdf: 'pdf', quiz: 'edit' };

export const ChapterLessonsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { chapterId, chapterTitle, subjectName } = route.params;
  const { data, loading, error, refetch, refreshing } = useApi(
    signal => StudentApi.chapterLessons(chapterId, signal),
    [chapterId],
  );

  const lessons = data?.lessons ?? [];

  const openLesson = (lesson: ApiLesson) => {
    if (lesson.type === 'video' && lesson.content_url) {
      navigation.navigate('LessonVideo', {
        lessonId: lesson.id,
        url: lesson.content_url,
        title: lesson.title,
        subjectName,
        durationSec: lesson.duration_sec,
      });
    } else if (lesson.type === 'quiz' && lesson.quiz_id) {
      navigation.navigate('QuizDetail', { quizId: lesson.quiz_id, title: lesson.title });
    } else if (lesson.type === 'quiz') {
      navigation.navigate('QuizList');
    } else {
      // text / pdf / video-without-url → detail screen handles each.
      navigation.navigate('LessonDetail', { lessonId: lesson.id, title: lesson.title });
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      <View style={styles.topbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.titleBlock}>
          {subjectName ? <Text style={styles.subjectLabel}>{subjectName.toUpperCase()}</Text> : null}
          <Text style={styles.topTitle} numberOfLines={1}>
            {data?.chapter?.title ?? chapterTitle}
          </Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {loading && !data ? (
        <LoadingState />
      ) : error && !data ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor={Colors.primary} />}
        >
          {lessons.length === 0 ? (
            <EmptyState icon="folder" title="No lessons yet" sub="This chapter has no published lessons." />
          ) : (
            lessons.map(lesson => {
              const completed = lesson.progress?.status === 'completed';
              const pct = lesson.progress?.progress_percent ?? 0;
              return (
                <TouchableOpacity key={lesson.id} style={styles.row} activeOpacity={0.85} onPress={() => openLesson(lesson)}>
                  <View style={[styles.iconBox, completed && styles.iconBoxDone]}>
                    <Icon name={TYPE_ICON[lesson.type] ?? 'book'} size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.info}>
                    <Text style={styles.title} numberOfLines={2}>
                      {lesson.title}
                    </Text>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaType}>{lesson.type.toUpperCase()}</Text>
                      {durationLabel(lesson.duration_label, lesson.duration_sec) ? (
                        <Text style={styles.metaDot}>
                          · {durationLabel(lesson.duration_label, lesson.duration_sec)}
                        </Text>
                      ) : null}
                      {lesson.is_free ? <Chip label="FREE" variant="success" small /> : null}
                    </View>
                  </View>
                  {completed ? (
                    <View style={styles.doneCheck}>
                      <Icon name="checkmark" size={12} color={Colors.white} />
                    </View>
                  ) : pct > 0 ? (
                    <Text style={styles.pct}>{pct}%</Text>
                  ) : (
                    <Text style={styles.chevron}>›</Text>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border2,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.bg2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 26, color: Colors.text },
  titleBlock: { flex: 1, alignItems: 'center', marginHorizontal: 8 },
  subjectLabel: { fontSize: 9, fontWeight: '700', color: Colors.text3, letterSpacing: 0.5 },
  topTitle: { fontSize: 16, fontWeight: '800', color: Colors.text },
  scroll: { padding: 16, gap: 10, paddingBottom: 24 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border2,
    padding: 12,
    ...Shadow.sm,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: Colors.bg2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconBoxDone: { backgroundColor: Colors.successLight },
  info: { flex: 1 },
  title: { fontSize: 13, fontWeight: '700', color: Colors.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  metaType: { fontSize: 9, fontWeight: '800', color: Colors.text3, letterSpacing: 0.4 },
  metaDot: { fontSize: 10, color: Colors.text3 },
  doneCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pct: { fontSize: 12, fontWeight: '800', color: Colors.primary },
  chevron: { fontSize: 22, color: Colors.text3 },
});
