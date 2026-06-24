import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Radius, Shadow, useTheme } from '../../theme';
import { LoadingState, ErrorState, EmptyState } from '../../components/common/ScreenStates';
import { CircularProgress } from '../../components/common/CircularProgress';
import { Entrance, AnimatedCounter, Shimmer } from '../../components/common/anim';
import { GlowBlob } from '../../components/illustrations/OnboardingArt';
import { useApi } from '../../hooks/useApi';
import { StudentApi } from '../../api';
import type { ApiBadge } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Icon, IconName } from '../../components/common/Icon';
import { subjectIconName, subjectColor, subjectTint } from '../../utils/ui';

// Deterministic demo mastery per subject (the wire model carries no per-subject %).
const DEMO_PROGRESS = [82, 64, 91, 48, 73, 58];

/** A single achievement medal — gradient ring when earned, dimmed + lock when not. */
const BadgeMedal: React.FC<{ badge: ApiBadge; index: number }> = ({ badge, index }) => (
  <Entrance index={index} style={styles.badgeItem}>
    {badge.earned ? (
      <LinearGradient
        colors={badge.colors.length >= 2 ? badge.colors : ['#F5C84B', '#C9982E']}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={styles.medal}
      >
        <Text style={styles.medalEmoji}>{badge.icon}</Text>
      </LinearGradient>
    ) : (
      <View style={[styles.medal, styles.medalLocked]}>
        <Text style={[styles.medalEmoji, styles.medalEmojiLocked]}>{badge.icon}</Text>
        <View style={styles.lockBadge}><Icon name="lock" size={10} color={Colors.text2} /></View>
      </View>
    )}
    <Text style={styles.badgeTitle} numberOfLines={1}>{badge.title}</Text>
    <Text style={[styles.badgeTier, { color: badge.earned ? Colors.primary : Colors.text2 }]}>{badge.tier_label}</Text>
  </Entrance>
);

