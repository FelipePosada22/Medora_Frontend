import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../../core/config/api.config';
import { PatientPayload } from '../models/patient.model';

/** Raw patient shape from the API (camelCase, as returned by the backend). */
export interface PatientDto {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  email: string;
  birthdate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Patients HTTP API service.
 * Handles all REST communication with the /patients endpoints.
 */
@Injectable({ providedIn: 'root' })
export class PatientsApi {
  private readonly http    = inject(HttpClient);
  private readonly apiUrl  = inject(API_URL);
  private readonly baseUrl = `${this.apiUrl}/patients`;

  getAll(): Observable<PatientDto[]> {
    return this.http.get<PatientDto[]>(this.baseUrl);
  }

  getById(id: string): Observable<PatientDto> {
    return this.http.get<PatientDto>(`${this.baseUrl}/${id}`);
  }

  create(payload: PatientPayload): Observable<PatientDto> {
    return this.http.post<PatientDto>(this.baseUrl, payload);
  }

  update(id: string, payload: Partial<PatientPayload>): Observable<PatientDto> {
    return this.http.patch<PatientDto>(`${this.baseUrl}/${id}`, payload);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
