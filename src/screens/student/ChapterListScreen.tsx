import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, RefreshControl, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../types';
import { Colors, Radius, Shadow } from '../../theme';
import { LoadingState, ErrorState, EmptyState } from '../../components/common/ScreenStates';
import { Icon } from '../../components/common/Icon';
import { CircularProgress } from '../../components/common/CircularProgress';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Entrance, PressableScale, Shimmer } from '../../components/common/anim';
import { GlowBlob } from '../../components/illustrations/OnboardingArt';
import { useApi } from '../../hooks/useApi';
import { StudentApi } from '../../api';
import { subjectIconName, subjectColor } from '../../utils/ui';

type Props = NativeStackScreenProps<StudentStackParamList, 'ChapterList'>;

// Deterministic demo progress per chapter (the wire model has no per-chapter %).
const DEMO_PROGRESS = [100, 60, 25, 0, 0, 0, 0, 0, 0, 0];

export const ChapterListScreen: React.FC<Props> = ({ navigation, route }) => {
  const { subjectId, subjectName, icon, color } = route.params;
  const { data, loading, error, refetch, refreshing } = useApi(signal => StudentApi.subject(subjectId, signal), [subjectId]);

  const chapters = data?.chapters ?? [];
  const heroColor = color ?? data?.subject?.color ?? null;
  const accent = subjectColor(heroColor);
  const heroIcon = subjectIconName(icon ?? data?.subject?.icon);

  const withPct = chapters.map((ch, i) => ({ ch, pct: DEMO_PROGRESS[i % DEMO_PROGRESS.length] }));
  const subjectPct = withPct.length ? Math.round(withPct.reduce((a, b) => a + b.pct, 0) / withPct.length) : 0;
  const doneChapters = withPct.filter(c => c.pct >= 100).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A0A0C" />

      {/* ── Subject-themed gradient hero (fixed) ──────────────────── */}
      <LinearGradient colors={['#1A0A0C', '#2A0E13', '#3D1520']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={styles.heroGlow} pointerEvents="none"><GlowBlob size={240} color={accent} /></View>
          <SafeAreaView edges={['top']}>
            <View style={styles.topbar}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Text style={styles.backIcon}>‹</Text>
              </TouchableOpacity>
              <View style={{ width: 40 }} />
            </View>

            <View style={styles.heroContent}>
              <Entrance index={0}>
                <CircularProgress size={108} strokeWidth={8} progress={subjectPct} colors={[accent, accent]} trackColor="rgba(245,232,208,0.14)">
                  <View style={[styles.ringIcon, { backgroundColor: accent + '26', borderColor: accent + '55' }]}>
                    <Icon name={heroIcon} size={30} color={accent} />
                  </View>
                </CircularProgress>
              </Entrance>
              <Text style={styles.subjectName}>{data?.subject?.name ?? subjectName}</Text>
              <Text style={styles.subjectMeta}>
                {chapters.length} {chapters.length === 1 ? 'chapter' : 'chapters'}
                {data?.subject?.grade ? ` · Grade ${data.subject.grade}` : ''}
              </Text>

              <Entrance index={1} style={styles.progressPill}>
                <Shimmer />
                <ProgressBar value={subjectPct} color={accent} height={6} style={styles.pillBar} />
                <Text style={styles.pillTxt}>{subjectPct}% · {doneChapters}/{chapters.length} done</Text>
              </Entrance>
            </View>
          </SafeAreaView>
        </LinearGradient>

      {/* ── Body sheet: chapter path ──────────────────────────────── */}
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
          {chapters.length === 0 ? (
            <EmptyState icon="book" title="No chapters yet" sub="Content for this subject is on the way." />
          ) : (
            <>
              <Text style={styles.pathTitle}>Chapters</Text>
              {withPct.map(({ ch, pct }, i) => {
                const done = pct >= 100;
                const started = pct > 0 && pct < 100;
                return (
                  <Entrance key={ch.id} index={i}>
                    <PressableScale
                      style={[styles.card, started && { borderColor: accent + '66' }]}
                      onPress={() => navigation.navigate('ChapterLessons', { chapterId: ch.id, chapterTitle: ch.title, subjectName: data?.subject?.name ?? subjectName })}
                    >
                      <View style={[styles.leftBar, { backgroundColor: done ? Colors.success : started ? accent : Colors.border }]} />
                      <View style={[styles.node, done ? styles.nodeDone : { backgroundColor: started ? accent + '1F' : Colors.bg2, borderWidth: started ? 1.5 : 1, borderColor: started ? accent : Colors.border }]}>
                        {done ? <Icon name="checkmark" size={15} color={Colors.white} /> : <Text style={[styles.nodeNum, started && { color: accent }]}>{ch.sort_order ?? i + 1}</Text>}
                      </View>
                      <View style={styles.info}>
                        <Text style={styles.chTitle} numberOfLines={2}>{ch.title}</Text>
                        {ch.lessons_count != null && (
                          <Text style={styles.chSub}>{ch.lessons_count} {ch.lessons_count === 1 ? 'lesson' : 'lessons'}{done ? ' · Completed' : started ? ' · In progress' : ''}</Text>
                        )}
                        {started && <ProgressBar value={pct} color={accent} height={5} style={styles.chBar} />}
                      </View>
                      {done || started ? (
                        <Text style={[styles.chPct, { color: done ? Colors.success : accent }]}>{pct}%</Text>
                      ) : (
                        <Text style={styles.chevron}>›</Text>
                      )}
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
  heroGlow: { position: 'absolute', top: -60, right: -50, opacity: 0.75 },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(196,149,96,0.15)', borderWidth: 1, borderColor: 'rgba(196,149,96,0.25)', alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 28, color: Colors.primary, fontWeight: '300', marginTop: -2 },

  heroContent: { alignItems: 'center', marginTop: 8 },
  ringIcon: { width: 64, height: 64, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  subjectName: { fontSize: 24, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.5, marginTop: 16 },
  subjectMeta: { fontSize: 12, color: 'rgba(245,232,208,0.65)', marginTop: 5 },
  progressPill: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16, backgroundColor: 'rgba(245,232,208,0.07)', borderWidth: 1, borderColor: 'rgba(196,149,96,0.2)', borderRadius: Radius.full, paddingHorizontal: 16, paddingVertical: 12, overflow: 'hidden', minWidth: 240 },
  pillBar: { flex: 1, backgroundColor: 'rgba(245,232,208,0.16)' },
  pillTxt: { fontSize: 11, fontWeight: '800', color: '#F5E8D0' },

  sheet: { flex: 1, backgroundColor: Colors.bg, marginTop: -18, borderTopLeftRadius: 26, borderTopRightRadius: 26 },
  content: { padding: 16, paddingTop: 20, gap: 10, paddingBottom: 28 },
  pathTitle: { fontSize: 15, fontWeight: '800', color: Colors.text, marginBottom: 2 },

  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border2, padding: 12, paddingLeft: 16, overflow: 'hidden', ...Shadow.sm },
  leftBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5 },
  node: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  nodeDone: { backgroundColor: Colors.success },
  nodeNum: { fontSize: 15, fontWeight: '800', color: Colors.text3 },
  info: { flex: 1, gap: 4 },
  chTitle: { fontSize: 13.5, fontWeight: '700', color: Colors.text },
  chSub: { fontSize: 11, color: Colors.text2 },
  chBar: { marginTop: 4, width: '70%' },
  chPct: { fontSize: 13, fontWeight: '800' },
  chevron: { fontSize: 22, color: Colors.text3 },
});
