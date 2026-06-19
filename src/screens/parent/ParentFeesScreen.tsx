/**
 * Parent · Fees & payments — current dues with a pay action, the term fee
 * breakdown, and a paid-invoices history. Premium gradient-header sheet. Static
 * mock for now (billing endpoints land in v1).
 */
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../theme';
import { Button } from '../../components/common/Button';
import { Entrance, PressableScale, Shimmer } from '../../components/common/anim';
import { GlowBlob } from '../../components/illustrations/OnboardingArt';
import { Icon, IconName } from '../../components/common/Icon';
import { ConfirmDialog, SuccessModal } from '../../components/common/PremiumModals';

const DUE = 24500;
const BREAKDOWN: { label: string; amount: number }[] = [
  { label: 'Tuition fee · Term 2', amount: 18000 },
  { label: 'Lab & activity fee', amount: 4000 },
  { label: 'Transport (Apr–Jun)', amount: 2500 },
];
const INVOICES: { icon: IconName; title: string; date: string; amount: number }[] = [
  { icon: 'checkmark', title: 'Term 1 fee', date: 'Paid 08 Jan 2026', amount: 24500 },
  { icon: 'checkmark', title: 'Admission & books', date: 'Paid 02 Apr 2025', amount: 31000 },
];

const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

export const ParentFeesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const payTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (payTimer.current) clearTimeout(payTimer.current); }, []);

  const pay = () => {
    setPaying(true);
    payTimer.current = setTimeout(() => {
      setPaying(false);
      setConfirmOpen(false);
      setSuccessOpen(true);
    }, 1300);
  };

  return (
  <View style={styles.container}>
    <StatusBar barStyle="light-content" backgroundColor="#1A0A0C" />

    <LinearGradient colors={['#1A0A0C', '#2A0E13', '#3D1520']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
      <View style={styles.heroGlow} pointerEvents="none"><GlowBlob size={220} /></View>
      <SafeAreaView edges={['top']}>
        <View style={styles.topbar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={8}><Text style={styles.backIcon}>‹</Text></TouchableOpacity>
          <Text style={styles.topTitle}>Fees & payments</Text>
          <View style={{ width: 40 }} />
        </View>

        <Entrance index={0} style={styles.dueCard}>
          <Shimmer />
          <Text style={styles.dueLabel}>TOTAL DUE · TERM 2</Text>
          <Text style={styles.dueAmount}>{inr(DUE)}</Text>
          <View style={styles.dueMetaRow}>
            <Icon name="clock" size={13} color={Colors.warning} />
            <Text style={styles.dueMeta}>Due by 30 June 2026</Text>
          </View>
        </Entrance>
      </SafeAreaView>
    </LinearGradient>

    <ScrollView style={styles.sheet} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Entrance index={0}>
        <Button
          label={`Pay ${inr(DUE)}`}
          variant="primary"
          icon={<Icon name="card" size={16} color={Colors.brand} />}
          onPress={() => setConfirmOpen(true)}
        />
      </Entrance>

      {/* Breakdown */}
      <Entrance index={1} style={styles.card}>
        <Text style={styles.cardTitle}>Fee breakdown</Text>
        {BREAKDOWN.map((b, i) => (
          <View key={b.label} style={[styles.breakRow, i < BREAKDOWN.length - 1 && styles.divider]}>
            <Text style={styles.breakLabel}>{b.label}</Text>
            <Text style={styles.breakAmount}>{inr(b.amount)}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>{inr(DUE)}</Text>
        </View>
      </Entrance>

      {/* History */}
      <Entrance index={2}><Text style={styles.sectionTitle}>Payment history</Text></Entrance>
      {INVOICES.map((inv, i) => (
        <Entrance key={i} index={3 + i}>
          <PressableScale style={styles.invoiceCard} onPress={() => Alert.alert('Receipt', 'Receipt download opens in v1.')}>
            <View style={styles.invoiceIcon}><Icon name="checkmark" size={16} color={Colors.success} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.invoiceTitle}>{inv.title}</Text>
              <Text style={styles.invoiceDate}>{inv.date}</Text>
            </View>
            <Text style={styles.invoiceAmount}>{inr(inv.amount)}</Text>
            <Icon name="upload" size={15} color={Colors.text3} style={{ marginLeft: 8 }} />
          </PressableScale>
        </Entrance>
      ))}
    </ScrollView>

    <ConfirmDialog
      visible={confirmOpen}
      icon="card"
      tone="primary"
      title="Confirm payment"
      message={`You'll pay ${inr(DUE)} towards Term 2 fees through the secure payment gateway.`}
      confirmLabel={`Pay ${inr(DUE)}`}
      cancelLabel="Cancel"
      loading={paying}
      onConfirm={pay}
      onCancel={() => setConfirmOpen(false)}
    />

    <SuccessModal
      visible={successOpen}
      title="Payment successful"
      message={`${inr(DUE)} paid towards Term 2 fees. A receipt has been emailed to you.`}
      buttonLabel="Done"
      onClose={() => setSuccessOpen(false)}
    />
  </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A0A0C' },
  hero: { paddingHorizontal: 16, paddingBottom: 28, overflow: 'hidden' },
  heroGlow: { position: 'absolute', top: -70, right: -40, opacity: 0.8 },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(196,149,96,0.15)', borderWidth: 1, borderColor: 'rgba(196,149,96,0.25)', alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 26, color: Colors.primary, fontWeight: '300', marginTop: -2 },
  topTitle: { fontSize: 16, fontWeight: '800', color: '#F5E8D0' },

  dueCard: { marginTop: 16, backgroundColor: 'rgba(245,232,208,0.07)', borderWidth: 1, borderColor: 'rgba(196,149,96,0.22)', borderRadius: Radius.xl, padding: 18, overflow: 'hidden' },
  dueLabel: { fontSize: 10, fontWeight: '800', color: 'rgba(196,149,96,0.9)', letterSpacing: 1 },
  dueAmount: { fontSize: 34, fontWeight: '900', color: '#F5E8D0', letterSpacing: -1, marginTop: 6 },
  dueMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  dueMeta: { fontSize: 12, color: 'rgba(245,232,208,0.75)', fontWeight: '600' },

  sheet: { flex: 1, backgroundColor: Colors.bg, marginTop: -16, borderTopLeftRadius: 26, borderTopRightRadius: 26 },
  content: { padding: 16, paddingTop: 22, gap: 12, paddingBottom: 32 },

  card: { backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border2, padding: 16, ...Shadow.sm },
  cardTitle: { fontSize: 14.5, fontWeight: '800', color: Colors.text, marginBottom: 6 },
  breakRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  divider: { borderBottomWidth: 1, borderBottomColor: Colors.border2 },
  breakLabel: { fontSize: 13, color: Colors.text2, fontWeight: '600' },
  breakAmount: { fontSize: 13, fontWeight: '700', color: Colors.text },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, marginTop: 4, borderTopWidth: 1.5, borderTopColor: Colors.border },
  totalLabel: { fontSize: 14, fontWeight: '800', color: Colors.text },
  totalAmount: { fontSize: 16, fontWeight: '900', color: Colors.primaryDark },

  sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.text, marginTop: 4 },
  invoiceCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border2, padding: 12, ...Shadow.sm },
  invoiceIcon: { width: 38, height: 38, borderRadius: 11, backgroundColor: Colors.successLight, alignItems: 'center', justifyContent: 'center' },
  invoiceTitle: { fontSize: 13, fontWeight: '700', color: Colors.text },
  invoiceDate: { fontSize: 11, color: Colors.text2, marginTop: 2 },
  invoiceAmount: { fontSize: 13.5, fontWeight: '800', color: Colors.text },
});
