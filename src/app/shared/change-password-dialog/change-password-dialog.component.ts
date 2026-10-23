import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/auth/auth.service';

function passwordMatchValidator(
  control: AbstractControl
): ValidationErrors | null {
  const newPass = control.get('newPassword')?.value;
  const confirm = control.get('confirmPassword')?.value;
  if (!newPass || !confirm) return null;
  return newPass === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-change-password-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './change-password-dialog.component.html',
  styleUrl: './change-password-dialog.component.scss',
})
export class ChangePasswordDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly dialogRef = inject(
    MatDialogRef<ChangePasswordDialogComponent, boolean>
  );
  private readonly snack = inject(MatSnackBar);

  readonly saving = signal(false);
  readonly hideCurrent = signal(true);
  readonly hideNew = signal(true);
  readonly hideConfirm = signal(true);

  readonly form = this.fb.nonNullable.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator }
  );

  submit(): void {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);

    const { currentPassword, newPassword } = this.form.getRawValue();
    this.auth.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.saving.set(false);
        this.snack.open(
          'Contraseña actualizada. Inicia sesión de nuevo.',
          'Cerrar',
          { duration: 4000 }
        );
        this.dialogRef.close(true);
        setTimeout(() => this.auth.logout().subscribe(), 1500);
      },
      error: (err) => {
        this.saving.set(false);
        const msg = Array.isArray(err?.error?.message)
          ? err.error.message[0]
          : err?.error?.message ?? 'Error al cambiar contraseña';
        this.snack.open(msg, 'Cerrar', { duration: 4000 });
      },
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}