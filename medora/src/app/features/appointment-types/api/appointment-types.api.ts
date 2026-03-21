import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../../core/config/api.config';
import { AppointmentTypePayload } from '../models/appointment-type.model';

/** Raw appointment-type shape from the API. */
export interface AppointmentTypeDto {
  id: string;
  tenantId: string;
  name: string;
  durationMinutes: number;
  price: number | null;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AppointmentTypesApi {
  private readonly http    = inject(HttpClient);
  private readonly apiUrl  = inject(API_URL);
  private readonly baseUrl = `${this.apiUrl}/appointment-types`;

  getAll(): Observable<AppointmentTypeDto[]> {
    return this.http.get<AppointmentTypeDto[]>(this.baseUrl);
  }

  create(payload: AppointmentTypePayload): Observable<AppointmentTypeDto> {
    return this.http.post<AppointmentTypeDto>(this.baseUrl, payload);
  }

  update(id: string, payload: Partial<AppointmentTypePayload>): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, payload);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
