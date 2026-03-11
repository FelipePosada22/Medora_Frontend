import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../../core/config/api.config';
import { AppointmentPayload } from '../models/appointment.model';

/** Nested patient shape inside an appointment response. */
export interface AppointmentPatientDto {
  id: string;
  name: string;
}

/** Nested professional shape inside an appointment response. */
export interface AppointmentProfessionalDto {
  id: string;
  name: string;
}

/** Nested appointment-type shape inside an appointment response. */
export interface AppointmentTypeRefDto {
  id: string;
  name: string;
  durationMinutes: number;
}

/** Raw appointment shape from the API. */
export interface AppointmentDto {
  id: string;
  tenantId: string;
  patientId: string;
  professionalId: string;
  appointmentTypeId: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
  createdAt: string;
  patient: AppointmentPatientDto;
  professional: AppointmentProfessionalDto;
  appointmentType: AppointmentTypeRefDto;
}

export interface CalendarQueryParams {
  professionalId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

@Injectable({ providedIn: 'root' })
export class AppointmentsApi {
  private readonly http    = inject(HttpClient);
  private readonly apiUrl  = inject(API_URL);
  private readonly baseUrl = `${this.apiUrl}/appointments`;

  getAll(): Observable<AppointmentDto[]> {
    return this.http.get<AppointmentDto[]>(this.baseUrl);
  }

  getCalendar(params: CalendarQueryParams): Observable<AppointmentDto[]> {
    const httpParams = new HttpParams()
      .set('professionalId', params.professionalId)
      .set('startDate', params.startDate)
      .set('endDate', params.endDate);
    return this.http.get<AppointmentDto[]>(`${this.baseUrl}/calendar`, { params: httpParams });
  }

  create(payload: AppointmentPayload): Observable<AppointmentDto> {
    return this.http.post<AppointmentDto>(this.baseUrl, payload);
  }

  update(id: string, payload: Partial<AppointmentPayload>): Observable<AppointmentDto> {
    return this.http.put<AppointmentDto>(`${this.baseUrl}/${id}`, payload);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
