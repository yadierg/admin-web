import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { RolesService } from '../roles.service';
import { Role } from '../models/role.model';
import { AuthStore } from '../../../core/auth/auth.store';

@Component({
  selector: 'app-role-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './role-detail.component.html',
  styleUrl: './role-detail.component.scss',
})
export class RoleDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly rolesService = inject(RolesService);
  private readonly store = inject(AuthStore);

  readonly loading = signal(true);
  readonly role = signal<Role | null>(null);
  readonly canUpdate = this.store.hasPermission('roles.update');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigateByUrl('/roles');
      return;
    }
    this.rolesService.getById(id).subscribe({
      next: (r) => {
        this.role.set(r);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigateByUrl('/roles');
      },
    });
  }

  /** Agrupa los permisos por recurso para mostrarlos */
  groupedPermissions(role: Role): Record<string, typeof role.permissions> {
    return role.permissions.reduce((acc, p) => {
      (acc[p.resource] ??= []).push(p);
      return acc;
    }, {} as Record<string, typeof role.permissions>);
  }

  resources(role: Role): string[] {
    return Object.keys(this.groupedPermissions(role)).sort();
  }
}