import { Routes } from '@angular/router';

export const prescriptionsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/prescriptions-page/prescriptions-page.component')
        .then(m => m.PrescriptionsPageComponent),
  },
];
