import { Component, computed, inject, output } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthStore } from '../../core/auth/auth.store';
import { AuthService } from '../../core/auth/auth.service';
import { ThemeService } from '../../core/theme/theme.service';
import { NotificationsBellComponent } from '../../shared/notifications-bell/notifications-bell.component';
import { ChangePasswordDialogComponent } from '../../shared/change-password-dialog/change-password-dialog.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
    MatDialogModule,
    NotificationsBellComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private readonly store = inject(AuthStore);
  private readonly auth = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  readonly themeService = inject(ThemeService);

  readonly toggleSidenav = output<void>();

  readonly userName = computed(() => this.store.user()?.name ?? 'Usuario');
  readonly userEmail = computed(() => this.store.user()?.email ?? '');
  readonly userRole = computed(() => this.store.user()?.role ?? '');
  readonly initials = computed(() => {
    const name = this.store.user()?.name ?? 'U';
    return name
      .split(' ')
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('');
  });

  readonly isDark = computed(() => this.themeService.theme() === 'dark');

  openChangePassword(): void {
    this.dialog.open(ChangePasswordDialogComponent, { width: '460px' });
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  logout(): void {
    this.auth.logout().subscribe();
  }
}