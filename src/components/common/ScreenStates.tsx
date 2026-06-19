import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Colors } from '../../theme';
import { Button } from './Button';
import { Icon, IconName } from './Icon';
import { Entrance, SkeletonList } from './anim';

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 10 },
  icon: { marginBottom: 2, opacity: 0.55 },
  title: { fontSize: 15, fontWeight: '800', color: Colors.text, textAlign: 'center' },
  sub: { fontSize: 12, color: Colors.text2, textAlign: 'center', lineHeight: 18 },
  hint: { fontSize: 12, color: Colors.text3, marginTop: 4 },
  retry: { marginTop: 8, minWidth: 160 },
});

/** A shimmering skeleton placeholder — reads as premium vs. a bare spinner. */
export const LoadingState: React.FC<{ label?: string }> = () => <SkeletonList rows={4} />;

export const ErrorState: React.FC<{
  message?: string | null;
  onRetry?: () => void;
  icon?: IconName;
  title?: string;
}> = ({ message, onRetry, icon = 'warning', title = 'Something went wrong' }) => (
  <Entrance style={styles.center}>
    <Icon name={icon} size={40} color={Colors.text3} style={styles.icon} />
    <Text style={styles.title}>{title}</Text>
    {message ? <Text style={styles.sub}>{message}</Text> : null}
    {onRetry ? (
      <Button label="Try again" variant="outline" fullWidth={false} style={styles.retry} onPress={onRetry} />
    ) : null}
  </Entrance>
);

export const EmptyState: React.FC<{
  icon?: IconName;
  title: string;
  sub?: string;
}> = ({ icon = 'folder', title, sub }) => (
  <Entrance style={styles.center}>
    <Icon name={icon} size={40} color={Colors.text3} style={styles.icon} />
    <Text style={styles.title}>{title}</Text>
    {sub ? <Text style={styles.sub}>{sub}</Text> : null}
  </Entrance>
);
