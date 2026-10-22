export interface Permission {
  id: string;
  name: string;       // 'users.create'
  resource: string;   // 'users'
  action: string;     // 'create'
  description?: string;
  category?: string;  // 'system' | 'custom'
  createdAt?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  category?: string;    // 'system' | 'custom'
  isActive: boolean;
  isSystem: boolean;
  permissions: Permission[];
}

export type GroupedPermissions = Record<string, Permission[]>;

export interface CreateRoleDto {
  name: string;
  description?: string;
  category?: string;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
}

export interface AssignPermissionsDto {
  permissionIds: string[];
}