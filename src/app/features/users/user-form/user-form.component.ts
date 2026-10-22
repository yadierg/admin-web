import {
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { environment } from '../../../../environments/environment';

import { UsersService } from '../users.service';
import { AdminUser } from '../models/user.model';

interface RoleOption {
  id: string;
  name: string;
}

@Component({
  selector: 'app-user-form',
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
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
})
export class UserFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly usersService = inject(UsersService);
  private readonly http = inject(HttpClient);
  private readonly snack = inject(MatSnackBar);

  readonly isEdit = signal(false);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly roles = signal<RoleOption[]>([]);
  readonly userId = signal<string | null>(null);

  readonly title = computed(() =>
    this.isEdit() ? 'Editar usuario' : 'Nuevo usuario'
  );

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    role: ['', [Validators.required]],
    password: [''], // solo en crear
    //isActive: [true],
  });

  ngOnInit(): void {
    this.loadRoles();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.userId.set(id);
      this.form.controls.password.clearValidators();
      this.loadUser(id);
    } else {
      this.form.controls.password.setValidators([
        Validators.required,
        Validators.minLength(8),
      ]);
    }
  }

  loadRoles(): void {
    this.http
      .get<RoleOption[]>(`${environment.apiUrl}/roles`)
      .subscribe({
        next: (roles) => {
          // El backend solo acepta 'admin' y 'user' para PATCH
          const ASSIGNABLE = ['admin', 'user'];
          this.roles.set(roles.filter((r) => ASSIGNABLE.includes(r.name)));
        },
        error: () => {
          this.snack.open('Error al cargar roles', 'Cerrar', { duration: 3000 });
        },
      });
  }

  loadUser(id: string): void {
    this.loading.set(true);
    this.usersService.getById(id).subscribe({
      next: (user) => {
        this.form.patchValue({
          name: user.name,
          email: user.email,
          role: user.role,
        });

        if (user.role === 'super_admin' || user.isSuperAdmin) {
          this.form.controls.role.disable();
        }

        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snack.open('Error al cargar usuario', 'Cerrar', { duration: 3000 });
        this.router.navigateByUrl('/users');
      },
    });
  }

  submit(): void {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    const value = this.form.getRawValue();

    if (this.isEdit() && this.userId()) {
      const payload: { name: string; email: string; role?: string } = {
        name: value.name,
        email: value.email,
      };

      if (!this.form.controls.role.disabled) {
        payload.role = value.role;
      }

      this.usersService.update(this.userId()!, payload).subscribe({
        next: () => {
          this.saving.set(false);
          this.snack.open('Usuario actualizado', 'Cerrar', { duration: 2500 });
          this.router.navigateByUrl('/users');
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
      const payload = {
        name: value.name,
        email: value.email,
        password: value.password,
        role: value.role,
      };
      this.usersService.create(payload).subscribe({
        next: () => {
          this.saving.set(false);
          this.snack.open('Usuario creado', 'Cerrar', { duration: 2500 });
          this.router.navigateByUrl('/users');
        },
        error: (err) => {
          this.saving.set(false);
          this.snack.open(
            err?.error?.message?.[0] ?? err?.error?.message ?? 'Error al crear usuario',
            'Cerrar',
            { duration: 3500 }
          );
        },
      });
    }
  }
}