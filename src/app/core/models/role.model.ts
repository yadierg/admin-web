import { Permission } from './permission.model';

export interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}