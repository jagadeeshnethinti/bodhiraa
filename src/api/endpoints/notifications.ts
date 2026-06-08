import { api } from '../client';
import type { ApiMeta, ApiNotification } from '../types';

export interface NotificationPage {
  items: ApiNotification[];
  meta: ApiMeta | null;
}

export const NotificationsApi = {
  /** Paginated, newest first, 25 per page. `meta.unread_count` drives the badge. */
  async list(page = 1, signal?: AbortSignal): Promise<NotificationPage> {
    const res = await api.get<ApiNotification[]>('/me/notifications', { query: { page }, signal });
    return { items: res.data, meta: res.meta };
  },

  async markRead(id: string): Promise<void> {
    await api.post(`/me/notifications/${id}/read`);
  },

  async markAllRead(): Promise<number> {
    const res = await api.post<{ marked: number }>('/me/notifications/read-all');
    return res.data?.marked ?? 0;
  },
};
