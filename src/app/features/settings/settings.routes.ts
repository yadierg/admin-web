import { Routes } from '@angular/router';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./settings-list/settings-list.component').then(
        (m) => m.SettingsListComponent
      ),
  },
];