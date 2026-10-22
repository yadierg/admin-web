import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthStore } from './auth.store';
import { RefreshService } from './refresh.service';
import { LoginResponse, User } from '../models';

export interface LoginPayload {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly store = inject(AuthStore);
  private readonly refreshService = inject(RefreshService);

  private get baseUrl(): string {
    return `${environment.apiUrl}/auth`;
  }

  login(payload: LoginPayload): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/login`, payload)
      .pipe(tap((res) => this.store.setSession(res)));
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/logout`, {}).pipe(
      catchError(() => throwError(() => null)),
      tap({
        next: () => this.cleanupAndRedirect(),
        error: () => this.cleanupAndRedirect(),
      })
    );
  }

  logoutAll(): Observable<void> {
    return this.http
      .post<void>(`${this.baseUrl}/logout-all`, {})
      .pipe(tap(() => this.cleanupAndRedirect()));
  }

  profile(): Observable<User> {
    return this.http
      .get<User>(`${this.baseUrl}/profile`)
      .pipe(tap((user) => this.store.updateUser(user)));
  }

  refreshIfNeeded(): Observable<unknown> | null {
    if (!this.store.isAuthenticated()) return null;
    if (!this.store.isExpiringSoon()) return null;
    return this.refreshService.refresh();
  }

  private cleanupAndRedirect(): void {
    this.store.clear();
    this.router.navigateByUrl('/login');
  }
}