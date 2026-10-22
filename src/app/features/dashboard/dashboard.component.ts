import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../../environments/environment';

interface StatCard {
  label: string;
  icon: string;
  endpoint: string;
  value: string | number | null;
  loading: boolean;
  error: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  template: `
    <div class="flex flex-col gap-6">
      <div>
        <h2 class="text-2xl font-semibold text-slate-800">Dashboard</h2>
        <p class="text-slate-500 text-sm mt-1">
          Resumen general del tenant Instelec
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        @for (card of cards(); track card.label) {
          <mat-card class="!p-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <mat-icon>{{ card.icon }}</mat-icon>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-xs text-slate-500 uppercase tracking-wide">
                  {{ card.label }}
                </div>
                <div class="text-2xl font-semibold text-slate-800">
                  @if (card.loading) {
                    <span class="text-base text-slate-400">…</span>
                  } @else if (card.error) {
                    <span class="text-sm text-red-500">Error</span>
                  } @else {
                    {{ card.value }}
                  }
                </div>
              </div>
            </div>
          </mat-card>
        }
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private readonly http = inject(HttpClient);

  readonly cards = signal<StatCard[]>([
    { label: 'Usuarios', icon: 'people', endpoint: '/users/stats', value: null, loading: true, error: false },
    { label: 'Roles', icon: 'shield', endpoint: '/roles/stats', value: null, loading: true, error: false },
    { label: 'Configuración', icon: 'settings', endpoint: '/settings/stats', value: null, loading: true, error: false },
    { label: 'Auditoría', icon: 'history', endpoint: '/audit/stats', value: null, loading: true, error: false },
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
      if (typeof obj['count'] === 'number') return obj['count'];
      if (typeof obj['total'] === 'number') return obj['total'];
      const firstNumber = Object.values(obj).find((v) => typeof v === 'number');
      if (typeof firstNumber === 'number') return firstNumber;
    }
    return '—';
  }
}