import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../../core/config/api.config';
import { Clinic, UpdateClinicPayload } from '../models/clinic.model';

@Injectable({ providedIn: 'root' })
export class ClinicApi {
  private readonly http   = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  get(): Observable<Clinic> {
    return this.http.get<Clinic>(`${this.apiUrl}/clinic`);
  }

  update(payload: UpdateClinicPayload): Observable<Clinic> {
    return this.http.put<Clinic>(`${this.apiUrl}/clinic`, payload);
  }
}
