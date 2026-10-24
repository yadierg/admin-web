import { Component, ViewChild, inject, signal, AfterViewInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';

import { UsersService } from '../users.service';
import { AdminUser } from '../models/user.model';
import { AuthStore } from '../../../core/auth/auth.store';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSelectModule,
  ],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss',
})
export class UsersListComponent implements AfterViewInit {
  private readonly usersService = inject(UsersService);
  private readonly store = inject(AuthStore);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  private readonly router = inject(Router);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  readonly loading = signal(true);
  readonly dataSource = new MatTableDataSource<AdminUser>([]);
  readonly displayedColumns = [
    'name',
    'email',
    'role',
    'isActive',
    'lastLogin',
    'actions',
  ];

  readonly canCreate = this.store.hasPermission('users.create');
  readonly canUpdate = this.store.hasPermission('users.update');
  readonly canDelete = this.store.hasPermission('users.delete');
  readonly currentUserId = this.store.user()?.id;

  readonly assignableRoles = [
    'super_admin',
    'admin',
    'budget_manager',
    'inventory_manager',
    'store_manager',
    'user',
  ];

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.usersService.list().subscribe({
      next: (users) => {
        this.dataSource.data = users;
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snack.open('Error al cargar usuarios', 'Cerrar', { duration: 3000 });
      },
    });
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  onRoleChange(user: AdminUser, newRole: string): void {
    if (newRole === user.role) return;
    const data: ConfirmDialogData = {
      title: 'Cambiar rol',
      message: `¿Cambiar el rol de ${user.name} de "${user.role}" a "${newRole}"?`,
      confirmLabel: 'Cambiar',
    };
    this.dialog
      .open(ConfirmDialogComponent, { data, width: '420px' })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.usersService.changeRole(user.id, newRole).subscribe({
          next: () => {
            this.snack.open('Rol actualizado', 'Cerrar', { duration: 2500 });
            this.loadUsers();
          },
          error: (err) => {
            this.snack.open(
              err?.error?.message ?? 'Error al cambiar rol',
              'Cerrar',
              { duration: 3500 }
            );
          },
        });
      });
  }

  onToggleActive(user: AdminUser): void {
    const data: ConfirmDialogData = {
      title: user.isActive ? 'Desactivar usuario' : 'Activar usuario',
      message: `¿Seguro que quieres ${
        user.isActive ? 'desactivar' : 'activar'
      } a ${user.name}?`,
      confirmLabel: user.isActive ? 'Desactivar' : 'Activar',
      confirmColor: user.isActive ? 'warn' : 'primary',
    };
    this.dialog
      .open(ConfirmDialogComponent, { data, width: '420px' })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.usersService.toggleActive(user.id).subscribe({
          next: () => {
            this.snack.open(
              user.isActive ? 'Usuario desactivado' : 'Usuario activado',
              'Cerrar',
              { duration: 2500 }
            );
            this.loadUsers();
          },
          error: () => {
            this.snack.open('Error al cambiar estado', 'Cerrar', { duration: 3000 });
          },
        });
      });
  }

  onDelete(user: AdminUser): void {
    const data: ConfirmDialogData = {
      title: 'Eliminar usuario',
      message: `¿Seguro que quieres eliminar a ${user.name}? Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      confirmColor: 'warn',
    };
    this.dialog
      .open(ConfirmDialogComponent, { data, width: '420px' })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.usersService.delete(user.id).subscribe({
          next: () => {
            this.snack.open('Usuario eliminado', 'Cerrar', { duration: 2500 });
            this.loadUsers();
          },
          error: () => {
            this.snack.open('Error al eliminar usuario', 'Cerrar', { duration: 3000 });
          },
        });
      });
  }

  goToNew(): void {
    this.router.navigateByUrl('/users/new');
  }

  canEditRole(user: AdminUser): boolean {
    return (
      this.canUpdate &&
      user.id !== this.currentUserId &&
      !user.isSuperAdmin
    );
  }
}