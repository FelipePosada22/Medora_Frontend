import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ProfessionalsApi } from '../api/professionals.api';
import { ProfessionalMapper } from '../mappers/professional.mapper';
import { Professional, ProfessionalPayload } from '../models/professional.model';

@Injectable({ providedIn: 'root' })
export class ProfessionalsService {
  private readonly api = inject(ProfessionalsApi);

  getAll(): Observable<Professional[]> {
    return this.api.getAll().pipe(map(ProfessionalMapper.toDomainList));
  }

  create(payload: ProfessionalPayload): Observable<Professional> {
    return this.api.create(payload).pipe(map(ProfessionalMapper.toDomain));
  }

  update(id: string, payload: Partial<ProfessionalPayload>): Observable<void> {
    return this.api.update(id, payload);
  }

  remove(id: string): Observable<void> {
    return this.api.remove(id);
  }
}
