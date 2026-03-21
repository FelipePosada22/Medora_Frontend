import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../../core/config/api.config';
import { StaffUser, CreateUserPayload, UpdateUserPayload } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UsersApi {
  private readonly http    = inject(HttpClient);
  private readonly apiUrl  = inject(API_URL);
  private readonly baseUrl = `${this.apiUrl}/users`;

  getAll(): Observable<StaffUser[]> {
    return this.http.get<StaffUser[]>(this.baseUrl);
  }

  create(payload: CreateUserPayload): Observable<StaffUser> {
    return this.http.post<StaffUser>(this.baseUrl, payload);
  }

  update(id: string, payload: UpdateUserPayload): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}`, payload);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
