import { Routes } from '@angular/router';

export const schedulesRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/schedules-page/schedules-page.component').then(
        m => m.SchedulesPageComponent,
      ),
  },
];
