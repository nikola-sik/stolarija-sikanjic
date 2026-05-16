import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AdminUser,
  LoginRequest,
  LoginResponse,
} from '../models/api.model';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

/**
 * Klijentski auth - drži JWT token i info o ulogovanom korisniku.
 * Token se čuva u localStorage (OK za marketing app; za sensitive
 * aplikacije razmotri httpOnly cookie da se zaštiti od XSS-a).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _currentUser = signal<AdminUser | null>(this.loadStoredUser());

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);
  readonly isAdmin = computed(() => this._currentUser()?.role === 'ADMIN');

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await firstValueFrom(
      this.http.post<LoginResponse>(`${environment.apiBaseUrl}/auth/login`, credentials),
    );

    this.storeToken(response.token);
    this.storeUser(response.user);
    this._currentUser.set(response.user);

    return response;
  }

  logout(): void {
    this.clearStorage();
    this._currentUser.set(null);
  }

  async refreshCurrentUser(): Promise<void> {
    if (!this.getToken()) return;
    try {
      const user = await firstValueFrom(
        this.http.get<AdminUser>(`${environment.apiBaseUrl}/auth/me`),
      );
      this.storeUser(user);
      this._currentUser.set(user);
    } catch {
      // Token expirirao ili nevažeći - očisti
      this.logout();
    }
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  private storeToken(token: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem(TOKEN_KEY, token);
  }

  private storeUser(user: AdminUser): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  private loadStoredUser(): AdminUser | null {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return null;
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AdminUser) : null;
    } catch {
      return null;
    }
  }

  private clearStorage(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}
