import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Radius, Shadow } from '../../theme';
import { ProgressBar } from './ProgressBar';
import { Chip } from './Chip';

interface SubjectRowProps {
  emoji: string;
  name: string;
  chapters: number;
  lessons: number;
  progress: number;
  progressVariant?: 'primary' | 'warning' | 'success' | 'danger' | 'teal';
  chipVariant?: 'primary' | 'warning' | 'success' | 'danger' | 'teal' | 'cyan';
  backgroundColor?: string;
  onPress?: () => void;
}

export const SubjectRow: React.FC<SubjectRowProps> = ({
  emoji,
  name,
  chapters,
  lessons,
  progress,
  progressVariant = 'primary',
  chipVariant = 'primary',
  backgroundColor = '#FDF4E8',
  onPress,
}) => (
  <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.85}>
    <View style={[styles.icon, { backgroundColor }]}>
      <Text style={styles.emoji}>{emoji}</Text>
    </View>
    <View style={styles.content}>
      <View style={styles.topRow}>
        <Text style={styles.name}>{name}</Text>
        <Chip label={`${progress}%`} variant={chipVariant as any} small />
      </View>
      <Text style={styles.meta}>{chapters} chapters · {lessons} lessons</Text>
      <ProgressBar value={progress} variant={progressVariant} height={3} style={styles.bar} />
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border2,
    ...Shadow.sm,
  },
  icon: {
    width: 46,
    height: 46,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  emoji: { fontSize: 22 },
  content: { flex: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  name: { fontSize: 13, fontWeight: '700', color: Colors.text },
  meta: { fontSize: 11, color: Colors.text2, marginBottom: 4 },
  bar: { marginTop: 2 },
});
