import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../services/token.service';

/**
 * Protects routes that require an authenticated session.
 * Redirects to /auth/login when no access token is present.
 */
export const authGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);
  const router       = inject(Router);

  return tokenService.hasToken() || router.createUrlTree(['/auth/login']);
};
