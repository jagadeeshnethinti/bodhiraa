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
import { Icon } from '../../components/common/Icon';
import { useApi } from '../../hooks/useApi';
import { StudentApi } from '../../api';
import { subjectIconName, subjectTint, subjectColor } from '../../utils/ui';

type Props = NativeStackScreenProps<StudentStackParamList, 'ChapterList'>;

export const ChapterListScreen: React.FC<Props> = ({ navigation, route }) => {
  const { subjectId, subjectName, icon, color } = route.params;
  const { data, loading, error, refetch, refreshing } = useApi(
    signal => StudentApi.subject(subjectId, signal),
    [subjectId],
  );

  const chapters = data?.chapters ?? [];
  const heroColor = color ?? data?.subject?.color ?? null;
  const heroIcon = subjectIconName(icon ?? data?.subject?.icon);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      <View style={styles.topbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle} numberOfLines={1}>
          {subjectName}
        </Text>
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
          {/* Subject hero */}
          <View style={[styles.subjectCard, { backgroundColor: subjectTint(heroColor) }]}>
            <Icon name={heroIcon} size={40} color={subjectColor(heroColor)} />
            <View style={styles.subjectInfo}>
              <Text style={styles.subjectName}>{data?.subject?.name ?? subjectName}</Text>
              <Text style={styles.subjectMeta}>
                {chapters.length} {chapters.length === 1 ? 'chapter' : 'chapters'}
                {data?.subject?.grade ? ` · Grade ${data.subject.grade}` : ''}
              </Text>
            </View>
          </View>

          {chapters.length === 0 ? (
            <EmptyState icon="book" title="No chapters yet" sub="Content for this subject is on the way." />
          ) : (
            chapters.map((ch, i) => (
              <TouchableOpacity
                key={ch.id}
                style={styles.chRow}
                activeOpacity={0.85}
                onPress={() =>
                  navigation.navigate('ChapterLessons', {
                    chapterId: ch.id,
                    chapterTitle: ch.title,
                    subjectName: data?.subject?.name ?? subjectName,
                  })
                }
              >
                <View style={styles.chBullet}>
                  <Text style={styles.chBulletTxt}>{ch.sort_order ?? i + 1}</Text>
                </View>
                <View style={styles.chInfo}>
                  <Text style={styles.chTitle}>{ch.title}</Text>
                  {ch.lessons_count != null && (
                    <Text style={styles.chSub}>
                      {ch.lessons_count} {ch.lessons_count === 1 ? 'lesson' : 'lessons'}
                    </Text>
                  )}
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))
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
  topTitle: { flex: 1, fontSize: 17, fontWeight: '800', color: Colors.text, textAlign: 'center', marginHorizontal: 8 },
  scroll: { padding: 16, gap: 8, paddingBottom: 24 },
  subjectCard: {
    borderRadius: Radius.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 6,
  },
  subjectInfo: { flex: 1 },
  subjectName: { fontSize: 15, fontWeight: '800', color: Colors.text },
  subjectMeta: { fontSize: 11, color: Colors.text2, marginTop: 3 },
  chRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border2,
    padding: 14,
    ...Shadow.sm,
  },
  chBullet: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  chBulletTxt: { color: Colors.primaryDark, fontWeight: '800', fontSize: 14 },
  chInfo: { flex: 1 },
  chTitle: { fontSize: 13, fontWeight: '700', color: Colors.text },
  chSub: { fontSize: 11, color: Colors.text2, marginTop: 2 },
  chevron: { fontSize: 22, color: Colors.text3 },
});
