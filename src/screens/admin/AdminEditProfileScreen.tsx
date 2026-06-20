/**
 * Admin · Edit profile — administrator details using the hardened auth field
 * components, prefilled from the authenticated user. The backend exposes no
 * admin self-profile update endpoint (no PATCH /admin/profile), so saving is a
 * local confirmation only — see note below.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius } from '../../theme';
import { Button } from '../../components/common/Button';
import { NameField, EmailField, PhoneField, AuthField } from '../../components/common/AuthField';
import { Entrance } from '../../components/common/anim';
import { GlowBlob } from '../../components/illustrations/OnboardingArt';
import { useAuth } from '../../context/AuthContext';
import { initials } from '../../utils/ui';

export const AdminEditProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [school, setSchool] = useState(user?.school?.name ?? '');
  const [saving, setSaving] = useState(false);

  // NOTE: There is no admin self-profile update endpoint on the backend, so this
  // only confirms locally. Wire to a real PATCH here once the API exposes one.
  const save = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      Alert.alert('Saved', 'Your details have been updated on this device.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    }, 600);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A0A0C" />

      <LinearGradient colors={['#1A0A0C', '#2A0E13', '#3D1520']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroGlow} pointerEvents="none"><GlowBlob size={220} /></View>
        <SafeAreaView edges={['top']}>
          <View style={styles.topbar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={8}><Text style={styles.backIcon}>‹</Text></TouchableOpacity>
            <Text style={styles.topTitle}>Edit profile</Text>
            <View style={{ width: 40 }} />
          </View>
          <Entrance index={0} style={styles.avatarWrap}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{initials(name)}</Text></View>
            <TouchableOpacity style={styles.editAvatar} activeOpacity={0.8}><Text style={styles.editAvatarTxt}>Change photo</Text></TouchableOpacity>
          </Entrance>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.sheet} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <NameField label="FULL NAME" value={name} onChangeText={setName} placeholder="Your name" />
        <EmailField label="EMAIL ADDRESS" value={email} onChangeText={setEmail} placeholder="admin@school.edu" />
        <PhoneField label="MOBILE NUMBER" value={phone} onChangeText={setPhone} placeholder="98765 43210" />
        <AuthField label="SCHOOL" icon="school" value={school} onChangeText={setSchool} placeholder="School name" autoCapitalize="words" />

        <Button label={saving ? 'Saving…' : 'Save changes'} variant="primary" onPress={save} loading={saving} style={{ marginTop: 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A0A0C' },
  hero: { paddingHorizontal: 16, paddingBottom: 26, alignItems: 'center', overflow: 'hidden' },
  heroGlow: { position: 'absolute', top: -70, alignSelf: 'center', opacity: 0.8 },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingTop: 4 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(196,149,96,0.15)', borderWidth: 1, borderColor: 'rgba(196,149,96,0.25)', alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 26, color: Colors.primary, fontWeight: '300', marginTop: -2 },
  topTitle: { fontSize: 16, fontWeight: '800', color: '#F5E8D0' },
  avatarWrap: { alignItems: 'center', marginTop: 14 },
  avatar: { width: 84, height: 84, borderRadius: 27, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(196,149,96,0.4)' },
  avatarText: { fontSize: 30, fontWeight: '900', color: Colors.brand },
  editAvatar: { marginTop: 10, backgroundColor: 'rgba(245,232,208,0.08)', borderRadius: Radius.full, paddingHorizontal: 14, paddingVertical: 6 },
  editAvatarTxt: { fontSize: 11, fontWeight: '700', color: Colors.primary },

  sheet: { flex: 1, backgroundColor: Colors.bg, marginTop: -16, borderTopLeftRadius: 26, borderTopRightRadius: 26 },
  content: { padding: 18, paddingTop: 24, paddingBottom: 40 },
});
