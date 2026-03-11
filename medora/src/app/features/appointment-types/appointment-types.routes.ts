import { Routes } from '@angular/router';

export const appointmentTypesRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/appointment-types-page/appointment-types-page.component').then(
        m => m.AppointmentTypesPageComponent,
      ),
  },
];
