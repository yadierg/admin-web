import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RolesService } from '../roles.service';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './role-form.component.html',
  styleUrl: './role-form.component.scss',
})
export class RoleFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly rolesService = inject(RolesService);
  private readonly snack = inject(MatSnackBar);

  readonly isEdit = signal(false);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly roleId = signal<string | null>(null);
  readonly isSystem = signal(false);

  readonly title = computed(() =>
    this.isEdit() ? 'Editar rol' : 'Nuevo rol'
  );

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.roleId.set(id);
      this.loadRole(id);
    }
  }

  loadRole(id: string): void {
    this.loading.set(true);
    this.rolesService.getById(id).subscribe({
      next: (role) => {
        if (role.isSystem) {
          this.isSystem.set(true);
          this.snack.open('Los roles del sistema no se pueden editar', 'Cerrar', {
            duration: 3000,
          });
          this.router.navigateByUrl('/roles');
          return;
        }
        this.form.patchValue({
          name: role.name,
          description: role.description ?? '',
        });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snack.open('Error al cargar rol', 'Cerrar', { duration: 3000 });
        this.router.navigateByUrl('/roles');
      },
    });
  }

  submit(): void {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    const value = this.form.getRawValue();

    if (this.isEdit() && this.roleId()) {
      this.rolesService
        .update(this.roleId()!, {
          name: value.name,
          description: value.description,
        })
        .subscribe({
          next: () => {
            this.saving.set(false);
            this.snack.open('Rol actualizado', 'Cerrar', { duration: 2500 });
            this.router.navigateByUrl('/roles');
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
      this.rolesService
        .create({
          name: value.name,
          description: value.description,
          category: 'custom',
        })
        .subscribe({
          next: () => {
            this.saving.set(false);
            this.snack.open('Rol creado', 'Cerrar', { duration: 2500 });
            this.router.navigateByUrl('/roles');
          },
          error: (err) => {
            this.saving.set(false);
            this.snack.open(
              err?.error?.message?.[0] ?? err?.error?.message ?? 'Error al crear rol',
              'Cerrar',
              { duration: 3500 }
            );
          },
        });
    }
  }
}