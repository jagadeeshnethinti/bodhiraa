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
import { Chip } from '../../components/common/Chip';
import { Icon } from '../../components/common/Icon';
import { LoadingState, ErrorState, EmptyState } from '../../components/common/ScreenStates';
import { useApi } from '../../hooks/useApi';
import { StudentApi, type ApiQuizSummary } from '../../api';
import { clockTime } from '../../utils/ui';

function statusChip(status?: string | null): { label: string; variant: 'primary' | 'success' | 'warning' } {
  switch ((status ?? '').toLowerCase()) {
    case 'completed':
    case 'attempted':
    case 'graded':
      return { label: 'Done', variant: 'success' };
    case 'in_progress':
      return { label: 'In progress', variant: 'warning' };
    default:
      return { label: 'Available', variant: 'primary' };
  }
}

export const QuizListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { data, loading, error, refetch, refreshing } = useApi(signal => StudentApi.quizzes(signal), []);
  const quizzes = data ?? [];

  const open = (q: ApiQuizSummary) => navigation.navigate('QuizDetail', { quizId: q.id, title: q.title });

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      <View style={styles.topbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Quizzes</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading && !data ? (
        <LoadingState />
      ) : error && !data ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor={Colors.primary} />}
        >
          {quizzes.length === 0 ? (
            <EmptyState icon="edit" title="No quizzes yet" sub="New quizzes from your teachers will show up here." />
          ) : (
            quizzes.map(q => {
              const chip = statusChip(q.status);
              return (
                <TouchableOpacity key={q.id} style={styles.card} activeOpacity={0.85} onPress={() => open(q)}>
                  <View style={styles.cardTop}>
                    <Text style={styles.title} numberOfLines={2}>
                      {q.title}
                    </Text>
                    <Chip label={chip.label} variant={chip.variant} small />
                  </View>
                  <View style={styles.metaRow}>
                    {q.subject ? (
                      <View style={styles.metaItem}>
                        <Icon name="book" size={13} color={Colors.text3} />
                        <Text style={styles.meta}>{q.subject}</Text>
                      </View>
                    ) : null}
                    {q.questions_count != null ? (
                      <View style={styles.metaItem}>
                        <Icon name="help" size={13} color={Colors.text3} />
                        <Text style={styles.meta}>{q.questions_count} Qs</Text>
                      </View>
                    ) : null}
                    {q.duration_min != null ? (
                      <View style={styles.metaItem}>
                        <Icon name="clock" size={13} color={Colors.text3} />
                        <Text style={styles.meta}>{q.duration_min}m</Text>
                      </View>
                    ) : null}
                    {q.total_marks != null ? (
                      <View style={styles.metaItem}>
                        <Icon name="star" size={13} color={Colors.warning} />
                        <Text style={styles.meta}>{q.total_marks} marks</Text>
                      </View>
                    ) : null}
                  </View>
                  {q.starts_at ? <Text style={styles.starts}>Starts {clockTime(q.starts_at)}</Text> : null}
                </TouchableOpacity>
              );
            })
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
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.bg2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 26, color: Colors.text },
  topTitle: { flex: 1, fontSize: 17, fontWeight: '800', color: Colors.text, textAlign: 'center', marginHorizontal: 8 },
  scroll: { padding: 16, gap: 12, paddingBottom: 24 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border2,
    padding: 14,
    gap: 8,
    ...Shadow.sm,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, justifyContent: 'space-between' },
  title: { flex: 1, fontSize: 14, fontWeight: '700', color: Colors.text, lineHeight: 20 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  meta: { fontSize: 11, color: Colors.text2 },
  starts: { fontSize: 11, color: Colors.text3 },
});
