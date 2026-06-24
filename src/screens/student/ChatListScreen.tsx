import React, { useState } from 'react';
import {
  View, Text, StyleSheet, StatusBar, TouchableOpacity, ScrollView, RefreshControl, Modal, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../theme';
import { LoadingState, ErrorState, EmptyState } from '../../components/common/ScreenStates';
import { Entrance } from '../../components/common/anim';
import { Icon } from '../../components/common/Icon';
import { useApi } from '../../hooks/useApi';
import { ChatApi } from '../../api';
import type { ApiChatContact } from '../../api';

const initials = (name: string) =>
  name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';

const AVATAR_TINTS = ['#FBF1E2', '#E8F0FE', '#E9F8EF', '#FDEBF1', '#F0ECFB'];
const AVATAR_INK = ['#A87840', '#3B6FD4', '#1F9254', '#C2407A', '#6D4FC2'];

const Avatar: React.FC<{ name: string; seed: number; size?: number }> = ({ name, seed, size = 50 }) => {
  const i = seed % AVATAR_TINTS.length;
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: AVATAR_TINTS[i] }]}>
      <Text style={[styles.avatarTxt, { color: AVATAR_INK[i], fontSize: size * 0.36 }]}>{initials(name)}</Text>
    </View>
  );
};

export const ChatListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const convos = useApi(signal => ChatApi.conversations(signal), []);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [starting, setStarting] = useState(false);
  const contacts = useApi(signal => (pickerOpen ? ChatApi.contacts(signal) : Promise.resolve([])), [pickerOpen]);

  const openThread = (conversationId: number, partnerName: string) =>
    navigation.navigate('ChatThread', { conversationId, partnerName });

  const startChat = async (c: ApiChatContact) => {
    if (starting) return;
    setStarting(true);
    try {
      const res = c.start === 'with-teacher'
        ? await ChatApi.startWithTeacher(c.student.id)
        : await ChatApi.startWithParent(c.student.id);
      setPickerOpen(false);
      openThread(res.id, c.partner.name);
      convos.refetch();
    } catch {
      // Surface nothing fancy — the picker stays open so they can retry.
    } finally {
      setStarting(false);
    }
  };

  const list = convos.data ?? [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <View style={styles.header}>
        <Text style={styles.heading}>Messages</Text>
        <TouchableOpacity style={styles.newBtn} onPress={() => setPickerOpen(true)} activeOpacity={0.85}>
          <Icon name="edit" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      {convos.loading && !convos.data ? (
        <LoadingState />
      ) : convos.error && !convos.data ? (
        <ErrorState message={convos.error} onRetry={convos.refetch} />
      ) : list.length === 0 ? (
        <EmptyState icon="chat" title="No conversations yet" sub="Tap the compose button to start a chat." />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={convos.refreshing} onRefresh={convos.refetch} tintColor={Colors.primary} />}
        >
          {list.map((c, i) => (
            <Entrance key={c.id} index={i}>
              <TouchableOpacity
                style={styles.row}
                activeOpacity={0.7}
                onPress={() => openThread(c.id, c.partner?.name ?? 'Chat')}
              >
                <Avatar name={c.partner?.name ?? '?'} seed={c.id} />
                <View style={styles.rowMid}>
                  <View style={styles.rowTop}>
                    <Text style={styles.name} numberOfLines={1}>{c.partner?.name ?? 'Unknown'}</Text>
                    {c.preview?.time ? <Text style={styles.time}>{c.preview.time}</Text> : null}
                  </View>
                  <View style={styles.rowBottom}>
                    <Text style={[styles.preview, c.unread_count > 0 && styles.previewUnread]} numberOfLines={1}>
                      {c.preview ? (c.preview.mine ? 'You: ' : '') + c.preview.body : c.partner?.role_label ?? ''}
                    </Text>
                    {c.unread_count > 0 ? (
                      <View style={styles.badge}><Text style={styles.badgeTxt}>{c.unread_count}</Text></View>
                    ) : null}
                  </View>
                </View>
              </TouchableOpacity>
            </Entrance>
          ))}
        </ScrollView>
      )}

      {/* New-chat picker */}
      <Modal visible={pickerOpen} animationType="slide" transparent onRequestClose={() => setPickerOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Start a conversation</Text>
            {contacts.loading ? (
              <ActivityIndicator color={Colors.primary} style={{ marginVertical: 24 }} />
            ) : (contacts.data ?? []).length === 0 ? (
              <Text style={styles.sheetEmpty}>No contacts available yet.</Text>
            ) : (
              <ScrollView style={{ maxHeight: 380 }}>
                {(contacts.data ?? []).map((c, i) => (
                  <TouchableOpacity key={`${c.partner.id}-${c.student.id}`} style={styles.contactRow} activeOpacity={0.7} onPress={() => startChat(c)} disabled={starting}>
                    <Avatar name={c.partner.name} seed={c.partner.id} size={42} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.contactName}>{c.partner.name}</Text>
                      <Text style={styles.contactSub}>{c.partner.role_label} · re: {c.student.name}</Text>
                    </View>
                    <Icon name="forward" size={16} color={Colors.text3} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            <TouchableOpacity style={styles.closeBtn} onPress={() => setPickerOpen(false)}>
              <Text style={styles.closeTxt}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  heading: { fontSize: 24, fontWeight: '900', color: Colors.text, letterSpacing: -0.5 },
  newBtn: { width: 40, height: 40, borderRadius: 14, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', ...Shadow.sm },

  content: { paddingHorizontal: 12, paddingBottom: 24, gap: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: Colors.card, borderRadius: Radius.md, padding: 12, borderWidth: 1, borderColor: Colors.border2 },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontWeight: '800' },
  rowMid: { flex: 1, gap: 4 },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  name: { fontSize: 14.5, fontWeight: '800', color: Colors.text, flex: 1 },
  time: { fontSize: 11, color: Colors.text3, fontWeight: '600' },
  rowBottom: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  preview: { fontSize: 12.5, color: Colors.text2, flex: 1 },
  previewUnread: { color: Colors.text, fontWeight: '700' },
  badge: { minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 6, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  badgeTxt: { color: '#fff', fontSize: 11, fontWeight: '800' },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(20,8,11,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18, paddingBottom: 28 },
  sheetHandle: { alignSelf: 'center', width: 42, height: 5, borderRadius: 3, backgroundColor: Colors.border, marginBottom: 14 },
  sheetTitle: { fontSize: 16, fontWeight: '800', color: Colors.text, marginBottom: 10 },
  sheetEmpty: { fontSize: 13, color: Colors.text2, textAlign: 'center', marginVertical: 24 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: Colors.border2 },
  contactName: { fontSize: 14, fontWeight: '700', color: Colors.text },
  contactSub: { fontSize: 12, color: Colors.text2, marginTop: 1 },
  closeBtn: { marginTop: 14, alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 24 },
  closeTxt: { fontSize: 14, fontWeight: '700', color: Colors.text2 },
});
