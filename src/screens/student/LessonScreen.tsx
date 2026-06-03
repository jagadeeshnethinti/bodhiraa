import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../theme';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Chip } from '../../components/common/Chip';
import { Button } from '../../components/common/Button';

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────
type ContentType = 'video' | 'pdf' | 'quiz' | 'discussion';

interface ContentItem {
  icon: string;
  title: string;
  sub: string;
  type: ContentType;
  done: boolean;
  active: boolean;
  videoIndex?: number;
  meta?: string;
}

const contentItems: ContentItem[] = [
  { icon: '🎥', title: 'Introduction to Organic Chemistry', sub: '09:56 min', meta: '12.4K views', type: 'video',      done: true,  active: false, videoIndex: 0 },
  { icon: '🎬', title: 'Reactions & Mechanisms',            sub: '09:57 min', meta: '8.2K views',  type: 'video',      done: false, active: true,  videoIndex: 1 },
  { icon: '✏️', title: 'Practice Quiz',                    sub: '10 questions',                    type: 'quiz',       done: false, active: false },
  { icon: '💬', title: 'Discussion Forum',                  sub: '24 comments',                    type: 'discussion', done: false, active: false },
];

// ─────────────────────────────────────────────────────────────────────────────
// Video card component — premium thumbnail style
// ─────────────────────────────────────────────────────────────────────────────
const VideoCard: React.FC<{
  item: ContentItem;
  onPress: () => void;
}> = ({ item, onPress }) => (
  <TouchableOpacity
    style={[vc.card, item.active && vc.cardActive]}
    onPress={onPress}
    activeOpacity={0.88}
  >
    {/* Thumbnail */}
    <LinearGradient
      colors={item.done ? ['#1A3A2A', '#0F2018'] : ['#2A0E13', '#3D1520']}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={vc.thumb}
    >
      <Text style={vc.thumbEmoji}>{item.icon}</Text>
      {/* Duration badge */}
      <View style={vc.durationBadge}>
        <Text style={vc.durationTxt}>{item.sub}</Text>
      </View>
      {/* Play button overlay */}
      <View style={[vc.playRing, item.done && vc.playRingDone]}>
        <Text style={vc.playArrow}>{item.done ? '↩' : '▶'}</Text>
      </View>
    </LinearGradient>

    {/* Info */}
    <View style={vc.info}>
      <Text style={[vc.title, item.active && { color: Colors.primary }]} numberOfLines={2}>{item.title}</Text>
      <View style={vc.metaRow}>
        {item.meta ? <Text style={vc.meta}>👁 {item.meta}</Text> : null}
      </View>
      {/* Status badge */}
      {item.done
        ? <View style={vc.doneBadge}><Text style={vc.doneBadgeTxt}>✓ Completed</Text></View>
        : item.active
        ? <View style={vc.activeBadge}><Text style={vc.activeBadgeTxt}>▶ CURRENT</Text></View>
        : null
      }
    </View>
  </TouchableOpacity>
);

const vc = StyleSheet.create({
  card: {
    flexDirection: 'row', gap: 12, alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border2, padding: 10, ...Shadow.sm,
  },
  cardActive: { borderColor: Colors.primary, borderWidth: 2, backgroundColor: Colors.primaryLight },
  thumb: {
    width: 96, height: 66, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative', overflow: 'hidden',
  },
  thumbEmoji:   { fontSize: 22, opacity: 0.7 },
  durationBadge:{ position: 'absolute', bottom: 5, left: 5, backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 },
  durationTxt:  { fontSize: 9, color: '#fff', fontWeight: '700' },
  playRing: {
    position: 'absolute', width: 30, height: 30, borderRadius: 15,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.6, shadowRadius: 8,
  },
  playRingDone: { backgroundColor: Colors.success },
  playArrow:    { fontSize: 12, color: Colors.brand, fontWeight: '800' },
  info:         { flex: 1, gap: 4 },
  title:        { fontSize: 13, fontWeight: '700', color: Colors.text, lineHeight: 18 },
  metaRow:      { flexDirection: 'row', alignItems: 'center', gap: 6 },
  meta:         { fontSize: 10, color: Colors.text3 },
  doneBadge:    { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, backgroundColor: Colors.successLight, borderRadius: 20, borderWidth: 1, borderColor: Colors.success + '44' },
  doneBadgeTxt: { fontSize: 9, fontWeight: '700', color: Colors.success },
  activeBadge:  { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, backgroundColor: Colors.primary, borderRadius: 20 },
  activeBadgeTxt:{ fontSize: 9, fontWeight: '800', color: Colors.brand, letterSpacing: 0.4 },
});

