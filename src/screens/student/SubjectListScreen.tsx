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
import { SearchBar } from '../../components/common/SearchBar';
import { LoadingState, ErrorState, EmptyState } from '../../components/common/ScreenStates';
import { useApi } from '../../hooks/useApi';
import { StudentApi, type ApiSubject } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Icon } from '../../components/common/Icon';
import { subjectIconName, subjectColor, subjectTint } from '../../utils/ui';

export const SubjectListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const { data, loading, error, refetch, refreshing } = useApi(signal => StudentApi.subjects(signal), []);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const list = data ?? [];
    const q = search.trim().toLowerCase();
    return q ? list.filter(s => s.name.toLowerCase().includes(q)) : list;
  }, [data, search]);

  const open = (s: ApiSubject) =>
    navigation.navigate('ChapterList', {
      subjectId: s.id,
      subjectName: s.name,
      icon: s.icon,
      color: s.color,
    });

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerSub}>{user?.grade ? `Grade ${user.grade}` : 'All subjects'}</Text>
          <Text style={s.headerTitle}>My Subjects</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <View style={s.searchWrap}>
        <SearchBar placeholder="Search subjects, topics…" value={search} onChangeText={setSearch} />
      </View>

      {loading && !data ? (
        <LoadingState />
      ) : error && !data ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <ScrollView
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor={Colors.primary} />}
        >
          {filtered.length === 0 ? (
            <EmptyState
              icon="search"
              title="No subjects found"
              sub={search ? 'Try a different search term.' : 'Subjects will appear here once assigned.'}
            />
          ) : (
            filtered.map(sub => (
              <TouchableOpacity key={sub.id} style={s.row} activeOpacity={0.85} onPress={() => open(sub)}>
                <View style={[s.icon, { backgroundColor: subjectTint(sub.color) }]}>
                  <Icon name={subjectIconName(sub.icon)} size={22} color={subjectColor(sub.color)} />
                </View>
                <View style={s.content}>
                  <Text style={s.name}>{sub.name}</Text>
                  <Text style={s.meta}>
                    {sub.chapters_count} {sub.chapters_count === 1 ? 'chapter' : 'chapters'}
                    {sub.grade ? ` · Grade ${sub.grade}` : ''}
                  </Text>
                </View>
                <Text style={s.chevron}>›</Text>
              </TouchableOpacity>
            ))
          )}
          <View style={{ height: 16 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 12,
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
  headerCenter: { flex: 1, alignItems: 'center' },
  headerSub: { fontSize: 10, fontWeight: '600', color: Colors.text3, letterSpacing: 0.4 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.text, marginTop: 2 },
  searchWrap: { paddingHorizontal: 16, paddingBottom: 10 },
  listContent: { paddingHorizontal: 16, paddingTop: 6, gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border2,
    ...Shadow.sm,
  },
  icon: {
    width: 46,
    height: 46,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: { flex: 1 },
  name: { fontSize: 13, fontWeight: '700', color: Colors.text },
  meta: { fontSize: 11, color: Colors.text2, marginTop: 3 },
  chevron: { fontSize: 24, color: Colors.text3 },
});
