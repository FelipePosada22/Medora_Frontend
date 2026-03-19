import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStateService, SessionUser } from '../services/auth-state.service';

/**
 * Factory that returns a route guard allowing only the specified roles.
 * Unauthorized users are redirected to /calendar (accessible by all roles).
 *
 * Usage:
 *   canActivate: [roleGuard(['ADMIN', 'RECEPTIONIST'])]
 */
export const roleGuard = (allowed: SessionUser['role'][]): CanActivateFn => () => {
  const authState = inject(AuthStateService);
  const router    = inject(Router);
  const role      = authState.user()?.role;

  return role && allowed.includes(role)
    ? true
    : router.createUrlTree(['/calendar']);
};
