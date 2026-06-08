import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../theme';
import { StatCard } from '../../components/common/StatCard';
import { LoadingState, ErrorState, EmptyState } from '../../components/common/ScreenStates';
import { useApi } from '../../hooks/useApi';
import { StudentApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Icon, IconName } from '../../components/common/Icon';
import { subjectIconName, subjectColor, subjectTint } from '../../utils/ui';

const prettify = (key: string) => key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

export const ProgressScreen: React.FC<{ navigation: any }> = () => {
  const { role } = useAuth();
  const isStudent = role === 'student';

  const profile = useApi(signal => (isStudent ? StudentApi.profile(signal) : Promise.resolve(null)), [isStudent]);
  const subjects = useApi(signal => (isStudent ? StudentApi.subjects(signal) : Promise.resolve([])), [isStudent]);

  const stats = useMemo(() => {
    const obj = (profile.data ?? {}) as Record<string, unknown>;
    return Object.entries(obj)
      .filter(([, v]) => typeof v === 'number')
      .slice(0, 3)
      .map(([k, v]) => ({ key: k, label: prettify(k), value: String(v) }));
  }, [profile.data]);

  // Non-student roles reuse this screen as a tab — show a neutral placeholder
  // rather than calling student-only endpoints (which would 403).
  if (!isStudent) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
        <View style={styles.header}>
          <Text style={styles.heading}>Reports</Text>
        </View>
        <EmptyState icon="chart" title="Reports are coming to mobile" sub="Use the web dashboard for full analytics in v1." />
      </SafeAreaView>
    );
  }

  const loading = profile.loading && !profile.data;
  const subjectList = subjects.data ?? [];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      <View style={styles.header}>
        <Text style={styles.heading}>My Progress</Text>
      </View>

      {loading ? (
        <LoadingState />
      ) : profile.error && !profile.data ? (
        <ErrorState message={profile.error} onRetry={profile.refetch} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={profile.refreshing || subjects.refreshing}
              onRefresh={() => {
                profile.refetch();
                subjects.refetch();
              }}
              tintColor={Colors.primary}
            />
          }
        >
          {stats.length > 0 ? (
            <View style={styles.statsRow}>
              {stats.map((s, i) => (
                <StatCard
                  key={s.key}
                  icon={(['fire', 'library', 'clock'][i] ?? 'star') as IconName}
                  value={s.value}
                  label={s.label.toUpperCase()}
                  valueColor={[Colors.warning, Colors.primary, Colors.success][i] ?? Colors.primary}
                />
              ))}
            </View>
          ) : (
            <View style={styles.noStats}>
              <Text style={styles.noStatsText}>Your stats will appear here as you study.</Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Subjects</Text>
          {subjectList.length === 0 ? (
            <EmptyState icon="library" title="No subjects yet" />
          ) : (
            subjectList.map(s => (
              <View key={s.id} style={styles.subjectRow}>
                <View style={[styles.subjectIcon, { backgroundColor: subjectTint(s.color) }]}>
                  <Icon name={subjectIconName(s.icon)} size={20} color={subjectColor(s.color)} />
                </View>
                <View style={styles.subjectInfo}>
                  <Text style={styles.subjectName}>{s.name}</Text>
                  <Text style={styles.subjectMeta}>
                    {s.chapters_count} {s.chapters_count === 1 ? 'chapter' : 'chapters'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border2,
  },
  heading: { fontSize: 20, fontWeight: '800', color: Colors.text },
  scroll: { padding: 16, gap: 14, paddingBottom: 32 },
  statsRow: { flexDirection: 'row', gap: 8 },
  noStats: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border2,
    padding: 18,
    alignItems: 'center',
  },
  noStatsText: { fontSize: 12, color: Colors.text3 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginTop: 4 },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border2,
    ...Shadow.sm,
  },
  subjectIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  subjectInfo: { flex: 1 },
  subjectName: { fontSize: 13, fontWeight: '700', color: Colors.text },
  subjectMeta: { fontSize: 11, color: Colors.text2, marginTop: 2 },
});
