export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Notification {
  id: string;
  userId: string | null;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  category: string | null;
  isRead: boolean;
  readAt: string | null;
  metadata: Record<string, unknown> | null;
  actionUrl: string | null;
  actionLabel: string | null;
  createdAt: string;
}

export interface NotificationListResponse {
  data: Notification[];
  meta: {
    total: number;
    unreadCount: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export interface NotificationQuery {
  page?: number;
  limit?: number;
  isRead?: boolean;
}