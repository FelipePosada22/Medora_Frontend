import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

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
      { path: '',             redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then(m => m.dashboardRoutes),
      },
      {
        path: 'patients',
        loadChildren: () =>
          import('./features/patients/patients.routes').then(m => m.patientsRoutes),
      },
      {
        path: 'professionals',
        loadChildren: () =>
          import('./features/professionals/professionals.routes').then(m => m.professionalsRoutes),
      },
      {
        path: 'appointment-types',
        loadChildren: () =>
          import('./features/appointment-types/appointment-types.routes').then(m => m.appointmentTypesRoutes),
      },
      {
        path: 'appointments',
        loadChildren: () =>
          import('./features/appointments/appointments.routes').then(m => m.appointmentsRoutes),
      },
      {
        path: 'schedules',
        loadChildren: () =>
          import('./features/schedules/schedules.routes').then(m => m.schedulesRoutes),
      },
      {
        path: 'calendar',
        loadChildren: () =>
          import('./features/calendar/calendar.routes').then(m => m.calendarRoutes),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./features/settings/settings.routes').then(m => m.settingsRoutes),
      },
      {
        path: 'billing',
        loadChildren: () =>
          import('./features/billing/billing.routes').then(m => m.billingRoutes),
      },
      {
        path: 'attention',
        loadChildren: () =>
          import('./features/patient-attention/patient-attention.routes').then(m => m.patientAttentionRoutes),
      },
    ],
  },

  // ── Fallback ───────────────────────────────────────────────────────────────
  { path: '**', redirectTo: 'auth/login' },
];
