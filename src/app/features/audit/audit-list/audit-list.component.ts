import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuditService } from '../audit.service';
import { AuditLog, AuditQuery } from '../models/audit-log.model';

@Component({
  selector: 'app-audit-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
  ],
  templateUrl: './audit-list.component.html',
  styleUrl: './audit-list.component.scss',
})
export class AuditListComponent implements OnInit {
  private readonly auditService = inject(AuditService);
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly logs = signal<AuditLog[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly limit = signal(20);

  readonly displayedColumns = [
    'createdAt',
    'action',
    'entity',
    'user',
    'ipAddress',
    'status',
    'duration',
  ];

  // Filtros
  readonly filterAction = signal<string>('');
  readonly filterEntity = signal<string>('');
  readonly filterStartDate = signal<Date | null>(null);
  readonly filterEndDate = signal<Date | null>(null);

  readonly actions = [
    'login',
    'create',
    'update',
    'delete',
    'view',
    'create_failed',
    'update_failed',
    'delete_failed',
  ];

  readonly entities = [
    'auth',
    'users',
    'roles',
    'settings',
    'audit',
    'products',
    'orders',
    'inventory',
    'budgets',
  ];

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.loading.set(true);
    const query: AuditQuery = {
      page: this.page(),
      limit: this.limit(),
      action: this.filterAction() || undefined,
      entity: this.filterEntity() || undefined,
      from: this.filterStartDate()?.toISOString(),
      to: this.filterEndDate()?.toISOString(),
    };
    this.auditService.list(query).subscribe({
      next: (res) => {
        this.logs.set(res.data ?? []);
        this.total.set(res.meta?.total ?? 0);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snack.open('Error al cargar auditoría', 'Cerrar', { duration: 3000 });
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.page.set(event.pageIndex + 1);
    this.limit.set(event.pageSize);
    this.loadLogs();
  }

  applyFilters(): void {
    this.page.set(1);
    this.loadLogs();
  }

  clearFilters(): void {
    this.filterAction.set('');
    this.filterEntity.set('');
    this.filterStartDate.set(null);
    this.filterEndDate.set(null);
    this.page.set(1);
    this.loadLogs();
  }

  goToDetail(log: AuditLog): void {
    this.router.navigate(['/audit', log.id]);
  }

  actionColor(action: string): string {
    if (action.startsWith('create_failed')) return 'bg-red-100 text-red-700';
    if (action.startsWith('create')) return 'bg-green-100 text-green-700';
    if (action.startsWith('update_failed')) return 'bg-red-100 text-red-700';
    if (action.startsWith('update')) return 'bg-blue-100 text-blue-700';
    if (action.startsWith('delete')) return 'bg-red-100 text-red-700';
    if (action === 'login') return 'bg-purple-100 text-purple-700';
    if (action === 'view') return 'bg-slate-100 text-slate-700';
    return 'bg-slate-100 text-slate-700';
  }

  entityColor(entity: string): string {
    switch (entity) {
      case 'auth': return 'bg-purple-50 text-purple-700';
      case 'users': return 'bg-blue-50 text-blue-700';
      case 'roles': return 'bg-indigo-50 text-indigo-700';
      case 'settings': return 'bg-amber-50 text-amber-700';
      case 'audit': return 'bg-slate-50 text-slate-700';
      default: return 'bg-slate-50 text-slate-700';
    }
  }
}