import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AppointmentsApi, CalendarQueryParams } from '../api/appointments.api';
import { AppointmentMapper } from '../mappers/appointment.mapper';
import { Appointment, AppointmentPayload } from '../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentsService {
  private readonly api = inject(AppointmentsApi);

  getAll(): Observable<Appointment[]> {
    return this.api.getAll().pipe(map(AppointmentMapper.toDomainList));
  }

  getCalendar(params: CalendarQueryParams): Observable<Appointment[]> {
    return this.api.getCalendar(params).pipe(map(AppointmentMapper.toDomainList));
  }

  create(payload: AppointmentPayload): Observable<Appointment> {
    return this.api.create(payload).pipe(map(AppointmentMapper.toDomain));
  }

  update(id: string, payload: Partial<AppointmentPayload>): Observable<void> {
    return this.api.update(id, payload);
  }

  remove(id: string): Observable<void> {
    return this.api.remove(id);
  }
}
