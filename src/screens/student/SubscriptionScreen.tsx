import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../theme';
import { Icon, IconName } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';
import { Entrance, PressableScale, AnimatedCounter, Pulse } from '../../components/common/anim';
import { ConfirmDialog, SuccessModal } from '../../components/common/PremiumModals';

type Period = 'monthly' | 'yearly';

interface Plan {
  id: string;
  name: string;
  icon: IconName;
  tagline: string;
  monthly: number;
  yearly: number;
  accent: string;
  popular?: boolean;
  features: string[];
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Starter',
    icon: 'book',
    tagline: 'The essentials to get going',
    monthly: 0,
    yearly: 0,
    accent: '#6B4A38',
    features: ['Access to 2 subjects', 'Basic practice quizzes', 'Community doubt forum', 'Progress tracking'],
  },
  {
    id: 'pro',
    name: 'Pro Learner',
    icon: 'rocket',
    tagline: 'Everything you need to excel',
    monthly: 299,
    yearly: 2499,
    accent: '#C49560',
    popular: true,
    features: ['All subjects & chapters', 'Unlimited AI doubt solver', 'Live classes & recordings', 'Full quiz analytics', 'Downloadable notes (PDF)'],
  },
  {
    id: 'premium',
    name: 'Premium',
    icon: 'trophy',
    tagline: 'For toppers who want it all',
    monthly: 499,
    yearly: 3999,
    accent: '#7A1322',
    features: ['Everything in Pro', '1-on-1 mentor sessions', 'Personalised study plan', 'Priority AI responses', 'Exclusive masterclasses'],
  },
];

