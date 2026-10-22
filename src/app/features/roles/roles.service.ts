import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AssignPermissionsDto,
  CreateRoleDto,
  GroupedPermissions,
  Role,
  UpdateRoleDto,
} from './models/role.model';

@Injectable({ providedIn: 'root' })
export class RolesService {
  private readonly http = inject(HttpClient);

  private get baseUrl(): string {
    return `${environment.apiUrl}/roles`;
  }

  list(): Observable<Role[]> {
    return this.http.get<Role[]>(this.baseUrl);
  }

  getById(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateRoleDto): Observable<Role> {
    return this.http.post<Role>(this.baseUrl, payload);
  }

  update(id: string, payload: UpdateRoleDto): Observable<Role> {
    return this.http.patch<Role>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  assignPermissions(id: string, payload: AssignPermissionsDto): Observable<Role> {
    return this.http.post<Role>(`${this.baseUrl}/${id}/permissions`, payload);
  }

  getGroupedPermissions(): Observable<GroupedPermissions> {
    return this.http.get<GroupedPermissions>(
      `${environment.apiUrl}/permissions/grouped`
    );
  }
}