import { Injectable } from '@angular/core';

const ACCESS_TOKEN_KEY  = 'medora_access_token';
const REFRESH_TOKEN_KEY = 'medora_refresh_token';

/**
 * Manages JWT tokens in localStorage.
 * Single responsibility: read, write and clear auth tokens.
 */
@Injectable({ providedIn: 'root' })
export class TokenService {

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  hasToken(): boolean {
    return !!this.getAccessToken();
  }
}
