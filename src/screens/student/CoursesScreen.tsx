import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius } from '../../theme';
import { CourseCard } from '../../components/common/CourseCard';

const TABS = ['All (5)', 'Started', 'Paused'];

const courses = [
  { emoji: '⚗️', title: 'Organic Chemistry', subtitle: 'Reactions & Mechanisms · 34 min left', progress: 62, chapter: 'Ch 5 of 12', bg: '#FEF3C7', v: 'warning'  as const },
  { emoji: '📐', title: 'Mathematics',        subtitle: 'Limits & Derivatives · 52 min left',  progress: 38, chapter: 'Ch 3 of 15', bg: '#FDF4E8', v: 'primary'  as const },
  { emoji: '🔬', title: 'Physics',            subtitle: 'Electrostatics · 1h 12 min left',       progress: 78, chapter: 'Ch 7 of 14', bg: '#ECFDF5', v: 'success'  as const },
];

export const CoursesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>In Progress</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Text style={{ fontSize: 16 }}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Pill tabs */}
      <View style={styles.tabs}>
        {TABS.map((t, i) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, activeTab === i && styles.tabActive]}
            onPress={() => setActiveTab(i)}
          >
            <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {courses.map((c, i) => (
          <CourseCard
            key={i}
            emoji={c.emoji}
            title={c.title}
            subtitle={c.subtitle}
            progress={c.progress}
            chapterInfo={c.chapter}
            progressVariant={c.v}
            backgroundColor={c.bg}
            onPress={() => navigation.navigate('ChapterList', { subject: { emoji: c.emoji, name: c.title, chapters: 12, lessons: 48, progress: c.progress } })}
            onResume={() => navigation.navigate('ChapterList', { subject: { emoji: c.emoji, name: c.title, chapters: 12, lessons: 48, progress: c.progress } })}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border2,
  },
  heading: { fontSize: 20, fontWeight: '800', color: Colors.text },
  iconBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.bg2,
    alignItems: 'center', justifyContent: 'center',
  },
  tabs: {
    flexDirection: 'row', backgroundColor: Colors.bg2, borderRadius: 10,
    padding: 3, gap: 3, marginHorizontal: 16, marginBottom: 14, marginTop: 12,
  },
  tab:           { flex: 1, alignItems: 'center', paddingVertical: 7, borderRadius: 8 },
  tabActive:     { backgroundColor: Colors.white, shadowColor: '#2A0E13', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2 },
  tabText:       { fontSize: 11, fontWeight: '600', color: Colors.text2 },
  tabTextActive: { fontWeight: '700', color: Colors.brand },
  scroll:        { paddingHorizontal: 16, gap: 12, paddingBottom: 16 },
});
