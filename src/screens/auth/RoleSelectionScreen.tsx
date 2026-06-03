import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList, UserRole } from '../../types';
import { Colors, Radius, Shadow } from '../../theme';
import { Button } from '../../components/common/Button';

type Props = NativeStackScreenProps<AuthStackParamList, 'RoleSelection'>;

const roles: { id: UserRole; icon: string; title: string; desc: string; iconBg: string }[] = [
  { id: 'student',   icon: '🎓', title: 'Student',      desc: 'Access courses, quizzes & AI tutor',  iconBg: Colors.brand },
  { id: 'teacher',   icon: '👨‍🏫', title: 'Teacher',      desc: 'Manage classes, create & grade',       iconBg: '#1E3A8A' },
  { id: 'parent',    icon: '👨‍👩‍👧', title: 'Parent',       desc: "Monitor child's progress & reports",  iconBg: '#6B21A8' },
  { id: 'admin',     icon: '🏫', title: 'School Admin',  desc: 'Manage school, users & analytics',     iconBg: '#14532D' },
];

const roleLabel: Record<UserRole, string> = {
  student: 'Student', teacher: 'Teacher', parent: 'Parent',
  admin: 'School Admin', superadmin: 'Super Admin',
};

const routeMap: Record<UserRole, string> = {
  student: 'Student', teacher: 'Teacher', parent: 'Parent',
  admin: 'Admin', superadmin: 'Admin',
};

export const RoleSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const [selected, setSelected] = useState<UserRole>('student');

  const handleContinue = () => {
    const parent = navigation.getParent<any>();
    parent?.navigate(routeMap[selected]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Heading */}
        <Text style={styles.heading}>Who are you? 👋</Text>
        <Text style={styles.sub}>Choose your role to unlock the right learning experience</Text>

        {/* Role cards */}
        {roles.map(r => {
          const isSelected = selected === r.id;
          return (
            <TouchableOpacity
              key={r.id}
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => setSelected(r.id)}
              activeOpacity={0.85}
            >
              <View style={[styles.roleIcon, { backgroundColor: r.iconBg }]}>
                <Text style={{ fontSize: 28 }}>{r.icon}</Text>
              </View>
              <View style={styles.roleInfo}>
                <Text style={[styles.roleTitle, isSelected && { color: Colors.brand }]}>{r.title}</Text>
                <Text style={styles.roleDesc}>{r.desc}</Text>
              </View>
              <View style={[styles.radio, isSelected && styles.radioOn]}>
                {isSelected && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Sticky CTA */}
      <View style={styles.cta}>
        <Button
          label={`Continue as ${roleLabel[selected]} →`}
          variant="primary"
          onPress={handleContinue}
          style={styles.continueBtn}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.bg },
  scroll:  { padding: 20, paddingTop: 28, gap: 10 },
  heading: { fontSize: 26, fontWeight: '900', color: Colors.text, letterSpacing: -0.52, marginBottom: 4 },
  sub:     { fontSize: 12, color: Colors.text2, lineHeight: 18, marginBottom: 8 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: 18, padding: 16, ...Shadow.sm,
  },
  cardSelected: {
    backgroundColor: Colors.primaryLight, borderColor: Colors.primary, borderWidth: 2.5,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4,
  },
  roleIcon: {
    width: 54, height: 54, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    shadowColor: Colors.brand, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 4,
  },
  roleInfo:  { flex: 1 },
  roleTitle: { fontSize: 15, fontWeight: '800', color: Colors.text },
  roleDesc:  { fontSize: 11, color: Colors.text2, marginTop: 2 },
  radio: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  radioOn:    { backgroundColor: Colors.primary, borderColor: Colors.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.brand },
  cta: {
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border2,
  },
  continueBtn: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 20, elevation: 6,
  },
});
