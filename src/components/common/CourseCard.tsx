import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Radius, Shadow } from '../../theme';
import { ProgressBar } from './ProgressBar';
import { Button } from './Button';
import { Chip } from './Chip';

interface CourseCardProps {
  emoji: string;
  title: string;
  subtitle: string;
  progress: number;
  chapterInfo?: string;
  onPress?: () => void;
  onResume?: () => void;
  progressVariant?: 'primary' | 'warning' | 'success';
  backgroundColor?: string;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  emoji,
  title,
  subtitle,
  progress,
  chapterInfo,
  onPress,
  onResume,
  progressVariant = 'primary',
  backgroundColor = '#FDF4E8',
}) => (
  <TouchableOpacity
    style={styles.card}
    onPress={onPress}
    activeOpacity={0.85}
  >
    <View style={[styles.banner, { backgroundColor }]}>
      <Text style={styles.emoji}>{emoji}</Text>
    </View>
    <View style={styles.body}>
      <View style={styles.titleRow}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {chapterInfo && <Chip label={chapterInfo} variant="warning" small />}
      </View>
      <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
      <ProgressBar value={progress} variant={progressVariant} height={5} style={styles.progress} />
      <View style={styles.footer}>
        <Text style={styles.percent}>{progress}% complete</Text>
        {onResume && (
          <Button
            label="Resume →"
            variant="primary"
            size="sm"
            fullWidth={false}
            onPress={onResume}
          />
        )}
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border2,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  banner: {
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 32 },
  body: { padding: 12 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: { fontSize: 13, fontWeight: '700', color: Colors.text, flex: 1, marginRight: 6 },
  subtitle: { fontSize: 11, color: Colors.text2, marginBottom: 8 },
  progress: { marginBottom: 8 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  percent: { fontSize: 11, color: Colors.text2 },
});
