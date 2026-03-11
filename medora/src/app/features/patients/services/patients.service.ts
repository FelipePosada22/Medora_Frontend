import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { PatientsApi } from '../api/patients.api';
import { PatientMapper } from '../mappers/patient.mapper';
import { Patient, PatientPayload } from '../models/patient.model';

/**
 * Patients domain service.
 * Orchestrates API calls and applies data mapping.
 * Does not hold state — state is managed in the ViewModels.
 */
@Injectable({ providedIn: 'root' })
export class PatientsService {
  private readonly api = inject(PatientsApi);

  getAll(): Observable<Patient[]> {
    return this.api.getAll().pipe(map(PatientMapper.toDomainList));
  }

  getById(id: string): Observable<Patient> {
    return this.api.getById(id).pipe(map(PatientMapper.toDomain));
  }

  create(payload: PatientPayload): Observable<Patient> {
    return this.api.create(payload).pipe(map(PatientMapper.toDomain));
  }

  update(id: string, payload: Partial<PatientPayload>): Observable<Patient> {
    return this.api.update(id, payload).pipe(map(PatientMapper.toDomain));
  }

  remove(id: string): Observable<void> {
    return this.api.remove(id);
  }
}
