/**
 * Admin · Users — directory of students, teachers and parents with role filters,
 * a search bar, and a user list with status. Wired to GET /admin/users
 * (role-filtered, paginated server-side).
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, RefreshControl, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../theme';
import { Button } from '../../components/common/Button';
import { LoadingState, ErrorState, EmptyState } from '../../components/common/ScreenStates';
import { Entrance, PressableScale, AnimatedCounter, Shimmer } from '../../components/common/anim';
import { GlowBlob } from '../../components/illustrations/OnboardingArt';
import { BoldIcon as Icon } from '../../components/common/BoldIcon';
import { useApi } from '../../hooks/useApi';
import { AdminApi, type AdminUserRole, type ApiAdminUser } from '../../api/endpoints/admin';

type Tab = 'Students' | 'Teachers' | 'Parents';
const ROLES: Tab[] = ['Students', 'Teachers', 'Parents'];
const ROLE_PARAM: Record<Tab, AdminUserRole> = { Students: 'student', Teachers: 'teacher', Parents: 'parent' };

const ini = (n: string) => n.replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.)\s*/, '').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

export const AdminUsersScreen: React.FC<{ navigation: any }> = () => {
  const [role, setRole] = useState<Tab>('Students');
  const page = useApi(signal => AdminApi.users({ role: ROLE_PARAM[role], per_page: 100 }, signal), [role]);

  const list: ApiAdminUser[] = page.data?.users ?? [];
  const total = page.data?.meta?.total ?? list.length;
  const userMeta = (u: ApiAdminUser) =>
    [u.role === 'student' && u.grade ? `Grade ${u.grade}` : null, u.email ?? u.phone].filter(Boolean).join(' · ') || '—';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A0A0C" />

      <LinearGradient colors={['#1A0A0C', '#2A0E13', '#3D1520']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroGlow} pointerEvents="none"><GlowBlob size={220} /></View>
        <SafeAreaView edges={['top']}>
          <Text style={styles.heading}>Users</Text>
          <Entrance index={0} style={styles.heroCard}>
            <Shimmer />
            {ROLES.map((r, i) => (
              <React.Fragment key={r}>
                {i > 0 && <View style={styles.statSep} />}
                <PressableScale style={styles.heroStat} onPress={() => setRole(r)}>
                  <AnimatedCounter value={role === r ? String(total) : '—'} style={[styles.heroStatVal, role === r && { color: Colors.primary }]} />
                  <Text style={styles.heroStatLbl}>{r}</Text>
                </PressableScale>
              </React.Fragment>
            ))}
          </Entrance>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.sheet}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={page.refreshing} onRefresh={page.refetch} tintColor={Colors.primary} />}
      >
        <Entrance index={0}>
          <Button label={`Add ${role.slice(0, -1).toLowerCase()}`} variant="primary" icon={<Icon name="user" size={15} color={Colors.brand} />} onPress={() => Alert.alert('Add user', `Create a new ${role.slice(0, -1).toLowerCase()} — coming soon.`)} />
        </Entrance>

        <Entrance index={2}>
          <View style={styles.searchBar}>
            <Icon name="search" size={16} color={Colors.text3} />
            <Text style={styles.searchPlaceholder}>Search {role.toLowerCase()}…</Text>
          </View>
        </Entrance>

        <Entrance index={3}><Text style={styles.sectionTitle}>{role}</Text></Entrance>

        {page.loading && !page.data ? (
          <LoadingState />
        ) : page.error && !page.data ? (
          <ErrorState message={page.error} onRetry={page.refetch} />
        ) : list.length === 0 ? (
          <EmptyState icon="user" title={`No ${role.toLowerCase()} yet`} sub="Users you add will appear here." />
        ) : (
          list.map((u, i) => {
            const active = u.status === 'active';
            return (
              <Entrance key={u.id} index={4 + i}>
                <PressableScale style={styles.userRow}>
                  <View style={styles.userAvatar}><Text style={styles.userInitials}>{ini(u.name)}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.userName}>{u.name}</Text>
                    <Text style={styles.userMeta} numberOfLines={1}>{userMeta(u)}</Text>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: active ? Colors.successLight : Colors.bg2 }]}>
                    <Text style={[styles.statusTxt, { color: active ? Colors.success : Colors.text2 }]}>{active ? 'Active' : 'Inactive'}</Text>
                  </View>
                </PressableScale>
              </Entrance>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A0A0C' },
  hero: { paddingHorizontal: 16, paddingBottom: 28, overflow: 'hidden' },
  heroGlow: { position: 'absolute', top: -60, right: -40, opacity: 0.8 },
  heading: { fontSize: 22, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.4, paddingTop: 6 },
  heroCard: { flexDirection: 'row', alignItems: 'center', marginTop: 16, backgroundColor: 'rgba(245,232,208,0.07)', borderWidth: 1, borderColor: 'rgba(196,149,96,0.22)', borderRadius: Radius.xl, paddingVertical: 18, overflow: 'hidden' },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatVal: { fontSize: 21, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.5 },
  heroStatLbl: { fontSize: 10, color: 'rgba(245,232,208,0.6)', fontWeight: '600', marginTop: 3 },
  statSep: { width: 1, height: 34, backgroundColor: 'rgba(196,149,96,0.2)' },

  sheet: { flex: 1, backgroundColor: Colors.bg, marginTop: -16, borderTopLeftRadius: 26, borderTopRightRadius: 26 },
  content: { padding: 16, paddingTop: 22, gap: 12, paddingBottom: 32 },

  pendingCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.warningLight, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.warning + '33', padding: 12 },
  pendingIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center' },
  pendingTxt: { flex: 1, fontSize: 13, fontWeight: '700', color: Colors.text },

  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border2, paddingHorizontal: 14, paddingVertical: 12 },
  searchPlaceholder: { fontSize: 13, color: Colors.text3 },

  sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.text },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border2, padding: 11, ...Shadow.sm },
  userAvatar: { width: 42, height: 42, borderRadius: 13, backgroundColor: Colors.bg2, alignItems: 'center', justifyContent: 'center' },
  userInitials: { fontSize: 14, fontWeight: '900', color: Colors.text2 },
  userName: { fontSize: 13.5, fontWeight: '700', color: Colors.text },
  userMeta: { fontSize: 11, color: Colors.text2, marginTop: 2 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  statusTxt: { fontSize: 10.5, fontWeight: '800' },
  chevron: { fontSize: 20, color: Colors.text3 },
});
