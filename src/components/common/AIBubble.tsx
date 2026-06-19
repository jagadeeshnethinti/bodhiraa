import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius } from '../../theme';
import { Icon } from './Icon';
import { Entrance, Pulse, PressableScale } from './anim';

interface AIBubbleProps {
  title?: string;
  message: string;
  actions?: { label: string; variant?: 'primary' | 'gray'; onPress?: () => void }[];
}

export const AIBubble: React.FC<AIBubbleProps> = ({ title, message, actions }) => (
  <Entrance style={styles.card}>
    <View style={styles.row}>
      <Pulse>
        <Icon name="robot" size={20} color={Colors.primary} />
      </Pulse>
      <View style={styles.content}>
        {title && <Text style={styles.title}>{title}</Text>}
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
    {actions && actions.length > 0 && (
      <View style={styles.actions}>
        {actions.map((a, i) => (
          <PressableScale
            key={i}
            onPress={a.onPress}
            style={[
              styles.actionBtn,
              a.variant === 'gray' ? styles.grayBtn : styles.primaryBtn,
            ]}
          >
            <Text
              style={[
                styles.actionText,
                a.variant === 'gray' ? { color: Colors.text2 } : { color: Colors.primaryDark },
              ]}
            >
              {a.label}
            </Text>
          </PressableScale>
        ))}
      </View>
    )}
  </Entrance>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: 'rgba(196,149,96,0.25)',
    borderRadius: Radius.lg,
    padding: 12,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  content: { flex: 1 },
  title: { fontSize: 12, fontWeight: '700', color: Colors.primary, marginBottom: 2 },
  message: { fontSize: 11, color: Colors.text, lineHeight: 17 },
  actions: { flexDirection: 'row', gap: 6, marginTop: 8 },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  primaryBtn: { backgroundColor: Colors.primary + '33' },
  grayBtn:   { backgroundColor: Colors.bg2 },
  actionText: { fontSize: 11, fontWeight: '600' },
});
