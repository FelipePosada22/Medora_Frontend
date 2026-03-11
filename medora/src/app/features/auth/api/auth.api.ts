import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../../core/config/api.config';

/** Raw login response shape from the REST API. */
export interface LoginResponseDto {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    role: string;
    tenant_id: string;
  };
}

/**
 * Auth API service.
 * Responsible only for HTTP communication with the /auth endpoints.
 */
@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly http    = inject(HttpClient);
  private readonly apiUrl  = inject(API_URL);
  private readonly baseUrl = `${this.apiUrl}/auth`;

  /**
   * Sends login credentials and returns the raw API response.
   * @param body - email and password
   */
  login(body: { email: string; password: string }): Observable<LoginResponseDto> {
    return this.http.post<LoginResponseDto>(`${this.baseUrl}/login`, body);
  }

  /** Invalidates the current session on the server. */
  logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/logout`, {});
  }
}
