import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

interface StatCard {
  label: string;
  icon: string;
  endpoint: string;
  value: string | number | null;
  loading: boolean;
  error: boolean;
  colorClass: string;
  iconClass: string;
  link: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly http = inject(HttpClient);

  readonly cards = signal<StatCard[]>([
    {
      label: 'Usuarios',
      icon: 'people',
      endpoint: '/users/stats',
      value: null,
      loading: true,
      error: false,
      colorClass: 'bg-brand-50 dark:bg-brand-900/20',
      iconClass: 'text-brand-600',
      link: '/users',
    },
    {
      label: 'Roles',
      icon: 'shield',
      endpoint: '/roles/stats',
      value: null,
      loading: true,
      error: false,
      colorClass: 'bg-green-50 dark:bg-green-900/20',
      iconClass: 'text-green-600',
      link: '/roles',
    },
    {
      label: 'Configuración',
      icon: 'settings',
      endpoint: '/settings/stats',
      value: null,
      loading: true,
      error: false,
      colorClass: 'bg-amber-50 dark:bg-amber-900/20',
      iconClass: 'text-amber-600',
      link: '/settings',
    },
    {
      label: 'Auditoría',
      icon: 'history',
      endpoint: '/audit/stats',
      value: null,
      loading: true,
      error: false,
      colorClass: 'bg-purple-50 dark:bg-purple-900/20',
      iconClass: 'text-purple-600',
      link: '/audit',
    },
  ]);

  ngOnInit(): void {
    this.cards().forEach((card, index) => {
      this.http.get<unknown>(`${environment.apiUrl}${card.endpoint}`).subscribe({
        next: (res) => {
          const value = this.extractCount(res);
          this.updateCard(index, { value, loading: false });
        },
        error: () => {
          this.updateCard(index, { error: true, loading: false });
        },
      });
    });
  }

  private updateCard(index: number, patch: Partial<StatCard>): void {
    this.cards.update((arr) =>
      arr.map((c, i) => (i === index ? { ...c, ...patch } : c))
    );
  }

  private extractCount(res: unknown): number | string {
    if (typeof res === 'number') return res;
    if (res && typeof res === 'object') {
      const obj = res as Record<string, unknown>;
      if (typeof obj['total'] === 'number') return obj['total'];
      if (typeof obj['count'] === 'number') return obj['count'];
    }
    return '—';
  }
}