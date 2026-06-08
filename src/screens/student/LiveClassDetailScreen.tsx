import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Linking } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../types';
import { Colors, Radius, Shadow } from '../../theme';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { LoadingState, ErrorState } from '../../components/common/ScreenStates';
import { useApi } from '../../hooks/useApi';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { StudentApi, ApiError, resolveMediaUrl } from '../../api';
import { dateTimeLabel, clockTime } from '../../utils/ui';

type Props = NativeStackScreenProps<StudentStackParamList, 'LiveClassDetail'>;

export const LiveClassDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { liveId, title } = route.params;
  const { data, loading, error, refetch } = useApi(signal => StudentApi.liveClass(liveId, signal), [liveId]);
  const join = useAsyncAction();

  const handleJoin = async () => {
    const result = await join.run(async () => {
      try {
        return await StudentApi.joinLiveClass(liveId);
      } catch (err) {
        // Map the documented join errors to friendly copy (api.md §5.7).
        if (err instanceof ApiError) {
          if (err.status === 403) throw new Error("You're not in the audience for this class.");
          if (err.status === 410) throw new Error('This class was cancelled.');
          if (err.status === 422) throw new Error('No meeting link is configured yet.');
        }
        throw err;
      }
    });
    if (result?.meeting_url) {
      // The meeting opens in the device browser. (For a true in-app experience,
      // wrap this in react-native-webview — see webapp-flows §6.6.)
      const url = resolveMediaUrl(result.meeting_url) ?? result.meeting_url;
      Linking.openURL(url);
      refetch(); // attendance/live_status may have changed.
    }
  };

  const status = data?.live_status;
  const canJoin = status === 'live' || status === 'scheduled';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A0A0C" />

      <LinearGradient colors={['#1A0A0C', '#2A0E13', '#3D1520']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <SafeAreaView edges={['top']}>
          <View style={styles.topbar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backIcon}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.topLabel}>LIVE CLASS</Text>
            <View style={{ width: 36 }} />
          </View>
          <View style={styles.heroBody}>
            <Text style={styles.heroTitle}>{data?.title ?? title ?? 'Live class'}</Text>
            {data ? <Text style={styles.heroSub}>{data.host_name}</Text> : null}
          </View>
        </SafeAreaView>
      </LinearGradient>

      <SafeAreaView style={styles.body} edges={['bottom']}>
        {loading && !data ? (
          <LoadingState />
        ) : error && !data ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : (
          <>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
              <View style={styles.metaCard}>
                <Row label="When" value={dateTimeLabel(data?.scheduled_at)} />
                <Row label="Duration" value={`${data?.duration_min ?? 0} minutes`} />
                <Row label="Status" value={statusLabel(status)} valueColor={statusColor(status)} />
              </View>

              {data?.description ? (
                <View style={styles.descCard}>
                  <Text style={styles.descTitle}>About</Text>
                  <Text style={styles.descText}>{data.description}</Text>
                </View>
              ) : null}

              {data?.attendees && data.attendees.length > 0 && (
                <View style={styles.descCard}>
                  <Text style={styles.descTitle}>Attendees ({data.attendees.length})</Text>
                  {data.attendees.map(a => (
                    <View key={a.user_id} style={styles.attendeeRow}>
                      <Text style={styles.attendeeName}>{a.name}</Text>
                      <Text style={styles.attendeeTime}>{a.joined_at ? `joined ${clockTime(a.joined_at)}` : '—'}</Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>

            <View style={styles.cta}>
              {join.error ? <Text style={styles.ctaError}>{join.error}</Text> : null}
              {status === 'cancelled' ? (
                <Text style={styles.muted}>This class was cancelled.</Text>
              ) : status === 'ended' ? (
                <Text style={styles.muted}>This class has ended.</Text>
              ) : status === 'scheduled' ? (
                <Button
                  label={join.submitting ? 'Joining…' : `Opens at ${clockTime(data?.scheduled_at)} · Join`}
                  variant="primary"
                  loading={join.submitting}
                  disabled={join.submitting}
                  onPress={handleJoin}
                />
              ) : (
                <Button
                  label={join.submitting ? 'Joining…' : 'Join now'}
                  variant="primary"
                  icon={<Icon name="video" size={16} color={Colors.brand} />}
                  loading={join.submitting}
                  disabled={join.submitting || !canJoin}
                  onPress={handleJoin}
                />
              )}
            </View>
          </>
        )}
      </SafeAreaView>
    </View>
  );
};

const Row: React.FC<{ label: string; value: string; valueColor?: string }> = ({ label, value, valueColor }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={[styles.rowValue, valueColor ? { color: valueColor } : null]}>{value || '—'}</Text>
  </View>
);

function statusLabel(s?: string): string {
  switch (s) {
    case 'live':
      return 'Live now';
    case 'scheduled':
      return 'Scheduled';
    case 'ended':
      return 'Ended';
    case 'cancelled':
      return 'Cancelled';
    default:
      return '—';
  }
}
function statusColor(s?: string): string {
  switch (s) {
    case 'live':
      return Colors.danger;
    case 'scheduled':
      return Colors.primary;
    case 'cancelled':
      return Colors.danger;
    default:
      return Colors.text2;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(196,149,96,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(196,149,96,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 24, color: '#F5E8D0', fontWeight: '300' },
  topLabel: { fontSize: 11, fontWeight: '800', color: 'rgba(196,149,96,0.8)', letterSpacing: 1 },
  heroBody: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 },
  heroTitle: { fontSize: 22, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.4 },
  heroSub: { fontSize: 12, color: 'rgba(245,232,208,0.7)', marginTop: 4 },
  body: { flex: 1 },
  scroll: { padding: 16, gap: 14, paddingBottom: 24 },
  metaCard: { backgroundColor: Colors.white, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border2, padding: 6, ...Shadow.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 10 },
  rowLabel: { fontSize: 12, color: Colors.text3, fontWeight: '600' },
  rowValue: { fontSize: 13, color: Colors.text, fontWeight: '700' },
  descCard: { backgroundColor: Colors.white, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border2, padding: 14, ...Shadow.sm },
  descTitle: { fontSize: 13, fontWeight: '800', color: Colors.text, marginBottom: 8 },
  descText: { fontSize: 12, color: Colors.text2, lineHeight: 18 },
  attendeeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  attendeeName: { fontSize: 12, fontWeight: '600', color: Colors.text },
  attendeeTime: { fontSize: 11, color: Colors.text3 },
  cta: { padding: 16, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border2 },
  ctaError: { fontSize: 12, color: Colors.danger, marginBottom: 8, textAlign: 'center' },
  muted: { fontSize: 13, color: Colors.text3, textAlign: 'center', paddingVertical: 8, fontWeight: '600' },
});
