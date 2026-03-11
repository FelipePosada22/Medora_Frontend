import { Routes } from '@angular/router';

export const calendarRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/calendar-page/calendar-page.component').then(
        m => m.CalendarPageComponent,
      ),
  },
];
