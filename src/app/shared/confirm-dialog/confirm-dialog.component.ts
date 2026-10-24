import { Component, inject } from '@angular/core';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: 'primary' | 'warn';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <div class="bg-white dark:bg-slate-800 rounded-lg">
      <h2 mat-dialog-title class="!text-slate-800 dark:!text-slate-100">
        {{ data.title }}
      </h2>
      <mat-dialog-content>
        <p class="text-slate-600 dark:text-slate-300">{{ data.message }}</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">
          {{ data.cancelLabel ?? 'Cancelar' }}
        </button>
        <button
          mat-flat-button
          [color]="data.confirmColor ?? 'primary'"
          (click)="onConfirm()"
        >
          {{ data.confirmLabel ?? 'Confirmar' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
})
export class ConfirmDialogComponent {
  private readonly ref = inject(MatDialogRef<ConfirmDialogComponent, boolean>);
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);

  onCancel(): void {
    this.ref.close(false);
  }

  onConfirm(): void {
    this.ref.close(true);
  }
}