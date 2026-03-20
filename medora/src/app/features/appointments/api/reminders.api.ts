import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../../core/config/api.config';

export interface ReminderDto {
  id:            string;
  type:          string;
  status:        string;
  message:       string;
  sentAt:        string;
  appointmentId?: string;
  tenantId?:     string;
}

@Injectable({ providedIn: 'root' })
export class RemindersApi {
  private readonly http    = inject(HttpClient);
  private readonly baseUrl = inject(API_URL);

  send(appointmentId: string): Observable<ReminderDto> {
    return this.http.post<ReminderDto>(
      `${this.baseUrl}/reminders/appointments/${appointmentId}/send`,
      {},
    );
  }

  getByAppointment(appointmentId: string): Observable<ReminderDto[]> {
    return this.http.get<ReminderDto[]>(
      `${this.baseUrl}/reminders/appointments/${appointmentId}`,
    );
  }
}
