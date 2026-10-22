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

import { RolesService } from '../roles.service';
import { Role } from '../models/role.model';
import { AuthStore } from '../../../core/auth/auth.store';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-roles-list',
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
  ],
  templateUrl: './roles-list.component.html',
  styleUrl: './roles-list.component.scss',
})
export class RolesListComponent implements AfterViewInit {
  private readonly rolesService = inject(RolesService);
  private readonly store = inject(AuthStore);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  private readonly router = inject(Router);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  readonly loading = signal(true);
  readonly dataSource = new MatTableDataSource<Role>([]);
  readonly displayedColumns = [
    'name',
    'description',
    'category',
    'permissions',
    'actions',
  ];

  readonly canCreate = this.store.hasPermission('roles.create');
  readonly canUpdate = this.store.hasPermission('roles.update');
  readonly canDelete = this.store.hasPermission('roles.delete');

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading.set(true);
    this.rolesService.list().subscribe({
      next: (roles) => {
        this.dataSource.data = roles;
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snack.open('Error al cargar roles', 'Cerrar', { duration: 3000 });
      },
    });
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  goToNew(): void {
    this.router.navigateByUrl('/roles/new');
  }

  onDelete(role: Role): void {
    const data: ConfirmDialogData = {
      title: 'Eliminar rol',
      message: `¿Seguro que quieres eliminar el rol "${role.name}"? Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      confirmColor: 'warn',
    };
    this.dialog
      .open(ConfirmDialogComponent, { data, width: '420px' })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.rolesService.delete(role.id).subscribe({
          next: () => {
            this.snack.open('Rol eliminado', 'Cerrar', { duration: 2500 });
            this.loadRoles();
          },
          error: (err) => {
            this.snack.open(
              err?.error?.message ?? 'Error al eliminar rol',
              'Cerrar',
              { duration: 3500 }
            );
          },
        });
      });
  }
}