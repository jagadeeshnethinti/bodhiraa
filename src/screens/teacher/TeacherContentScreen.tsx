/**
 * Teacher · Content — the teacher's library of lessons, quizzes and materials.
 * Hero with library stats, filter chips, a "new content" CTA and content cards
 * with type/status. Static mock for now.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../theme';
import { Button } from '../../components/common/Button';
import { Entrance, PressableScale, AnimatedCounter, Shimmer } from '../../components/common/anim';
import { GlowBlob } from '../../components/illustrations/OnboardingArt';
import { Icon, IconName } from '../../components/common/Icon';

type Type = 'Lesson' | 'Quiz' | 'Material';
const FILTERS: ('All' | Type)[] = ['All', 'Lesson', 'Quiz', 'Material'];

const HERO: { value: string; label: string }[] = [
  { value: '48', label: 'Lessons' },
  { value: '23', label: 'Quizzes' },
  { value: '31', label: 'Materials' },
];

const CONTENT: { type: Type; icon: IconName; title: string; meta: string; published: boolean; tint: string; color: string }[] = [
  { type: 'Lesson', icon: 'video', title: 'Wave Optics — Interference', meta: 'Physics 11-A · 18 min', published: true, tint: '#EAF2FF', color: '#2F4DA0' },
  { type: 'Quiz', icon: 'edit', title: 'Thermodynamics — Unit Test', meta: '20 questions · 45 min', published: true, tint: '#F3E8FF', color: '#7C3AED' },
  { type: 'Material', icon: 'pdf', title: 'Organic Chemistry Notes.pdf', meta: 'Chemistry 12-B · 2.4 MB', published: true, tint: '#FEF2F2', color: Colors.danger },
  { type: 'Lesson', icon: 'video', title: 'Quadratic Equations — Basics', meta: 'Maths 10-C · 22 min', published: false, tint: '#EAF2FF', color: '#2F4DA0' },
  { type: 'Quiz', icon: 'edit', title: 'Algebra Practice Set', meta: '15 questions · Draft', published: false, tint: '#F3E8FF', color: '#7C3AED' },
];

export const TeacherContentScreen: React.FC<{ navigation: any }> = () => {
  const [filter, setFilter] = useState<'All' | Type>('All');
  const list = CONTENT.filter(c => filter === 'All' || c.type === filter);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A0A0C" />

      <LinearGradient colors={['#1A0A0C', '#2A0E13', '#3D1520']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroGlow} pointerEvents="none"><GlowBlob size={220} /></View>
        <SafeAreaView edges={['top']}>
          <Text style={styles.heading}>Content library</Text>
          <Entrance index={0} style={styles.heroCard}>
            <Shimmer />
            {HERO.map((h, i) => (
              <React.Fragment key={h.label}>
                {i > 0 && <View style={styles.statSep} />}
                <View style={styles.heroStat}>
                  <AnimatedCounter value={h.value} style={styles.heroStatVal} />
                  <Text style={styles.heroStatLbl}>{h.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </Entrance>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.sheet} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Entrance index={0}>
          <Button
            label="New content"
            variant="primary"
            icon={<Icon name="upload" size={16} color={Colors.brand} />}
            onPress={() => Alert.alert('Create', 'Choose lesson, quiz or material — available in v1.')}
          />
        </Entrance>

        <Entrance index={1}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {FILTERS.map(f => {
              const active = f === filter;
              return (
                <PressableScale key={f} onPress={() => setFilter(f)} style={[styles.filterChip, active && styles.filterChipActive]}>
                  <Text style={[styles.filterTxt, active && styles.filterTxtActive]}>{f}</Text>
                </PressableScale>
              );
            })}
          </ScrollView>
        </Entrance>

        {list.map((c, i) => (
          <Entrance key={c.title} index={2 + i}>
            <PressableScale style={styles.contentCard}>
              <View style={[styles.contentIcon, { backgroundColor: c.tint }]}><Icon name={c.icon} size={20} color={c.color} /></View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.contentTitle} numberOfLines={1}>{c.title}</Text>
                <Text style={styles.contentMeta} numberOfLines={1}>{c.type} · {c.meta}</Text>
              </View>
              <View style={[styles.statusPill, { backgroundColor: c.published ? Colors.successLight : Colors.bg2 }]}>
                <Text style={[styles.statusTxt, { color: c.published ? Colors.success : Colors.text2 }]}>{c.published ? 'Live' : 'Draft'}</Text>
              </View>
            </PressableScale>
          </Entrance>
        ))}
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
  heroStatVal: { fontSize: 22, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.5 },
  heroStatLbl: { fontSize: 10, color: 'rgba(245,232,208,0.6)', fontWeight: '600', marginTop: 3 },
  statSep: { width: 1, height: 34, backgroundColor: 'rgba(196,149,96,0.2)' },

  sheet: { flex: 1, backgroundColor: Colors.bg, marginTop: -16, borderTopLeftRadius: 26, borderTopRightRadius: 26 },
  content: { padding: 16, paddingTop: 22, gap: 12, paddingBottom: 32 },
  filterRow: { gap: 8 },
  filterChip: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.full, paddingHorizontal: 16, paddingVertical: 9 },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterTxt: { fontSize: 12.5, fontWeight: '700', color: Colors.text2 },
  filterTxtActive: { color: Colors.brand },

  contentCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border2, padding: 12, ...Shadow.sm },
  contentIcon: { width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  contentTitle: { fontSize: 13.5, fontWeight: '800', color: Colors.text },
  contentMeta: { fontSize: 11, color: Colors.text2, marginTop: 2 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  statusTxt: { fontSize: 10.5, fontWeight: '800' },
});
