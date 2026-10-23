import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { guestGuard } from './core/auth/guest.guard';
import { permissionGuard } from './core/auth/permission.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
    import('./features/auth/register/register.component').then(
      (m) => m.RegisterComponent
          ),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent
      ),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'users',
        canActivate: [permissionGuard],
        data: { permission: 'users.read' },
        loadChildren: () =>
          import('./features/users/users.routes').then((m) => m.USERS_ROUTES),
      },
      {
        path: 'roles',
        canActivate: [permissionGuard],
        data: { permission: 'roles.read' },
        loadChildren: () =>
          import('./features/roles/roles.routes').then((m) => m.ROLES_ROUTES),
      },
      {
        path: 'settings',
        canActivate: [permissionGuard],
        data: { permission: 'settings.read' },
        loadChildren: () =>
          import('./features/settings/settings.routes').then((m) => m.SETTINGS_ROUTES),
      },
      {
        path: 'audit',
        canActivate: [permissionGuard],
        data: { permission: 'audit.read' },
        loadChildren: () =>
          import('./features/audit/audit.routes').then((m) => m.AUDIT_ROUTES),
      },
      {
        path: 'notifications',
        canActivate: [permissionGuard],
        data: { permission: 'notifications.read' },
        loadChildren: () =>
          import('./features/notifications/notifications.routes').then(
            (m) => m.NOTIFICATIONS_ROUTES
          ),
      },
 
    ],
  },
  {
    path: 'forbidden',
    loadComponent: () =>
      import('./features/forbidden/forbidden.component').then(
        (m) => m.ForbiddenComponent
      ),
  },
  { path: '**', redirectTo: '' },
];