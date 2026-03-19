import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PrescriptionsApi } from '../api/prescriptions.api';
import { PrescriptionMapper } from '../mappers/prescription.mapper';
import { Prescription, CreatePrescriptionPayload } from '../models/prescription.model';

@Injectable({ providedIn: 'root' })
export class PrescriptionsService {
  private readonly api = inject(PrescriptionsApi);

  getAll(): Observable<Prescription[]> {
    return this.api.getAll().pipe(map(PrescriptionMapper.toDomainList));
  }

  getById(id: string): Observable<Prescription> {
    return this.api.getById(id).pipe(map(PrescriptionMapper.toDomain));
  }

  getByPatient(patientId: string): Observable<Prescription[]> {
    return this.api.getByPatient(patientId).pipe(map(PrescriptionMapper.toDomainList));
  }

  create(payload: CreatePrescriptionPayload): Observable<Prescription> {
    return this.api.create(payload).pipe(map(PrescriptionMapper.toDomain));
  }

  signDoctor(id: string, signature: string): Observable<Prescription> {
    return this.api.signDoctor(id, signature).pipe(map(PrescriptionMapper.toDomain));
  }

  signPatient(id: string, signature: string, fingerprint: string): Observable<Prescription> {
    return this.api.signPatient(id, signature, fingerprint).pipe(map(PrescriptionMapper.toDomain));
  }

  finalize(id: string): Observable<Prescription> {
    return this.api.finalize(id).pipe(map(PrescriptionMapper.toDomain));
  }
}
