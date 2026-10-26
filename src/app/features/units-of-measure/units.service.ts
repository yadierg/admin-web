import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateUnitDto,
  UnitOfMeasure,
  UnitsListResponse,
  UnitsQuery,
  UnitsStats,
  UpdateUnitDto,
} from './models/unit.model';

@Injectable({ providedIn: 'root' })
export class UnitsService {
  private readonly http = inject(HttpClient);

  private get baseUrl(): string {
    return `${environment.apiUrl}/units-of-measure`;
  }

  /** Unidades activas (para dropdowns) */
  listActive(): Observable<UnitOfMeasure[]> {
    return this.http.get<UnitOfMeasure[]>(`${this.baseUrl}/active`);
  }

  /** Listado paginado con filtros */
  list(query: UnitsQuery = {}): Observable<UnitsListResponse> {
    let params = new HttpParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        params = params.set(k, String(v));
      }
    });
    return this.http.get<UnitsListResponse>(this.baseUrl, { params });
  }

  /** Unidades por tipo */
  listByType(type: string): Observable<UnitOfMeasure[]> {
    return this.http.get<UnitOfMeasure[]>(`${this.baseUrl}/type/${type}`);
  }

  /** Stats */
  stats(): Observable<UnitsStats> {
    return this.http.get<UnitsStats>(`${this.baseUrl}/stats`);
  }

  /** Por ID */
  getById(id: string): Observable<UnitOfMeasure> {
    return this.http.get<UnitOfMeasure>(`${this.baseUrl}/${id}`);
  }

  /** Crear */
  create(payload: CreateUnitDto): Observable<UnitOfMeasure> {
    return this.http.post<UnitOfMeasure>(this.baseUrl, payload);
  }

  /** Actualizar */
  update(id: string, payload: UpdateUnitDto): Observable<UnitOfMeasure> {
    return this.http.patch<UnitOfMeasure>(`${this.baseUrl}/${id}`, payload);
  }

  /** Toggle activo */
  toggleActive(id: string): Observable<UnitOfMeasure> {
    return this.http.patch<UnitOfMeasure>(`${this.baseUrl}/${id}/toggle-active`, {});
  }

  /** Eliminar */
  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }
}