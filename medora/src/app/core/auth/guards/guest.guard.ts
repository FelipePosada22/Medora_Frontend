import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../services/token.service';

/**
 * Prevents authenticated users from accessing guest-only routes (e.g. login).
 * Redirects to /dashboard when a token already exists.
 */
export const guestGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);
  const router       = inject(Router);

  return !tokenService.hasToken() || router.createUrlTree(['/dashboard']);
};
