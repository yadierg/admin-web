export interface Session {
  id: string;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}