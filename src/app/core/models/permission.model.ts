export interface Permission {
  id: string;
  resource: string;
  action: string;
  key: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}