import { InjectionToken } from '@angular/core';

/**
 * Injection token for the base API URL.
 * Override in `app.config.ts` via `{ provide: API_URL, useValue: env.apiUrl }`.
 */
export const API_URL = new InjectionToken<string>('API_URL', {
  factory: () => 'https://joyful-trust-dev.up.railway.app',
});
