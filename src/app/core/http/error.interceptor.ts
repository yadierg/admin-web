import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthStore } from '../auth/auth.store';
import { RefreshService } from '../auth/refresh.service';
import { AuthService } from '../auth/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(AuthStore);
  const refreshService = inject(RefreshService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Solo reintentar si es 401 y NO es un endpoint de auth
      const isAuthUrl = req.url.includes('/auth/');
      if (error.status !== 401 || isAuthUrl) {
        return throwError(() => error);
      }

      // Intentar refresh una sola vez
      return refreshService.refresh().pipe(
        switchMap(() => {
          const newToken = store.accessToken();
          return next(
            req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` },
            })
          );
        }),
        catchError((refreshErr) => {
          // Refresh falló → logout y redirect
          authService.logout().subscribe();
          return throwError(() => refreshErr);
        })
      );
    })
  );
};