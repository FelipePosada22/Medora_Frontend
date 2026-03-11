import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { SchedulesApi } from '../api/schedules.api';
import { ScheduleMapper } from '../mappers/schedule.mapper';
import { Schedule, SchedulePayload } from '../models/schedule.model';

@Injectable({ providedIn: 'root' })
export class SchedulesService {
  private readonly api = inject(SchedulesApi);

  getByProfessional(professionalId: string): Observable<Schedule[]> {
    return this.api.getByProfessional(professionalId).pipe(map(ScheduleMapper.toDomainList));
  }

  create(payload: SchedulePayload): Observable<Schedule> {
    return this.api.create(payload).pipe(map(ScheduleMapper.toDomain));
  }

  remove(id: string): Observable<void> {
    return this.api.remove(id);
  }
}
