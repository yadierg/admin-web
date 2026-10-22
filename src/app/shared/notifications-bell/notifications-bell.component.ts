import {
  Component,
  OnInit,
  OnDestroy,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { NotificationsService } from '../../features/notifications/notifications.service';
import { Notification } from '../../features/notifications/models/notification.model';

@Component({
  selector: 'app-notifications-bell',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  templateUrl: './notifications-bell.component.html',
  styleUrl: './notifications-bell.component.scss',
})
export class NotificationsBellComponent implements OnInit, OnDestroy {
  private readonly notificationsService = inject(NotificationsService);
  private readonly router = inject(Router);

  readonly recent = signal<Notification[]>([]);
  readonly loading = signal(false);
  private pollTimer: ReturnType<typeof setInterval> | null = null;

  readonly count = computed(() => this.notificationsService.unreadCount());
  readonly displayCount = computed(() => {
    const c = this.count();
    return c > 99 ? '99+' : String(c);
  });

  ngOnInit(): void {
    this.refresh();
    // Polling cada 30s
    this.pollTimer = setInterval(() => {
      this.notificationsService.refreshUnreadCount();
      this.loadRecent();
    }, 30_000);
  }

  ngOnDestroy(): void {
    if (this.pollTimer) clearInterval(this.pollTimer);
  }

  /** Refresca el contador y la lista de recientes */
  refresh(): void {
    this.notificationsService.refreshUnreadCount();
    this.loadRecent();
  }

  loadRecent(): void {
    this.loading.set(true);
    this.notificationsService.list({ limit: 5, page: 1 }).subscribe({
      next: (res) => {
        this.recent.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onNotificationClick(n: Notification): void {
    if (!n.isRead) {
      this.notificationsService.markAsRead(n.id).subscribe();
    }
    if (n.actionUrl) {
      this.router.navigateByUrl(n.actionUrl);
    }
  }

  markAllAsRead(): void {
    this.notificationsService.markAllAsRead().subscribe(() => {
      this.recent.update((list) => list.map((n) => ({ ...n, isRead: true })));
    });
  }

  goToAll(): void {
    this.router.navigateByUrl('/notifications');
  }

  /** Icono según type */
  iconFor(type: string): string {
    switch (type) {
      case 'success': return 'check_circle';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'info';
    }
  }

  /** Color según type */
  colorFor(type: string): string {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-amber-600';
      case 'error': return 'text-red-600';
      default: return 'text-blue-600';
    }
  }

  /** Fecha relativa (hace X) */
  relativeDate(iso: string): string {
    const now = Date.now();
    const then = new Date(iso).getTime();
    const diff = Math.floor((now - then) / 1000);
    if (diff < 60) return 'hace unos segundos';
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
    if (diff < 604800) return `hace ${Math.floor(diff / 86400)} d`;
    return new Date(iso).toLocaleDateString();
  }
}