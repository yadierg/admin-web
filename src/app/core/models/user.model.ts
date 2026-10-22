export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'manager'
  | 'editor'
  | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  roles: UserRole[];
  tenantId: string;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  user: User;
  permissions: string[];
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}