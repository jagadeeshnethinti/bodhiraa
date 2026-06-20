/**
 * Teacher · Students — class roster with per-student presence. A hero with a
 * class selector and a summary ring, summary tiles, and the student list.
 * Wired to GET /teacher/classes (selector) and GET /teacher/classes/{id}
 * (roster + summary) via TeacherApi.classes() / TeacherApi.klass().
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, RefreshControl } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow, useTheme } from '../../theme';
import { CircularProgress } from '../../components/common/CircularProgress';
import { LoadingState, ErrorState, EmptyState } from '../../components/common/ScreenStates';
import { Entrance, PressableScale, AnimatedCounter, Shimmer } from '../../components/common/anim';
import { GlowBlob } from '../../components/illustrations/OnboardingArt';
import { Icon, IconName } from '../../components/common/Icon';
import { useApi } from '../../hooks/useApi';
import { TeacherApi } from '../../api';

const ini = (n: string) => n.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

export const TeacherStudentsScreen: React.FC<{ navigation: any }> = () => {
  const theme = useTheme();
  const [clsIdx, setClsIdx] = useState(0);

  const classesReq = useApi(signal => TeacherApi.classes(signal), []);
  const classes = classesReq.data ?? [];
  const selected = classes[clsIdx] ?? null;
  const selectedId = selected?.id ?? null;

  // Roster + summary for the chosen class. Re-fetches when the selection changes.
  const detail = useApi(
    signal => {
      if (selectedId == null) return Promise.resolve(null);
      return TeacherApi.klass(selectedId, signal);
    },
    [selectedId],
  );

  const d = detail.data;
  const students = d?.students ?? [];
  const attendancePct = d?.summary.attendancePercent ?? 0;
  const presentCount = students.filter(s => s.present === true).length;

  const summary: { icon: IconName; value: string; label: string; color: string; tint: string }[] = [
    { icon: 'group', value: String(d?.summary.students ?? selected?.students ?? 0), label: 'Students', color: Colors.primaryDark, tint: '#FDF4E8' },
    { icon: 'chart', value: `${attendancePct}%`, label: 'Attendance', color: Colors.success, tint: '#EDFAF4' },
    { icon: 'library', value: String(d?.summary.subjects ?? 0), label: 'Subjects', color: '#2F4DA0', tint: '#EAF2FF' },
  ];

  const onRefresh = () => { classesReq.refetch(); detail.refetch(); };

  return (
    <View style={[styles.container, { backgroundColor: theme.heroSolid }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.heroSolid} />

      <LinearGradient colors={theme.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroGlow} pointerEvents="none"><GlowBlob size={220} color={theme.accent} /></View>
        <SafeAreaView edges={['top']}>
          <Text style={styles.heading}>Students</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {classes.map((c, i) => {
              const active = i === clsIdx;
              return (
                <PressableScale key={c.id} onPress={() => setClsIdx(i)} style={[styles.classChip, active && { backgroundColor: theme.accent, borderColor: theme.accent }]}>
                  <Text style={[styles.classChipTxt, active && { color: theme.onAccent }]}>{c.name}</Text>
                </PressableScale>
              );
            })}
          </ScrollView>

          <Entrance index={0} style={styles.heroCard}>
            <Shimmer />
            <CircularProgress size={84} strokeWidth={8} progress={attendancePct} trackColor="rgba(245,232,208,0.14)">
              <View style={styles.ringCenter}>
                <AnimatedCounter value={`${attendancePct}%`} style={styles.ringPct} />
                <Text style={styles.ringLbl}>Present</Text>
              </View>
            </CircularProgress>
            <View style={styles.heroInfo}>
              <Text style={styles.heroInfoTitle}>{selected?.name ?? 'Your classes'}</Text>
              <Text style={styles.heroInfoSub}>
                {students.length > 0
                  ? `${students.length} students · ${presentCount} marked present.`
                  : 'Select a class to view its roster.'}
              </Text>
            </View>
          </Entrance>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.sheet}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={classesReq.refreshing || detail.refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {classesReq.loading && !classesReq.data ? (
          <LoadingState />
        ) : classesReq.error && !classesReq.data ? (
          <ErrorState message={classesReq.error} onRetry={classesReq.refetch} />
        ) : classes.length === 0 ? (
          <EmptyState icon="library" title="No classes yet" sub="Classes assigned to you will appear here." />
        ) : (
          <>
            <Entrance index={0} style={styles.summaryGrid}>
              {summary.map(s => (
                <View key={s.label} style={styles.summaryTile}>
                  <View style={[styles.summaryIcon, { backgroundColor: s.tint }]}><Icon name={s.icon} size={15} color={s.color} /></View>
                  <Text style={[styles.summaryVal, { color: s.color }]}>{s.value}</Text>
                  <Text style={styles.summaryLbl}>{s.label}</Text>
                </View>
              ))}
            </Entrance>

            <Entrance index={2} style={styles.listHeaderRow}>
              <Text style={styles.sectionTitle}>Roster</Text>
            </Entrance>

            {detail.loading && !detail.data ? (
              <LoadingState />
            ) : detail.error && !detail.data ? (
              <ErrorState message={detail.error} onRetry={detail.refetch} />
            ) : students.length === 0 ? (
              <EmptyState icon="group" title="No students" sub="This class has no enrolled students yet." />
            ) : (
              students.map((s, i) => (
                <Entrance key={s.id} index={3 + i}>
                  <PressableScale style={styles.studentRow}>
                    <View style={styles.studentAvatar}><Text style={styles.studentInitials}>{ini(s.name)}</Text></View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.studentTop}>
                        <Text style={styles.studentName}>{s.name}</Text>
                        {s.present !== null && (
                          <View style={[styles.presentDot, { backgroundColor: s.present ? Colors.success : Colors.danger }]} />
                        )}
                      </View>
                      <Text style={styles.studentRoll}>
                        {s.roll ? `${s.roll} · ` : ''}{s.present === null ? 'Not marked' : s.present ? 'Present' : 'Absent'}
                      </Text>
                    </View>
                    <View style={[styles.statusPill, { backgroundColor: s.status === 'active' ? Colors.successLight : Colors.bg2 }]}>
                      <Text style={[styles.statusTxt, { color: s.status === 'active' ? Colors.success : Colors.text2 }]}>
                        {s.status === 'active' ? 'Active' : 'Inactive'}
                      </Text>
                    </View>
                  </PressableScale>
                </Entrance>
              ))
            )}
          </>
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
  chipRow: { gap: 8, paddingVertical: 14 },
  classChip: { backgroundColor: 'rgba(245,232,208,0.08)', borderWidth: 1, borderColor: 'rgba(196,149,96,0.2)', borderRadius: Radius.full, paddingHorizontal: 14, paddingVertical: 8 },
  classChipTxt: { fontSize: 12, fontWeight: '700', color: 'rgba(245,232,208,0.8)' },
  heroCard: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: 'rgba(245,232,208,0.07)', borderWidth: 1, borderColor: 'rgba(196,149,96,0.22)', borderRadius: Radius.xl, padding: 16, overflow: 'hidden' },
  ringCenter: { alignItems: 'center', justifyContent: 'center' },
  ringPct: { fontSize: 17, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.5 },
  ringLbl: { fontSize: 9, fontWeight: '700', color: 'rgba(245,232,208,0.6)', marginTop: 1 },
  heroInfo: { flex: 1 },
  heroInfoTitle: { fontSize: 13.5, fontWeight: '800', color: '#F5E8D0' },
  heroInfoSub: { fontSize: 11, color: 'rgba(245,232,208,0.7)', lineHeight: 16, marginTop: 4 },

  sheet: { flex: 1, backgroundColor: Colors.bg, marginTop: -16, borderTopLeftRadius: 26, borderTopRightRadius: 26 },
  content: { padding: 16, paddingTop: 22, gap: 12, paddingBottom: 32 },
  summaryGrid: { flexDirection: 'row', gap: 8 },
  summaryTile: { flex: 1, alignItems: 'center', gap: 5, paddingVertical: 13, backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border2, ...Shadow.sm },
  summaryIcon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  summaryVal: { fontSize: 18, fontWeight: '900' },
  summaryLbl: { fontSize: 9.5, color: Colors.text3, fontWeight: '700' },

  listHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.text },

  studentRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border2, padding: 11, ...Shadow.sm },
  studentAvatar: { width: 42, height: 42, borderRadius: 13, backgroundColor: Colors.bg2, alignItems: 'center', justifyContent: 'center' },
  studentInitials: { fontSize: 14, fontWeight: '900', color: Colors.text2 },
  studentTop: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  studentName: { fontSize: 13.5, fontWeight: '700', color: Colors.text },
  presentDot: { width: 7, height: 7, borderRadius: 4 },
  studentRoll: { fontSize: 11, color: Colors.text2, marginTop: 2 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  statusTxt: { fontSize: 10.5, fontWeight: '800' },
});
