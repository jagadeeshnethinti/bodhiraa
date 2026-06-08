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
import { Icon } from '../../components/common/Icon';
import { LoadingState, ErrorState, EmptyState } from '../../components/common/ScreenStates';
import { useApi } from '../../hooks/useApi';
import { StudentApi, type ApiLiveClass } from '../../api';
import { clockTime, relativeUntil, dateTimeLabel } from '../../utils/ui';

const LiveCard: React.FC<{ item: ApiLiveClass; onPress: () => void }> = ({ item, onPress }) => {
  const isLive = item.live_status === 'live';
  return (
    <TouchableOpacity style={[styles.card, isLive && styles.cardLive]} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.cardTop}>
        <View style={[styles.icon, isLive && styles.iconLive]}>
          <Icon name="video" size={20} color={isLive ? Colors.danger : Colors.primary} />
        </View>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.sub} numberOfLines={1}>
            {item.host_name} · {item.duration_min}m
          </Text>
        </View>
        {isLive ? (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBadgeTxt}>LIVE</Text>
          </View>
        ) : item.live_status === 'cancelled' ? (
          <Text style={styles.cancelled}>Cancelled</Text>
        ) : item.live_status === 'scheduled' ? (
          <Text style={styles.soon}>{relativeUntil(item.scheduled_at) || clockTime(item.scheduled_at)}</Text>
        ) : (
          <Text style={styles.ended}>Ended</Text>
        )}
      </View>
      <Text style={styles.when}>{dateTimeLabel(item.scheduled_at)}</Text>
    </TouchableOpacity>
  );
};

export const LiveClassesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { data, loading, error, refetch, refreshing } = useApi(signal => StudentApi.liveClasses(signal), []);

  const liveNow = data?.live_now ?? [];
  const upcoming = data?.upcoming ?? [];
  const past = data?.past ?? [];
  const empty = liveNow.length === 0 && upcoming.length === 0 && past.length === 0;

  const open = (lc: ApiLiveClass) => navigation.navigate('LiveClassDetail', { liveId: lc.id, title: lc.title });

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      <View style={styles.topbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Live Classes</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading && !data ? (
        <LoadingState />
      ) : error && !data ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : empty ? (
        <EmptyState icon="signal" title="No live classes" sub="Scheduled classes from your teachers will appear here." />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor={Colors.primary} />}
        >
          {liveNow.length > 0 && (
            <>
              <View style={styles.sectionRow}>
                <Icon name="video" size={14} color={Colors.danger} />
                <Text style={styles.sectionTitle}>Live now</Text>
              </View>
              {liveNow.map(lc => (
                <LiveCard key={lc.id} item={lc} onPress={() => open(lc)} />
              ))}
            </>
          )}
          {upcoming.length > 0 && (
            <>
              <View style={styles.sectionRow}>
                <Icon name="clock" size={14} color={Colors.text2} />
                <Text style={styles.sectionTitle}>Upcoming</Text>
              </View>
              {upcoming.map(lc => (
                <LiveCard key={lc.id} item={lc} onPress={() => open(lc)} />
              ))}
            </>
          )}
          {past.length > 0 && (
            <>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>Past</Text>
              </View>
              {past.map(lc => (
                <LiveCard key={lc.id} item={lc} onPress={() => open(lc)} />
              ))}
            </>
          )}
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
  topTitle: { flex: 1, fontSize: 17, fontWeight: '800', color: Colors.text, textAlign: 'center', marginHorizontal: 8 },
  scroll: { padding: 16, gap: 10, paddingBottom: 24 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, marginBottom: 2 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: Colors.text },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border2,
    padding: 12,
    gap: 8,
    ...Shadow.sm,
  },
  cardLive: { borderColor: Colors.danger, borderWidth: 1.5 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  icon: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  iconLive: { backgroundColor: Colors.dangerLight },
  info: { flex: 1, minWidth: 0 },
  title: { fontSize: 13, fontWeight: '700', color: Colors.text },
  sub: { fontSize: 11, color: Colors.text2, marginTop: 2 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.danger, paddingHorizontal: 9, paddingVertical: 4, borderRadius: Radius.full },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  liveBadgeTxt: { fontSize: 10, fontWeight: '800', color: '#fff' },
  soon: { fontSize: 11, fontWeight: '700', color: Colors.primary },
  ended: { fontSize: 11, fontWeight: '600', color: Colors.text3 },
  cancelled: { fontSize: 11, fontWeight: '700', color: Colors.danger },
  when: { fontSize: 11, color: Colors.text3 },
});
