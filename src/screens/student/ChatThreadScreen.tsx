import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, StatusBar, TouchableOpacity, ScrollView, TextInput,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../theme';
import { LoadingState, ErrorState } from '../../components/common/ScreenStates';
import { Icon } from '../../components/common/Icon';
import { ChatApi, ApiError } from '../../api';
import type { ApiChatMessage, ApiChatPartner } from '../../api';

const initials = (name: string) =>
  name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';

export const ChatThreadScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const conversationId: number = route.params?.conversationId;
  const fallbackName: string = route.params?.partnerName ?? 'Chat';

  const [messages, setMessages] = useState<ApiChatMessage[]>([]);
  const [partner, setPartner] = useState<ApiChatPartner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const thread = await ChatApi.thread(conversationId);
      setMessages(thread.messages ?? []);
      setPartner(thread.conversation?.partner ?? null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not load this conversation.');
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(t);
  }, [messages.length]);

  const onSend = async () => {
    const body = input.trim();
    if (!body || sending) return;
    setInput('');
    setSending(true);

    const tempId = -Date.now();
    const optimistic: ApiChatMessage = {
      id: tempId, body, mine: true, read: false, created_at: null,
      time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, optimistic]);

    try {
      const saved = await ChatApi.send(conversationId, body);
      setMessages(prev => prev.map(m => (m.id === tempId ? saved : m)));
    } catch {
      // Roll back the optimistic bubble and restore the text for a retry.
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setInput(body);
    } finally {
      setSending(false);
    }
  };

  const name = partner?.name ?? fallbackName;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.card} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={10}>
          <Icon name="forward" size={20} color={Colors.text} style={styles.backIcon} />
        </TouchableOpacity>
        <View style={styles.headAvatar}><Text style={styles.headAvatarTxt}>{initials(name)}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headName} numberOfLines={1}>{name}</Text>
          {partner?.role_label ? <Text style={styles.headRole}>{partner.role_label}</Text> : null}
        </View>
      </View>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
          <ScrollView ref={scrollRef} contentContainerStyle={styles.messages} showsVerticalScrollIndicator={false}>
            {messages.length === 0 ? (
              <Text style={styles.emptyHint}>Say hello 👋 — this is the start of your conversation.</Text>
            ) : (
              messages.map(m => (
                <View key={m.id} style={[styles.bubbleRow, m.mine ? styles.rowMine : styles.rowTheirs]}>
                  <View style={[styles.bubble, m.mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                    <Text style={[styles.bubbleText, m.mine && styles.bubbleTextMine]}>{m.body}</Text>
                    <Text style={[styles.bubbleTime, m.mine && styles.bubbleTimeMine]}>{m.time}</Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              placeholder="Type a message…"
              placeholderTextColor={Colors.text3}
              value={input}
              onChangeText={setInput}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnOff]}
              onPress={onSend}
              disabled={!input.trim() || sending}
              activeOpacity={0.85}
            >
              {sending ? <ActivityIndicator color="#fff" size="small" /> : <Icon name="send" size={18} color="#fff" />}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border2 },
  backBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  backIcon: { transform: [{ rotate: '180deg' }] },
  headAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FBF1E2', alignItems: 'center', justifyContent: 'center' },
  headAvatarTxt: { color: '#A87840', fontWeight: '800', fontSize: 15 },
  headName: { fontSize: 15.5, fontWeight: '800', color: Colors.text },
  headRole: { fontSize: 11.5, color: Colors.text2, marginTop: 1 },

  messages: { padding: 14, gap: 8, paddingBottom: 12 },
  emptyHint: { textAlign: 'center', color: Colors.text2, fontSize: 13, marginTop: 40 },
  bubbleRow: { flexDirection: 'row' },
  rowMine: { justifyContent: 'flex-end' },
  rowTheirs: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '80%', borderRadius: 16, paddingHorizontal: 13, paddingVertical: 9, ...Shadow.sm },
  bubbleMine: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  bubbleTheirs: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border2, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 14, color: Colors.text, lineHeight: 20 },
  bubbleTextMine: { color: '#fff' },
  bubbleTime: { fontSize: 10, color: Colors.text3, marginTop: 4, alignSelf: 'flex-end' },
  bubbleTimeMine: { color: 'rgba(255,255,255,0.75)' },

  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 9, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: Colors.card, borderTopWidth: 1, borderTopColor: Colors.border2 },
  input: { flex: 1, maxHeight: 120, minHeight: 44, backgroundColor: Colors.bg, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border2, paddingHorizontal: 14, paddingTop: 11, paddingBottom: 11, fontSize: 14, color: Colors.text },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', ...Shadow.sm },
  sendBtnOff: { opacity: 0.45 },
});
