import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../types';
import { Colors, Radius, Shadow } from '../../theme';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { LoadingState, ErrorState } from '../../components/common/ScreenStates';
import { useApi } from '../../hooks/useApi';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { StudentApi, resolveMediaUrl } from '../../api';

type Props = NativeStackScreenProps<StudentStackParamList, 'LessonDetail'>;

/** Very small HTML → readable text fallback (no render-html dependency). */
function htmlToText(html?: string | null): string {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li)>/gi, '\n\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export const LessonDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { lessonId, title } = route.params;
  const { data, loading, error, refetch } = useApi(signal => StudentApi.lesson(lessonId, signal), [lessonId]);
  const complete = useAsyncAction();
  const [done, setDone] = useState(false);
  const autoMarked = useRef(false);

  const markComplete = async () => {
    const result = await complete.run(() => StudentApi.postProgress(lessonId, { watched_seconds: 0, completed: true }));
    if (result || result === undefined) {
      // postProgress resolves with the persisted status; treat a clean run as done.
      if (!complete.error) setDone(true);
    }
  };

  // For text lessons: auto-complete once the reader reaches the bottom.
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (autoMarked.current || done) return;
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const reachedBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 40;
    if (reachedBottom && contentSize.height > layoutMeasurement.height + 40) {
      autoMarked.current = true;
      void markComplete();
    }
  };

  const isCompleted = done || data?.progress?.status === 'completed';
  const pdfUrl = resolveMediaUrl(data?.content_url);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      <View style={styles.topbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle} numberOfLines={1}>
          {data?.title ?? title ?? 'Lesson'}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      {loading && !data ? (
        <LoadingState />
      ) : error && !data ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={32}>
            <Text style={styles.lessonTitle}>{data?.title}</Text>

            {data?.type === 'pdf' ? (
              <View style={styles.pdfCard}>
                <Icon name="document" size={44} color={Colors.primary} />
                <Text style={styles.pdfTitle}>PDF document</Text>
                <Text style={styles.pdfSub}>Open the document to read it, then mark this lesson complete.</Text>
                <Button
                  label="Open PDF →"
                  variant="primary"
                  fullWidth={false}
                  style={styles.pdfBtn}
                  onPress={() => pdfUrl && Linking.openURL(pdfUrl)}
                  disabled={!pdfUrl}
                />
              </View>
            ) : data?.type === 'video' ? (
              <View style={styles.pdfCard}>
                <Icon name="video" size={44} color={Colors.primary} />
                <Text style={styles.pdfTitle}>Video unavailable</Text>
                <Text style={styles.pdfSub}>This video hasn't been uploaded yet. Check back soon.</Text>
              </View>
            ) : (
              <Text style={styles.body}>{htmlToText(data?.content_body) || 'No content for this lesson yet.'}</Text>
            )}

            {/* Adjacent lessons */}
            {data?.siblings && data.siblings.length > 0 && (
              <View style={styles.siblings}>
                <Text style={styles.siblingsTitle}>More in this chapter</Text>
                {data.siblings.map(sib => (
                  <TouchableOpacity
                    key={sib.id}
                    style={styles.siblingRow}
                    onPress={() => navigation.push('LessonDetail', { lessonId: sib.id, title: sib.title })}
                  >
                    <Text style={styles.siblingType}>{(sib.type ?? '').toUpperCase()}</Text>
                    <Text style={styles.siblingTitle} numberOfLines={1}>
                      {sib.title}
                    </Text>
                    <Text style={styles.chevron}>›</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>

          <View style={styles.cta}>
            {complete.error ? <Text style={styles.ctaError}>{complete.error}</Text> : null}
            <Button
              label={isCompleted ? 'Completed' : complete.submitting ? 'Saving…' : 'Mark as complete'}
              icon={isCompleted ? <Icon name="checkmark" size={16} color={Colors.white} /> : undefined}
              variant={isCompleted ? 'success' : 'primary'}
              loading={complete.submitting}
              disabled={isCompleted || complete.submitting}
              onPress={markComplete}
            />
          </View>
        </>
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
  topTitle: { flex: 1, fontSize: 16, fontWeight: '800', color: Colors.text, textAlign: 'center', marginHorizontal: 8 },
  scroll: { padding: 20, paddingBottom: 32 },
  lessonTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: 14, letterSpacing: -0.3 },
  body: { fontSize: 14, color: Colors.text, lineHeight: 23 },
  pdfCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border2,
    padding: 24,
    alignItems: 'center',
    gap: 6,
    ...Shadow.sm,
  },
  pdfTitle: { fontSize: 15, fontWeight: '800', color: Colors.text },
  pdfSub: { fontSize: 12, color: Colors.text2, textAlign: 'center', lineHeight: 18 },
  pdfBtn: { marginTop: 12, minWidth: 160 },
  siblings: { marginTop: 28, gap: 8 },
  siblingsTitle: { fontSize: 13, fontWeight: '800', color: Colors.text, marginBottom: 2 },
  siblingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border2,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  siblingType: { fontSize: 9, fontWeight: '800', color: Colors.text3 },
  siblingTitle: { flex: 1, fontSize: 12, fontWeight: '600', color: Colors.text },
  chevron: { fontSize: 20, color: Colors.text3 },
  cta: { padding: 16, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border2 },
  ctaError: { fontSize: 12, color: Colors.danger, marginBottom: 8, textAlign: 'center' },
});
