import { Injectable, inject, signal, computed } from '@angular/core';
import { TokenService } from './token.service';

/** Minimal user shape stored in global auth state. */
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST' | 'AUXILIARY';
  tenantId: string;
}

/**
 * Global auth state service.
 * Holds the current session user and exposes reactive signals consumed
 * by guards, the layout, and any feature that needs the current user.
 *
 * On construction, attempts to restore the session from the stored JWT
 * so the user is not lost on page refresh.
 */
@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly tokenService = inject(TokenService);

  private readonly _user = signal<SessionUser | null>(null);

  readonly user = this._user.asReadonly();

  readonly isAuthenticated = computed(() => this.tokenService.hasToken() && !!this._user());

  constructor() {
    const token = this.tokenService.getAccessToken();
    if (token) {
      const user = this.decodeToken(token);
      if (user) {
        this._user.set(user);
      } else {
        // Token present but invalid/expired — clear it
        this.tokenService.clearTokens();
      }
    }
  }

  setUser(user: SessionUser): void {
    this._user.set(user);
  }

  clearSession(): void {
    this.tokenService.clearTokens();
    this._user.set(null);
  }

  private decodeToken(token: string): SessionUser | null {
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));

      // Reject expired tokens locally before any API call
      if (payload.exp && Date.now() / 1000 > payload.exp) {
        return null;
      }

      const id       = payload.sub ?? payload.id;
      const name     = payload.name;
      const email    = payload.email;
      const role     = payload.role;
      const tenantId = payload.tenantId;

      if (!id || !name || !email || !role || !tenantId) return null;

      return { id, name, email, role, tenantId };
    } catch {
      return null;
    }
  }
}
