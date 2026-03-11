import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../../core/config/api.config';
import { SchedulePayload } from '../models/schedule.model';

/** Raw schedule shape from the API. */
export interface ScheduleDto {
  id: string;
  professionalId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

@Injectable({ providedIn: 'root' })
export class SchedulesApi {
  private readonly http    = inject(HttpClient);
  private readonly apiUrl  = inject(API_URL);
  private readonly baseUrl = `${this.apiUrl}/schedules`;

  getByProfessional(professionalId: string): Observable<ScheduleDto[]> {
    return this.http.get<ScheduleDto[]>(`${this.baseUrl}/professional/${professionalId}`);
  }

  create(payload: SchedulePayload): Observable<ScheduleDto> {
    return this.http.post<ScheduleDto>(this.baseUrl, payload);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
