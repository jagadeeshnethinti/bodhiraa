import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../theme';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Chip } from '../../components/common/Chip';

type ChapterStatus = 'completed' | 'in_progress' | 'locked';

const CHAPTERS = [
  { num: 1, title: 'Basic Concepts',        lessons: 4, status: 'completed'   as ChapterStatus },
  { num: 2, title: 'Hydrocarbons',           lessons: 5, status: 'completed'   as ChapterStatus },
  { num: 3, title: 'Alcohols & Phenols',     lessons: 4, status: 'completed'   as ChapterStatus },
  { num: 4, title: 'Aldehydes & Ketones',    lessons: 5, status: 'completed'   as ChapterStatus },
  { num: 5, title: 'Reactions & Mechanisms', lessons: 6, status: 'in_progress' as ChapterStatus, done: 4 },
  { num: 6, title: 'Functional Groups',      lessons: 5, status: 'locked'      as ChapterStatus },
  { num: 7, title: 'Aromatic Compounds',     lessons: 6, status: 'locked'      as ChapterStatus },
];

const ChapterRow: React.FC<{
  num: number; title: string; lessons: number;
  status: ChapterStatus; done?: number; onPress?: () => void;
}> = ({ num, title, lessons, status, done, onPress }) => {
  const isLocked = status === 'locked';
  const isCurrent = status === 'in_progress';
  const isDone = status === 'completed';

  return (
    <TouchableOpacity
      style={[styles.chRow, isCurrent && styles.chRowCurrent, isLocked && styles.chRowLocked]}
      onPress={onPress}
      disabled={isLocked}
      activeOpacity={isLocked ? 1 : 0.85}
    >
      <View style={[styles.chBullet,
        isDone    && { backgroundColor: Colors.success },
        isCurrent && { backgroundColor: Colors.primary },
        isLocked  && { backgroundColor: Colors.border },
      ]}>
        {isDone    && <Text style={styles.chBulletTxt}>✓</Text>}
        {isCurrent && <Text style={styles.chBulletTxt}>▶</Text>}
        {isLocked  && <Text style={[styles.chBulletTxt, { color: Colors.text3 }]}>{num}</Text>}
      </View>
      <View style={styles.chInfo}>
        <Text style={[styles.chTitle, isCurrent && { color: Colors.primary }]}>
          Ch {num} · {title}
        </Text>
        <Text style={styles.chSub}>
          {done != null ? `${done}/${lessons}` : `${lessons}`} lessons ·{' '}
          {isDone ? 'Completed' : isCurrent ? 'In Progress' : 'Locked'}
        </Text>
      </View>
      {isCurrent ? <Chip label="RESUME" variant="primary" small />
       : isLocked ? <Text style={{ fontSize: 14 }}>🔒</Text>
       : <Text style={styles.chevron}>›</Text>}
    </TouchableOpacity>
  );
};

export const ChapterListScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const subject = route.params?.subject ?? { emoji: '⚗️', name: 'Organic Chemistry', chapters: 12, lessons: 48, progress: 62 };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      {/* Topbar */}
      <View style={styles.topbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle} numberOfLines={1}>{subject.name ?? 'Chemistry'}</Text>
        <TouchableOpacity style={styles.moreBtn}>
          <Text style={styles.moreIcon}>⋯</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Subject card */}
        <View style={[styles.subjectCard, { backgroundColor: '#FEF3C7' }]}>
          <Text style={styles.emoji}>{subject.emoji ?? '⚗️'}</Text>
          <View style={styles.subjectInfo}>
            <Text style={styles.subjectName}>{subject.name ?? 'Organic Chemistry'}</Text>
            <Text style={styles.subjectMeta}>{subject.chapters ?? 12} chapters · {subject.lessons ?? 48} lessons · 3h 20m</Text>
            <View style={styles.progressRow}>
              <ProgressBar value={subject.progress ?? 62} variant="warning" height={5} style={{ flex: 1 }} />
              <Text style={styles.progressPct}>{subject.progress ?? 62}%</Text>
            </View>
          </View>
        </View>

        {/* Chapters */}
        {CHAPTERS.map((ch, i) => (
          <ChapterRow
            key={i}
            num={ch.num}
            title={ch.title}
            lessons={ch.lessons}
            status={ch.status}
            done={ch.done}
            onPress={() => {
              if (ch.status !== 'locked') {
                navigation.navigate('Lesson', {
                  lesson: { id: String(ch.num), title: ch.title, type: 'video', completed: ch.status === 'completed' },
                });
              }
            }}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.bg },
  topbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border2,
  },
  backBtn:   { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.bg2, alignItems: 'center', justifyContent: 'center' },
  backIcon:  { fontSize: 26, color: Colors.text },
  topTitle:  { flex: 1, fontSize: 17, fontWeight: '800', color: Colors.text, textAlign: 'center', marginHorizontal: 8 },
  moreBtn:   { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.bg2, alignItems: 'center', justifyContent: 'center' },
  moreIcon:  { fontSize: 18, color: Colors.text, letterSpacing: 2 },
  scroll:    { padding: 16, gap: 8, paddingBottom: 24 },
  subjectCard: { borderRadius: Radius.lg, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 4 },
  emoji:       { fontSize: 40 },
  subjectInfo: { flex: 1 },
  subjectName: { fontSize: 15, fontWeight: '800', color: Colors.text },
  subjectMeta: { fontSize: 11, color: Colors.text2, marginTop: 3, marginBottom: 8 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressPct: { fontSize: 11, fontWeight: '700', color: Colors.warning },
  chRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.white, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border2, padding: 14, ...Shadow.sm,
  },
  chRowCurrent: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary, borderWidth: 2 },
  chRowLocked:  { opacity: 0.6 },
  chBullet: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  chBulletTxt: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  chInfo:    { flex: 1 },
  chTitle:   { fontSize: 13, fontWeight: '700', color: Colors.text },
  chSub:     { fontSize: 11, color: Colors.text2, marginTop: 2 },
  chevron:   { fontSize: 22, color: Colors.text3 },
});
