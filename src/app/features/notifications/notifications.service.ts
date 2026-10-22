import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Notification,
  NotificationListResponse,
  NotificationQuery,
  UnreadCountResponse,
} from './models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly http = inject(HttpClient);

  /** Signal global del contador de no leídas */
  readonly unreadCount = signal(0);

  private get baseUrl(): string {
    return `${environment.apiUrl}/notifications`;
  }

  list(query: NotificationQuery = {}): Observable<NotificationListResponse> {
    let params = new HttpParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        params = params.set(k, String(v));
      }
    });
    return this.http
      .get<NotificationListResponse>(this.baseUrl, { params })
      .pipe(tap((res) => this.unreadCount.set(res.meta.unreadCount)));
  }

  getById(id: string): Observable<Notification> {
    return this.http.get<Notification>(`${this.baseUrl}/${id}`);
  }

  unreadCountReq(): Observable<UnreadCountResponse> {
    return this.http
      .get<UnreadCountResponse>(`${this.baseUrl}/unread-count`)
      .pipe(tap((res) => this.unreadCount.set(res.unreadCount)));
  }

  markAsRead(id: string): Observable<Notification> {
    return this.http
      .patch<Notification>(`${this.baseUrl}/${id}/read`, {})
      .pipe(tap(() => this.unreadCountReq().subscribe()));
  }

  markAllAsRead(): Observable<unknown> {
    return this.http
      .patch(`${this.baseUrl}/read-all`, {})
      .pipe(tap(() => this.unreadCount.set(0)));
  }

  delete(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/${id}`)
      .pipe(tap(() => this.unreadCountReq().subscribe()));
  }

  /** Refresca el contador (para polling) */
  refreshUnreadCount(): void {
    this.unreadCountReq().subscribe({ error: () => {} });
  }
}