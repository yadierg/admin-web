import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';

import { RolesService } from '../roles.service';
import { GroupedPermissions, Permission, Role } from '../models/role.model';

@Component({
  selector: 'app-role-permissions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
  ],
  templateUrl: './role-permissions.component.html',
  styleUrl: './role-permissions.component.scss',
})
export class RolePermissionsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly rolesService = inject(RolesService);
  private readonly snack = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly role = signal<Role | null>(null);
  readonly grouped = signal<GroupedPermissions>({});
  readonly selectedIds = signal<Set<string>>(new Set());
  readonly searchQuery = signal('');

  readonly resources = computed(() =>
    Object.keys(this.grouped()).sort()
  );

  readonly totalPermissions = computed(() => {
    const grouped = this.grouped();
    return Object.values(grouped).reduce((n, arr) => n + arr.length, 0);
  });

  readonly selectedCount = computed(() => this.selectedIds().size);

  readonly filteredGrouped = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const grouped = this.grouped();
    if (!query) return grouped;
    const out: GroupedPermissions = {};
    for (const [resource, perms] of Object.entries(grouped)) {
      const filtered = perms.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.description ?? '').toLowerCase().includes(query)
      );
      if (filtered.length) out[resource] = filtered;
    }
    return out;
  });

  readonly filteredResources = computed(() =>
    Object.keys(this.filteredGrouped()).sort()
  );

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigateByUrl('/roles');
      return;
    }
    this.loadAll(id);
  }

  private loadAll(roleId: string): void {
    this.loading.set(true);
    let pending = 2;

    this.rolesService.getById(roleId).subscribe({
      next: (role) => {
        this.role.set(role);
        this.selectedIds.set(new Set(role.permissions.map((p) => p.id)));
        if (--pending === 0) this.loading.set(false);
      },
      error: () => this.router.navigateByUrl('/roles'),
    });

    this.rolesService.getGroupedPermissions().subscribe({
      next: (grouped) => {
        this.grouped.set(grouped);
        if (--pending === 0) this.loading.set(false);
      },
      error: () => this.router.navigateByUrl('/roles'),
    });
  }

  isSelected(id: string): boolean {
    return this.selectedIds().has(id);
  }

  togglePermission(id: string, checked: boolean): void {
    const newSet = new Set(this.selectedIds());
    if (checked) newSet.add(id);
    else newSet.delete(id);
    this.selectedIds.set(newSet);
  }

  groupState(resource: string): 'all' | 'none' | 'indeterminate' {
    const perms = this.filteredGrouped()[resource] ?? [];
    if (perms.length === 0) return 'none';
    const selected = perms.filter((p) => this.isSelected(p.id)).length;
    if (selected === 0) return 'none';
    if (selected === perms.length) return 'all';
    return 'indeterminate';
  }

  toggleGroup(resource: string, checked: boolean): void {
    const newSet = new Set(this.selectedIds());
    const perms = this.filteredGrouped()[resource] ?? [];
    for (const p of perms) {
      if (checked) newSet.add(p.id);
      else newSet.delete(p.id);
    }
    this.selectedIds.set(newSet);
  }

  onSearchChange(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  save(): void {
    if (!this.role() || this.saving()) return;
    this.saving.set(true);

    this.rolesService
      .assignPermissions(this.role()!.id, {
        permissionIds: Array.from(this.selectedIds()),
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.snack.open('Permisos actualizados', 'Cerrar', { duration: 2500 });
          this.router.navigateByUrl(`/roles/${this.role()!.id}`);
        },
        error: (err) => {
          this.saving.set(false);
          this.snack.open(
            err?.error?.message?.[0] ??
              err?.error?.message ??
              'Error al guardar permisos',
            'Cerrar',
            { duration: 3500 }
          );
        },
      });
  }

  cancel(): void {
    this.router.navigateByUrl(`/roles/${this.role()?.id ?? ''}`);
  }
}