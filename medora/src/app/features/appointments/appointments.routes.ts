import { Routes } from '@angular/router';

export const appointmentsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/appointments-page/appointments-page.component').then(
        m => m.AppointmentsPageComponent,
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/create-appointment-page/create-appointment-page.component').then(
        m => m.CreateAppointmentPageComponent,
      ),
  },
];