export const ProgressScreen: React.FC<{ navigation: any }> = () => {
  const { role } = useAuth();
  const theme = useTheme();
  const isStudent = role === 'student';

  const profile = useApi(signal => (isStudent ? StudentApi.profile(signal) : Promise.resolve(null)), [isStudent]);
  const subjects = useApi(signal => (isStudent ? StudentApi.subjects(signal) : Promise.resolve([])), [isStudent]);
  const badges = useApi(signal => (isStudent ? StudentApi.badges(signal) : Promise.resolve(null)), [isStudent]);

  const p = (profile.data ?? {}) as Record<string, number>;
  const avg = Number(p.avg_score ?? 0);
  const overview: { icon: IconName; label: string; value: number }[] = [
    { icon: 'book', label: 'Lessons done', value: Number(p.lessons_completed ?? 0) },
    { icon: 'edit', label: 'Quizzes taken', value: Number(p.quizzes_taken ?? 0) },
    { icon: 'fire', label: 'Day streak', value: Number(p.day_streak ?? 0) },
  ];

  if (!isStudent) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
        <View style={styles.header}><Text style={styles.heading}>Reports</Text></View>
        <EmptyState icon="chart" title="Reports are coming to mobile" sub="Use the web dashboard for full analytics in v1." />
      </SafeAreaView>
    );
  }

  const loading = profile.loading && !profile.data;
  const subjectList = subjects.data ?? [];

  return (
    <View style={[styles.container, styles.dark, { backgroundColor: theme.heroSolid }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.heroSolid} />

      {/* Hero: overall mastery ring (fixed) */}
      <LinearGradient colors={theme.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroGlow} pointerEvents="none"><GlowBlob size={220} /></View>
        <SafeAreaView edges={['top']}>
          <Text style={styles.heading}>My Progress</Text>
          <Entrance index={0} style={styles.heroCard}>
            <Shimmer />
            <CircularProgress size={108} strokeWidth={11} progress={avg} trackColor="rgba(245,232,208,0.14)">
              <View style={styles.ringCenter}>
                <AnimatedCounter value={`${avg}%`} style={styles.ringPct} />
                <Text style={styles.ringLbl}>Mastery</Text>
              </View>
            </CircularProgress>
            <View style={styles.overviewStats}>
              {overview.map(o => (
                <View key={o.label} style={styles.ovRow}>
                  <View style={styles.ovIcon}><Icon name={o.icon} size={16} color={Colors.primary} /></View>
                  <AnimatedCounter value={o.value} style={styles.ovVal} />
                  <Text style={styles.ovLbl}>{o.label}</Text>
                </View>
              ))}
            </View>
          </Entrance>
        </SafeAreaView>
      </LinearGradient>

      {loading ? (
        <View style={styles.sheet}><LoadingState /></View>
      ) : profile.error && !profile.data ? (
        <View style={styles.sheet}><ErrorState message={profile.error} onRetry={profile.refetch} /></View>
      ) : (
        <ScrollView
          style={styles.sheet}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={profile.refreshing || subjects.refreshing || badges.refreshing} onRefresh={() => { profile.refetch(); subjects.refetch(); badges.refetch(); }} tintColor={Colors.primary} />
          }
        >
          <Text style={styles.sectionTitle}>Subject mastery</Text>
          {subjectList.length === 0 ? (
            <EmptyState icon="library" title="No subjects yet" />
          ) : (
            subjectList.map((s, i) => {
              const pct = DEMO_PROGRESS[i % DEMO_PROGRESS.length];
              const ringColor = subjectColor(s.color);
              return (
                <Entrance key={s.id} index={i}>
                  <View style={styles.subjectRow}>
                    <CircularProgress size={52} strokeWidth={6} progress={pct} colors={[ringColor, ringColor]} delay={150 + i * 60}>
                      <View style={[styles.subjectIcon, { backgroundColor: subjectTint(s.color) }]}>
                        <Icon name={subjectIconName(s.icon)} size={18} color={ringColor} />
                      </View>
                    </CircularProgress>
                    <View style={styles.subjectInfo}>
                      <Text style={styles.subjectName}>{s.name}</Text>
                      <Text style={styles.subjectMeta}>{s.chapters_count} {s.chapters_count === 1 ? 'chapter' : 'chapters'}</Text>
                    </View>
                    <Text style={[styles.subjectPct, { color: pct >= 70 ? Colors.success : pct >= 50 ? Colors.warning : Colors.danger }]}>{pct}%</Text>
                  </View>
                </Entrance>
              );
            })
          )}

          {badges.data && badges.data.badges.length > 0 && (
            <>
              <View style={styles.badgeHead}>
                <Text style={styles.sectionTitle}>Achievements</Text>
                <View style={styles.badgeChips}>
                  <View style={styles.badgeChip}>
                    <Icon name="trophy" size={12} color={Colors.primary} />
                    <Text style={styles.badgeChipTxt}>{badges.data.earned_count}/{badges.data.total}</Text>
                  </View>
                  <View style={styles.badgeChip}>
                    <Icon name="star" size={12} color={Colors.primary} />
                    <Text style={styles.badgeChipTxt}>{badges.data.total_xp} XP</Text>
                  </View>
                </View>
              </View>
              <View style={styles.badgeGrid}>
                {badges.data.badges.map((b, i) => (
                  <BadgeMedal key={b.key} badge={b} index={i} />
                ))}
              </View>
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  dark: { backgroundColor: '#1A0A0C' },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.border2 },
  heading: { fontSize: 22, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.4, paddingHorizontal: 16, paddingTop: 6 },

  hero: { paddingBottom: 32, overflow: 'hidden' },
  heroGlow: { position: 'absolute', top: -60, right: -40, opacity: 0.8 },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginTop: 14,
    marginHorizontal: 16,
    backgroundColor: 'rgba(245,232,208,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(196,149,96,0.22)',
    borderRadius: Radius.xl,
    padding: 16,
    overflow: 'hidden',
  },
  ringCenter: { alignItems: 'center', justifyContent: 'center' },
  ringPct: { fontSize: 23, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.6 },
  ringLbl: { fontSize: 9, fontWeight: '700', color: 'rgba(245,232,208,0.6)', letterSpacing: 0.5, marginTop: 1 },
  overviewStats: { flex: 1, gap: 10 },
  ovRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ovIcon: { width: 30, height: 30, borderRadius: 9, backgroundColor: 'rgba(245,232,208,0.08)', alignItems: 'center', justifyContent: 'center' },
  ovVal: { fontSize: 16, fontWeight: '900', color: '#F5E8D0' },
  ovLbl: { fontSize: 11, color: 'rgba(245,232,208,0.65)', fontWeight: '600', flex: 1 },

  sheet: { flex: 1, backgroundColor: Colors.bg, marginTop: -20, borderTopLeftRadius: 26, borderTopRightRadius: 26 },
  content: { padding: 16, paddingTop: 22, gap: 12, paddingBottom: 28 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.text, marginBottom: 2 },
  subjectRow: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Colors.card, borderRadius: Radius.md, padding: 12, borderWidth: 1, borderColor: Colors.border2, ...Shadow.sm },
  subjectIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  subjectInfo: { flex: 1 },
  subjectName: { fontSize: 13.5, fontWeight: '700', color: Colors.text },
  subjectMeta: { fontSize: 11, color: Colors.text2, marginTop: 2 },
  subjectPct: { fontSize: 15, fontWeight: '900' },

  // Achievements
  badgeHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, marginBottom: 4 },
  badgeChips: { flexDirection: 'row', gap: 8 },
  badgeChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FBF1E2', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999 },
  badgeChipTxt: { fontSize: 11.5, fontWeight: '800', color: Colors.text },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4 },
  badgeItem: { width: '30%', alignItems: 'center', backgroundColor: Colors.card, borderRadius: Radius.md, paddingVertical: 14, paddingHorizontal: 6, borderWidth: 1, borderColor: Colors.border2, ...Shadow.sm },
  medal: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  medalLocked: { backgroundColor: '#E9E2D6' },
  medalEmoji: { fontSize: 26 },
  medalEmojiLocked: { opacity: 0.45 },
  lockBadge: { position: 'absolute', right: -2, bottom: -2, width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border2, alignItems: 'center', justifyContent: 'center' },
  badgeTitle: { fontSize: 11.5, fontWeight: '800', color: Colors.text, textAlign: 'center' },
  badgeTier: { fontSize: 9.5, fontWeight: '800', letterSpacing: 0.4, textTransform: 'uppercase', marginTop: 2 },
});
