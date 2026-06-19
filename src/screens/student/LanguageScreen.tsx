import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../theme';
import { Icon } from '../../components/common/Icon';
import { Entrance, PressableScale } from '../../components/common/anim';
import { GlowBlob } from '../../components/illustrations/OnboardingArt';
import { useLanguage, LANGUAGES } from '../../context/LanguageContext';

export const LanguageScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A0A0C" />

      <LinearGradient colors={['#1A0A0C', '#2A0E13', '#3D1520']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroGlow} pointerEvents="none"><GlowBlob size={220} /></View>
        <SafeAreaView edges={['top']}>
          <View style={styles.topbar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Text style={styles.backIcon}>‹</Text></TouchableOpacity>
            <View style={{ width: 40 }} />
          </View>
          <Text style={styles.title}>Language</Text>
          <Text style={styles.subtitle}>Choose your preferred language</Text>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.sheet} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {LANGUAGES.map((l, i) => {
          const active = l.code === language;
          return (
            <Entrance key={l.code} index={i}>
              <PressableScale style={[styles.row, active && styles.rowActive]} onPress={() => setLanguage(l.code)}>
                <View style={[styles.tag, active && styles.tagActive]}>
                  <Text style={[styles.tagTxt, active && { color: Colors.brand }]}>{l.tag}</Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.native}>{l.native}</Text>
                  <Text style={styles.label}>{l.label}</Text>
                </View>
                <View style={[styles.radio, active && styles.radioActive]}>
                  {active && <Icon name="checkmark" size={13} color={Colors.white} />}
                </View>
              </PressableScale>
            </Entrance>
          );
        })}

        <View style={styles.note}>
          <Icon name="warning" size={14} color={Colors.text3} />
          <Text style={styles.noteTxt}>More languages are on the way. Your choice is saved on this device.</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A0A0C' },
  hero: { paddingHorizontal: 16, paddingBottom: 26, overflow: 'hidden' },
  heroGlow: { position: 'absolute', top: -60, right: -40, opacity: 0.8 },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(196,149,96,0.15)', borderWidth: 1, borderColor: 'rgba(196,149,96,0.25)', alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 28, color: Colors.primary, fontWeight: '300', marginTop: -2 },
  title: { fontSize: 26, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.5, marginTop: 8 },
  subtitle: { fontSize: 12.5, color: 'rgba(245,232,208,0.7)', marginTop: 4 },

  sheet: { flex: 1, backgroundColor: Colors.bg, marginTop: -16, borderTopLeftRadius: 26, borderTopRightRadius: 26 },
  content: { padding: 16, paddingTop: 22, gap: 12, paddingBottom: 28 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.border2, padding: 14, ...Shadow.sm },
  rowActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  tag: { width: 50, height: 50, borderRadius: 15, backgroundColor: Colors.bg2, alignItems: 'center', justifyContent: 'center' },
  tagActive: { backgroundColor: Colors.primary },
  tagTxt: { fontSize: 19, fontWeight: '900', color: Colors.text2 },
  info: { flex: 1 },
  native: { fontSize: 16, fontWeight: '800', color: Colors.text },
  label: { fontSize: 12, color: Colors.text2, marginTop: 2 },
  radio: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  radioActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  note: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6, paddingHorizontal: 4 },
  noteTxt: { flex: 1, fontSize: 11.5, color: Colors.text3, lineHeight: 16 },
});
