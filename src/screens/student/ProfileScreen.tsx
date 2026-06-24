import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Linking } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow, useTheme } from '../../theme';
import { Button } from '../../components/common/Button';
import { CircularProgress } from '../../components/common/CircularProgress';
import { planDaysLeft, daysLeftLabel, PLAN_LABEL } from '../../utils/plan';
import { Entrance, PressableScale, Pulse, AnimatedCounter, Shimmer } from '../../components/common/anim';
import { GlowBlob } from '../../components/illustrations/OnboardingArt';
import { useApi } from '../../hooks/useApi';
import { StudentApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Icon, IconName } from '../../components/common/Icon';
import { Avatar } from '../../components/common/Avatar';
import { ConfirmDialog } from '../../components/common/PremiumModals';
import { Env } from '../../config/env';

const ACHIEVEMENTS: { icon: IconName; label: string; unlocked: boolean }[] = [
  { icon: 'fire', label: 'Streak Star', unlocked: true },
  { icon: 'target', label: 'Quiz Ace', unlocked: true },
  { icon: 'trophy', label: 'Top 5', unlocked: true },
  { icon: 'rocket', label: 'Fast Learner', unlocked: false },
  { icon: 'brain', label: 'AI Explorer', unlocked: true },
  { icon: 'flag', label: 'Goal Crusher', unlocked: false },
];

