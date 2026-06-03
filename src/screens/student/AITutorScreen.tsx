import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, KeyboardAvoidingView, Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../theme';

const messages = [
  { from: 'user', text: 'What is the difference between SN1 and SN2 reactions?' },
  {
    from: 'ai',
    text: 'Great question! 🎓\n\nSN1 (Substitution Nucleophilic Unimolecular):\n• Two-step reaction\n• Forms carbocation intermediate\n• Rate depends only on substrate\n• Favored by tertiary carbons\n\nSN2 (Substitution Nucleophilic Bimolecular):\n• One-step concerted reaction\n• Backside attack by nucleophile\n• Rate depends on both substrate and nucleophile\n• Favored by primary carbons\n\nWant me to explain with an example? 🔬',
  },
  { from: 'user', text: 'Yes please! Show me an example of SN2' },
];

const suggestions = [
  'Explain SN1 mechanism', 'Draw reaction mechanism', 'Practice questions', 'Compare with elimination',
];

export const AITutorScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#1A0A0C" />

      {/* Gradient header with top safe area */}
      <LinearGradient
        colors={['#1A0A0C', '#2A0E13', '#3D1520']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.topbar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backIcon}>‹</Text>
            </TouchableOpacity>
            <View style={styles.aiInfo}>
              <View style={styles.aiAvatar}>
                <Text style={{ fontSize: 18 }}>🤖</Text>
              </View>
              <View>
                <Text style={styles.aiName}>Bodhira AI</Text>
                <Text style={styles.aiStatus}>● Online · Powered by AI</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.histBtn}><Text style={{ fontSize: 16, color: Colors.primary }}>📋</Text></TouchableOpacity>
          </View>

          {/* Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
            {['Doubt Solver', 'AI Chat', 'Smart Search', 'Recommendations'].map((t, i) => (
              <TouchableOpacity
                key={t}
                style={[styles.tabChip, activeTab === i && styles.tabChipActive]}
                onPress={() => setActiveTab(i)}
              >
                <Text style={[styles.tabChipText, activeTab === i && styles.tabChipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      {/* Messages */}
      <ScrollView
        contentContainerStyle={styles.messages}
        showsVerticalScrollIndicator={false}
        style={styles.messagesList}
      >
        {/* AI greeting */}
        <View style={styles.aiGreeting}>
          <View style={styles.aiGreetAvatar}><Text style={{ fontSize: 22 }}>🤖</Text></View>
          <View style={styles.aiBubble}>
            <Text style={styles.aiBubbleText}>
              Hi Arjun! 👋 I'm your AI tutor. Ask me any doubt about your subjects — Chemistry, Maths, Physics, or any topic!
            </Text>
          </View>
        </View>

        {/* Suggestion chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestions}>
          {suggestions.map((s, i) => (
            <TouchableOpacity key={i} style={styles.suggestionChip}>
              <Text style={styles.suggestionText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Chat messages */}
        {messages.map((m, i) => (
          <View
            key={i}
            style={[
              styles.messageRow,
              m.from === 'user' ? styles.messageRowUser : styles.messageRowAI,
            ]}
          >
            {m.from === 'ai' && (
              <View style={styles.aiMsgAvatar}><Text style={{ fontSize: 14 }}>🤖</Text></View>
            )}
            <View
              style={[
                styles.messageBubble,
                m.from === 'user' ? styles.userBubble : styles.aiBubbleMsg,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  m.from === 'user' ? { color: '#F5E8D0' } : { color: Colors.text },
                ]}
              >
                {m.text}
              </Text>
            </View>
          </View>
        ))}

        {/* Typing indicator */}
        <View style={styles.messageRowAI}>
          <View style={styles.aiMsgAvatar}><Text style={{ fontSize: 14 }}>🤖</Text></View>
          <View style={[styles.messageBubble, styles.aiBubbleMsg, styles.typingBubble]}>
            <Text style={styles.typingDots}>● ● ●</Text>
          </View>
        </View>
      </ScrollView>

      {/* Chat Input with bottom safe area */}
      <SafeAreaView edges={['bottom']} style={styles.inputSafeArea}>
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.attachBtn}><Text style={{ fontSize: 18 }}>📎</Text></TouchableOpacity>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="Ask any doubt…"
              placeholderTextColor={Colors.text3}
              value={input}
              onChangeText={setInput}
              multiline
            />
          </View>
          <TouchableOpacity style={styles.sendBtn}>
            <Text style={{ fontSize: 18, color: Colors.primary }}>➤</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: Colors.bg },
  topbar:      { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12 },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(196,149,96,0.15)', borderWidth: 1, borderColor: 'rgba(196,149,96,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { fontSize: 22, color: '#F5E8D0', fontWeight: '300' },
  aiInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  aiAvatar: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: 'rgba(196,149,96,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  aiName:   { fontSize: 15, fontWeight: '800', color: '#F5E8D0' },
  aiStatus: { fontSize: 10, color: 'rgba(196,149,96,0.75)', marginTop: 1 },
  histBtn:  { padding: 4 },
  tabs:     { flexDirection: 'row', gap: 6, paddingHorizontal: 16, paddingBottom: 14 },
  tabChip: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(196,149,96,0.12)',
    borderWidth: 1, borderColor: 'rgba(196,149,96,0.2)',
  },
  tabChipActive:     { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabChipText:       { fontSize: 11, fontWeight: '600', color: 'rgba(245,232,208,0.7)' },
  tabChipTextActive: { color: Colors.brand },
  messagesList: { flex: 1 },
  messages:    { padding: 16, gap: 12, paddingBottom: 8 },
  aiGreeting:  { flexDirection: 'row', gap: 10, alignItems: 'flex-end' },
  aiGreetAvatar: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  aiBubble: {
    flex: 1, backgroundColor: Colors.primaryLight,
    borderRadius: 18, borderBottomLeftRadius: 4, padding: 12,
    borderWidth: 1, borderColor: 'rgba(196,149,96,0.2)',
  },
  aiBubbleText:  { fontSize: 12, color: Colors.text, lineHeight: 18 },
  suggestions:   { gap: 6, paddingVertical: 4 },
  suggestionChip: {
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border,
  },
  suggestionText: { fontSize: 11, fontWeight: '600', color: Colors.text2 },
  messageRow:     { flexDirection: 'row', gap: 8, alignItems: 'flex-end' },
  messageRowUser: { justifyContent: 'flex-end' },
  messageRowAI:   { justifyContent: 'flex-start' },
  aiMsgAvatar: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  messageBubble: { maxWidth: '80%', padding: 10, borderRadius: 18 },
  userBubble: { backgroundColor: Colors.brand, borderBottomRightRadius: 4 },
  aiBubbleMsg: {
    backgroundColor: Colors.white, borderBottomLeftRadius: 4,
    borderWidth: 1, borderColor: Colors.border2,
  },
  messageText:  { fontSize: 12, lineHeight: 18 },
  typingBubble: { paddingVertical: 12 },
  typingDots:   { color: Colors.primary, fontSize: 10, letterSpacing: 3 },
  inputSafeArea: {
    backgroundColor: Colors.white,
    borderTopWidth: 1, borderTopColor: 'rgba(42,14,19,0.05)',
  },
  inputBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 10, paddingHorizontal: 12,
  },
  attachBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.bg2, alignItems: 'center', justifyContent: 'center',
  },
  inputWrap: {
    flex: 1, backgroundColor: Colors.bg2, borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  input:   { fontSize: 13.5, color: Colors.text, maxHeight: 100 },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.brand, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.brand, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 14, elevation: 4,
  },
});
