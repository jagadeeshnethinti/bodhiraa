import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, RefreshControl } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow, useTheme } from '../../theme';
import { LoadingState, ErrorState, EmptyState } from '../../components/common/ScreenStates';
import { SearchBar } from '../../components/common/SearchBar';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Entrance, PressableScale, AnimatedCounter, Shimmer } from '../../components/common/anim';
import { GlowBlob } from '../../components/illustrations/OnboardingArt';
import { useApi } from '../../hooks/useApi';
import { StudentApi, type ApiSubject } from '../../api';
import { Icon } from '../../components/common/Icon';
import { subjectIconName, subjectColor, subjectTint } from '../../utils/ui';

// Deterministic demo progress per subject (the wire model has no per-subject %).
const DEMO_PROGRESS = [100, 72, 45, 88, 60, 30];
const FILTERS = ['All', 'In Progress', 'Completed'] as const;
type Filter = (typeof FILTERS)[number];

export const CoursesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const theme = useTheme();
  const { data, loading, error, refetch, refreshing } = useApi(signal => StudentApi.subjects(signal), []);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');

  const all = data ?? [];
  const withProgress = useMemo(() => all.map((s, i) => ({ s, pct: DEMO_PROGRESS[i % DEMO_PROGRESS.length] })), [data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return withProgress.filter(({ s, pct }) => {
      if (q && !s.name.toLowerCase().includes(q)) return false;
      if (filter === 'In Progress' && pct >= 100) return false;
      if (filter === 'Completed' && pct < 100) return false;
      return true;
    });
  }, [withProgress, query, filter]);

  const avg = withProgress.length ? Math.round(withProgress.reduce((a, b) => a + b.pct, 0) / withProgress.length) : 0;
  const totalChapters = all.reduce((a, s) => a + s.chapters_count, 0);

  const open = (s: ApiSubject) => navigation.navigate('ChapterList', { subjectId: s.id, subjectName: s.name, icon: s.icon, color: s.color });

  return (
    <View style={[styles.container, { backgroundColor: theme.heroSolid }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.heroSolid} />

      {/* ── Gradient hero (fixed) ─────────────────────────────────── */}
      <LinearGradient colors={theme.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={styles.heroGlow} pointerEvents="none"><GlowBlob size={230} color={theme.accent} /></View>
          <SafeAreaView edges={['top']}>
              <Text style={styles.title}>My Courses</Text>
              <Text style={styles.subtitle}>Keep going — you're making great progress</Text>

              <Entrance index={0} style={styles.summaryCard}>
                <Shimmer />
                <Summary value={String(all.length)} label="Subjects" />
                <View style={styles.sumSep} />
                <Summary value={String(totalChapters)} label="Chapters" />
                <View style={styles.sumSep} />
                <Summary value={`${avg}%`} label="Avg progress" />
              </Entrance>
          </SafeAreaView>
        </LinearGradient>

      {/* ── Body sheet ────────────────────────────────────────────── */}
      <ScrollView
        style={styles.sheet}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor={Colors.primary} />}
      >
        <SearchBar placeholder="Search subjects…" value={query} onChangeText={setQuery} style={styles.search} />

        <View style={styles.chips}>
          {FILTERS.map(f => {
            const active = filter === f;
            return (
              <PressableScale key={f} style={[styles.chip, active && styles.chipActive]} onPress={() => setFilter(f)}>
                <Text style={[styles.chipTxt, active && styles.chipTxtActive]}>{f}</Text>
              </PressableScale>
            );
          })}
        </View>

        {loading && !data ? (
          <LoadingState />
        ) : error && !data ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="library"
            title={query ? 'No matches' : 'Nothing here yet'}
            sub={query ? 'Try a different search term.' : 'Subjects will appear here once assigned.'}
          />
        ) : (
          filtered.map(({ s, pct }, i) => {
            const accent = subjectColor(s.color);
            const done = pct >= 100;
            return (
              <Entrance key={s.id} index={i}>
                <PressableScale style={styles.card} onPress={() => open(s)}>
                  <View style={[styles.accentBar, { backgroundColor: accent }]} />
                  <View style={[styles.iconTile, { backgroundColor: subjectTint(s.color) }]}>
                    <Icon name={subjectIconName(s.icon)} size={26} color={accent} />
                  </View>
                  <View style={styles.cardBody}>
                    <View style={styles.cardTopRow}>
                      <Text style={styles.cardName} numberOfLines={1}>{s.name}</Text>
                      {done && (
                        <View style={styles.doneBadge}>
                          <Icon name="checkmark" size={10} color={Colors.white} />
                          <Text style={styles.doneTxt}>Done</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.cardMeta}>
                      {s.chapters_count} {s.chapters_count === 1 ? 'chapter' : 'chapters'}{s.grade ? ` · Grade ${s.grade}` : ''}
                    </Text>
                    <View style={styles.progressRow}>
                      <ProgressBar value={pct} color={accent} height={6} style={styles.progressBar} />
                      <Text style={[styles.cardPct, { color: accent }]}>{pct}%</Text>
                    </View>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </PressableScale>
              </Entrance>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const Summary: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <View style={styles.sumItem}>
    {value.endsWith('%') || /^\d+$/.test(value) ? (
      <AnimatedCounter value={value} style={styles.sumVal} />
    ) : (
      <Text style={styles.sumVal}>{value}</Text>
    )}
    <Text style={styles.sumLbl}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A0A0C' },

  hero: { paddingHorizontal: 16, paddingBottom: 30, overflow: 'hidden' },
  heroGlow: { position: 'absolute', top: -60, right: -40, opacity: 0.8 },
  title: { fontSize: 26, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.5, paddingTop: 6 },
  subtitle: { fontSize: 12.5, color: 'rgba(245,232,208,0.7)', marginTop: 4 },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    backgroundColor: 'rgba(245,232,208,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(196,149,96,0.2)',
    borderRadius: Radius.lg,
    paddingVertical: 14,
    overflow: 'hidden',
  },
  sumItem: { flex: 1, alignItems: 'center' },
  sumVal: { fontSize: 19, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.3 },
  sumLbl: { fontSize: 9.5, color: 'rgba(245,232,208,0.6)', fontWeight: '600', marginTop: 3, letterSpacing: 0.3 },
  sumSep: { width: 1, height: 30, backgroundColor: 'rgba(196,149,96,0.2)' },

  sheet: { flex: 1, backgroundColor: Colors.bg, marginTop: -18, borderTopLeftRadius: 26, borderTopRightRadius: 26 },
  content: { padding: 16, paddingTop: 20, gap: 12, paddingBottom: 28 },
  search: { backgroundColor: Colors.bg2 },

  chips: { flexDirection: 'row', gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: Radius.full, backgroundColor: Colors.bg2, borderWidth: 1, borderColor: Colors.border2 },
  chipActive: { backgroundColor: Colors.brand, borderColor: Colors.brand },
  chipTxt: { fontSize: 12, fontWeight: '700', color: Colors.text2 },
  chipTxtActive: { color: Colors.primary },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border2,
    padding: 14,
    paddingLeft: 18,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  accentBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5 },
  iconTile: { width: 52, height: 52, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, gap: 6 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardName: { flex: 1, fontSize: 15, fontWeight: '800', color: Colors.text },
  doneBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.success, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  doneTxt: { fontSize: 9, fontWeight: '800', color: Colors.white, letterSpacing: 0.3 },
  cardMeta: { fontSize: 11.5, color: Colors.text2 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  progressBar: { flex: 1 },
  cardPct: { fontSize: 12, fontWeight: '800', width: 38, textAlign: 'right' },
  chevron: { fontSize: 24, color: Colors.text3 },
});