export const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, role, isB2C, logout } = useAuth();
  const theme = useTheme();
  const isStudent = role === 'student';
  const plan = user?.plan ?? null;
  const monthlyDaysLeft = plan?.tier === 'monthly' ? planDaysLeft(plan.expires_at) : null;
  const isPrivate = user?.visibility === 'private';

  const profile = useApi(signal => (isStudent ? StudentApi.profile(signal) : Promise.resolve(null)), [isStudent]);
  const pf = (profile.data ?? {}) as Record<string, number>;

  const level = Number(pf.level ?? 1);
  const levelProgress = Number(pf.level_progress ?? 0);
  const xp = Number(pf.xp_points ?? 0);

  const heroStats: { value: string; label: string }[] = [
    { value: String(pf.lessons_completed ?? 0), label: 'Lessons' },
    { value: String(pf.quizzes_taken ?? 0), label: 'Quizzes' },
    { value: String(pf.day_streak ?? 0), label: 'Streak' },
    { value: `#${pf.rank ?? '—'}`, label: 'Rank' },
  ];

  const [logoutOpen, setLogoutOpen] = useState(false);

  const subtitle = user?.school?.name
    ? `${user.role_label ?? role} · ${user.school.name}`
    : user?.grade
    ? `${user.role_label ?? role} · Grade ${user.grade}`
    : user?.role_label ?? role ?? '';

  return (
    <View style={[styles.container, { backgroundColor: theme.heroSolid }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.heroSolid} />

      {/* ── Gradient hero (fixed) ─────────────────────────────────── */}
      <LinearGradient colors={theme.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroGlow} pointerEvents="none"><GlowBlob size={260} color={theme.accent} /></View>
        <SafeAreaView edges={['top']}>
          <View style={styles.heroTop}>
            <View style={{ width: 40 }} />
            {isStudent ? (
              <View style={styles.heroBtns}>
                <TouchableOpacity style={styles.bellBtn} onPress={() => navigation.navigate('Notifications')}>
                  <Icon name="bell" size={16} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.bellBtn} onPress={() => navigation.navigate('Settings')}>
                  <Text style={styles.gearTxt}>⚙</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ width: 40 }} />
            )}
          </View>

          {/* Avatar with level ring */}
          <Entrance index={0} style={styles.avatarWrap}>
            {isStudent ? (
              <CircularProgress size={108} strokeWidth={5} progress={levelProgress} trackColor="rgba(245,232,208,0.16)">
                <Avatar uri={user?.avatar} name={user?.name} style={[styles.avatar, { backgroundColor: theme.accent }]} textStyle={[styles.avatarText, { color: theme.onAccent }]} />
              </CircularProgress>
            ) : (
              <Avatar uri={user?.avatar} name={user?.name} style={[styles.avatar, styles.avatarPlain, { backgroundColor: theme.accent }]} textStyle={[styles.avatarText, { color: theme.onAccent }]} />
            )}
            {isStudent && (
              <View style={styles.levelBadge}>
                <Text style={styles.levelTxt}>LV {level}</Text>
              </View>
            )}
          </Entrance>

          <Text style={styles.name}>{user?.name ?? 'Bodhira user'}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          {isStudent && (
            <View style={styles.xpRow}>
              <Icon name="star" size={12} color={Colors.primary} />
              <Text style={styles.xpTxt}>{xp.toLocaleString('en-IN')} XP · {100 - levelProgress}% to Level {level + 1}</Text>
            </View>
          )}

          {/* Stats strip */}
          {isStudent && (
            <Entrance index={1} style={styles.statStrip}>
              <Shimmer />
              {heroStats.map((s, i) => (
                <React.Fragment key={s.label}>
                  {i > 0 && <View style={styles.statSep} />}
                  <View style={styles.statItem}>
                    {s.value.startsWith('#') ? (
                      <Text style={styles.statVal}>{s.value}</Text>
                    ) : (
                      <AnimatedCounter value={s.value} style={styles.statVal} />
                    )}
                    <Text style={styles.statLbl}>{s.label}</Text>
                  </View>
                </React.Fragment>
              ))}
            </Entrance>
          )}
        </SafeAreaView>
      </LinearGradient>

      {/* ── Body sheet ────────────────────────────────────────────── */}
      <ScrollView style={styles.sheet} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Achievements */}
        {isStudent && (
          <Entrance index={0}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgeRow}>
              {ACHIEVEMENTS.map(a => (
                <View key={a.label} style={styles.badge}>
                  {a.unlocked ? (
                    <Pulse style={styles.badgeIconWrap}>
                      <LinearGradient colors={['#D9AD7A', '#A87840']} style={styles.badgeIcon}>
                        <Icon name={a.icon} size={22} color={Colors.brand} />
                      </LinearGradient>
                    </Pulse>
                  ) : (
                    <View style={[styles.badgeIcon, styles.badgeLocked]}>
                      <Icon name={a.icon} size={22} color={Colors.text3} />
                    </View>
                  )}
                  <Text style={[styles.badgeLabel, !a.unlocked && { color: Colors.text3 }]} numberOfLines={1}>{a.label}</Text>
                </View>
              ))}
            </ScrollView>
          </Entrance>
        )}

        {/* Quick actions */}
        {isStudent && (
          <Entrance index={1} style={styles.actionsGrid}>
            <ActionTile icon="robot" label="AI Tutor" onPress={() => navigation.navigate('AITutor')} />
            <ActionTile icon="edit" label="Quizzes" onPress={() => navigation.navigate('QuizList')} />
            <ActionTile icon="video" label="Live" onPress={() => navigation.navigate('LiveClasses')} />
            <ActionTile icon="bell" label="Alerts" onPress={() => navigation.navigate('Notifications')} />
          </Entrance>
        )}

        {/* Upgrade */}
        {isStudent && (
          <Entrance index={2}>
            <PressableScale style={styles.upgradeCard} onPress={() => navigation.navigate('Subscription')}>
              <LinearGradient colors={['#2A0E13', '#3D1520', '#52202E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
              <Pulse style={styles.upgradeIcon}><Icon name="rocket" size={22} color={Colors.primary} /></Pulse>
              <View style={{ flex: 1 }}>
                <Text style={styles.upgradeTitle}>Upgrade to Pro</Text>
                <Text style={styles.upgradeSub}>Unlimited AI, live classes & more</Text>
              </View>
              <View style={styles.upgradePill}><Text style={styles.upgradePillTxt}>View plans →</Text></View>
            </PressableScale>
          </Entrance>
        )}

        {isB2C && (
          <PressableScale style={styles.billingCard} onPress={() => navigation.navigate('Subscription')}>
            <Icon name="card" size={26} color={Colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.billingTitle}>Subscription & billing</Text>
              <Text style={styles.billingSub}>Manage your plan and invoices</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </PressableScale>
        )}

        {/* Plan & privacy */}
        {isStudent && (
          <Entrance index={2}>
            <Text style={styles.sectionTitle}>Plan & privacy</Text>
            <View style={styles.planCard}>
              <View style={styles.planRow}>
                <View style={[styles.planIconBox, { backgroundColor: theme.accentLight }]}>
                  <Icon name="card" size={18} color={theme.accentDark} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.planCardLabel}>Current plan</Text>
                  <Text style={styles.planCardValue}>
                    {PLAN_LABEL[plan?.tier ?? 'free']}
                    {monthlyDaysLeft != null ? ` · ${daysLeftLabel(monthlyDaysLeft)}` : ''}
                  </Text>
                </View>
                {plan?.tier === 'monthly' && (
                  <PressableScale style={[styles.planManage, { borderColor: theme.accent }]} onPress={() => navigation.navigate('Subscription')}>
                    <Text style={[styles.planManageTxt, { color: theme.accentDark }]}>Manage</Text>
                  </PressableScale>
                )}
              </View>
              <View style={styles.planDivider} />
              <View style={styles.planRow}>
                <View style={[styles.planIconBox, { backgroundColor: isPrivate ? Colors.primaryLight : Colors.successLight }]}>
                  <Icon name={isPrivate ? 'lock' : 'group'} size={18} color={isPrivate ? Colors.primaryDark : Colors.success} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.planCardLabel}>Performance sharing</Text>
                  <Text style={styles.planCardValue}>{isPrivate ? 'Private — hidden from teachers' : 'Shared with your school'}</Text>
                </View>
              </View>
            </View>
          </Entrance>
        )}

        {/* Settings */}
        <Entrance index={3} style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <SettingRow icon="user" label="Account" onPress={isStudent ? () => navigation.navigate('Account') : undefined} />
          <SettingRow icon="flag" label="Language" onPress={isStudent ? () => navigation.navigate('Language') : undefined} />
          {isStudent && <SettingRow icon="desktop" label="All settings" onPress={() => navigation.navigate('Settings')} />}
          <SettingRow icon="help" label="Help & support" onPress={() => Linking.openURL(`${Env.apiOrigin}/help`)} />
          <SettingRow icon="document" label="Terms & policies" onPress={() => Linking.openURL(`${Env.apiOrigin}/terms`)} />
        </Entrance>

        <Button label="Sign out" variant="outline" onPress={() => setLogoutOpen(true)} style={{ marginTop: 4 }} />
        <Text style={styles.version}>Bodhira · {Env.isLocal ? 'Dev build' : 'v1'}</Text>
      </ScrollView>

      <ConfirmDialog
        visible={logoutOpen}
        icon="logout"
        tone="danger"
        title="Sign out?"
        message="You can sign back in any time."
        confirmLabel="Sign out"
        cancelLabel="Cancel"
        onConfirm={() => { setLogoutOpen(false); void logout(); }}
        onCancel={() => setLogoutOpen(false)}
      />
    </View>
  );
};

