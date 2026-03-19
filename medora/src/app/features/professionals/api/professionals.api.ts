import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../../core/config/api.config';
import { ProfessionalPayload } from '../models/professional.model';

/** Raw professional shape from the API. */
export interface ProfessionalDto {
  id: string;
  tenantId: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class ProfessionalsApi {
  private readonly http    = inject(HttpClient);
  private readonly apiUrl  = inject(API_URL);
  private readonly baseUrl = `${this.apiUrl}/professionals`;

  getAll(): Observable<ProfessionalDto[]> {
    return this.http.get<ProfessionalDto[]>(this.baseUrl);
  }

  create(payload: ProfessionalPayload): Observable<ProfessionalDto> {
    return this.http.post<ProfessionalDto>(this.baseUrl, payload);
  }

  update(id: string, payload: Partial<ProfessionalPayload>): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, payload);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
