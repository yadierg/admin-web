import { Permission } from '../../../core/models/permission.model';

export interface TenantEmbedded {
  id: string;
  slug: string;
  name: string;
  legalName: string | null;
  taxId: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  logo: string | null;
  settings: unknown | null;
  isActive: boolean;
  plan: string;
  planExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RoleEmbedded {
  id: string;
  name: string;
  description?: string;
  category?: string;
  isActive: boolean;
  isSystem: boolean;
  permissions: Permission[];
}

/** Usuario tal como lo devuelve el backend real */
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  lastLogin: string | null;
  tenantId: string;
  tenant?: TenantEmbedded;
  isSuperAdmin: boolean;
  roles: RoleEmbedded[];
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  role: string;
}

export interface UpdateUserDto {
  email?: string;
  name?: string;
  role?: string;
  isActive?: boolean;
}