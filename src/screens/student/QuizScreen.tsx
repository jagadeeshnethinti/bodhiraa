import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../theme';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Button } from '../../components/common/Button';

const questions = [
  {
    q: 'Which of the following is an example of SN2 reaction?',
    options: [
      'Tertiary alkyl halide + NaOH (aqueous)',
      'Primary alkyl halide + NaOH (alcoholic)',
      'Secondary alkyl halide + H₂O',
      'Tertiary alkyl halide + KCN',
    ],
    correct: 1,
  },
];

export const QuizScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const handleCheck = () => setAnswered(true);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      {/* Topbar */}
      <View style={styles.topbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
        <View style={styles.topCenter}>
          <Text style={styles.quizLabel}>Chemistry · Quick Quiz</Text>
          <ProgressBar value={40} variant="primary" height={4} style={{ marginTop: 4, width: 120 }} />
        </View>
        <Text style={styles.qCounter}>4/10</Text>
      </View>

      {/* Timer + Score strip */}
      <View style={styles.metaStrip}>
        <View style={styles.metaItem}>
          <Text style={styles.metaIcon}>⏱</Text>
          <Text style={styles.metaValue}>02:45</Text>
          <Text style={styles.metaLabel}>TIME LEFT</Text>
        </View>
        <View style={styles.metaDivider} />
        <View style={styles.metaItem}>
          <Text style={styles.metaIcon}>✅</Text>
          <Text style={[styles.metaValue, { color: Colors.success }]}>3</Text>
          <Text style={styles.metaLabel}>CORRECT</Text>
        </View>
        <View style={styles.metaDivider} />
        <View style={styles.metaItem}>
          <Text style={styles.metaIcon}>❌</Text>
          <Text style={[styles.metaValue, { color: Colors.danger }]}>0</Text>
          <Text style={styles.metaLabel}>WRONG</Text>
        </View>
        <View style={styles.metaDivider} />
        <View style={styles.metaItem}>
          <Text style={styles.metaIcon}>⭐</Text>
          <Text style={[styles.metaValue, { color: Colors.primary }]}>30</Text>
          <Text style={styles.metaLabel}>XP</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Question */}
        <View style={styles.questionCard}>
          <Text style={styles.qBadge}>Question 4</Text>
          <Text style={styles.question}>{questions[0].q}</Text>
        </View>

        {/* Options */}
        {questions[0].options.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrect = answered && i === questions[0].correct;
          const isWrong = answered && isSelected && i !== questions[0].correct;

          return (
            <TouchableOpacity
              key={i}
              style={[
                styles.option,
                isSelected && !answered && styles.optionSelected,
                isCorrect && styles.optionCorrect,
                isWrong && styles.optionWrong,
              ]}
              onPress={() => !answered && setSelected(i)}
              disabled={answered}
              activeOpacity={0.85}
            >
              <View style={[
                styles.optCircle,
                isSelected && !answered && styles.optCircleSelected,
                isCorrect && styles.optCircleCorrect,
                isWrong && styles.optCircleWrong,
              ]}>
                <Text style={[
                  styles.optLetter,
                  (isSelected || isCorrect) && { color: Colors.brand },
                ]}>
                  {['A', 'B', 'C', 'D'][i]}
                </Text>
              </View>
              <Text style={[
                styles.optText,
                isCorrect && { color: Colors.success },
                isWrong && { color: Colors.danger },
              ]}>
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Explanation (after answer) */}
        {answered && (
          <View style={styles.explanation}>
            <Text style={styles.explainIcon}>💡</Text>
            <View>
              <Text style={styles.explainTitle}>Explanation</Text>
              <Text style={styles.explainText}>
                SN2 reactions occur in one step with backside attack. Primary alkyl halides with strong nucleophiles in polar aprotic solvents follow SN2 mechanism.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.cta}>
        {!answered ? (
          <Button
            label="Check Answer →"
            variant="primary"
            onPress={handleCheck}
            disabled={selected === null}
          />
        ) : (
          <Button
            label="Next Question →"
            variant="primary"
            onPress={() => navigation.navigate('QuizResult', { result: { totalQuestions: 10, correct: 3, incorrect: 0, skipped: 0, score: 80, timeTaken: '12:45' } })}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  topbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.bg2,
    alignItems: 'center', justifyContent: 'center',
  },
  closeIcon:   { fontSize: 14, color: Colors.text },
  topCenter:   { alignItems: 'center' },
  quizLabel:   { fontSize: 12, fontWeight: '700', color: Colors.text },
  qCounter:    { fontSize: 14, fontWeight: '800', color: Colors.primary },
  metaStrip: {
    flexDirection: 'row', backgroundColor: Colors.white,
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.border2,
    marginBottom: 16,
  },
  metaItem:   { flex: 1, alignItems: 'center', paddingVertical: 10, gap: 2 },
  metaIcon:   { fontSize: 14 },
  metaValue:  { fontSize: 14, fontWeight: '800', color: Colors.text },
  metaLabel:  { fontSize: 8, color: Colors.text3, fontWeight: '600', letterSpacing: 0.3 },
  metaDivider:{ width: 1, backgroundColor: Colors.border2, marginVertical: 8 },
  scroll:     { padding: 16, gap: 10, paddingBottom: 16 },
  questionCard: {
    backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 16,
    borderWidth: 1, borderColor: Colors.border2, ...Shadow.sm, marginBottom: 4,
  },
  qBadge:    { fontSize: 10, fontWeight: '700', color: Colors.primary, marginBottom: 8, letterSpacing: 0.3 },
  question:  { fontSize: 15, fontWeight: '700', color: Colors.text, lineHeight: 22 },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.white, borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.border2,
    padding: 14, ...Shadow.sm,
  },
  optionSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  optionCorrect:  { borderColor: Colors.success, backgroundColor: Colors.successLight },
  optionWrong:    { borderColor: Colors.danger, backgroundColor: Colors.dangerLight },
  optCircle: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 1.5, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  optCircleSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  optCircleCorrect:  { backgroundColor: Colors.success, borderColor: Colors.success },
  optCircleWrong:    { backgroundColor: Colors.danger, borderColor: Colors.danger },
  optLetter: { fontSize: 10, fontWeight: '700', color: Colors.text3 },
  optText:   { fontSize: 12, color: Colors.text, flex: 1, lineHeight: 17 },
  explanation: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    backgroundColor: Colors.primaryLight, borderRadius: Radius.md,
    borderWidth: 1, borderColor: 'rgba(196,149,96,0.2)', padding: 12,
  },
  explainIcon:  { fontSize: 20 },
  explainTitle: { fontSize: 12, fontWeight: '700', color: Colors.primary, marginBottom: 4 },
  explainText:  { fontSize: 11, color: Colors.text, lineHeight: 17 },
  cta: { padding: 16, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border2 },
});
