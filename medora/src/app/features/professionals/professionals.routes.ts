import { Routes } from '@angular/router';

export const professionalsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/professionals-page/professionals-page.component').then(
        m => m.ProfessionalsPageComponent,
      ),
  },
];
