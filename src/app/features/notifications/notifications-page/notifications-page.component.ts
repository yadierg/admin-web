import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { NotificationsService } from '../notifications.service';
import { Notification, NotificationQuery } from '../models/notification.model';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../shared/confirm-dialog/confirm-dialog.component';

type FilterMode = 'all' | 'unread' | 'read';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule,
  ],
  templateUrl: './notifications-page.component.html',
  styleUrl: './notifications-page.component.scss',
})
export class NotificationsPageComponent implements OnInit {
  private readonly service = inject(NotificationsService);
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly items = signal<Notification[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly limit = signal(20);
  readonly filter = signal<FilterMode>('all');

  readonly unreadCount = computed(() => this.service.unreadCount());
  readonly hasUnread = computed(() => this.unreadCount() > 0);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const query: NotificationQuery = {
      page: this.page(),
      limit: this.limit(),
    };
    if (this.filter() === 'unread') query.isRead = false;
    if (this.filter() === 'read') query.isRead = true;

    this.service.list(query).subscribe({
      next: (res) => {
        this.items.set(res.data);
        this.total.set(res.meta.total);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snack.open('Error al cargar notificaciones', 'Cerrar', {
          duration: 3000,
        });
      },
    });
  }

  onFilterChange(f: FilterMode): void {
    this.filter.set(f);
    this.page.set(1);
    this.load();
  }

  onPageChange(e: PageEvent): void {
    this.page.set(e.pageIndex + 1);
    this.limit.set(e.pageSize);
    this.load();
  }

  onNotificationClick(n: Notification): void {
    if (!n.isRead) {
      this.service.markAsRead(n.id).subscribe(() => {
        this.items.update((list) =>
          list.map((x) => (x.id === n.id ? { ...x, isRead: true } : x))
        );
      });
    }
    if (n.actionUrl) {
      this.router.navigateByUrl(n.actionUrl);
    }
  }

  onMarkRead(n: Notification, event: Event): void {
    event.stopPropagation();
    this.service.markAsRead(n.id).subscribe(() => {
      this.items.update((list) =>
        list.map((x) => (x.id === n.id ? { ...x, isRead: true } : x))
      );
      this.snack.open('Marcada como leída', 'Cerrar', { duration: 2000 });
    });
  }

  onDelete(n: Notification, event: Event): void {
    event.stopPropagation();
    const data: ConfirmDialogData = {
      title: 'Eliminar notificación',
      message: `¿Seguro que quieres eliminar "${n.title}"?`,
      confirmLabel: 'Eliminar',
      confirmColor: 'warn',
    };
    this.dialog
      .open(ConfirmDialogComponent, { data, width: '420px' })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.service.delete(n.id).subscribe({
          next: () => {
            this.snack.open('Notificación eliminada', 'Cerrar', { duration: 2000 });
            this.load();
          },
          error: () => {
            this.snack.open('Error al eliminar', 'Cerrar', { duration: 3000 });
          },
        });
      });
  }

  markAllAsRead(): void {
    if (!this.hasUnread()) return;
    this.service.markAllAsRead().subscribe(() => {
      this.items.update((list) => list.map((n) => ({ ...n, isRead: true })));
      this.snack.open('Todas marcadas como leídas', 'Cerrar', { duration: 2000 });
    });
  }

  iconFor(type: string): string {
    switch (type) {
      case 'success': return 'check_circle';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'info';
    }
  }

  colorFor(type: string): string {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-amber-600 bg-amber-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  }

  priorityBadge(priority: string): string {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'low': return 'bg-slate-100 text-slate-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  }

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