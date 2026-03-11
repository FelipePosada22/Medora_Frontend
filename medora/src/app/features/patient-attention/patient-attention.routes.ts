import { Routes } from '@angular/router';

export const patientAttentionRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/attention-page/attention-page.component').then(m => m.AttentionPageComponent),
  },
];
