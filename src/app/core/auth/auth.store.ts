import { Injectable, computed, signal } from '@angular/core';
import { LoginResponse, User } from '../models';

const STORAGE_KEYS = {
  accessToken: 'auth.accessToken',
  refreshToken: 'auth.refreshToken',
  user: 'auth.user',
  permissions: 'auth.permissions',
  expiresAt: 'auth.expiresAt',
} as const;

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly _user = signal<User | null>(null);
  private readonly _permissions = signal<string[]>([]);
  private readonly _accessToken = signal<string | null>(null);
  private readonly _refreshToken = signal<string | null>(null);
  private readonly _expiresAt = signal<number | null>(null);

  readonly user = this._user.asReadonly();
  readonly permissions = this._permissions.asReadonly();
  readonly accessToken = this._accessToken.asReadonly();
  readonly refreshToken = this._refreshToken.asReadonly();

  readonly isAuthenticated = computed(() => !!this._accessToken());
  readonly isSuperAdmin = computed(
    () => this._user()?.roles?.includes('super_admin') ?? false
  );

  hasPermission(permission: string): boolean {
    if (this.isSuperAdmin()) return true;
    return this._permissions().includes(permission);
  }

  isExpiringSoon(marginSeconds = 60): boolean {
    const expiresAt = this._expiresAt();
    if (!expiresAt) return true;
    return Date.now() >= expiresAt - marginSeconds * 1000;
  }

  setSession(response: LoginResponse): void {
    const expiresAt = Date.now() + response.expiresIn * 1000;

    this._user.set(response.user);
    this._permissions.set(response.permissions);
    this._accessToken.set(response.accessToken);
    this._refreshToken.set(response.refreshToken);
    this._expiresAt.set(expiresAt);

    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(response.user));
    localStorage.setItem(STORAGE_KEYS.permissions, JSON.stringify(response.permissions));
    localStorage.setItem(STORAGE_KEYS.accessToken, response.accessToken);
    localStorage.setItem(STORAGE_KEYS.refreshToken, response.refreshToken);
    localStorage.setItem(STORAGE_KEYS.expiresAt, String(expiresAt));
  }

  updateUser(user: User): void {
    this._user.set(user);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  }

  updateTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
    const expiresAt = Date.now() + expiresIn * 1000;
    this._accessToken.set(accessToken);
    this._refreshToken.set(refreshToken);
    this._expiresAt.set(expiresAt);

    localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
    localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken);
    localStorage.setItem(STORAGE_KEYS.expiresAt, String(expiresAt));
  }

  clear(): void {
    this._user.set(null);
    this._permissions.set([]);
    this._accessToken.set(null);
    this._refreshToken.set(null);
    this._expiresAt.set(null);
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  }

  hydrateFromStorage(): void {
    const accessToken = localStorage.getItem(STORAGE_KEYS.accessToken);
    const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken);
    const userRaw = localStorage.getItem(STORAGE_KEYS.user);
    const permissionsRaw = localStorage.getItem(STORAGE_KEYS.permissions);
    const expiresAtRaw = localStorage.getItem(STORAGE_KEYS.expiresAt);

    if (!accessToken || !refreshToken || !userRaw) return;

    try {
      this._accessToken.set(accessToken);
      this._refreshToken.set(refreshToken);
      this._user.set(JSON.parse(userRaw) as User);
      this._permissions.set(permissionsRaw ? JSON.parse(permissionsRaw) : []);
      this._expiresAt.set(expiresAtRaw ? Number(expiresAtRaw) : null);
    } catch {
      this.clear();
    }
  }
}