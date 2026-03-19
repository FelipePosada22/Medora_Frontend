import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';
import { roleGuard } from './core/auth/guards/role.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

const ADMIN_ONLY   = roleGuard(['ADMIN']);
const ADMIN_RECEP  = roleGuard(['ADMIN', 'DOCTOR', 'RECEPTIONIST']);
const NO_AUXILIARY = roleGuard(['ADMIN', 'DOCTOR', 'RECEPTIONIST']);

export const routes: Routes = [
  // ── Public routes ──────────────────────────────────────────────────────────
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.authRoutes),
  },

  // ── Protected routes (inside main layout) ──────────────────────────────────
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      // ADMIN | DOCTOR | RECEPTIONIST
      {
        path: 'dashboard',
        canActivate: [NO_AUXILIARY],
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then(m => m.dashboardRoutes),
      },

      // All roles
      {
        path: 'treatment-plans',
        loadChildren: () =>
          import('./features/treatment-plans/treatment-plans.routes').then(m => m.treatmentPlansRoutes),
      },
      {
        path: 'prescriptions',
        loadChildren: () =>
          import('./features/prescriptions/prescriptions.routes').then(m => m.prescriptionsRoutes),
      },
      {
        path: 'calendar',
        loadChildren: () =>
          import('./features/calendar/calendar.routes').then(m => m.calendarRoutes),
      },
      {
        path: 'appointments',
        loadChildren: () =>
          import('./features/appointments/appointments.routes').then(m => m.appointmentsRoutes),
      },
      {
        path: 'patients',
        loadChildren: () =>
          import('./features/patients/patients.routes').then(m => m.patientsRoutes),
      },

      // ADMIN | RECEPTIONIST
      {
        path: 'billing',
        canActivate: [ADMIN_RECEP],
        loadChildren: () =>
          import('./features/billing/billing.routes').then(m => m.billingRoutes),
      },

      // ADMIN only
      {
        path: 'professionals',
        canActivate: [ADMIN_ONLY],
        loadChildren: () =>
          import('./features/professionals/professionals.routes').then(m => m.professionalsRoutes),
      },
      {
        path: 'appointment-types',
        canActivate: [ADMIN_ONLY],
        loadChildren: () =>
          import('./features/appointment-types/appointment-types.routes').then(m => m.appointmentTypesRoutes),
      },
      {
        path: 'schedules',
        canActivate: [ADMIN_ONLY],
        loadChildren: () =>
          import('./features/schedules/schedules.routes').then(m => m.schedulesRoutes),
      },
      {
        path: 'settings',
        canActivate: [ADMIN_ONLY],
        loadChildren: () =>
          import('./features/settings/settings.routes').then(m => m.settingsRoutes),
      },
    ],
  },

  // ── Fallback ───────────────────────────────────────────────────────────────
  { path: '**', redirectTo: 'auth/login' },
];
