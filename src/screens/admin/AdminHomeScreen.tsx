import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../theme';
import { ProgressBar } from '../../components/common/ProgressBar';

export const AdminHomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => (
  <View style={styles.container}>
    <StatusBar barStyle="light-content" backgroundColor="#1A0A0C" />

    {/* Gradient header with top safe area */}
    <LinearGradient
      colors={['#1A0A0C', '#2A0E13', '#3D1520']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.topbar}>
          <View>
            <Text style={styles.greeting}>School Admin</Text>
            <Text style={styles.name}>Delhi Public School</Text>
          </View>
          <View style={styles.avatar}><Text style={styles.avatarText}>DPS</Text></View>
        </View>
      </SafeAreaView>
    </LinearGradient>

    {/* Scrollable body with bottom safe area */}
    <SafeAreaView style={styles.body} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Overview stats */}
        <View style={styles.statsGrid}>
          {[
            { icon: '🎓', label: 'Students', value: '1,248' },
            { icon: '👨‍🏫', label: 'Teachers', value: '68' },
            { icon: '📚', label: 'Classes',  value: '42' },
            { icon: '📊', label: 'Avg Score', value: '74%' },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={{ fontSize: 24 }}>{s.icon}</Text>
              <Text style={styles.statVal}>{s.value}</Text>
              <Text style={styles.statLbl}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Alerts */}
        <View style={styles.alertCard}>
          <Text style={{ fontSize: 16 }}>🔔</Text>
          <View style={styles.alertInfo}>
            <Text style={styles.alertTitle}>3 new teacher registrations pending</Text>
            <Text style={styles.alertSub}>Approval required</Text>
          </View>
          <TouchableOpacity style={styles.alertBtn}>
            <Text style={styles.alertBtnTxt}>Review</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Management</Text>
        <View style={styles.actionsGrid}>
          {[
            { icon: '👤',  label: 'Add Student' },
            { icon: '👨‍🏫', label: 'Add Teacher' },
            { icon: '🏫',  label: 'Classes' },
            { icon: '📊',  label: 'Analytics' },
            { icon: '📢',  label: 'Announce' },
            { icon: '📋',  label: 'Reports' },
          ].map((a, i) => (
            <TouchableOpacity key={i} style={styles.actionTile}>
              <Text style={{ fontSize: 28 }}>{a.icon}</Text>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Class performance */}
        <Text style={styles.sectionTitle}>Class Performance</Text>
        {[
          { cls: 'Class 12-A', students: 45, avg: 82 },
          { cls: 'Class 11-B', students: 42, avg: 74 },
          { cls: 'Class 10-C', students: 48, avg: 68 },
        ].map((c, i) => (
          <View key={i} style={styles.classCard}>
            <View>
              <Text style={styles.className}>{c.cls}</Text>
              <Text style={styles.classMeta}>{c.students} students</Text>
            </View>
            <View style={styles.classRight}>
              <ProgressBar value={c.avg} variant={c.avg >= 75 ? 'success' : 'warning'} height={4} style={{ width: 100 }} />
              <Text style={[styles.classPct, { color: c.avg >= 75 ? Colors.success : Colors.warning }]}>{c.avg}%</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header:    { paddingHorizontal: 16, paddingBottom: 20 },
  body:      { flex: 1 },
  topbar:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 8 },
  greeting:  { fontSize: 11, color: 'rgba(245,232,208,0.7)', fontWeight: '600', letterSpacing: 0.3 },
  name:      { fontSize: 20, fontWeight: '900', color: '#F5E8D0' },
  avatar: {
    height: 44, paddingHorizontal: 12, borderRadius: 12,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  avatarText:  { fontSize: 12, fontWeight: '900', color: Colors.brand },
  scroll:      { padding: 16, gap: 12, paddingBottom: 32 },
  statsGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statCard: {
    width: '47%', alignItems: 'center', paddingVertical: 16, gap: 4,
    backgroundColor: Colors.white, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border2, ...Shadow.sm,
  },
  statVal:      { fontSize: 20, fontWeight: '900', color: Colors.text },
  statLbl:      { fontSize: 11, color: Colors.text3, fontWeight: '600' },
  alertCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.primaryLight, borderRadius: Radius.md,
    borderWidth: 1, borderColor: 'rgba(196,149,96,0.25)', padding: 12,
  },
  alertInfo:    { flex: 1 },
  alertTitle:   { fontSize: 13, fontWeight: '700', color: Colors.text },
  alertSub:     { fontSize: 11, color: Colors.text2 },
  alertBtn:     { paddingHorizontal: 10, paddingVertical: 5, backgroundColor: Colors.primary, borderRadius: Radius.full },
  alertBtnTxt:  { fontSize: 11, fontWeight: '700', color: Colors.brand },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  actionsGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionTile: {
    width: '30%', alignItems: 'center', paddingVertical: 16, gap: 6,
    backgroundColor: Colors.white, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border2, ...Shadow.sm,
  },
  actionLabel: { fontSize: 10, fontWeight: '600', color: Colors.text, textAlign: 'center' },
  classCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.white, borderRadius: Radius.md, padding: 14,
    borderWidth: 1, borderColor: Colors.border2, ...Shadow.sm,
  },
  className:  { fontSize: 13, fontWeight: '700', color: Colors.text },
  classMeta:  { fontSize: 11, color: Colors.text2, marginTop: 2 },
  classRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  classPct:   { fontSize: 14, fontWeight: '800' },
});
