import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../theme';
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

export const NotificationsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
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
        ? {
            ...prev,
            items: prev.items.map(n => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)),
          }
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
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      <View style={styles.topbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.titleBlock}>
          <Text style={styles.topTitle}>Notifications</Text>
          {unread > 0 ? <Text style={styles.unreadCount}>{unread} unread</Text> : null}
        </View>
        <TouchableOpacity onPress={markAll} disabled={markingAll || unread === 0}>
          <Text style={[styles.markAll, (markingAll || unread === 0) && styles.markAllDisabled]}>Mark all</Text>
        </TouchableOpacity>
      </View>

      {loading && !data ? (
        <LoadingState />
      ) : error && !data ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : items.length === 0 ? (
        <EmptyState icon="bell" title="You're all caught up" sub="New notifications will show up here." />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor={Colors.primary} />}
        >
          {items.map(n => {
            const isUnread = !n.read_at;
            return (
              <TouchableOpacity
                key={n.id}
                style={[styles.row, isUnread && styles.rowUnread]}
                activeOpacity={0.85}
                onPress={() => onTap(n)}
              >
                {isUnread && <View style={styles.unreadDot} />}
                <View style={styles.iconBox}>
                  <Icon name="bell" size={20} color={Colors.primary} />
                </View>
                <View style={styles.info}>
                  <View style={styles.titleRow}>
                    <Text style={styles.title} numberOfLines={1}>
                      {n.title}
                    </Text>
                    <Text style={styles.time}>{timeAgo(n.created_at)}</Text>
                  </View>
                  {n.body ? (
                    <Text style={styles.body} numberOfLines={2}>
                      {n.body}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })}
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border2,
  },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.bg2, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 26, color: Colors.text },
  titleBlock: { flex: 1, alignItems: 'center' },
  topTitle: { fontSize: 17, fontWeight: '800', color: Colors.text },
  unreadCount: { fontSize: 10, color: Colors.primary, fontWeight: '700', marginTop: 1 },
  markAll: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  markAllDisabled: { color: Colors.text3 },
  scroll: { padding: 16, gap: 8, paddingBottom: 24 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border2,
    padding: 12,
    paddingLeft: 14,
    ...Shadow.sm,
  },
  rowUnread: { backgroundColor: Colors.primaryLight, borderColor: 'rgba(196,149,96,0.25)' },
  unreadDot: { position: 'absolute', left: 5, top: '50%', width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  iconBox: { width: 42, height: 42, borderRadius: 12, backgroundColor: Colors.bg2, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { flex: 1, fontSize: 13, fontWeight: '700', color: Colors.text },
  time: { fontSize: 10, color: Colors.text3 },
  body: { fontSize: 11, color: Colors.text2, marginTop: 3, lineHeight: 16 },
});
