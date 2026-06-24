import { api } from '../client';
import type {
  ApiChatContact,
  ApiChatMessage,
  ApiChatStartResult,
  ApiChatThread,
  ApiConversation,
} from '../types';

/**
 * Parent ↔ teacher direct messaging. Shared by both roles — the backend gates
 * which contacts each user may start a chat with.
 */
export const ChatApi = {
  /** My conversations, newest activity first. */
  conversations: (signal?: AbortSignal) =>
    api.getData<ApiConversation[]>('/chat', { signal }),

  /** People I can start a new chat with (parents ↔ teachers via my students). */
  contacts: (signal?: AbortSignal) =>
    api.getData<ApiChatContact[]>('/chat/contacts', { signal }),

  /** Open a thread (also marks the partner's messages read server-side). */
  thread: (conversationId: number, signal?: AbortSignal) =>
    api.getData<ApiChatThread>(`/chat/${conversationId}`, { signal }),

  /** Send a message; resolves to the created message. */
  send: (conversationId: number, body: string) =>
    api.post<ApiChatMessage>(`/chat/${conversationId}/messages`, { body }).then(r => r.data),

  /** Parent: open/create the chat with a child's class teacher. */
  startWithTeacher: (studentId: number) =>
    api.post<ApiChatStartResult>(`/chat/with-teacher/${studentId}`).then(r => r.data),

  /** Teacher: open/create the chat with a student's parent. */
  startWithParent: (studentId: number) =>
    api.post<ApiChatStartResult>(`/chat/with-parent/${studentId}`).then(r => r.data),
};
