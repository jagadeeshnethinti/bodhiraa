import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, TextInput, Alert, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../types';
import { Colors, Radius, Shadow } from '../../theme';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { LoadingState, ErrorState, EmptyState } from '../../components/common/ScreenStates';
import { useApi } from '../../hooks/useApi';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { StudentApi, type AnswerValue, type ApiQuizQuestion } from '../../api';

type Props = NativeStackScreenProps<StudentStackParamList, 'QuizActive'>;

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

function isAnswered(value?: AnswerValue): boolean {
  if (!value) return false;
  if (value.selected_option_ids && value.selected_option_ids.length > 0) return true;
  if (typeof value.text === 'string' && value.text.trim() !== '') return true;
  if (typeof value.boolean === 'boolean') return true;
  return false;
}

export const QuizScreen: React.FC<Props> = ({ navigation, route }) => {
  const { attemptId, quizId, title, durationMin } = route.params;
  const { data, loading, error, refetch } = useApi(signal => StudentApi.quiz(quizId, signal), [quizId]);
  const submitAction = useAsyncAction();

  const questions = useMemo(() => data?.questions ?? [], [data]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, AnswerValue>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [padOpen, setPadOpen] = useState(false);
  const [seconds, setSeconds] = useState<number | null>(durationMin ? durationMin * 60 : null);

  const submittedRef = useRef(false);

  const doSubmit = useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    const result = await submitAction.run(() => StudentApi.submit(attemptId));
    if (result) {
      navigation.replace('QuizResult', { result, quizTitle: data?.title ?? title });
    } else {
      submittedRef.current = false; // allow retry on failure
    }
  }, [attemptId, data?.title, navigation, submitAction, title]);

  // Countdown timer → auto-submit at zero.
  useEffect(() => {
    if (seconds == null) return;
    if (seconds <= 0) {
      void doSubmit();
      return;
    }
    const id = setInterval(() => setSeconds(s => (s == null ? s : Math.max(0, s - 1))), 1000);
    return () => clearInterval(id);
  }, [seconds, doSubmit]);

  const saveAnswer = useCallback(
    (q: ApiQuizQuestion, value: AnswerValue) => {
      setAnswers(prev => ({ ...prev, [q.id]: value }));
      // Fire-and-forget per api.md §6.2 (queue retries if offline → caught here).
      StudentApi.answer(attemptId, { question_id: q.id, answer: value }).catch(() => {});
    },
    [attemptId],
  );

  const toggleFlag = (qid: number) =>
    setFlagged(prev => {
      const next = new Set(prev);
      if (next.has(qid)) next.delete(qid);
      else next.add(qid);
      return next;
    });

  const answeredCount = useMemo(
    () => questions.filter(q => isAnswered(answers[q.id])).length,
    [questions, answers],
  );

  const confirmSubmit = () => {
    const remaining = questions.length - answeredCount;
    if (remaining > 0) {
      Alert.alert(
        'Submit quiz?',
        `You have ${remaining} unanswered question${remaining === 1 ? '' : 's'}. Submit anyway?`,
        [
          { text: 'Keep going', style: 'cancel' },
          { text: 'Submit', style: 'destructive', onPress: () => void doSubmit() },
        ],
      );
    } else {
      Alert.alert('Submit quiz?', 'You can’t change answers after submitting.', [
        { text: 'Review', style: 'cancel' },
        { text: 'Submit', onPress: () => void doSubmit() },
      ]);
    }
  };

  const confirmExit = () => {
    Alert.alert('Leave quiz?', 'Your answers are saved, but the attempt stays in progress.', [
      { text: 'Stay', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: () => navigation.goBack() },
    ]);
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // ── Loading / error / empty ────────────────────────────────────────────────
  if (loading && !data) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <LoadingState label="Loading questions…" />
      </SafeAreaView>
    );
  }
  if (error && !data) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ErrorState message={error} onRetry={refetch} />
      </SafeAreaView>
    );
  }
  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <EmptyState icon="edit" title="No questions" sub="This quiz has no questions to attempt." />
      </SafeAreaView>
    );
  }

  const q = questions[index];
  const value = answers[q.id];
  const isLast = index === questions.length - 1;
  const lowTime = seconds != null && seconds <= 60;

  const renderOptions = () => {
    const type = q.type;
    if (type === 'boolean') {
      return [
        { id: 1, label: 'True', val: true },
        { id: 0, label: 'False', val: false },
      ].map(opt => {
        const selected = value?.boolean === opt.val;
        return (
          <TouchableOpacity
            key={opt.label}
            style={[styles.option, selected && styles.optionSelected]}
            activeOpacity={0.85}
            onPress={() => saveAnswer(q, { boolean: opt.val })}
          >
            <View style={[styles.optCircle, selected && styles.optCircleSelected]}>
              <Text style={[styles.optLetter, selected && { color: Colors.brand }]}>{opt.label[0]}</Text>
            </View>
            <Text style={styles.optText}>{opt.label}</Text>
          </TouchableOpacity>
        );
      });
    }

    if (type === 'fill') {
      return (
        <TextInput
          style={styles.fillInput}
          placeholder="Type your answer…"
          placeholderTextColor={Colors.text3}
          defaultValue={value?.text ?? ''}
          onEndEditing={e => saveAnswer(q, { text: e.nativeEvent.text })}
          multiline
        />
      );
    }

    // mcq (single) or multi (multiple)
    const multi = type === 'multi';
    const selectedIds = value?.selected_option_ids ?? [];
    return (q.options ?? []).map((opt, i) => {
      const selected = selectedIds.includes(opt.id);
      const onPress = () => {
        if (multi) {
          const next = selected ? selectedIds.filter(id => id !== opt.id) : [...selectedIds, opt.id];
          saveAnswer(q, { selected_option_ids: next });
        } else {
          saveAnswer(q, { selected_option_ids: [opt.id] });
        }
      };
      return (
        <TouchableOpacity
          key={opt.id}
          style={[styles.option, selected && styles.optionSelected]}
          activeOpacity={0.85}
          onPress={onPress}
        >
          <View style={[styles.optCircle, selected && styles.optCircleSelected, multi && styles.optSquare]}>
            <Text style={[styles.optLetter, selected && { color: Colors.brand }]}>{LETTERS[i] ?? '•'}</Text>
          </View>
          <Text style={styles.optText}>{opt.text}</Text>
        </TouchableOpacity>
      );
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      {/* Topbar */}
      <View style={styles.topbar}>
        <TouchableOpacity onPress={confirmExit} style={styles.closeBtn}>
          <Icon name="close" size={14} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.topCenter}>
          <Text style={styles.quizLabel} numberOfLines={1}>
            {data?.title ?? title ?? 'Quiz'}
          </Text>
          <ProgressBar
            value={Math.round(((index + 1) / questions.length) * 100)}
            variant="primary"
            height={4}
            style={{ marginTop: 4, width: 140 }}
          />
        </View>
        {seconds != null ? (
          <Text style={[styles.timer, lowTime && styles.timerLow]}>{fmt(seconds)}</Text>
        ) : (
          <Text style={styles.qCounter}>
            {index + 1}/{questions.length}
          </Text>
        )}
      </View>

      <ScrollView
        style={styles.flex1}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
      >
        <View style={styles.questionCard}>
          <View style={styles.qHeader}>
            <Text style={styles.qBadge}>
              Question {index + 1} of {questions.length}
              {q.marks ? ` · ${q.marks} mark${q.marks === 1 ? '' : 's'}` : ''}
            </Text>
            <TouchableOpacity onPress={() => toggleFlag(q.id)} hitSlop={hit} style={styles.flagBtn}>
              <Icon name="flag" size={12} color={flagged.has(q.id) ? Colors.warning : Colors.text3} />
              <Text style={[styles.flag, flagged.has(q.id) && styles.flagOn]}>
                {flagged.has(q.id) ? 'Flagged' : 'Flag'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.question}>{q.text}</Text>
          {q.type === 'multi' ? <Text style={styles.hint}>Select all that apply.</Text> : null}
        </View>

        {renderOptions()}
        </ScrollView>

      {/* Bottom nav */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.navBtn, index === 0 && styles.navBtnDisabled]}
          disabled={index === 0}
          onPress={() => setIndex(i => Math.max(0, i - 1))}
        >
          <Text style={styles.navTxt}>‹ Prev</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.padBtn} onPress={() => setPadOpen(true)}>
          <Text style={styles.padTxt}>
            {answeredCount}/{questions.length}
          </Text>
        </TouchableOpacity>

        {isLast ? (
          <View style={styles.submitWrap}>
            <Button
              label={submitAction.submitting ? 'Submitting…' : 'Submit'}
              variant="primary"
              size="sm"
              fullWidth={false}
              loading={submitAction.submitting}
              disabled={submitAction.submitting}
              onPress={confirmSubmit}
            />
          </View>
        ) : (
          <TouchableOpacity style={styles.navBtn} onPress={() => setIndex(i => Math.min(questions.length - 1, i + 1))}>
            <Text style={styles.navTxt}>Next ›</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Question pad */}
      <Modal visible={padOpen} transparent animationType="fade" onRequestClose={() => setPadOpen(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setPadOpen(false)}>
          <View style={styles.padSheet}>
            <Text style={styles.padTitle}>Questions</Text>
            <View style={styles.padGrid}>
              {questions.map((qq, i) => {
                const ans = isAnswered(answers[qq.id]);
                const flg = flagged.has(qq.id);
                return (
                  <TouchableOpacity
                    key={qq.id}
                    style={[styles.padCell, ans && styles.padCellAns, flg && styles.padCellFlag, i === index && styles.padCellCurrent]}
                    onPress={() => {
                      setIndex(i);
                      setPadOpen(false);
                    }}
                  >
                    <Text style={[styles.padCellTxt, ans && { color: Colors.white }]}>{i + 1}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
                <Text style={styles.legendTxt}>Answered</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.warning }]} />
                <Text style={styles.legendTxt}>Flagged</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.border }]} />
                <Text style={styles.legendTxt}>Unanswered</Text>
              </View>
            </View>
            <Button label="Submit quiz" variant="primary" onPress={() => { setPadOpen(false); confirmSubmit(); }} />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const hit = { top: 8, bottom: 8, left: 8, right: 8 };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  flex1: { flex: 1 },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border2,
  },
  closeBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.bg2, alignItems: 'center', justifyContent: 'center' },
  topCenter: { alignItems: 'center', flex: 1 },
  quizLabel: { fontSize: 12, fontWeight: '700', color: Colors.text, maxWidth: 180 },
  qCounter: { fontSize: 14, fontWeight: '800', color: Colors.primary, minWidth: 44, textAlign: 'right' },
  timer: { fontSize: 14, fontWeight: '800', color: Colors.text, minWidth: 50, textAlign: 'right' },
  timerLow: { color: Colors.danger },
  scroll: { padding: 16, gap: 10, paddingBottom: 16 },
  questionCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border2,
    ...Shadow.sm,
    marginBottom: 4,
  },
  qHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  qBadge: { fontSize: 10, fontWeight: '700', color: Colors.primary, letterSpacing: 0.3, flex: 1 },
  flagBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  flag: { fontSize: 11, fontWeight: '700', color: Colors.text3 },
  flagOn: { color: Colors.warning },
  question: { fontSize: 15, fontWeight: '700', color: Colors.text, lineHeight: 22 },
  hint: { fontSize: 11, color: Colors.text3, marginTop: 6 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border2,
    padding: 14,
    ...Shadow.sm,
  },
  optionSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  optCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  optSquare: { borderRadius: 6 },
  optCircleSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  optLetter: { fontSize: 10, fontWeight: '700', color: Colors.text3 },
  optText: { fontSize: 13, color: Colors.text, flex: 1, lineHeight: 19 },
  fillInput: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 14,
    fontSize: 14,
    color: Colors.text,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border2,
  },
  navBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: Radius.md,
    backgroundColor: Colors.bg2,
  },
  navBtnDisabled: { opacity: 0.45 },
  navTxt: { fontSize: 13, fontWeight: '700', color: Colors.text },
  padBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  padTxt: { fontSize: 13, fontWeight: '800', color: Colors.primaryDark },
  submitWrap: { flex: 1, alignItems: 'stretch' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  padSheet: { backgroundColor: Colors.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, gap: 14 },
  padTitle: { fontSize: 16, fontWeight: '800', color: Colors.text },
  padGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  padCell: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  padCellAns: { backgroundColor: Colors.success, borderColor: Colors.success },
  padCellFlag: { borderColor: Colors.warning, borderWidth: 2 },
  padCellCurrent: { borderColor: Colors.primary, borderWidth: 2 },
  padCellTxt: { fontSize: 13, fontWeight: '800', color: Colors.text },
  legendRow: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendTxt: { fontSize: 11, color: Colors.text2 },
});
