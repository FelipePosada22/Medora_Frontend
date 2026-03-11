import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth/interceptors/auth.interceptor';
import { API_URL } from './core/config/api.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),

    // Router with input binding (route params auto-bound to component inputs)
    provideRouter(routes, withComponentInputBinding()),

    // HTTP client with auth interceptor
    provideHttpClient(withInterceptors([authInterceptor])),

    // Override API URL — replace with environment variable in production
    { provide: API_URL, useValue: 'http://localhost:3000' },
  ],
};
