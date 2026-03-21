import { Injectable, signal } from '@angular/core';

const STORAGE_KEY    = 'medora_currency';
const DEFAULT_CODE   = 'COP';

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private readonly _code = signal<string>(
    localStorage.getItem(STORAGE_KEY) || DEFAULT_CODE,
  );

  /** Reactive currency code — use in templates as `currencyCode()`. */
  readonly currencyCode = this._code.asReadonly();

  /** Updates the active currency and persists it to localStorage. */
  set(code: string): void {
    const value = code || DEFAULT_CODE;
    this._code.set(value);
    localStorage.setItem(STORAGE_KEY, value);
  }
}
