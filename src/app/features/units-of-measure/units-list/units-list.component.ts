import { Component, OnInit, inject, signal, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { UnitsService } from '../units.service';
import {
  UnitOfMeasure,
  UnitsQuery,
  UnitType,
  UNIT_TYPE_LABELS,
  UNIT_TYPE_ICONS,
} from '../models/unit.model';
import { AuthStore } from '../../../core/auth/auth.store';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../shared/confirm-dialog/confirm-dialog.component';
import { UnitFormDialogComponent } from '../unit-form-dialog/unit-form-dialog.component';

@Component({
  selector: 'app-units-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './units-list.component.html',
  styleUrl: './units-list.component.scss',
})
export class UnitsListComponent implements OnInit, AfterViewInit {
  private readonly unitsService = inject(UnitsService);
  private readonly store = inject(AuthStore);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  readonly loading = signal(true);
  readonly dataSource = new MatTableDataSource<UnitOfMeasure>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly limit = signal(20);

  readonly displayedColumns = [
    'order',
    'name',
    'abbreviation',
    'type',
    'decimalPlaces',
    'isActive',
    'isSystem',
    'actions',
  ];

  readonly canCreate = this.store.hasPermission('inventory.create');
  readonly canUpdate = this.store.hasPermission('inventory.update');
  readonly canDelete = this.store.hasPermission('inventory.delete');

  // Filtros
  readonly filterSearch = signal('');
  readonly filterType = signal<UnitType | ''>('');
  readonly filterActive = signal<boolean | ''>('');

  readonly unitTypes = Object.values(UnitType);
  readonly unitTypeLabels = UNIT_TYPE_LABELS;
  readonly unitTypeIcons = UNIT_TYPE_ICONS;

  ngOnInit(): void {
    this.loadUnits();
  }

  ngAfterViewInit(): void {
    // No usamos el paginator de MatTableDataSource, es server-side
  }

  loadUnits(): void {
    this.loading.set(true);
    const query: UnitsQuery = {
      page: this.page(),
      limit: this.limit(),
      search: this.filterSearch() || undefined,
      type: (this.filterType() as UnitType) || undefined,
      isActive:
        this.filterActive() === '' ? undefined : Boolean(this.filterActive()),
    };
    this.unitsService.list(query).subscribe({
      next: (res) => {
        this.dataSource.data = res.data;
        this.total.set(res.meta.total);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snack.open('Error al cargar unidades', 'Cerrar', { duration: 3000 });
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.page.set(event.pageIndex + 1);
    this.limit.set(event.pageSize);
    this.loadUnits();
  }

  onFilterChange(): void {
    this.page.set(1);
    this.loadUnits();
  }

  clearFilters(): void {
    this.filterSearch.set('');
    this.filterType.set('');
    this.filterActive.set('');
    this.page.set(1);
    this.loadUnits();
  }

  openCreateDialog(): void {
    this.dialog
      .open(UnitFormDialogComponent, { width: '560px', data: {} })
      .afterClosed()
      .subscribe((result) => {
        if (result) this.loadUnits();
      });
  }

  openEditDialog(unit: UnitOfMeasure): void {
    if (unit.isSystem) return;
    this.dialog
      .open(UnitFormDialogComponent, {
        width: '560px',
        data: { unit },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) this.loadUnits();
      });
  }

  onToggleActive(unit: UnitOfMeasure): void {
    if (unit.isSystem) return;
    const data: ConfirmDialogData = {
      title: unit.isActive ? 'Desactivar unidad' : 'Activar unidad',
      message: `¿Seguro que quieres ${
        unit.isActive ? 'desactivar' : 'activar'
      } "${unit.name}"?`,
      confirmLabel: unit.isActive ? 'Desactivar' : 'Activar',
      confirmColor: unit.isActive ? 'warn' : 'primary',
    };
    this.dialog
      .open(ConfirmDialogComponent, { data, width: '420px' })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.unitsService.toggleActive(unit.id).subscribe({
          next: () => {
            this.snack.open(
              unit.isActive ? 'Unidad desactivada' : 'Unidad activada',
              'Cerrar',
              { duration: 2500 }
            );
            this.loadUnits();
          },
          error: (err) => {
            this.snack.open(
              err?.error?.message ?? 'Error al cambiar estado',
              'Cerrar',
              { duration: 3500 }
            );
          },
        });
      });
  }

  onDelete(unit: UnitOfMeasure): void {
    if (unit.isSystem) return;
    const data: ConfirmDialogData = {
      title: 'Eliminar unidad',
      message: `¿Seguro que quieres eliminar "${unit.name}"? Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      confirmColor: 'warn',
    };
    this.dialog
      .open(ConfirmDialogComponent, { data, width: '420px' })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.unitsService.delete(unit.id).subscribe({
          next: () => {
            this.snack.open('Unidad eliminada', 'Cerrar', { duration: 2500 });
            this.loadUnits();
          },
          error: (err) => {
            this.snack.open(
              err?.error?.message ?? 'Error al eliminar unidad',
              'Cerrar',
              { duration: 4000 }
            );
          },
        });
      });
      
  }
  
    getTypeLabel(type: string): string {
        return this.unitTypeLabels[type as UnitType] ?? type;
    }

    getTypeIcon(type: string): string {
        return this.unitTypeIcons[type as UnitType] ?? 'category';
    }
}