import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from './auth.store';

export const guestGuard: CanActivateFn = () => {
  const store = inject(AuthStore);
  const router = inject(Router);
  return store.isAuthenticated() ? router.createUrlTree(['/dashboard']) : true;
};