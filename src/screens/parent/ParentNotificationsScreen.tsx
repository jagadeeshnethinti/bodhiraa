/**
 * Parent · Notifications — the parent's notification feed. Premium gradient-header
 * sheet over a live list of notifications.
 *
 * Live data: NotificationsApi.list (the generic, role-agnostic notifications feed,
 * same as the student NotificationsScreen). Tapping a notification marks it read
 * (optimistically) and opens its link; "Mark all" clears every unread item.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, RefreshControl, Linking } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../theme';
import { Entrance } from '../../components/common/anim';
import { GlowBlob } from '../../components/illustrations/OnboardingArt';
import { Icon } from '../../components/common/Icon';
import { LoadingState, ErrorState, EmptyState } from '../../components/common/ScreenStates';
import { useApi } from '../../hooks/useApi';
import { NotificationsApi, resolveMediaUrl, type ApiNotification } from '../../api';
import { relativeUntil, dateTimeLabel } from '../../utils/ui';

/** "2h ago" style relative-past label. */
function timeAgo(iso?: string | null): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (isNaN(then)) return '';
  const diff = Date.now() - then;
  if (diff < 0) return relativeUntil(iso);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return dateTimeLabel(iso);
}

export const ParentNotificationsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { data, loading, error, refetch, refreshing, setData } = useApi(
    signal => NotificationsApi.list(1, signal),
    [],
  );
  const [markingAll, setMarkingAll] = useState(false);

  const items = data?.items ?? [];
  const unread = data?.meta?.unread_count ?? items.filter(n => !n.read_at).length;

  const markOneLocally = (id: string) =>
    setData(prev =>
      prev
        ? { ...prev, items: prev.items.map(n => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)) }
        : prev,
    );

  const onTap = (n: ApiNotification) => {
    if (!n.read_at) {
      markOneLocally(n.id); // optimistic
      NotificationsApi.markRead(n.id).catch(() => {});
    }
    if (n.url) {
      const url = resolveMediaUrl(n.url) ?? n.url;
      Linking.openURL(url).catch(() => {});
    }
  };

  const markAll = async () => {
    setMarkingAll(true);
    try {
      await NotificationsApi.markAllRead();
      setData(prev =>
        prev
          ? { ...prev, items: prev.items.map(n => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })) }
          : prev,
      );
    } catch {
      /* ignore */
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A0A0C" />

      <LinearGradient colors={['#1A0A0C', '#2A0E13', '#3D1520']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroGlow} pointerEvents="none"><GlowBlob size={220} /></View>
        <SafeAreaView edges={['top']}>
          <View style={styles.topbar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={8}><Text style={styles.backIcon}>‹</Text></TouchableOpacity>
            <TouchableOpacity onPress={markAll} disabled={markingAll || unread === 0} hitSlop={8}>
              <Text style={[styles.markAll, (markingAll || unread === 0) && styles.markAllDisabled]}>Mark all</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>{unread > 0 ? `${unread} unread` : "You're all caught up"}</Text>
        </SafeAreaView>
      </LinearGradient>

      {loading && !data ? (
        <View style={styles.sheet}><LoadingState /></View>
      ) : error && !data ? (
        <View style={styles.sheet}><ErrorState message={error} onRetry={refetch} /></View>
      ) : items.length === 0 ? (
        <View style={styles.sheet}>
          <EmptyState icon="bell" title="You're all caught up" sub="New notifications will show up here." />
        </View>
      ) : (
        <ScrollView
          style={styles.sheet}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor={Colors.primary} />}
        >
          {items.map((n, i) => {
            const isUnread = !n.read_at;
            return (
              <Entrance key={n.id} index={i}>
                <TouchableOpacity
                  style={[styles.row, isUnread && styles.rowUnread]}
                  activeOpacity={0.85}
                  onPress={() => onTap(n)}
                >
                  {isUnread && <View style={styles.unreadDot} />}
                  <View style={styles.rowIcon}><Icon name="bell" size={18} color={Colors.primaryDark} /></View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={styles.titleRow}>
                      <Text style={styles.rowTitle} numberOfLines={1}>{n.title}</Text>
                      <Text style={styles.time}>{timeAgo(n.created_at)}</Text>
                    </View>
                    {n.body ? <Text style={styles.rowSub} numberOfLines={2}>{n.body}</Text> : null}
                  </View>
                </TouchableOpacity>
              </Entrance>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A0A0C' },
  hero: { paddingHorizontal: 16, paddingBottom: 26, overflow: 'hidden' },
  heroGlow: { position: 'absolute', top: -70, right: -40, opacity: 0.8 },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(196,149,96,0.15)', borderWidth: 1, borderColor: 'rgba(196,149,96,0.25)', alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 26, color: Colors.primary, fontWeight: '300', marginTop: -2 },
  markAll: { fontSize: 12.5, fontWeight: '800', color: Colors.primary },
  markAllDisabled: { color: 'rgba(245,232,208,0.4)' },
  title: { fontSize: 22, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.4, marginTop: 8 },
  subtitle: { fontSize: 12.5, color: 'rgba(245,232,208,0.65)', marginTop: 4 },

  sheet: { flex: 1, backgroundColor: Colors.bg, marginTop: -16, borderTopLeftRadius: 26, borderTopRightRadius: 26 },
  content: { padding: 16, paddingTop: 22, gap: 8, paddingBottom: 32 },

  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border2,
    padding: 12, paddingLeft: 14, ...Shadow.sm,
  },
  rowUnread: { backgroundColor: Colors.primaryLight, borderColor: 'rgba(196,149,96,0.25)' },
  unreadDot: { position: 'absolute', left: 5, top: '50%', width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  rowIcon: { width: 38, height: 38, borderRadius: 11, backgroundColor: Colors.bg2, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  rowTitle: { flex: 1, fontSize: 13.5, fontWeight: '700', color: Colors.text },
  time: { fontSize: 10, color: Colors.text3 },
  rowSub: { fontSize: 11, color: Colors.text2, marginTop: 3, lineHeight: 16 },
});
