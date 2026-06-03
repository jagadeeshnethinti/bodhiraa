import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Line, Circle, Polyline, G } from 'react-native-svg';
import { Colors, Radius, Shadow } from '../../theme';
import { SubjectRow } from '../../components/common/SubjectRow';
import { SearchBar } from '../../components/common/SearchBar';

// ─── Flat icon (subset) ─────────────────────────────────────────────────────────
type IName = 'menu' | 'search' | 'bell' | 'chevron-right';
const Icon: React.FC<{ name: IName; size?: number; color?: string }> = ({ name, size = 20, color = Colors.text }) => {
  const p = { stroke: color, strokeWidth: 2, strokeLinecap: 'round' as any, strokeLinejoin: 'round' as any, fill: 'none' };
  const map: Record<IName, React.ReactNode> = {
    menu:            <G {...p}><Line x1="3" y1="6"  x2="21" y2="6"  /><Line x1="3" y1="12" x2="21" y2="12" /><Line x1="3" y1="18" x2="21" y2="18" /></G>,
    search:          <G {...p}><Circle cx="11" cy="11" r="8" /><Line x1="21" y1="21" x2="16.65" y2="16.65" /></G>,
    bell:            <G {...p}><Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><Path d="M13.73 21a2 2 0 0 1-3.46 0" /></G>,
    'chevron-right': <Polyline points="9 18 15 12 9 6" {...p} />,
  };
  return <Svg width={size} height={size} viewBox="0 0 24 24">{map[name]}</Svg>;
};

// ─── Data ───────────────────────────────────────────────────────────────────────
const FILTERS = ['All', 'Science', 'Mathematics', 'Languages', 'Social'];

const SUBJECTS = [
  { emoji: '⚗️', name: 'Chemistry',   chapters: 12, lessons: 48, progress: 62, pV: 'warning' as const, cV: 'warning' as const, bg: '#FEF3C7', filter: 'Science' },
  { emoji: '📐', name: 'Mathematics', chapters: 15, lessons: 72, progress: 38, pV: 'primary' as const, cV: 'primary' as const, bg: '#FDF4E8', filter: 'Mathematics' },
  { emoji: '🔬', name: 'Physics',     chapters: 14, lessons: 56, progress: 78, pV: 'success' as const, cV: 'success' as const, bg: '#ECFDF5', filter: 'Science' },
  { emoji: '🧬', name: 'Biology',     chapters: 10, lessons: 40, progress: 45, pV: 'primary' as const, cV: 'primary' as const, bg: '#FDF4FF', filter: 'Science' },
  { emoji: '📖', name: 'English',     chapters:  8, lessons: 32, progress: 91, pV: 'teal'    as const, cV: 'cyan'    as const, bg: '#ECFEFF', filter: 'Languages' },
];

// ─── Screen ─────────────────────────────────────────────────────────────────────
export const SubjectListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [activeFilter, setActiveFilter] = useState(0);
  const [search, setSearch] = useState('');

  const filtered = SUBJECTS.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === 0 || s.filter === FILTERS[activeFilter];
    return matchSearch && matchFilter;
  });

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      {/* ── Header ── */}
      <View style={s.header}>
        <View>
          <Text style={s.headerSub}>Grade 11 · 2025–26</Text>
          <Text style={s.headerTitle}>My Subjects</Text>
        </View>
        <View style={s.headerRight}>
          <TouchableOpacity style={s.iconBtn}>
            <Icon name="bell" size={18} color={Colors.text2} />
          </TouchableOpacity>
          <TouchableOpacity style={s.iconBtn}>
            <Icon name="menu" size={18} color={Colors.text2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Search ── */}
      <View style={s.searchWrap}>
        <SearchBar placeholder="Search subjects, topics…" value={search} onChangeText={setSearch} />
      </View>

      {/* ── Filter chips ── horizontal scroll, chips never clip or wrap ── */}
      <View style={s.filterOuter}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filterContent}
          bounces={false}
        >
          {FILTERS.map((label, i) => (
            <TouchableOpacity
              key={label}
              style={[s.chip, activeFilter === i && s.chipActive]}
              onPress={() => setActiveFilter(i)}
              activeOpacity={0.75}
            >
              {activeFilter === i && <View style={s.chipDot} />}
              <Text style={[s.chipTxt, activeFilter === i && s.chipTxtActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Results count ── */}
      {search.length > 0 && (
        <Text style={s.resultCount}>{filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"</Text>
      )}

      {/* ── Subject list ── */}
      <ScrollView
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={s.emptyWrap}>
            <Text style={s.emptyTitle}>No subjects found</Text>
            <Text style={s.emptySub}>Try a different filter or search term</Text>
          </View>
        ) : (
          filtered.map((sub, i) => (
            <SubjectRow
              key={sub.name}
              emoji={sub.emoji}
              name={sub.name}
              chapters={sub.chapters}
              lessons={sub.lessons}
              progress={sub.progress}
              progressVariant={sub.pV}
              chipVariant={sub.cV as any}
              backgroundColor={sub.bg}
              onPress={() => navigation.navigate('ChapterList', {
                subject: { emoji: sub.emoji, name: sub.name, chapters: sub.chapters, lessons: sub.lessons, progress: sub.progress },
              })}
            />
          ))
        )}
        <View style={{ height: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 6, paddingBottom: 12,
  },
  headerSub:   { fontSize: 10, fontWeight: '600', color: Colors.text3, letterSpacing: 0.4 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.text, marginTop: 2 },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn:     { width: 38, height: 38, borderRadius: 11, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border2, ...Shadow.sm },

  // Search
  searchWrap: { paddingHorizontal: 16, paddingBottom: 10 },

  // Filter strip — outer wrapper clips overscroll bleed; inner content is a row
  filterOuter: {
    borderTopWidth: 1, borderBottomWidth: 1,
    borderColor: Colors.border2,
    backgroundColor: Colors.white,
  },
  filterContent: {
    flexDirection: 'row',      // ← chips laid out in a row
    alignItems: 'center',      // ← vertically centred
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,                    // ← spacing between chips
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexShrink: 0,             // ← chip never squishes, always full width
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.bg2,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  chipDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  chipTxt: {
    fontSize: 12, fontWeight: '600', color: Colors.text3,
  },
  chipTxtActive: {
    color: Colors.primary, fontWeight: '800',
  },

  // Results
  resultCount: {
    fontSize: 11, color: Colors.text3, fontWeight: '600',
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 2,
  },

  // List
  listContent: { paddingHorizontal: 16, paddingTop: 12, gap: 10 },

  // Empty state
  emptyWrap:  { alignItems: 'center', paddingTop: 48, gap: 6 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  emptySub:   { fontSize: 12, color: Colors.text3 },
});
