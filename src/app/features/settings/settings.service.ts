import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateSettingDto,
  Setting,
  SettingsStats,
  UpdateSettingDto,
} from './models/setting.model';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly http = inject(HttpClient);

  private get baseUrl(): string {
    return `${environment.apiUrl}/settings`;
  }

  list(): Observable<Setting[]> {
    return this.http.get<Setting[]>(this.baseUrl);
  }

  stats(): Observable<SettingsStats> {
    return this.http.get<SettingsStats>(`${this.baseUrl}/stats`);
  }

  create(payload: CreateSettingDto): Observable<Setting> {
    return this.http.post<Setting>(this.baseUrl, payload);
  }

  update(id: string, payload: UpdateSettingDto): Observable<Setting> {
    return this.http.patch<Setting>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  refreshCache(): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/refresh-cache`, {});
  }
}