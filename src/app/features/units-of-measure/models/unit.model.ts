export enum UnitType {
  UNIT = 'unit',
  LENGTH = 'length',
  AREA = 'area',
  VOLUME = 'volume',
  WEIGHT = 'weight',
  TIME = 'time',
  SERVICE = 'service',
  OTHER = 'other',
}

export interface UnitOfMeasure {
  id: string;
  tenantId: string | null;
  name: string;
  abbreviation: string;
  nameEn?: string;
  description?: string;
  type: UnitType;
  decimalPlaces: number;
  isActive: boolean;
  isSystem: boolean;
  order: number;
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUnitDto {
  name: string;
  abbreviation: string;
  nameEn?: string;
  description?: string;
  type?: UnitType;
  decimalPlaces?: number;
  isActive?: boolean;
  order?: number;
}

export interface UpdateUnitDto {
  name?: string;
  nameEn?: string;
  description?: string;
  type?: UnitType;
  decimalPlaces?: number;
  isActive?: boolean;
  order?: number;
}

export interface UnitsQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: UnitType;
  isActive?: boolean;
}

export interface UnitsListResponse {
  data: UnitOfMeasure[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UnitsStats {
  total: number;
  active: number;
  inactive: number;
  system: number;
  custom: number;
  byType: Array<{ type: UnitType; count: string }>;
}

export const UNIT_TYPE_LABELS: Record<UnitType, string> = {
  [UnitType.UNIT]: 'Unidad',
  [UnitType.LENGTH]: 'Longitud',
  [UnitType.AREA]: 'Área',
  [UnitType.VOLUME]: 'Volumen',
  [UnitType.WEIGHT]: 'Peso',
  [UnitType.TIME]: 'Tiempo',
  [UnitType.SERVICE]: 'Servicio',
  [UnitType.OTHER]: 'Otro',
};

export const UNIT_TYPE_ICONS: Record<UnitType, string> = {
  [UnitType.UNIT]: 'inventory_2',
  [UnitType.LENGTH]: 'straighten',
  [UnitType.AREA]: 'square_foot',
  [UnitType.VOLUME]: 'local_drink',
  [UnitType.WEIGHT]: 'scale',
  [UnitType.TIME]: 'schedule',
  [UnitType.SERVICE]: 'handyman',
  [UnitType.OTHER]: 'category',
};