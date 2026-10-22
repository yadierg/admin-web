import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { UsersService } from '../users.service';
import { AdminUser } from '../models/user.model';
import { AuthStore } from '../../../core/auth/auth.store';

@Component({
  selector: 'app-user-detail',
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
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss',
})
export class UserDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly usersService = inject(UsersService);
  private readonly store = inject(AuthStore);

  readonly loading = signal(true);
  readonly user = signal<AdminUser | null>(null);
  readonly canUpdate = this.store.hasPermission('users.update');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigateByUrl('/users');
      return;
    }
    this.usersService.getById(id).subscribe({
      next: (u) => {
        this.user.set(u);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigateByUrl('/users');
      },
    });
  }
}