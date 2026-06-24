import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius } from '../../theme';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';
import { AuthField } from '../../components/common/AuthField';
import { Entrance } from '../../components/common/anim';
import { GlowBlob } from '../../components/illustrations/OnboardingArt';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../../components/common/Avatar';
import type { ApiUser } from '../../api';

export const AccountScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, setUser } = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [grade, setGrade] = useState(user?.grade ?? '');
  const [error, setError] = useState<string | null>(null);

  const dirty =
    name.trim() !== (user?.name ?? '') ||
    email.trim() !== (user?.email ?? '') ||
    phone.trim() !== (user?.phone ?? '') ||
    grade.trim() !== (user?.grade ?? '');

  const save = () => {
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (user) {
      const updated: ApiUser = {
        ...user,
        name: name.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        grade: grade.trim() || null,
      };
      setUser(updated);
    }
    Alert.alert('Profile updated', 'Your changes have been saved.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A0A0C" />

      <LinearGradient colors={['#1A0A0C', '#2A0E13', '#3D1520', '#52202E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroGlow} pointerEvents="none"><GlowBlob size={240} /></View>
        <SafeAreaView edges={['top']}>
          <View style={styles.topbar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Text style={styles.backIcon}>‹</Text></TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Account</Text>
            <View style={{ width: 40 }} />
          </View>

          <Entrance index={0} style={styles.avatarWrap}>
            <Avatar uri={user?.avatar} name={name || user?.name} style={styles.avatar} textStyle={styles.avatarText} />
            <TouchableOpacity style={styles.camBtn} onPress={() => Alert.alert('Coming soon', 'Photo upload will be available shortly.')}>
              <Icon name="edit" size={13} color={Colors.brand} />
            </TouchableOpacity>
          </Entrance>
          <Text style={styles.roleLine}>{user?.role_label ?? 'Student'}{user?.school?.name ? ` · ${user.school.name}` : ''}</Text>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.sheet}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
      >
        <Entrance index={1}>
          <AuthField label="FULL NAME" icon="user" value={name} onChangeText={t => { setName(t); if (error) setError(null); }} placeholder="Your name" error={error} />
        </Entrance>
        <Entrance index={2}>
          <AuthField label="EMAIL ADDRESS" icon="user" value={email} onChangeText={setEmail} placeholder="you@email.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
        </Entrance>
        <Entrance index={3}>
          <AuthField label="MOBILE NUMBER" icon="phone" value={phone} onChangeText={setPhone} placeholder="+91 98765 43210" keyboardType="phone-pad" />
        </Entrance>
        <Entrance index={4}>
          <AuthField label="CLASS / GRADE" icon="school" value={grade} onChangeText={setGrade} placeholder="e.g. 11" />
        </Entrance>

        <Entrance index={5}>
          <Button label="Save changes" variant="primary" onPress={save} disabled={!dirty} style={styles.saveBtn} />
          <Text style={styles.hint}>Your profile is visible to your teachers and school.</Text>
        </Entrance>
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
  backIcon: { fontSize: 28, color: Colors.primary, fontWeight: '300', marginTop: -2 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#F5E8D0' },

  avatarWrap: { alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  avatar: { width: 88, height: 88, borderRadius: 30, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(196,149,96,0.4)' },
  avatarText: { fontSize: 32, fontWeight: '900', color: Colors.brand },
  camBtn: { position: 'absolute', bottom: -4, right: '34%', width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#2A0E13' },
  roleLine: { fontSize: 12, color: 'rgba(245,232,208,0.65)', marginTop: 14, textTransform: 'capitalize' },

  sheet: { flex: 1, backgroundColor: Colors.bg, marginTop: -14, borderTopLeftRadius: 26, borderTopRightRadius: 26 },
  content: { padding: 20, paddingTop: 24, paddingBottom: 36 },
  saveBtn: { marginTop: 8 },
  hint: { fontSize: 11, color: Colors.text3, textAlign: 'center', marginTop: 14, lineHeight: 16 },
});
