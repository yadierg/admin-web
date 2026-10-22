import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { SettingsService } from '../settings.service';
import { Setting } from '../models/setting.model';
import { AuthStore } from '../../../core/auth/auth.store';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../shared/confirm-dialog/confirm-dialog.component';
import {
  SettingFormDialogComponent,
  SettingFormDialogData,
} from '../setting-form-dialog/setting-form-dialog.component';

@Component({
  selector: 'app-settings-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatTooltipModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  templateUrl: './settings-list.component.html',
  styleUrl: './settings-list.component.scss',
})
export class SettingsListComponent implements OnInit {
  private readonly settingsService = inject(SettingsService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  private readonly store = inject(AuthStore);

  readonly loading = signal(true);
  readonly settings = signal<Setting[]>([]);
  readonly searchQuery = signal('');

  readonly canCreate = this.store.hasPermission('settings.create');
  readonly canUpdate = this.store.hasPermission('settings.update');
  readonly canDelete = this.store.hasPermission('settings.delete');

  readonly grouped = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const list = this.settings().filter((s) => {
      if (!query) return true;
      return (
        s.key.toLowerCase().includes(query) ||
        (s.description ?? '').toLowerCase().includes(query) ||
        String(s.value).toLowerCase().includes(query)
      );
    });

    const map: Record<string, Setting[]> = {};
    for (const s of list) {
      (map[s.group] ??= []).push(s);
    }
    for (const group of Object.keys(map)) {
      map[group].sort((a, b) => a.key.localeCompare(b.key));
    }
    return map;
  });

  readonly groups = computed(() =>
    Object.keys(this.grouped()).sort((a, b) => a.localeCompare(b))
  );

  readonly totalVisible = computed(() =>
    this.groups().reduce((n, g) => n + this.grouped()[g].length, 0)
  );

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.loading.set(true);
    this.settingsService.list().subscribe({
      next: (settings) => {
        this.settings.set(settings);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snack.open('Error al cargar settings', 'Cerrar', { duration: 3000 });
      },
    });
  }

  onSearchChange(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  formatValue(setting: Setting): string {
    const v = setting.value;
    if (v === null || v === undefined) return '—';
    if (typeof v === 'object') return JSON.stringify(v);
    if (typeof v === 'boolean') return v ? 'true' : 'false';
    return String(v);
  }

  iconForType(type: string): string {
    switch (type) {
      case 'number': return 'numbers';
      case 'boolean': return 'toggle_on';
      case 'json': return 'data_object';
      case 'array': return 'data_array';
      default: return 'text_fields';
    }
  }

  openCreateDialog(): void {
    const data: SettingFormDialogData = {};
    this.dialog
      .open(SettingFormDialogComponent, { data, width: '640px' })
      .afterClosed()
      .subscribe((result) => {
        if (result) this.loadSettings();
      });
  }

  openEditDialog(setting: Setting): void {
    const data: SettingFormDialogData = { setting };
    this.dialog
      .open(SettingFormDialogComponent, { data, width: '640px' })
      .afterClosed()
      .subscribe((result) => {
        if (result) this.loadSettings();
      });
  }

  onDelete(setting: Setting): void {
    const data: ConfirmDialogData = {
      title: 'Eliminar setting',
      message: `¿Seguro que quieres eliminar "${setting.key}"?`,
      confirmLabel: 'Eliminar',
      confirmColor: 'warn',
    };
    this.dialog
      .open(ConfirmDialogComponent, { data, width: '420px' })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.settingsService.delete(setting.id).subscribe({
          next: () => {
            this.snack.open('Setting eliminado', 'Cerrar', { duration: 2500 });
            this.loadSettings();
          },
          error: (err) => {
            this.snack.open(
              err?.error?.message ?? 'Error al eliminar setting',
              'Cerrar',
              { duration: 3500 }
            );
          },
        });
      });
  }
}