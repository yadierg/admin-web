import { Component, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { SettingsService } from '../settings.service';
import { Setting, SettingType } from '../models/setting.model';

export interface SettingFormDialogData {
  setting?: Setting;
}

@Component({
  selector: 'app-setting-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './setting-form-dialog.component.html',
  styleUrl: './setting-form-dialog.component.scss',
})
export class SettingFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly settingsService = inject(SettingsService);
  private readonly dialogRef = inject(
    MatDialogRef<SettingFormDialogComponent, Setting | undefined>
  );
  private readonly snack = inject(MatSnackBar);

  readonly data = inject<SettingFormDialogData>(MAT_DIALOG_DATA);

  readonly isEdit = computed(() => !!this.data.setting);
  readonly saving = signal(false);

  readonly availableGroups = [
    'general',
    'email',
    'security',
    'shipping',
    'tax',
    'store',
    'custom',
  ];

  readonly availableTypes: SettingType[] = [
    'string',
    'number',
    'boolean',
    'json',
    'array',
  ];

  readonly form = this.fb.nonNullable.group({
    key: [
      { value: this.data.setting?.key ?? '', disabled: this.isEdit() },
      [Validators.required, Validators.pattern(/^[a-z0-9_]+$/)],
    ],
    value: [
      this.valueAsString(this.data.setting?.value ?? ''),
      Validators.required,
    ],
    group: [this.data.setting?.group ?? 'general', Validators.required],
    type: [
      (this.data.setting?.type ?? 'string') as SettingType,
      Validators.required,
    ],
    description: [this.data.setting?.description ?? ''],
    isPublic: [this.data.setting?.isPublic ?? false],
    isEditable: [this.data.setting?.isEditable ?? true],
  });

  /** Placeholder dinámico según el tipo seleccionado */
  get valuePlaceholder(): string {
    switch (this.form.controls.type.value) {
      case 'json':
      case 'array':
        return '{"key": "value"}';
      case 'boolean':
        return 'true / false';
      case 'number':
        return '123';
      default:
        return 'texto';
    }
  }

  /** ¿El tipo actual requiere JSON? */
  get isJsonType(): boolean {
    const t = this.form.controls.type.value;
    return t === 'json' || t === 'array';
  }

  private valueAsString(v: unknown): string {
    if (v === null || v === undefined) return '';
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
  }

  parseValue(raw: string, type: SettingType): unknown {
    if (type === 'number') {
      const n = Number(raw);
      return Number.isFinite(n) ? n : raw;
    }
    if (type === 'boolean') {
      return raw === 'true' || raw === '1';
    }
    if (type === 'json' || type === 'array') {
      try {
        return JSON.parse(raw);
      } catch {
        return raw;
      }
    }
    return raw;
  }

  submit(): void {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    const raw = this.form.getRawValue();
    const parsedValue = this.parseValue(raw.value, raw.type);

    if (this.isEdit() && this.data.setting) {
      this.settingsService
        .update(this.data.setting.id, {
          value: parsedValue,
          group: raw.group,
          type: raw.type,
          description: raw.description || undefined,
          isPublic: raw.isPublic,
          isEditable: raw.isEditable,
        })
        .subscribe({
          next: (s) => {
            this.saving.set(false);
            this.snack.open('Setting actualizado', 'Cerrar', { duration: 2500 });
            this.dialogRef.close(s);
          },
          error: (err) => {
            this.saving.set(false);
            this.snack.open(
              err?.error?.message?.[0] ??
                err?.error?.message ??
                'Error al actualizar',
              'Cerrar',
              { duration: 3500 }
            );
          },
        });
    } else {
      this.settingsService
        .create({
          key: raw.key,
          value: parsedValue,
          group: raw.group,
          type: raw.type,
          description: raw.description || undefined,
          isPublic: raw.isPublic,
          isEditable: raw.isEditable,
        })
        .subscribe({
          next: (s) => {
            this.saving.set(false);
            this.snack.open('Setting creado', 'Cerrar', { duration: 2500 });
            this.dialogRef.close(s);
          },
          error: (err) => {
            this.saving.set(false);
            this.snack.open(
              err?.error?.message?.[0] ?? err?.error?.message ?? 'Error al crear',
              'Cerrar',
              { duration: 3500 }
            );
          },
        });
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}