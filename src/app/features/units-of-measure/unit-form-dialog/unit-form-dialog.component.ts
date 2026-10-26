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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { UnitsService } from '../units.service';
import {
  UnitOfMeasure,
  UnitType,
  UNIT_TYPE_LABELS,
} from '../models/unit.model';

export interface UnitFormDialogData {
  unit?: UnitOfMeasure;
}

@Component({
  selector: 'app-unit-form-dialog',
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
    MatSnackBarModule,
  ],
  templateUrl: './unit-form-dialog.component.html',
  styleUrl: './unit-form-dialog.component.scss',
})
export class UnitFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly unitsService = inject(UnitsService);
  private readonly dialogRef = inject(
    MatDialogRef<UnitFormDialogComponent, UnitOfMeasure | undefined>
  );
  private readonly snack = inject(MatSnackBar);

  readonly data = inject<UnitFormDialogData>(MAT_DIALOG_DATA);

  readonly isEdit = computed(() => !!this.data.unit);
  readonly saving = signal(false);
  readonly unitTypes = Object.values(UnitType);
  readonly unitTypeLabels = UNIT_TYPE_LABELS;

  readonly form = this.fb.nonNullable.group({
    name: [this.data.unit?.name ?? '', [Validators.required, Validators.maxLength(50)]],
    abbreviation: [
      { value: this.data.unit?.abbreviation ?? '', disabled: this.isEdit() },
      [Validators.required, Validators.maxLength(10)],
    ],
    nameEn: [this.data.unit?.nameEn ?? '', Validators.maxLength(50)],
    description: [this.data.unit?.description ?? ''],
    type: [this.data.unit?.type ?? UnitType.UNIT, Validators.required],
    decimalPlaces: [this.data.unit?.decimalPlaces ?? 0, [
      Validators.required,
      Validators.min(0),
      Validators.max(4),
    ]],
    order: [this.data.unit?.order ?? 0, [Validators.required, Validators.min(0)]],
    isActive: [this.data.unit?.isActive ?? true],
  });

  submit(): void {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    const raw = this.form.getRawValue();

    if (this.isEdit() && this.data.unit) {
      this.unitsService
        .update(this.data.unit.id, {
          name: raw.name,
          nameEn: raw.nameEn || undefined,
          description: raw.description || undefined,
          type: raw.type as UnitType,
          decimalPlaces: raw.decimalPlaces,
          order: raw.order,
          isActive: raw.isActive,
        })
        .subscribe({
          next: (u) => {
            this.saving.set(false);
            this.snack.open('Unidad actualizada', 'Cerrar', { duration: 2500 });
            this.dialogRef.close(u);
          },
          error: (err) => {
            this.saving.set(false);
            this.snack.open(
              err?.error?.message?.[0] ?? err?.error?.message ?? 'Error al actualizar',
              'Cerrar',
              { duration: 3500 }
            );
          },
        });
    } else {
      this.unitsService
        .create({
          name: raw.name,
          abbreviation: raw.abbreviation,
          nameEn: raw.nameEn || undefined,
          description: raw.description || undefined,
          type: raw.type as UnitType,
          decimalPlaces: raw.decimalPlaces,
          order: raw.order,
          isActive: raw.isActive,
        })
        .subscribe({
          next: (u) => {
            this.saving.set(false);
            this.snack.open('Unidad creada', 'Cerrar', { duration: 2500 });
            this.dialogRef.close(u);
          },
          error: (err) => {
            this.saving.set(false);
            const msg = Array.isArray(err?.error?.message)
              ? err.error.message[0]
              : err?.error?.message ?? 'Error al crear';
            this.snack.open(msg, 'Cerrar', { duration: 3500 });
          },
        });
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}