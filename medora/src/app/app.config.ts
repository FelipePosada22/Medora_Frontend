import {
  ApplicationConfig,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import localeEs from '@angular/common/locales/es';

registerLocaleData(localeEs);

import { routes } from './app.routes';
import { authInterceptor } from './core/auth/interceptors/auth.interceptor';
import { API_URL } from './core/config/api.config';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),

    // Router with input binding (route params auto-bound to component inputs)
    provideRouter(routes, withComponentInputBinding()),

    // HTTP client with auth interceptor
    provideHttpClient(withInterceptors([authInterceptor])),

    { provide: API_URL, useValue: environment.apiUrl },

    // Spanish locale
    { provide: LOCALE_ID, useValue: 'es' },
  ],
};
