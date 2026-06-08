import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar, Modal, ActivityIndicator, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius } from '../../theme';
import { Icon } from '../../components/common/Icon';
import { useKeyboard } from '../../hooks/useKeyboard';
import { StudentApi, ApiError, type ApiAiMessage, type ApiAiSessionSummary } from '../../api';
import { useAuth } from '../../context/AuthContext';

export const AITutorScreen: React.FC<{ navigation: any }> = () => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const keyboard = useKeyboard();
  // iOS: lift the composer by the keyboard height (no KeyboardAvoidingView).
  // Android: adjustResize already moved it, so keep the safe-area inset.
  const composerPad = Platform.OS === 'ios' && keyboard.visible ? keyboard.height : insets.bottom;
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ApiAiMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [sessions, setSessions] = useState<ApiAiSessionSummary[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  const tempId = useRef(-1);
  const scrollRef = useRef<ScrollView>(null);
  const cooldownTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const openSession = useCallback(async (id: number) => {
    setLoadingHistory(true);
    try {
      const detail = await StudentApi.aiSession(id);
      setSessionId(id);
      setMessages(detail.messages ?? []);
    } catch {
      /* ignore */
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  // Initial load: most recent session + recommendations.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const list = await StudentApi.aiSessions();
        if (!active) return;
        setSessions(list);
        if (list.length > 0) await openSession(list[0].id);
      } catch {
        /* non-fatal — user can still start a fresh chat */
      }
      try {
        const recs = await StudentApi.aiRecommendations();
        if (active) setRecommendations(recs ?? []);
      } catch {
        /* optional */
      }
    })();
    return () => {
      active = false;
      if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    };
  }, [openSession]);

  useEffect(() => {
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
    return () => clearTimeout(t);
  }, [messages]);

  const startCooldown = (seconds: number) => {
    setCooldown(seconds);
    if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    cooldownTimer.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1 && cooldownTimer.current) {
          clearInterval(cooldownTimer.current);
          cooldownTimer.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const send = async (text: string) => {
    const body = text.trim();
    if (!body || sending || cooldown > 0) return;
    setInput('');
    setSending(true);

    const optimistic: ApiAiMessage = { id: tempId.current--, role: 'user', content: body, created_at: '' };
    setMessages(prev => [...prev, optimistic]);

    try {
      let id = sessionId;
      if (id == null) {
        // Create the session first so there is always an id to send into.
        const created = await StudentApi.createAiSession();
        id = (created as { id: number }).id;
        setSessionId(id);
        const seeded = (created as { messages?: ApiAiMessage[] }).messages;
        if (Array.isArray(seeded)) setMessages([...seeded, optimistic]);
      }
      const reply = await StudentApi.aiSend(id, body);
      setMessages(prev => {
        const withoutTemp = prev.filter(m => m.id !== optimistic.id);
        return [...withoutTemp, reply.user, reply.assistant];
      });
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      setInput(body);
      if (err instanceof ApiError && err.kind === 'rate_limited') startCooldown(err.retryAfter ?? 30);
    } finally {
      setSending(false);
    }
  };

  const newChat = () => {
    setSessionId(null);
    setMessages([]);
    setInput('');
  };

  const conversationEmpty = messages.length === 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A0A0C" />

      <LinearGradient colors={['#1A0A0C', '#2A0E13', '#3D1520']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <SafeAreaView edges={['top']}>
          <View style={styles.topbar}>
            <View style={styles.aiInfo}>
              <View style={styles.aiAvatar}>
                <Icon name="robot" size={18} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.aiName}>Bodhira AI</Text>
                <Text style={styles.aiStatus}>● Online · Doubt Solver</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerBtn} onPress={newChat}>
                <Text style={styles.headerBtnTxt}>＋ New</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerIconBtn} onPress={() => setHistoryOpen(true)}>
                <Icon name="clock" size={16} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.messages}
        showsVerticalScrollIndicator={false}
        style={styles.messagesList}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        {loadingHistory ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 24 }} />
        ) : (
          <>
            <View style={styles.aiGreeting}>
              <View style={styles.aiGreetAvatar}>
                <Icon name="robot" size={22} color={Colors.primary} />
              </View>
              <View style={styles.aiBubble}>
                <Text style={styles.aiBubbleText}>
                  Hi {user?.name?.split(' ')[0] ?? 'there'}! I'm your AI tutor. Ask me any doubt — Chemistry,
                  Maths, Physics, or any topic.
                </Text>
              </View>
            </View>

            {conversationEmpty && recommendations.length > 0 && (
              <View style={styles.suggestions}>
                {recommendations.slice(0, 6).map((s, i) => (
                  <TouchableOpacity key={i} style={styles.suggestionChip} onPress={() => send(s)}>
                    <Text style={styles.suggestionText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {messages.map(m => (
              <View key={m.id} style={[styles.messageRow, m.role === 'user' ? styles.messageRowUser : styles.messageRowAI]}>
                {m.role === 'assistant' && (
                  <View style={styles.aiMsgAvatar}>
                    <Icon name="robot" size={14} color={Colors.primary} />
                  </View>
                )}
                <View style={[styles.messageBubble, m.role === 'user' ? styles.userBubble : styles.aiBubbleMsg]}>
                  <Text style={[styles.messageText, { color: m.role === 'user' ? '#F5E8D0' : Colors.text }]}>{m.content}</Text>
                </View>
              </View>
            ))}

            {sending && (
              <View style={styles.messageRowAI}>
                <View style={styles.aiMsgAvatar}>
                  <Icon name="robot" size={14} color={Colors.primary} />
                </View>
                <View style={[styles.messageBubble, styles.aiBubbleMsg, styles.typingBubble]}>
                  <Text style={styles.typingDots}>● ● ●</Text>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <View style={[styles.inputSafeArea, { paddingBottom: composerPad }]}>
        {cooldown > 0 && <Text style={styles.cooldown}>Slow down — you've been busy. Try again in {cooldown}s.</Text>}
        <View style={styles.inputBar}>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="Ask any doubt…"
              placeholderTextColor={Colors.text3}
              value={input}
              onChangeText={setInput}
              multiline
              editable={cooldown === 0}
            />
          </View>
          <TouchableOpacity
            style={[styles.sendBtn, (sending || cooldown > 0 || !input.trim()) && styles.sendBtnDisabled]}
            onPress={() => send(input)}
            disabled={sending || cooldown > 0 || !input.trim()}
          >
            <Icon name="send" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={historyOpen} transparent animationType="slide" onRequestClose={() => setHistoryOpen(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setHistoryOpen(false)}>
          <View style={styles.historySheet}>
            <Text style={styles.historyTitle}>Recent chats</Text>
            {sessions.length === 0 ? (
              <Text style={styles.historyEmpty}>No previous chats yet.</Text>
            ) : (
              <ScrollView style={{ maxHeight: 380 }}>
                {sessions.map(s => (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.historyRow, s.id === sessionId && styles.historyRowActive]}
                    onPress={() => {
                      setHistoryOpen(false);
                      void openSession(s.id);
                    }}
                  >
                    <Text style={styles.historyRowTitle} numberOfLines={1}>
                      {s.title ?? 'Untitled chat'}
                    </Text>
                    {s.messages_count != null ? <Text style={styles.historyRowMeta}>{s.messages_count} messages</Text> : null}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  topbar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12 },
  aiInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  aiAvatar: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(196,149,96,0.2)', alignItems: 'center', justifyContent: 'center' },
  aiName: { fontSize: 15, fontWeight: '800', color: '#F5E8D0' },
  aiStatus: { fontSize: 10, color: 'rgba(196,149,96,0.75)', marginTop: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.full, backgroundColor: 'rgba(196,149,96,0.18)', borderWidth: 1, borderColor: 'rgba(196,149,96,0.3)' },
  headerBtnTxt: { fontSize: 11, fontWeight: '800', color: Colors.primary },
  headerIconBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(196,149,96,0.12)', alignItems: 'center', justifyContent: 'center' },
  messagesList: { flex: 1 },
  messages: { padding: 16, gap: 12, paddingBottom: 8 },
  aiGreeting: { flexDirection: 'row', gap: 10, alignItems: 'flex-end' },
  aiGreetAvatar: { width: 34, height: 34, borderRadius: 10, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  aiBubble: { flex: 1, backgroundColor: Colors.primaryLight, borderRadius: 18, borderBottomLeftRadius: 4, padding: 12, borderWidth: 1, borderColor: 'rgba(196,149,96,0.2)' },
  aiBubbleText: { fontSize: 12, color: Colors.text, lineHeight: 18 },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingVertical: 4 },
  suggestionChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.full, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border },
  suggestionText: { fontSize: 11, fontWeight: '600', color: Colors.text2 },
  messageRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-end' },
  messageRowUser: { justifyContent: 'flex-end' },
  messageRowAI: { justifyContent: 'flex-start' },
  aiMsgAvatar: { width: 28, height: 28, borderRadius: 8, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  messageBubble: { maxWidth: '80%', padding: 10, borderRadius: 18 },
  userBubble: { backgroundColor: Colors.brand, borderBottomRightRadius: 4 },
  aiBubbleMsg: { backgroundColor: Colors.white, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: Colors.border2 },
  messageText: { fontSize: 12.5, lineHeight: 19 },
  typingBubble: { paddingVertical: 12 },
  typingDots: { color: Colors.primary, fontSize: 10, letterSpacing: 3 },
  inputSafeArea: { backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: 'rgba(42,14,19,0.05)' },
  cooldown: { fontSize: 11, color: Colors.warning, textAlign: 'center', paddingTop: 8, fontWeight: '600' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, padding: 10, paddingHorizontal: 12 },
  inputWrap: { flex: 1, backgroundColor: Colors.bg2, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10 },
  input: { fontSize: 13.5, color: Colors.text, maxHeight: 100, padding: 0 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.brand, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.5 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  historySheet: { backgroundColor: Colors.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, gap: 10 },
  historyTitle: { fontSize: 16, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  historyEmpty: { fontSize: 12, color: Colors.text3, paddingVertical: 12 },
  historyRow: { paddingVertical: 12, paddingHorizontal: 14, borderRadius: Radius.md, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border2, marginBottom: 8 },
  historyRowActive: { borderColor: Colors.primary },
  historyRowTitle: { fontSize: 13, fontWeight: '700', color: Colors.text },
  historyRowMeta: { fontSize: 10, color: Colors.text3, marginTop: 2 },
});