const ActionTile: React.FC<{ icon: IconName; label: string; onPress: () => void }> = ({ icon, label, onPress }) => (
  <PressableScale style={styles.actionTile} onPress={onPress}>
    <View style={styles.actionIcon}><Icon name={icon} size={24} color={Colors.primary} /></View>
    <Text style={styles.actionLabel}>{label}</Text>
  </PressableScale>
);

const SettingRow: React.FC<{ icon: IconName; label: string; onPress?: () => void }> = ({ icon, label, onPress }) => (
  <PressableScale style={styles.settingRow} onPress={onPress} disabled={!onPress}>
    <View style={styles.settingIcon}><Icon name={icon} size={17} color={Colors.text2} /></View>
    <Text style={styles.settingLabel}>{label}</Text>
    <Text style={styles.chevron}>›</Text>
  </PressableScale>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A0A0C' },

  hero: { paddingHorizontal: 16, paddingBottom: 30, alignItems: 'center', overflow: 'hidden' },
  heroGlow: { position: 'absolute', top: -80, alignSelf: 'center', opacity: 0.8 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingTop: 4 },
  bellBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(196,149,96,0.15)', borderWidth: 1, borderColor: 'rgba(196,149,96,0.25)', alignItems: 'center', justifyContent: 'center' },
  heroBtns: { flexDirection: 'row', gap: 8 },
  gearTxt: { fontSize: 18, color: Colors.primary, marginTop: -1 },

  avatarWrap: { alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  avatar: { width: 90, height: 90, borderRadius: 30, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarPlain: { borderWidth: 3, borderColor: 'rgba(196,149,96,0.4)' },
  avatarText: { fontSize: 32, fontWeight: '900', color: Colors.brand },
  levelBadge: { position: 'absolute', bottom: -6, backgroundColor: Colors.brand, borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1.5, borderColor: Colors.primary },
  levelTxt: { fontSize: 10, fontWeight: '900', color: Colors.primary, letterSpacing: 0.5 },

  name: { fontSize: 23, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.5, marginTop: 16 },
  subtitle: { fontSize: 12, color: 'rgba(245,232,208,0.65)', marginTop: 4, textTransform: 'capitalize' },
  xpRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, backgroundColor: 'rgba(245,232,208,0.08)', borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 6 },
  xpTxt: { fontSize: 11, color: '#F5E8D0', fontWeight: '600' },

  statStrip: { flexDirection: 'row', alignItems: 'center', marginTop: 18, backgroundColor: 'rgba(245,232,208,0.07)', borderWidth: 1, borderColor: 'rgba(196,149,96,0.2)', borderRadius: Radius.lg, paddingVertical: 14, width: '100%', overflow: 'hidden' },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 18, fontWeight: '900', color: '#F5E8D0' },
  statLbl: { fontSize: 9.5, color: 'rgba(245,232,208,0.6)', fontWeight: '600', marginTop: 3, letterSpacing: 0.3 },
  statSep: { width: 1, height: 30, backgroundColor: 'rgba(196,149,96,0.2)' },

  sheet: { flex: 1, backgroundColor: Colors.bg, marginTop: -18, borderTopLeftRadius: 26, borderTopRightRadius: 26 },
  content: { padding: 16, paddingTop: 22, gap: 18, paddingBottom: 32 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.text, marginBottom: 10 },

  badgeRow: { gap: 14, paddingRight: 8 },
  badge: { alignItems: 'center', width: 68, gap: 7 },
  badgeIconWrap: { borderRadius: 18 },
  badgeIcon: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', ...Shadow.sm },
  badgeLocked: { backgroundColor: Colors.bg2, borderWidth: 1, borderColor: Colors.border2 },
  badgeLabel: { fontSize: 10, fontWeight: '700', color: Colors.text2, textAlign: 'center' },

  actionsGrid: { flexDirection: 'row', gap: 8 },
  actionTile: { flex: 1, alignItems: 'center', paddingVertical: 16, gap: 8, backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border2, ...Shadow.sm },
  actionIcon: { width: 44, height: 44, borderRadius: 13, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 11, fontWeight: '700', color: Colors.text },

  upgradeCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: Radius.lg, padding: 16, overflow: 'hidden', ...Shadow.md },
  upgradeIcon: { width: 44, height: 44, borderRadius: 13, backgroundColor: 'rgba(196,149,96,0.18)', borderWidth: 1, borderColor: 'rgba(196,149,96,0.35)', alignItems: 'center', justifyContent: 'center' },
  upgradeTitle: { fontSize: 15, fontWeight: '800', color: '#F5E8D0' },
  upgradeSub: { fontSize: 11, color: 'rgba(245,232,208,0.7)', marginTop: 2 },
  upgradePill: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 7 },
  upgradePillTxt: { fontSize: 11, fontWeight: '800', color: Colors.brand },

  billingCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.primaryLight, borderRadius: Radius.lg, borderWidth: 1, borderColor: 'rgba(196,149,96,0.25)', padding: 14 },
  billingTitle: { fontSize: 13, fontWeight: '800', color: Colors.text },
  billingSub: { fontSize: 11, color: Colors.text2, marginTop: 2 },

  section: { gap: 8 },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border2, paddingVertical: 13, paddingHorizontal: 12, ...Shadow.sm },
  settingIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: Colors.bg2, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: Colors.text },
  chevron: { fontSize: 20, color: Colors.text3 },
  version: { fontSize: 11, color: Colors.text3, textAlign: 'center', marginTop: 8 },

  planCard: { backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border2, padding: 14, ...Shadow.sm },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  planIconBox: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  planCardLabel: { fontSize: 11, color: Colors.text3, fontWeight: '700' },
  planCardValue: { fontSize: 13.5, color: Colors.text, fontWeight: '800', marginTop: 2 },
  planManage: { borderWidth: 1.5, borderRadius: Radius.full, paddingHorizontal: 14, paddingVertical: 7 },
  planManageTxt: { fontSize: 11.5, fontWeight: '800' },
  planDivider: { height: 1, backgroundColor: Colors.border2, marginVertical: 12 },
});
