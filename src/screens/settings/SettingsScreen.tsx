import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../theme';

interface ToggleRowProps {
  icon: string;
  label: string;
  value: boolean;
  onToggle: (v: boolean) => void;
}

const ToggleRow: React.FC<ToggleRowProps> = ({ icon, label, value, onToggle }) => (
  <View style={rowStyles.row}>
    <Text style={rowStyles.icon}>{icon}</Text>
    <Text style={rowStyles.label}>{label}</Text>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{ false: Colors.border, true: Colors.primary }}
      thumbColor={Colors.white}
    />
  </View>
);

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border2,
  },
  icon:  { fontSize: 18, marginRight: 12 },
  label: { flex: 1, fontSize: 13, fontWeight: '600', color: Colors.text },
});

const NavRow: React.FC<{ icon: string; label: string; sub?: string; onPress?: () => void }> = ({ icon, label, sub, onPress }) => (
  <TouchableOpacity style={rowStyles.row} onPress={onPress} activeOpacity={0.85}>
    <Text style={rowStyles.icon}>{icon}</Text>
    <View style={{ flex: 1 }}>
      <Text style={rowStyles.label}>{label}</Text>
      {sub ? <Text style={{ fontSize: 11, color: Colors.text3, marginTop: 1 }}>{sub}</Text> : null}
    </View>
    <Text style={{ fontSize: 18, color: Colors.text3 }}>›</Text>
  </TouchableOpacity>
);

export const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [biometric, setBiometric] = useState(true);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg2} />

      <View style={styles.header}>
        <Text style={styles.heading}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}><Text style={styles.avatarText}>A</Text></View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Arjun Sharma</Text>
            <Text style={styles.profileMeta}>Student · Class 11-A</Text>
          </View>
          <TouchableOpacity style={styles.editBtn}>
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Appearance */}
        <Text style={styles.sectionLabel}>APPEARANCE</Text>
        <View style={styles.section}>
          <ToggleRow icon="🌙" label="Dark Mode" value={darkMode} onToggle={setDarkMode} />
        </View>

        {/* Notifications */}
        <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>
        <View style={styles.section}>
          <ToggleRow icon="🔔" label="Push Notifications" value={notifications} onToggle={setNotifications} />
          <ToggleRow icon="🤖" label="AI Suggestions" value={aiSuggestions} onToggle={setAiSuggestions} />
        </View>

        {/* Learning */}
        <Text style={styles.sectionLabel}>LEARNING</Text>
        <View style={styles.section}>
          <ToggleRow icon="📥" label="Offline Mode" value={offlineMode} onToggle={setOfflineMode} />
          <NavRow icon="🎯" label="Study Goal" sub="3 hours/day" />
          <NavRow icon="🌐" label="Language" sub="English" />
        </View>

        {/* Security */}
        <Text style={styles.sectionLabel}>SECURITY</Text>
        <View style={styles.section}>
          <ToggleRow icon="🔒" label="Biometric Login" value={biometric} onToggle={setBiometric} />
          <NavRow icon="🔑" label="Change Password" />
        </View>

        {/* Support */}
        <Text style={styles.sectionLabel}>SUPPORT</Text>
        <View style={styles.section}>
          <NavRow icon="💬" label="Help & Support" />
          <NavRow icon="⭐" label="Rate the App" />
          <NavRow icon="📄" label="Privacy Policy" />
          <NavRow icon="📋" label="Terms of Service" />
        </View>

        {/* App info */}
        <Text style={styles.sectionLabel}>ABOUT</Text>
        <View style={styles.section}>
          <NavRow icon="ℹ️" label="App Version" sub="v3.0.0 · AI Edition" />
        </View>

        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={() => {
            const root = navigation.getParent()?.getParent?.();
            if (root) root.navigate('Auth');
            else navigation.getParent()?.navigate('Auth');
          }}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: Colors.bg2 },
  header:      { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
  heading:     { fontSize: 28, fontWeight: '900', color: Colors.text, letterSpacing: -0.02 * 28 },
  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.white, marginHorizontal: 16, marginBottom: 24,
    borderRadius: Radius.lg, padding: 16, borderWidth: 1, borderColor: Colors.border2,
    ...Shadow.md,
  },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  avatarText:   { fontSize: 18, fontWeight: '900', color: Colors.brand },
  profileInfo:  { flex: 1 },
  profileName:  { fontSize: 16, fontWeight: '800', color: Colors.text },
  profileMeta:  { fontSize: 12, color: Colors.text2, marginTop: 2 },
  editBtn:      { paddingHorizontal: 14, paddingVertical: 7, backgroundColor: Colors.primaryLight, borderRadius: Radius.full },
  editBtnText:  { fontSize: 12, fontWeight: '700', color: Colors.primary },
  sectionLabel: {
    fontSize: 10, fontWeight: '700', color: Colors.text3,
    letterSpacing: 0.6, paddingHorizontal: 16, paddingBottom: 6, marginTop: 8,
  },
  section: {
    backgroundColor: Colors.white, marginHorizontal: 16, marginBottom: 4,
    borderRadius: Radius.md, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border2,
  },
  signOutBtn: {
    marginHorizontal: 16, marginTop: 20,
    backgroundColor: Colors.dangerLight, borderRadius: Radius.md, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.danger + '44',
  },
  signOutText: { fontSize: 14, fontWeight: '700', color: Colors.danger },
});
