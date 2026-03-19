import { Routes } from '@angular/router';

export const treatmentPlansRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/treatment-plans-page/treatment-plans-page.component')
        .then(m => m.TreatmentPlansPageComponent),
  },
];
