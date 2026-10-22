import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuditListResponse,
  AuditLog,
  AuditQuery,
  AuditStats,
} from './models/audit-log.model';

@Injectable({ providedIn: 'root' })
export class AuditService {
  private readonly http = inject(HttpClient);

  private get baseUrl(): string {
    return `${environment.apiUrl}/audit`;
  }

  list(query: AuditQuery = {}): Observable<AuditListResponse> {
    let params = new HttpParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        params = params.set(k, String(v));
      }
    });
    return this.http.get<AuditListResponse>(this.baseUrl, { params });
  }

  getById(id: string): Observable<AuditLog> {
    return this.http.get<AuditLog>(`${this.baseUrl}/${id}`);
  }

  stats(): Observable<AuditStats> {
    return this.http.get<AuditStats>(`${this.baseUrl}/stats`);
  }
}