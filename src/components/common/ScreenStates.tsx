import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../theme';
import { Button } from './Button';
import { Icon, IconName } from './Icon';

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 10 },
  icon: { marginBottom: 2, opacity: 0.55 },
  title: { fontSize: 15, fontWeight: '800', color: Colors.text, textAlign: 'center' },
  sub: { fontSize: 12, color: Colors.text2, textAlign: 'center', lineHeight: 18 },
  hint: { fontSize: 12, color: Colors.text3, marginTop: 4 },
  retry: { marginTop: 8, minWidth: 160 },
});

export const LoadingState: React.FC<{ label?: string }> = ({ label }) => (
  <View style={styles.center}>
    <ActivityIndicator size="large" color={Colors.primary} />
    {label ? <Text style={styles.hint}>{label}</Text> : null}
  </View>
);

export const ErrorState: React.FC<{
  message?: string | null;
  onRetry?: () => void;
  icon?: IconName;
  title?: string;
}> = ({ message, onRetry, icon = 'warning', title = 'Something went wrong' }) => (
  <View style={styles.center}>
    <Icon name={icon} size={40} color={Colors.text3} style={styles.icon} />
    <Text style={styles.title}>{title}</Text>
    {message ? <Text style={styles.sub}>{message}</Text> : null}
    {onRetry ? (
      <Button label="Try again" variant="outline" fullWidth={false} style={styles.retry} onPress={onRetry} />
    ) : null}
  </View>
);

export const EmptyState: React.FC<{
  icon?: IconName;
  title: string;
  sub?: string;
}> = ({ icon = 'folder', title, sub }) => (
  <View style={styles.center}>
    <Icon name={icon} size={40} color={Colors.text3} style={styles.icon} />
    <Text style={styles.title}>{title}</Text>
    {sub ? <Text style={styles.sub}>{sub}</Text> : null}
  </View>
);
