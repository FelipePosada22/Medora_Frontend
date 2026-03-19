import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { AuthApi, LoginResponseDto } from '../api/auth.api';
import { AuthMapper } from '../mappers/auth.mapper';
import { LoginCredentials } from '../models/auth.model';
import { TokenService } from '../../../core/auth/services/token.service';
import { AuthStateService } from '../../../core/auth/services/auth-state.service';

/**
 * Auth domain service.
 * Orchestrates the login/logout flow: API call → token storage → global state update → navigation.
 * Singleton so the session is consistent across the entire app.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authApi   = inject(AuthApi);
  private readonly tokenSvc  = inject(TokenService);
  private readonly authState = inject(AuthStateService);
  private readonly router    = inject(Router);

  login(credentials: LoginCredentials): Observable<void> {
    localStorage.clear();
    return this.authApi.login(credentials).pipe(
      tap((dto: LoginResponseDto) => {
        const tokens = AuthMapper.toTokens(dto);
        this.tokenSvc.saveTokens(tokens.accessToken);
        this.authState.setUser(AuthMapper.toSessionUser(dto));
      }),
      tap((dto: LoginResponseDto) => {
        const landing = dto.user.role === 'AUXILIARY' ? '/calendar' : '/dashboard';
        this.router.navigate([landing]);
      }),
      map(() => void 0),
    );
  }

  /**
   * Invalidates the token on the server, then clears local session.
   * Local state is always cleared even if the API call fails.
   */
  logout(): void {
    this.authApi.logout().subscribe({
      next: () => {
        this.authState.clearSession();
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        // API failed (network error, token already invalid, etc.) — clear locally anyway
        this.authState.clearSession();
        this.router.navigate(['/auth/login']);
      },
    });
  }
}
