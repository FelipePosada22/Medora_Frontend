import { Injectable, inject, signal, computed } from '@angular/core';
import { TokenService } from './token.service';

/** Minimal user shape stored in global auth state. */
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST';
  tenantId: string;
}

/**
 * Global auth state service.
 * Holds the current session user and exposes reactive signals consumed
 * by guards, the layout, and any feature that needs the current user.
 */
@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly tokenService = inject(TokenService);

  private readonly _user = signal<SessionUser | null>(null);

  /** The authenticated user, or null when logged out. */
  readonly user = this._user.asReadonly();

  /** True when a valid access token exists in storage. */
  readonly isAuthenticated = computed(() => this.tokenService.hasToken() && !!this._user());

  setUser(user: SessionUser): void {
    this._user.set(user);
  }

  clearSession(): void {
    this.tokenService.clearTokens();
    this._user.set(null);
  }
}
