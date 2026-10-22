import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, tap, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthStore } from './auth.store';
import { RefreshResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class RefreshService {
  private readonly http = inject(HttpClient);
  private readonly store = inject(AuthStore);

  private refresh$: Observable<RefreshResponse> | null = null;

  refresh(): Observable<RefreshResponse> {
    if (this.refresh$) return this.refresh$;

    const refreshToken = this.store.refreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    this.refresh$ = this.http
      .post<RefreshResponse>(`${environment.apiUrl}/auth/refresh`, { refreshToken })
      .pipe(
        tap((res) =>
          this.store.updateTokens(res.accessToken, res.refreshToken, res.expiresIn)
        ),
        finalize(() => {
          this.refresh$ = null;
        }),
        shareReplay({ bufferSize: 1, refCount: true })
      );

    return this.refresh$;
  }
}