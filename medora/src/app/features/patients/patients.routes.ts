import { Routes } from '@angular/router';

/** Patients feature routes (lazy loaded). */
export const patientsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/patients-page/patients-page.component').then(
        m => m.PatientsPageComponent,
      ),
  },
];
