import { Component, computed, inject, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AuthStore } from '../../core/auth/auth.store';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  permission?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MatListModule,
    MatIconModule,
    MatDividerModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  private readonly store = inject(AuthStore);

  readonly itemClicked = output<void>();

  private readonly allItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Usuarios', icon: 'people', route: '/users', permission: 'users.read' },
    { label: 'Roles', icon: 'shield', route: '/roles', permission: 'roles.read' },
    { label: 'Configuración', icon: 'settings', route: '/settings', permission: 'settings.read' },
    { label: 'Auditoría', icon: 'history', route: '/audit', permission: 'audit.read' },
    { label: 'Notificaciones', icon: 'notifications', route: '/notifications', permission: 'notifications.read' },
  ];

  readonly visibleItems = computed(() =>
    this.allItems.filter(
      (item) => !item.permission || this.store.hasPermission(item.permission)
    )
  );

  onClick(): void {
    this.itemClicked.emit();
  }
}