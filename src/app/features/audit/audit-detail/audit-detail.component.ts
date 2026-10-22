import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuditService } from '../audit.service';
import { AuditLog } from '../models/audit-log.model';

@Component({
  selector: 'app-audit-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './audit-detail.component.html',
  styleUrl: './audit-detail.component.scss',
})
export class AuditDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auditService = inject(AuditService);

  readonly loading = signal(true);
  readonly log = signal<AuditLog | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigateByUrl('/audit');
      return;
    }
    this.auditService.getById(id).subscribe({
      next: (log) => {
        this.log.set(log);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigateByUrl('/audit');
      },
    });
  }

  /** Cambios como array de { key, value } */
  changesArray(changes: Record<string, unknown> | null): { key: string; value: unknown }[] {
    if (!changes) return [];
    return Object.entries(changes).map(([key, value]) => ({ key, value }));
  }

  /** Formatea un valor cualquiera como string legible */
  pretty(value: unknown): string {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  }
}