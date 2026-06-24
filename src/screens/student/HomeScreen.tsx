import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, RefreshControl, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow, useTheme } from '../../theme';
import { AIBubble } from '../../components/common/AIBubble';
import { SectionHeader } from '../../components/common/SectionHeader';
import { LoadingState, ErrorState } from '../../components/common/ScreenStates';
import { CircularProgress } from '../../components/common/CircularProgress';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Entrance, PressableScale, AnimatedCounter, Pulse, Shimmer } from '../../components/common/anim';
import { GlowBlob } from '../../components/illustrations/OnboardingArt';
import { useApi } from '../../hooks/useApi';
import { StudentApi, NotificationsApi, type ApiSubject, type ApiStudentHome } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Icon } from '../../components/common/Icon';
import { Avatar } from '../../components/common/Avatar';
import { subjectIconName, subjectColor, subjectTint, clockTime, relativeUntil } from '../../utils/ui';
import { planDaysLeft, daysLeftLabel } from '../../utils/plan';

type HomeExtra = {
  daily_goal_percent?: number;
  lessons_today?: number;
  lessons_goal?: number;
  xp_points?: number;
  continue_lesson?: {
    lesson_id: number;
    subject_name: string;
    chapter: string;
    progress_percent: number;
    icon: string;
    color: string;
  };
};

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const theme = useTheme();
  // Monthly (B2C) plans show a renewal countdown; school plans don't expire.
  const monthlyDaysLeft = user?.plan?.tier === 'monthly' ? planDaysLeft(user.plan.expires_at) : null;
  const home = useApi(signal => StudentApi.home(signal), []);
  const notifs = useApi(signal => NotificationsApi.list(1, signal), []);
  const unread = notifs.data?.meta?.unread_count ?? 0;

  const hd = home.data as (ApiStudentHome & HomeExtra) | null;
  const goal = hd?.daily_goal_percent ?? 0;
  const streak = hd?.streak_days ?? 0;
  const xp = hd?.xp_points ?? 0;
  const lessonsToday = hd?.lessons_today ?? 0;
  const lessonsGoal = hd?.lessons_goal ?? 0;
  const cont = hd?.continue_lesson;
  const subjects = hd?.subjects ?? [];

  const openSubject = (s: ApiSubject) =>
    navigation.navigate('ChapterList', { subjectId: s.id, subjectName: s.name, icon: s.icon, color: s.color });

  return (
    <View style={[styles.container, { backgroundColor: theme.heroSolid }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.heroSolid} />

      {/* ── Gradient hero (fixed) ─────────────────────────────────── */}
      <LinearGradient colors={theme.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroGlow} pointerEvents="none">
          <GlowBlob size={240} color={theme.accent} />
        </View>
        <SafeAreaView edges={['top']}>
          <View style={styles.topRow}>
            <View style={styles.userRow}>
              <Avatar
                uri={user?.avatar}
                name={user?.name}
                style={[styles.avatar, { backgroundColor: theme.accent }]}
                textStyle={[styles.avatarText, { color: theme.onAccent }]}
              />
              <View>
                <Text style={styles.helloLabel}>{user?.school ? user.school.name.toUpperCase() : 'WELCOME BACK'}</Text>
                <Text style={styles.helloName} numberOfLines={1}>{user?.name ?? 'Learner'}</Text>
              </View>
            </View>
            <TouchableOpacity style={[styles.bellBtn, { backgroundColor: theme.accent + '22', borderColor: theme.accent + '40' }]} onPress={() => navigation.navigate('Notifications')}>
              <Icon name="bell" size={18} color={theme.accent} />
              {unread > 0 && <View style={styles.bellDot} />}
            </TouchableOpacity>
          </View>

          {/* Glass stat card with the daily-goal ring */}
          <Entrance index={0} style={styles.heroCard}>
            <Shimmer />
            <CircularProgress size={94} strokeWidth={9} progress={goal} trackColor="rgba(245,232,208,0.14)">
              <View style={styles.ringCenter}>
                <AnimatedCounter value={`${goal}%`} style={styles.ringPct} />
                <Text style={styles.ringLbl}>Goal</Text>
              </View>
            </CircularProgress>

            <View style={styles.heroStats}>
              <View style={styles.statChip}>
                <Pulse style={styles.statIcon}><Icon name="fire" size={18} color={Colors.warning} /></Pulse>
                <View>
                  <AnimatedCounter value={streak} style={styles.statVal} />
                  <Text style={styles.statLbl}>Day streak</Text>
                </View>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statChip}>
                <View style={styles.statIcon}><Icon name="star" size={18} color={Colors.primary} /></View>
                <View>
                  <AnimatedCounter value={xp.toLocaleString('en-IN')} style={styles.statVal} />
                  <Text style={styles.statLbl}>XP points</Text>
                </View>
              </View>
            </View>
          </Entrance>
          <Text style={styles.goalHint}>
            {lessonsToday}/{lessonsGoal} lessons done today — keep it up! 🔥
          </Text>
        </SafeAreaView>
      </LinearGradient>

      {/* ── Body (rounded sheet overlapping the hero) ─────────────── */}
      {home.loading && !home.data ? (
        <View style={styles.sheet}><LoadingState /></View>
      ) : home.error && !home.data ? (
        <View style={styles.sheet}><ErrorState message={home.error} onRetry={home.refetch} /></View>
      ) : (
        <ScrollView
          style={styles.sheet}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={home.refreshing} onRefresh={() => { home.refetch(); notifs.refetch(); }} tintColor={Colors.primary} />
          }
        >
          {/* Monthly plan countdown (B2C only) */}
          {monthlyDaysLeft != null && (
            <Entrance index={0}>
              <PressableScale style={styles.planBanner} onPress={() => navigation.navigate('Subscription')}>
                <View style={[styles.planIcon, { backgroundColor: monthlyDaysLeft <= 3 ? Colors.dangerLight : Colors.primaryLight }]}>
                  <Icon name="clock" size={18} color={monthlyDaysLeft <= 3 ? Colors.danger : Colors.primaryDark} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.planTitle}>Monthly plan · {daysLeftLabel(monthlyDaysLeft)}</Text>
                  <Text style={styles.planSub}>{monthlyDaysLeft <= 3 ? 'Renew now to keep your premium access.' : 'Tap to manage or renew your subscription.'}</Text>
                </View>
                <View style={[styles.planRenew, { backgroundColor: theme.accent }]}>
                  <Text style={[styles.planRenewTxt, { color: theme.onAccent }]}>Renew</Text>
                </View>
              </PressableScale>
            </Entrance>
          )}

          {/* Continue learning */}
          {cont && (
            <Entrance index={0}>
              <PressableScale
                style={styles.continueCard}
                onPress={() => navigation.navigate('LessonDetail', { lessonId: cont.lesson_id, title: cont.chapter })}
              >
                <View style={[styles.continueIcon, { backgroundColor: subjectTint(cont.color) }]}>
                  <Icon name={subjectIconName(cont.icon)} size={26} color={subjectColor(cont.color)} />
                </View>
                <View style={styles.continueBody}>
                  <Text style={styles.continueLabel}>CONTINUE LEARNING</Text>
                  <Text style={styles.continueTitle} numberOfLines={1}>{cont.chapter}</Text>
                  <View style={styles.continueBarRow}>
                    <ProgressBar value={cont.progress_percent} variant="primary" height={6} style={styles.continueTrack} />
                    <Text style={styles.continuePct}>{cont.progress_percent}%</Text>
                  </View>
                </View>
              </PressableScale>
            </Entrance>
          )}

          {/* AI entry */}
          <Entrance index={1}>
            <AIBubble
              title="Bodhira AI"
              message="Stuck on a concept? Ask your AI tutor anything — it answers in seconds."
              actions={[{ label: 'Ask a doubt', variant: 'primary', onPress: () => navigation.navigate('AITutor') }]}
            />
          </Entrance>

          {/* Today's live classes */}
          {hd?.todays_classes && hd.todays_classes.length > 0 && (
            <>
              <Entrance index={2}><SectionHeader title="Today's Live Classes" actionLabel="All" onAction={() => navigation.navigate('LiveClasses')} /></Entrance>
              {hd.todays_classes.map((lc, i) => (
                <Entrance key={lc.id} index={3 + i}>
                  <PressableScale style={styles.liveCard} onPress={() => navigation.navigate('LiveClassDetail', { liveId: lc.id, title: lc.title })}>
                    <View style={styles.liveIcon}><Icon name="video" size={20} color={Colors.primary} /></View>
                    <View style={styles.liveInfo}>
                      <Text style={styles.liveTitle} numberOfLines={1}>{lc.title}</Text>
                      <Text style={styles.liveSub}>{lc.host_name} · {clockTime(lc.scheduled_at)}</Text>
                    </View>
                    <View style={[styles.liveBadge, lc.live_status === 'live' ? styles.liveBadgeLive : styles.liveBadgeSoon]}>
                      <Text style={[styles.liveBadgeTxt, lc.live_status === 'live' && { color: Colors.white }]}>
                        {lc.live_status === 'live' ? 'LIVE' : relativeUntil(lc.scheduled_at) || 'Soon'}
                      </Text>
                    </View>
                  </PressableScale>
                </Entrance>
              ))}
            </>
          )}

          {/* Next quiz */}
          {hd?.next_quiz && (
            <>
              <Entrance index={6}><SectionHeader title="Next Quiz" actionLabel="All quizzes" onAction={() => navigation.navigate('QuizList')} /></Entrance>
              <Entrance index={7}>
                <PressableScale style={styles.quizCard} onPress={() => navigation.navigate('QuizDetail', { quizId: hd.next_quiz!.id, title: hd.next_quiz!.title })}>
                  <View style={styles.quizIcon}><Icon name="edit" size={22} color="#8B5CF6" /></View>
                  <View style={styles.liveInfo}>
                    <Text style={styles.quizTitle} numberOfLines={1}>{hd.next_quiz.title}</Text>
                    <Text style={styles.liveSub}>{hd.next_quiz.starts_at ? `Starts ${clockTime(hd.next_quiz.starts_at)}` : 'Tap to begin'}</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </PressableScale>
              </Entrance>
            </>
          )}

          {/* Subjects grid */}
          <Entrance index={8}><SectionHeader title="Subjects" actionLabel="View all" onAction={() => navigation.navigate('SubjectList')} /></Entrance>
          <View style={styles.subjectsGrid}>
            {subjects.slice(0, 6).map((s, i) => (
              <Entrance key={s.id} index={9 + i} style={styles.subjectTileWrap}>
                <PressableScale style={styles.subjectTile} onPress={() => openSubject(s)}>
                  <View style={[styles.subjectIcon, { backgroundColor: subjectTint(s.color) }]}>
                    <Icon name={subjectIconName(s.icon)} size={20} color={subjectColor(s.color)} />
                  </View>
                  <Text style={styles.subjectName} numberOfLines={1}>{s.name}</Text>
                  <Text style={styles.subjectMeta}>{s.chapters_count} ch</Text>
                </PressableScale>
              </Entrance>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A0A0C' },

  hero: { paddingHorizontal: 16, paddingBottom: 34, overflow: 'hidden' },
  heroGlow: { position: 'absolute', top: -70, right: -50, opacity: 0.8 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4, marginBottom: 18 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatar: { width: 46, height: 46, borderRadius: 15, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '900', color: Colors.brand },
  helloLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(196,149,96,0.8)', letterSpacing: 1 },
  helloName: { fontSize: 18, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.3, marginTop: 1 },
  bellBtn: { width: 42, height: 42, borderRadius: 13, backgroundColor: 'rgba(196,149,96,0.16)', borderWidth: 1, borderColor: 'rgba(196,149,96,0.25)', alignItems: 'center', justifyContent: 'center' },
  bellDot: { position: 'absolute', top: 9, right: 9, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.danger, borderWidth: 1.5, borderColor: '#2A0E13' },

  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'rgba(245,232,208,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(196,149,96,0.22)',
    borderRadius: Radius.xl,
    padding: 16,
    overflow: 'hidden',
  },
  ringCenter: { alignItems: 'center', justifyContent: 'center' },
  ringPct: { fontSize: 20, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.5 },
  ringLbl: { fontSize: 9, fontWeight: '700', color: 'rgba(245,232,208,0.6)', letterSpacing: 0.5, marginTop: 1 },
  heroStats: { flex: 1, gap: 12 },
  statChip: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: 'rgba(245,232,208,0.08)', alignItems: 'center', justifyContent: 'center' },
  statVal: { fontSize: 18, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.3 },
  statLbl: { fontSize: 10, color: 'rgba(245,232,208,0.6)', fontWeight: '600', marginTop: -1 },
  statDivider: { height: 1, backgroundColor: 'rgba(196,149,96,0.18)' },
  goalHint: { fontSize: 11.5, color: 'rgba(245,232,208,0.75)', fontWeight: '600', textAlign: 'center', marginTop: 14 },

  sheet: { flex: 1, backgroundColor: Colors.bg, marginTop: -22, borderTopLeftRadius: 26, borderTopRightRadius: 26 },
  content: { padding: 16, paddingTop: 22, gap: 14, paddingBottom: 28 },

  planBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border2, padding: 12, ...Shadow.sm },
  planIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  planTitle: { fontSize: 13, fontWeight: '800', color: Colors.text },
  planSub: { fontSize: 11, color: Colors.text2, marginTop: 2 },
  planRenew: { borderRadius: Radius.full, paddingHorizontal: 14, paddingVertical: 8 },
  planRenewTxt: { fontSize: 11, fontWeight: '800' },

  continueCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border2, padding: 14, ...Shadow.md },
  continueIcon: { width: 52, height: 52, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  continueBody: { flex: 1, gap: 6 },
  continueLabel: { fontSize: 9.5, fontWeight: '800', color: Colors.primaryDark, letterSpacing: 0.8 },
  continueTitle: { fontSize: 14.5, fontWeight: '800', color: Colors.text },
  continueBarRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  continueTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: Colors.bg2, overflow: 'hidden' },
  continueFill: { height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  continuePct: { fontSize: 11, fontWeight: '800', color: Colors.primaryDark },

  liveCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border2, padding: 10, ...Shadow.sm },
  liveIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  liveInfo: { flex: 1, minWidth: 0 },
  liveTitle: { fontSize: 13, fontWeight: '700', color: Colors.text },
  liveSub: { fontSize: 11, color: Colors.text2, marginTop: 2 },
  liveBadge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: Radius.full },
  liveBadgeLive: { backgroundColor: Colors.danger },
  liveBadgeSoon: { backgroundColor: Colors.primaryLight },
  liveBadgeTxt: { fontSize: 10, fontWeight: '800', color: Colors.primary },

  quizCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border2, padding: 10, ...Shadow.sm },
  quizIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F3E8FF', alignItems: 'center', justifyContent: 'center' },
  quizTitle: { fontSize: 13, fontWeight: '700', color: Colors.text },
  chevron: { fontSize: 24, color: Colors.text3 },

  subjectsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  subjectTileWrap: { width: '31%' },
  subjectTile: { width: '100%', alignItems: 'center', gap: 4, paddingVertical: 14, backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border2, ...Shadow.sm },
  subjectIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  subjectName: { fontSize: 11, fontWeight: '700', color: Colors.text, textAlign: 'center', paddingHorizontal: 4 },
  subjectMeta: { fontSize: 9, color: Colors.text3 },
});
