/**
 * Admin · Classes — every class in the school with its class teacher, headcount
 * and average. Grade filter chips + add-class CTA. Static mock for now.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../theme';
import { Button } from '../../components/common/Button';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Entrance, PressableScale, AnimatedCounter, Shimmer } from '../../components/common/anim';
import { GlowBlob } from '../../components/illustrations/OnboardingArt';
import { BoldIcon as Icon } from '../../components/common/BoldIcon';

const GRADES = ['All', 'Grade 12', 'Grade 11', 'Grade 10'];

type C = { name: string; teacher: string; students: number; avg: number; grade: string };
const CLASSES: C[] = [
  { name: 'Class 12-A', teacher: 'Dr. Meera Sharma', students: 45, avg: 82, grade: 'Grade 12' },
  { name: 'Class 12-B', teacher: 'Mr. Anil Kapoor', students: 43, avg: 71, grade: 'Grade 12' },
  { name: 'Class 11-A', teacher: 'Mrs. Nair', students: 42, avg: 78, grade: 'Grade 11' },
  { name: 'Class 11-B', teacher: 'Mr. Rao', students: 42, avg: 74, grade: 'Grade 11' },
  { name: 'Class 10-C', teacher: 'Ms. Iyer', students: 48, avg: 68, grade: 'Grade 10' },
];

const avgColor = (a: number) => (a >= 75 ? Colors.success : a >= 60 ? Colors.warning : Colors.danger);

export const AdminClassesScreen: React.FC<{ navigation: any }> = () => {
  const [grade, setGrade] = useState('All');
  const list = CLASSES.filter(c => grade === 'All' || c.grade === grade);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A0A0C" />

      <LinearGradient colors={['#1A0A0C', '#2A0E13', '#3D1520']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroGlow} pointerEvents="none"><GlowBlob size={220} /></View>
        <SafeAreaView edges={['top']}>
          <Text style={styles.heading}>Classes</Text>
          <Entrance index={0} style={styles.heroCard}>
            <Shimmer />
            <View style={styles.heroStat}><AnimatedCounter value="42" style={styles.heroStatVal} /><Text style={styles.heroStatLbl}>Classes</Text></View>
            <View style={styles.statSep} />
            <View style={styles.heroStat}><AnimatedCounter value="1,248" style={styles.heroStatVal} /><Text style={styles.heroStatLbl}>Students</Text></View>
            <View style={styles.statSep} />
            <View style={styles.heroStat}><AnimatedCounter value="74%" style={styles.heroStatVal} /><Text style={styles.heroStatLbl}>Avg score</Text></View>
          </Entrance>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.sheet} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Entrance index={0}>
          <Button label="Add class" variant="primary" icon={<Icon name="school" size={15} color={Colors.brand} />} onPress={() => Alert.alert('Add class', 'Create a new class — available in v1.')} />
        </Entrance>

        <Entrance index={1}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {GRADES.map(g => {
              const active = g === grade;
              return (
                <PressableScale key={g} onPress={() => setGrade(g)} style={[styles.filterChip, active && styles.filterChipActive]}>
                  <Text style={[styles.filterTxt, active && styles.filterTxtActive]}>{g}</Text>
                </PressableScale>
              );
            })}
          </ScrollView>
        </Entrance>

        {list.map((c, i) => (
          <Entrance key={c.name} index={2 + i}>
            <PressableScale style={styles.classCard}>
              <View style={styles.classIcon}><Icon name="library" size={20} color={Colors.primaryDark} /></View>
              <View style={{ flex: 1, gap: 6 }}>
                <View style={styles.classTop}>
                  <Text style={styles.className}>{c.name}</Text>
                  <Text style={[styles.classPct, { color: avgColor(c.avg) }]}>{c.avg}%</Text>
                </View>
                <ProgressBar value={c.avg} color={avgColor(c.avg)} height={6} />
                <Text style={styles.classMeta}>{c.teacher} · {c.students} students</Text>
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
  classMeta: { fontSize: 11, color: Colors.text2 },
});