export const SubscriptionScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [period, setPeriod] = useState<Period>('yearly');
  const [selected, setSelected] = useState<string>('pro');
  const plan = PLANS.find(p => p.id === selected)!;

  // Premium payment flow: confirm dialog → simulated charge → success animation.
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const payTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (payTimer.current) clearTimeout(payTimer.current); }, []);

  // Animated sliding pill for the billing toggle.
  const [trackW, setTrackW] = useState(0);
  const pillX = useRef(new Animated.Value(0)).current;
  const segW = trackW > 0 ? (trackW - 8) / 2 : 0;
  useEffect(() => {
    if (segW <= 0) return;
    Animated.spring(pillX, {
      toValue: period === 'monthly' ? 0 : segW,
      useNativeDriver: true,
      friction: 9,
      tension: 90,
    }).start();
  }, [period, segW, pillX]);

  const priceFor = (p: Plan) => (period === 'monthly' ? p.monthly : p.yearly);
  const periodLabel = period === 'monthly' ? '/mo' : '/yr';

  const subscribe = () => {
    if (plan.monthly === 0) {
      setInfoOpen(true);
      return;
    }
    setConfirmOpen(true);
  };

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

      {/* Hero header */}
      <LinearGradient colors={['#1A0A0C', '#2A0E13', '#3D1520', '#52202E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <SafeAreaView edges={['top']} style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.backIcon}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Go Premium</Text>
            <View style={{ width: 38 }} />
          </View>

          <Entrance index={0} style={styles.heroBlock}>
            <Pulse style={styles.heroIcon}>
              <Icon name="rocket" size={26} color={Colors.primary} />
            </Pulse>
            <Text style={styles.heroTitle}>Unlock your full potential</Text>
            <Text style={styles.heroSub}>Pick a plan and learn without limits.</Text>
          </Entrance>

          {/* Billing toggle */}
          <Entrance index={1} style={styles.toggleTrack} >
            <View style={styles.toggleInner} onLayout={e => setTrackW(e.nativeEvent.layout.width)}>
              {segW > 0 && (
                <Animated.View style={[styles.togglePill, { width: segW, transform: [{ translateX: pillX }] }]} />
              )}
              <TouchableOpacity style={styles.toggleSeg} activeOpacity={0.8} onPress={() => setPeriod('monthly')}>
                <Text style={[styles.toggleTxt, period === 'monthly' && styles.toggleTxtActive]}>Monthly</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.toggleSeg} activeOpacity={0.8} onPress={() => setPeriod('yearly')}>
                <Text style={[styles.toggleTxt, period === 'yearly' && styles.toggleTxtActive]}>Yearly</Text>
                <View style={styles.saveBadge}><Text style={styles.saveTxt}>SAVE 30%</Text></View>
              </TouchableOpacity>
            </View>
          </Entrance>
        </SafeAreaView>
      </LinearGradient>

      {/* Plans */}
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {PLANS.map((p, i) => {
          const isSel = p.id === selected;
          return (
            <Entrance key={p.id} index={i + 2}>
              <PressableScale
                style={[
                  styles.planCard,
                  { borderColor: isSel ? p.accent : Colors.border2, borderWidth: isSel ? 2 : 1 },
                  isSel && Shadow.md,
                ]}
                scaleTo={0.98}
                onPress={() => setSelected(p.id)}
              >
                {p.popular && (
                  <View style={[styles.popularBadge, { backgroundColor: p.accent }]}>
                    <Text style={styles.popularTxt}>★ MOST POPULAR</Text>
                  </View>
                )}
                <View style={styles.planTop}>
                  <View style={[styles.planIcon, { backgroundColor: p.accent + '1A' }]}>
                    <Icon name={p.icon} size={22} color={p.accent} />
                  </View>
                  <View style={styles.flex1}>
                    <Text style={styles.planName}>{p.name}</Text>
                    <Text style={styles.planTagline}>{p.tagline}</Text>
                  </View>
                  <View style={[styles.radio, { borderColor: isSel ? p.accent : Colors.border }]}>
                    {isSel && <View style={[styles.radioDot, { backgroundColor: p.accent }]} />}
                  </View>
                </View>

                <View style={styles.priceRow}>
                  <Text style={[styles.currency, { color: p.accent }]}>₹</Text>
                  <AnimatedCounter value={priceFor(p)} style={[styles.price, { color: p.accent }]} />
                  <Text style={styles.period}>{p.monthly === 0 ? 'Free forever' : periodLabel}</Text>
                </View>

                <View style={styles.divider} />

                {p.features.map((f, fi) => (
                  <View key={fi} style={styles.featureRow}>
                    <View style={[styles.tick, { backgroundColor: p.accent + '22' }]}>
                      <Icon name="checkmark" size={11} color={p.accent} />
                    </View>
                    <Text style={styles.featureTxt}>{f}</Text>
                  </View>
                ))}
              </PressableScale>
            </Entrance>
          );
        })}

        <Entrance index={6} style={styles.trustRow}>
          <View style={styles.trustItem}>
            <Icon name="lock" size={14} color={Colors.text3} />
            <Text style={styles.trustTxt}>Secure payment</Text>
          </View>
          <View style={styles.trustItem}>
            <Icon name="checkmark" size={14} color={Colors.text3} />
            <Text style={styles.trustTxt}>Cancel anytime</Text>
          </View>
        </Entrance>
      </ScrollView>

      {/* Sticky CTA */}
      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <View style={styles.footerInner}>
          <View style={styles.footerPrice}>
            <Text style={styles.footerPlan}>{plan.name}</Text>
            <Text style={styles.footerAmt}>
              {plan.monthly === 0 ? 'Free' : `₹${priceFor(plan).toLocaleString('en-IN')}${periodLabel}`}
            </Text>
          </View>
          <Button
            label={plan.monthly === 0 ? 'Continue Free' : `Subscribe →`}
            variant="primary"
            fullWidth={false}
            onPress={subscribe}
            style={styles.ctaBtn}
          />
        </View>
      </SafeAreaView>

      <ConfirmDialog
        visible={confirmOpen}
        icon="card"
        tone="primary"
        title={`Subscribe to ${plan.name}`}
        message={`You'll pay ₹${priceFor(plan).toLocaleString('en-IN')} ${period === 'monthly' ? 'per month' : 'per year'}. Cancel anytime.`}
        confirmLabel={`Pay ₹${priceFor(plan).toLocaleString('en-IN')}`}
        cancelLabel="Cancel"
        loading={paying}
        onConfirm={pay}
        onCancel={() => setConfirmOpen(false)}
      />

      <ConfirmDialog
        visible={infoOpen}
        icon="book"
        tone="primary"
        title="You’re on Starter"
        message="The free plan is already active. Upgrade any time for more."
        confirmLabel="Got it"
        onConfirm={() => setInfoOpen(false)}
        onCancel={() => setInfoOpen(false)}
      />

      <SuccessModal
        visible={successOpen}
        title="Payment successful"
        message={`Welcome to Bodhira ${plan.name}! Enjoy your new features.`}
        buttonLabel="Start learning"
        onClose={() => setSuccessOpen(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  flex1: { flex: 1 },

  // Header
  header: { paddingHorizontal: 16, paddingBottom: 18 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(196,149,96,0.15)', alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 28, color: Colors.primary, fontWeight: '300', marginTop: -2 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#F5E8D0' },
  heroBlock: { alignItems: 'center', marginTop: 8, marginBottom: 18 },
  heroIcon: { width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(196,149,96,0.18)', borderWidth: 1, borderColor: 'rgba(196,149,96,0.35)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  heroTitle: { fontSize: 22, fontWeight: '900', color: '#F5E8D0', letterSpacing: -0.4, textAlign: 'center' },
  heroSub: { fontSize: 12.5, color: 'rgba(245,232,208,0.7)', marginTop: 4 },

  // Billing toggle
  toggleTrack: { },
  toggleInner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(196,149,96,0.25)',
    padding: 4,
  },
  togglePill: { position: 'absolute', top: 4, bottom: 4, left: 4, borderRadius: Radius.full, backgroundColor: Colors.primary },
  toggleSeg: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10 },
  toggleTxt: { fontSize: 13, fontWeight: '700', color: 'rgba(245,232,208,0.7)' },
  toggleTxtActive: { color: Colors.brand },
  saveBadge: { backgroundColor: Colors.success, borderRadius: Radius.full, paddingHorizontal: 6, paddingVertical: 2 },
  saveTxt: { fontSize: 8, fontWeight: '900', color: Colors.white, letterSpacing: 0.3 },

  // Plans
  scroll: { padding: 16, gap: 14, paddingBottom: 24 },
  planCard: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: 16, ...Shadow.sm },
  popularBadge: { position: 'absolute', top: 0, right: 16, paddingHorizontal: 10, paddingVertical: 4, borderBottomLeftRadius: Radius.md, borderBottomRightRadius: Radius.md },
  popularTxt: { fontSize: 9, fontWeight: '900', color: Colors.brand, letterSpacing: 0.4 },
  planTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14, marginTop: 4 },
  planIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  planName: { fontSize: 16, fontWeight: '800', color: Colors.text },
  planTagline: { fontSize: 11.5, color: Colors.text2, marginTop: 2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 11, height: 11, borderRadius: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  currency: { fontSize: 18, fontWeight: '800' },
  price: { fontSize: 30, fontWeight: '900', letterSpacing: -1 },
  period: { fontSize: 12, color: Colors.text3, fontWeight: '600', marginLeft: 4 },
  divider: { height: 1, backgroundColor: Colors.border2, marginVertical: 14 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 9 },
  tick: { width: 20, height: 20, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  featureTxt: { flex: 1, fontSize: 12.5, color: Colors.text, fontWeight: '500' },

  trustRow: { flexDirection: 'row', justifyContent: 'center', gap: 22, paddingTop: 6 },
  trustItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  trustTxt: { fontSize: 11, color: Colors.text3, fontWeight: '600' },

  // Sticky CTA
  footer: { backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border2, ...Shadow.lg },
  footerInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  footerPrice: { },
  footerPlan: { fontSize: 11, color: Colors.text3, fontWeight: '600' },
  footerAmt: { fontSize: 18, fontWeight: '900', color: Colors.text },
  ctaBtn: { paddingHorizontal: 28, minWidth: 150 },
});