// ─────────────────────────────────────────────────────────────────────────────
// Standard content row (quiz / discussion / pdf)
// ─────────────────────────────────────────────────────────────────────────────
const ContentRow: React.FC<{
  item: ContentItem;
  onPress: () => void;
}> = ({ item, onPress }) => (
  <TouchableOpacity
    style={[cr.row, item.active && cr.rowActive]}
    activeOpacity={0.85}
    onPress={onPress}
    disabled={!item.active && !item.done}
  >
    <View style={[cr.iconBox, item.done && cr.iconBoxDone, item.active && cr.iconBoxActive]}>
      <Text style={{ fontSize: 20 }}>{item.icon}</Text>
    </View>
    <View style={cr.info}>
      <Text style={[cr.title, item.active && { color: Colors.primary }]}>{item.title}</Text>
      <Text style={cr.sub}>{item.sub}</Text>
    </View>
    {item.done
      ? <View style={cr.doneCheck}><Text style={{ color: Colors.white, fontSize: 11, fontWeight: '700' }}>✓</Text></View>
      : item.active
      ? <Chip label="START" variant="primary" small />
      : <Text style={{ fontSize: 14 }}>🔒</Text>
    }
  </TouchableOpacity>
);

const cr = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.white, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border2, padding: 14, ...Shadow.sm },
  rowActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight, borderWidth: 2 },
  iconBox:   { width: 46, height: 46, borderRadius: 12, backgroundColor: Colors.bg2, alignItems: 'center', justifyContent: 'center' },
  iconBoxDone:  { backgroundColor: Colors.successLight },
  iconBoxActive:{ backgroundColor: Colors.primaryLight },
  info:  { flex: 1 },
  title: { fontSize: 13, fontWeight: '700', color: Colors.text },
  sub:   { fontSize: 11, color: Colors.text2, marginTop: 2 },
  doneCheck: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.success, alignItems: 'center', justifyContent: 'center' },
});

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────
export const LessonScreen: React.FC<{ navigation: any; route: any }> = ({ navigation }) => (
  <View style={styles.container}>
    <StatusBar barStyle="light-content" backgroundColor="#1A0A0C" />

    {/* ── Gradient header ── */}
    <LinearGradient colors={['#1A0A0C', '#2A0E13', '#3D1520']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <SafeAreaView edges={['top']}>
        <View style={styles.topbar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <View style={styles.titleBlock}>
            <Text style={styles.chapterLabel}>CHEMISTRY · CH 5</Text>
            <Text style={styles.lessonTitle} numberOfLines={1}>Reactions & Mechanisms</Text>
          </View>
          <TouchableOpacity><Text style={{ fontSize: 18 }}>🔖</Text></TouchableOpacity>
        </View>
        <View style={styles.progressSection}>
          <ProgressBar value={62} variant="primary" height={4} />
          <View style={styles.progressMeta}>
            <Text style={styles.progressText}>Lesson 4 of 6</Text>
            <Text style={styles.progressText}>62% complete</Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>

    {/* ── Body ── */}
    <SafeAreaView style={styles.body} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Video section header ── */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>📹 Video Lessons</Text>
          <Text style={styles.sectionSub}>2 videos · 19:53 total</Text>
        </View>

        {/* Video cards */}
        {contentItems
          .filter(it => it.type === 'video')
          .map((item, i) => (
            <VideoCard
              key={i}
              item={item}
              onPress={() => navigation.navigate('VideoPlayer', { videoIndex: item.videoIndex ?? 0 })}
            />
          ))}

        {/* ── Other content ── */}
        <View style={[styles.sectionRow, { marginTop: 4 }]}>
          <Text style={styles.sectionTitle}>📋 Activities</Text>
        </View>

        {contentItems
          .filter(it => it.type !== 'video')
          .map((item, i) => (
            <ContentRow
              key={i}
              item={item}
              onPress={() => {
                if (item.type === 'quiz')       navigation.navigate('QuizActive', {});
                if (item.type === 'discussion') navigation.navigate('Discussion', {});
              }}
            />
          ))}

        {/* ── AI Tip ── */}
        <LinearGradient
          colors={['#FDF4E8', '#FEF8F2']}
          style={styles.aiCard}
        >
          <View style={styles.aiAvatarBox}><Text style={{ fontSize: 18 }}>🤖</Text></View>
          <View style={styles.aiInfo}>
            <Text style={styles.aiLabel}>BODHIRA AI</Text>
            <Text style={styles.aiTitle}>Exam Tip</Text>
            <Text style={styles.aiText}>Focus on SN1 vs SN2 — this topic appears in 80% of board exams. Always watch the video before attempting the quiz!</Text>
          </View>
        </LinearGradient>

        {/* ── Discussion preview ── */}
        <View style={styles.discussCard}>
          <View style={styles.discussHeader}>
            <Text style={styles.sectionTitle}>💬 Discussion</Text>
            <Text style={styles.discussCount}>24 comments</Text>
          </View>
          <View style={styles.discussRow}>
            <View style={styles.discussAvatar}><Text style={{ fontSize: 14 }}>👤</Text></View>
            <View style={styles.discussBubble}>
              <Text style={styles.discussUser}>Priya M.</Text>
              <Text style={styles.discussMsg}>Can someone explain the SN2 mechanism in simple terms?</Text>
              <Text style={styles.discussTime}>2 hours ago · 5 replies</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.viewAllBtn} onPress={() => navigation.navigate('Discussion', {})}>
            <Text style={styles.viewAllTxt}>View all 24 comments →</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* ── Bottom CTA ── */}
      <View style={styles.cta}>
        <Button
          label="▶  Play Next Video"
          variant="primary"
          onPress={() => navigation.navigate('VideoPlayer', { videoIndex: 1 })}
        />
      </View>
    </SafeAreaView>
  </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  topbar:    { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(196,149,96,0.15)', borderWidth: 1, borderColor: 'rgba(196,149,96,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon:        { fontSize: 24, color: '#F5E8D0', fontWeight: '300' },
  titleBlock:      { flex: 1 },
  chapterLabel:    { fontSize: 10, fontWeight: '700', color: 'rgba(196,149,96,0.75)', letterSpacing: 0.5 },
  lessonTitle:     { fontSize: 16, fontWeight: '800', color: '#F5E8D0' },
  progressSection: { paddingHorizontal: 16, paddingBottom: 16, gap: 5 },
  progressMeta:    { flexDirection: 'row', justifyContent: 'space-between' },
  progressText:    { fontSize: 10, color: 'rgba(245,232,208,0.7)', fontWeight: '600' },
  body:            { flex: 1 },
  scroll:          { padding: 16, gap: 10, paddingBottom: 8 },

  sectionRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  sectionTitle:  { fontSize: 13, fontWeight: '700', color: Colors.text },
  sectionSub:    { fontSize: 11, color: Colors.text3 },

  // AI card
  aiCard:      { flexDirection: 'row', gap: 12, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: 14 },
  aiAvatarBox: { width: 38, height: 38, borderRadius: 12, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  aiInfo:      { flex: 1 },
  aiLabel:     { fontSize: 9, fontWeight: '800', color: Colors.primary, letterSpacing: 0.8 },
  aiTitle:     { fontSize: 12, fontWeight: '700', color: Colors.text, marginTop: 1, marginBottom: 3 },
  aiText:      { fontSize: 11, color: Colors.text2, lineHeight: 17 },

  // Discussion
  discussCard:   { backgroundColor: Colors.white, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border2, padding: 14, ...Shadow.sm, gap: 10 },
  discussHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  discussCount:  { fontSize: 11, color: Colors.text3, fontWeight: '600' },
  discussRow:    { flexDirection: 'row', gap: 10 },
  discussAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.bg2, alignItems: 'center', justifyContent: 'center' },
  discussBubble: { flex: 1, backgroundColor: Colors.bg, borderRadius: 10, padding: 10 },
  discussUser:   { fontSize: 11, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  discussMsg:    { fontSize: 11, color: Colors.text2, lineHeight: 16 },
  discussTime:   { fontSize: 10, color: Colors.text3, marginTop: 4 },
  viewAllBtn:    { alignItems: 'center', paddingTop: 4 },
  viewAllTxt:    { fontSize: 12, fontWeight: '600', color: Colors.primary },

  cta: { padding: 16, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border2 },
});
