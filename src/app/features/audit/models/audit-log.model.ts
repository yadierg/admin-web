export interface AuditUser {
  id: string;
  email: string;
  name: string;
  role?: string;
  isSuperAdmin?: boolean;
  roles?: { id: string; name: string }[];
}

export interface AuditLog {
  id: string;
  userId: string | null;
  user: AuditUser | null;
  action: string;
  entity: string;
  entityId: string | null;
  changes: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  description: string | null;
  statusCode: number | null;
  durationMs: number | null;
  createdAt: string;
}

export interface AuditListResponse {
  data: AuditLog[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuditQuery {
  page?: number;
  limit?: number;
  action?: string;
  entity?: string;
  userId?: string;
  from?: string;
  to?: string;
}

export interface AuditStats {
  total: number;
  byAction: { action: string; count: string }[];
  byEntity: { entity: string; count: string }[];
}