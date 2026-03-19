import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AppointmentTypesApi } from '../api/appointment-types.api';
import { AppointmentTypeMapper } from '../mappers/appointment-type.mapper';
import { AppointmentType, AppointmentTypePayload } from '../models/appointment-type.model';

@Injectable({ providedIn: 'root' })
export class AppointmentTypesService {
  private readonly api = inject(AppointmentTypesApi);

  getAll(): Observable<AppointmentType[]> {
    return this.api.getAll().pipe(map(AppointmentTypeMapper.toDomainList));
  }

  create(payload: AppointmentTypePayload): Observable<AppointmentType> {
    return this.api.create(payload).pipe(map(AppointmentTypeMapper.toDomain));
  }

  update(id: string, payload: Partial<AppointmentTypePayload>): Observable<void> {
    return this.api.update(id, payload);
  }

  remove(id: string): Observable<void> {
    return this.api.remove(id);
  }
}
