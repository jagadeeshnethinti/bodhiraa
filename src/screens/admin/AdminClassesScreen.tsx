/**
 * Admin · Classes — every class in the school with its class teacher, headcount
 * and subject count. Grade filter chips + add-class CTA. Wired to GET /admin/classes.
 */
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, RefreshControl, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../theme';
import { Button } from '../../components/common/Button';
import { ProgressBar } from '../../components/common/ProgressBar';
import { LoadingState, ErrorState, EmptyState } from '../../components/common/ScreenStates';
import { Entrance, PressableScale, AnimatedCounter, Shimmer } from '../../components/common/anim';
import { GlowBlob } from '../../components/illustrations/OnboardingArt';
import { BoldIcon as Icon } from '../../components/common/BoldIcon';
import { useApi } from '../../hooks/useApi';
import { AdminApi, type ApiAdminClass } from '../../api/endpoints/admin';

const avgColor = (a: number) => (a >= 75 ? Colors.success : a >= 60 ? Colors.warning : Colors.danger);

export const AdminClassesScreen: React.FC<{ navigation: any }> = () => {
  const [grade, setGrade] = useState('All');
  const classesApi = useApi(signal => AdminApi.classes(signal), []);
  const all: ApiAdminClass[] = classesApi.data ?? [];

  const grades = useMemo(() => ['All', ...Array.from(new Set(all.map(c => `Grade ${c.grade}`)))], [all]);
  const list = all.filter(c => grade === 'All' || `Grade ${c.grade}` === grade);

  const totalStudents = all.reduce((sum, c) => sum + (c.students_count ?? 0), 0);
  const totalSubjects = all.reduce((sum, c) => sum + (c.subjects_count ?? 0), 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A0A0C" />

      <LinearGradient colors={['#1A0A0C', '#2A0E13', '#3D1520']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroGlow} pointerEvents="none"><GlowBlob size={220} /></View>
        <SafeAreaView edges={['top']}>
          <Text style={styles.heading}>Classes</Text>
          <Entrance index={0} style={styles.heroCard}>
            <Shimmer />
            <View style={styles.heroStat}><AnimatedCounter value={String(all.length)} style={styles.heroStatVal} /><Text style={styles.heroStatLbl}>Classes</Text></View>
            <View style={styles.statSep} />
            <View style={styles.heroStat}><AnimatedCounter value={totalStudents.toLocaleString('en-IN')} style={styles.heroStatVal} /><Text style={styles.heroStatLbl}>Students</Text></View>
            <View style={styles.statSep} />
            <View style={styles.heroStat}><AnimatedCounter value={String(totalSubjects)} style={styles.heroStatVal} /><Text style={styles.heroStatLbl}>Subjects</Text></View>
          </Entrance>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.sheet}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={classesApi.refreshing} onRefresh={classesApi.refetch} tintColor={Colors.primary} />}
      >
        <Entrance index={0}>
          <Button label="Add class" variant="primary" icon={<Icon name="school" size={15} color={Colors.brand} />} onPress={() => Alert.alert('Add class', 'Create a new class — coming soon.')} />
        </Entrance>

        {grades.length > 1 && (
          <Entrance index={1}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              {grades.map(g => {
                const active = g === grade;
                return (
                  <PressableScale key={g} onPress={() => setGrade(g)} style={[styles.filterChip, active && styles.filterChipActive]}>
                    <Text style={[styles.filterTxt, active && styles.filterTxtActive]}>{g}</Text>
                  </PressableScale>
                );
              })}
            </ScrollView>
          </Entrance>
        )}

        {classesApi.loading && !classesApi.data ? (
          <LoadingState />
        ) : classesApi.error && !classesApi.data ? (
          <ErrorState message={classesApi.error} onRetry={classesApi.refetch} />
        ) : list.length === 0 ? (
          <EmptyState icon="school" title="No classes yet" sub="Classes you create will appear here." />
        ) : (
          list.map((c, i) => (
            <Entrance key={c.id} index={2 + i}>
              <PressableScale style={styles.classCard}>
                <View style={styles.classIcon}><Icon name="library" size={20} color={Colors.primaryDark} /></View>
                <View style={{ flex: 1, gap: 6 }}>
                  <View style={styles.classTop}>
                    <Text style={styles.className}>{c.label}</Text>
                    <Text style={styles.classCountTxt}>{c.students_count} students</Text>
                  </View>
                  <ProgressBar value={c.subjects_count > 0 ? Math.min(c.subjects_count * 20, 100) : 0} color={avgColor(70)} height={6} />
                  <Text style={styles.classMeta}>{c.class_teacher ?? 'No class teacher'} · {c.subjects_count} subjects{c.academic_year ? ` · ${c.academic_year}` : ''}</Text>
                </View>
              </PressableScale>
            </Entrance>
          ))
        )}
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
  heroStatVal: { fontSize: 21, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.5 },
  heroStatLbl: { fontSize: 10, color: 'rgba(245,232,208,0.6)', fontWeight: '600', marginTop: 3 },
  statSep: { width: 1, height: 34, backgroundColor: 'rgba(196,149,96,0.2)' },

  sheet: { flex: 1, backgroundColor: Colors.bg, marginTop: -16, borderTopLeftRadius: 26, borderTopRightRadius: 26 },
  content: { padding: 16, paddingTop: 22, gap: 12, paddingBottom: 32 },
  filterRow: { gap: 8 },
  filterChip: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.full, paddingHorizontal: 16, paddingVertical: 9 },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterTxt: { fontSize: 12.5, fontWeight: '700', color: Colors.text2 },
  filterTxtActive: { color: Colors.brand },

  classCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border2, padding: 12, ...Shadow.sm },
  classIcon: { width: 46, height: 46, borderRadius: 13, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  classTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  className: { fontSize: 13.5, fontWeight: '800', color: Colors.text },
  classPct: { fontSize: 14, fontWeight: '900' },
  classCountTxt: { fontSize: 12, fontWeight: '800', color: Colors.text2 },
  classMeta: { fontSize: 11, color: Colors.text2 },
});
