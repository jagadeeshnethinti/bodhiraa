import React, { useMemo, useState } from 'react';
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
import { Colors, Radius, Shadow } from '../../theme';
import { LoadingState, ErrorState, EmptyState } from '../../components/common/ScreenStates';
import { SearchBar } from '../../components/common/SearchBar';
import { useApi } from '../../hooks/useApi';
import { StudentApi, type ApiSubject } from '../../api';
import { Icon } from '../../components/common/Icon';
import { subjectIconName, subjectTint, subjectColor } from '../../utils/ui';

export const CoursesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { data, loading, error, refetch, refreshing } = useApi(signal => StudentApi.subjects(signal), []);
  const [query, setQuery] = useState('');

  const subjects = useMemo(() => {
    const list = data ?? [];
    const q = query.trim().toLowerCase();
    return q ? list.filter(s => s.name.toLowerCase().includes(q)) : list;
  }, [data, query]);

  const open = (s: ApiSubject) =>
    navigation.navigate('ChapterList', {
      subjectId: s.id,
      subjectName: s.name,
      icon: s.icon,
      color: s.color,
    });

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      <View style={styles.header}>
        <Text style={styles.heading}>My Courses</Text>
        <Text style={styles.headerSub}>{data?.length ?? 0} subjects</Text>
      </View>

      <View style={styles.searchWrap}>
        <SearchBar placeholder="Search subjects…" value={query} onChangeText={setQuery} />
      </View>

      {loading && !data ? (
        <LoadingState />
      ) : error && !data ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor={Colors.primary} />}
        >
          {subjects.length === 0 ? (
            <EmptyState
              icon="library"
              title={query ? 'No matches' : 'No subjects yet'}
              sub={query ? 'Try a different search term.' : 'Subjects will appear here once assigned.'}
            />
          ) : (
            subjects.map(s => (
              <TouchableOpacity key={s.id} style={styles.card} activeOpacity={0.85} onPress={() => open(s)}>
                <View style={[styles.banner, { backgroundColor: subjectTint(s.color) }]}>
                  <Icon name={subjectIconName(s.icon)} size={34} color={subjectColor(s.color)} />
                </View>
                <View style={styles.body}>
                  <Text style={styles.title} numberOfLines={1}>
                    {s.name}
                  </Text>
                  <Text style={styles.meta}>
                    {s.chapters_count} {s.chapters_count === 1 ? 'chapter' : 'chapters'}
                    {s.grade ? ` · Grade ${s.grade}` : ''}
                  </Text>
                  <View style={[styles.openBtn, { borderColor: subjectColor(s.color) }]}>
                    <Text style={[styles.openTxt, { color: subjectColor(s.color) }]}>Open →</Text>
                  </View>
                </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  heading: { fontSize: 22, fontWeight: '800', color: Colors.text },
  headerSub: { fontSize: 12, fontWeight: '600', color: Colors.text3 },
  searchWrap: { paddingHorizontal: 16, paddingBottom: 8 },
  scroll: { paddingHorizontal: 16, paddingTop: 8, gap: 12, paddingBottom: 24 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border2,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  banner: { height: 76, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 12, gap: 8 },
  title: { fontSize: 14, fontWeight: '700', color: Colors.text },
  meta: { fontSize: 11, color: Colors.text2 },
  openBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1.5,
  },
  openTxt: { fontSize: 11, fontWeight: '700' },
});
