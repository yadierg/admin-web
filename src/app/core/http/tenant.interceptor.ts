import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/admin') && !req.url.startsWith('/store')) {
    return next(req);
  }
  return next(
    req.clone({
      setHeaders: { 'x-tenant-id': environment.tenantId },
    })
  );
};