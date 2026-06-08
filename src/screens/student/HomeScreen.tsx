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
import { Colors, Radius, Shadow } from '../../theme';
import { StatCard } from '../../components/common/StatCard';
import { AIBubble } from '../../components/common/AIBubble';
import { SectionHeader } from '../../components/common/SectionHeader';
import { LoadingState, ErrorState } from '../../components/common/ScreenStates';
import { useApi } from '../../hooks/useApi';
import { StudentApi, NotificationsApi, type ApiSubject } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Icon } from '../../components/common/Icon';
import { initials, subjectIconName, subjectColor, subjectTint, clockTime, relativeUntil } from '../../utils/ui';

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const home = useApi(signal => StudentApi.home(signal), []);
  // Unread badge — cheap secondary fetch; failures are non-fatal.
  const notifs = useApi(signal => NotificationsApi.list(1, signal), []);
  const unread = notifs.data?.meta?.unread_count ?? 0;

  const openSubject = (s: ApiSubject) =>
    navigation.navigate('ChapterList', {
      subjectId: s.id,
      subjectName: s.name,
      icon: s.icon,
      color: s.color,
    });

  const schoolName = user?.school?.name ?? (user?.grade ? `Grade ${user.grade}` : 'Bodhira');

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      {/* Top bar */}
      <View style={styles.topbar}>
        <View style={styles.locationPill}>
          <View style={styles.locIcon}>
            <Icon name="school" size={16} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.locLabel}>YOUR SCHOOL</Text>
            <Text style={styles.locValue} numberOfLines={1}>
              {schoolName}
            </Text>
          </View>
        </View>
        <View style={styles.topRight}>
          <TouchableOpacity style={styles.notifBtn} onPress={() => navigation.navigate('Notifications')}>
            <Icon name="bell" size={18} color={Colors.primary} />
            {unread > 0 && <View style={styles.notifDot} />}
          </TouchableOpacity>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials(user?.name)}</Text>
          </View>
        </View>
      </View>

      {home.loading && !home.data ? (
        <LoadingState />
      ) : home.error && !home.data ? (
        <ErrorState message={home.error} onRetry={home.refetch} />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={home.refreshing}
              onRefresh={() => {
                home.refetch();
                notifs.refetch();
              }}
              tintColor={Colors.primary}
            />
          }
        >
          {/* Greeting */}
          <View>
            <Text style={styles.greetLabel}>WELCOME BACK</Text>
            <Text style={styles.greetName}>{home.data?.greeting ?? `Hello, ${user?.name ?? ''}`}</Text>
          </View>

          {/* AI entry */}
          <AIBubble
            title="Bodhira AI"
            message="Stuck on a concept? Ask your AI tutor anything — it answers in seconds."
            actions={[
              { label: 'Ask a doubt', variant: 'primary', onPress: () => navigation.navigate('AITutor') },
            ]}
          />

          {/* Stats strip */}
          <View style={styles.statsRow}>
            <StatCard icon="fire" value={String(home.data?.streak_days ?? 0)} label="DAY STREAK" valueColor={Colors.warning} />
            <StatCard icon="library" value={String(home.data?.subjects?.length ?? 0)} label="SUBJECTS" valueColor={Colors.primary} />
            <StatCard
              icon="edit"
              value={String(home.data?.pending_assignments ?? 0)}
              label="PENDING"
              valueColor="#8B5CF6"
            />
          </View>

          {/* Today's live classes */}
          {home.data?.todays_classes && home.data.todays_classes.length > 0 && (
            <>
              <SectionHeader title="Today's Live Classes" actionLabel="All" onAction={() => navigation.navigate('LiveClasses')} />
              {home.data.todays_classes.map(lc => (
                <TouchableOpacity
                  key={lc.id}
                  style={styles.liveCard}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('LiveClassDetail', { liveId: lc.id, title: lc.title })}
                >
                  <View style={styles.liveIcon}>
                    <Icon name="video" size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.liveInfo}>
                    <Text style={styles.liveTitle} numberOfLines={1}>
                      {lc.title}
                    </Text>
                    <Text style={styles.liveSub}>
                      {lc.host_name} · {clockTime(lc.scheduled_at)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.liveBadge,
                      lc.live_status === 'live' ? styles.liveBadgeLive : styles.liveBadgeSoon,
                    ]}
                  >
                    <Text style={[styles.liveBadgeTxt, lc.live_status === 'live' && { color: Colors.white }]}>
                      {lc.live_status === 'live' ? 'LIVE' : relativeUntil(lc.scheduled_at) || 'Soon'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* Next quiz */}
          {home.data?.next_quiz && (
            <>
              <SectionHeader title="Next Quiz" actionLabel="All quizzes" onAction={() => navigation.navigate('QuizList')} />
              <TouchableOpacity
                style={styles.quizCard}
                activeOpacity={0.85}
                onPress={() =>
                  navigation.navigate('QuizDetail', {
                    quizId: home.data!.next_quiz!.id,
                    title: home.data!.next_quiz!.title,
                  })
                }
              >
                <View style={styles.quizIcon}>
                  <Icon name="edit" size={22} color={Colors.primary} />
                </View>
                <View style={styles.liveInfo}>
                  <Text style={styles.quizTitle} numberOfLines={1}>
                    {home.data.next_quiz.title}
                  </Text>
                  {home.data.next_quiz.starts_at ? (
                    <Text style={styles.liveSub}>Starts {clockTime(home.data.next_quiz.starts_at)}</Text>
                  ) : (
                    <Text style={styles.liveSub}>Tap to begin</Text>
                  )}
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Subjects grid */}
          <SectionHeader title="Subjects" actionLabel="View all" onAction={() => navigation.navigate('SubjectList')} />
          {(!home.data?.subjects || home.data.subjects.length === 0) && (
            <Text style={styles.emptyHint}>No subjects assigned yet.</Text>
          )}
          <View style={styles.subjectsGrid}>
            {(home.data?.subjects ?? []).slice(0, 6).map(s => (
              <TouchableOpacity key={s.id} style={styles.subjectTile} activeOpacity={0.85} onPress={() => openSubject(s)}>
                <View style={[styles.subjectIcon, { backgroundColor: subjectTint(s.color) }]}>
                  <Icon name={subjectIconName(s.icon)} size={20} color={subjectColor(s.color)} />
                </View>
                <Text style={styles.subjectName} numberOfLines={1}>
                  {s.name}
                </Text>
                <Text style={styles.subjectMeta}>{s.chapters_count} ch</Text>
              </TouchableOpacity>
            ))}
          </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border2,
    backgroundColor: Colors.bg,
  },
  locationPill: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, marginRight: 12 },
  locIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locLabel: { fontSize: 10, fontWeight: '700', color: Colors.text3, letterSpacing: 0.4 },
  locValue: { fontSize: 13, fontWeight: '700', color: Colors.text },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  notifBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 8,
    height: 8,
    backgroundColor: Colors.danger,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '800', color: Colors.brand },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 14, paddingBottom: 24 },
  greetLabel: { fontSize: 11, fontWeight: '600', color: Colors.text3, letterSpacing: 0.5 },
  greetName: { fontSize: 22, fontWeight: '800', color: Colors.text, letterSpacing: -0.44 },
  statsRow: { flexDirection: 'row', gap: 6 },
  liveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border2,
    padding: 10,
    ...Shadow.sm,
  },
  liveIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveInfo: { flex: 1, minWidth: 0 },
  liveTitle: { fontSize: 13, fontWeight: '700', color: Colors.text },
  liveSub: { fontSize: 11, color: Colors.text2, marginTop: 2 },
  liveBadge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: Radius.full },
  liveBadgeLive: { backgroundColor: Colors.danger },
  liveBadgeSoon: { backgroundColor: Colors.primaryLight },
  liveBadgeTxt: { fontSize: 10, fontWeight: '800', color: Colors.primary },
  quizCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border2,
    padding: 10,
    ...Shadow.sm,
  },
  quizIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FDF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizTitle: { fontSize: 13, fontWeight: '700', color: Colors.text },
  chevron: { fontSize: 24, color: Colors.text3 },
  emptyHint: { fontSize: 12, color: Colors.text3 },
  subjectsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  subjectTile: {
    width: '31%',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 14,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border2,
    ...Shadow.sm,
  },
  subjectIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  subjectName: { fontSize: 11, fontWeight: '700', color: Colors.text, textAlign: 'center', paddingHorizontal: 4 },
  subjectMeta: { fontSize: 9, color: Colors.text3 },
});
