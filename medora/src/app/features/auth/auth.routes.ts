import { Routes } from '@angular/router';
import { guestGuard } from '../../core/auth/guards/guest.guard';

/**
 * Auth feature routes.
 * All routes protected by guestGuard (redirect to /dashboard if already logged in).
 */
export const authRoutes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/login-page/login-page.component').then(
        m => m.LoginPageComponent,
      ),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
