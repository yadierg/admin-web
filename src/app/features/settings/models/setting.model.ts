export type SettingType = 'string' | 'number' | 'boolean' | 'json' | 'array';

export interface Setting {
  id: string;
  key: string;
  value: string | number | boolean | null | unknown;
  group: string;
  description: string | null;
  type: SettingType;
  isPublic: boolean;
  isEditable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSettingDto {
  key: string;
  value: unknown;
  group: string;
  description?: string;
  type?: SettingType;
  isPublic?: boolean;
  isEditable?: boolean;
}

export interface UpdateSettingDto {
  value?: unknown;
  group?: string;
  description?: string;
  type?: SettingType;
  isPublic?: boolean;
  isEditable?: boolean;
}

export interface SettingsByGroup {
  group: string;
  count: number;
}

export interface SettingsStats {
  total: number;
  byGroup: SettingsByGroup[];
  cacheSize: number;
}