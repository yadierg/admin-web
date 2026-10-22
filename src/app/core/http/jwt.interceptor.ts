import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '../auth/auth.store';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(AuthStore);
  const token = store.accessToken();

  const isAuthEndpoint =
    req.url.includes('/auth/login') || req.url.includes('/auth/refresh');

  if (!token || isAuthEndpoint) return next(req);

  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    })
  );
};