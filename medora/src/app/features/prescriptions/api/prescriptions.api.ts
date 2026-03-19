import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../../core/config/api.config';
import type { CreatePrescriptionPayload } from '../models/prescription.model';

export interface PrescriptionItemDto {
  id:           string;
  medication:   string;
  dosage:       string;
  frequency:    string;
  duration:     string;
  instructions: string | null;
}

export interface PrescriptionDto {
  id:               string;
  diagnosis:        string;
  notes:            string | null;
  status:           string;
  doctorSignature:  string | null;
  patientSignature: string | null;
  fingerprint:      string | null;
  createdAt:        string;
  finalizedAt:      string | null;
  patient:          { id: string; name: string; [k: string]: unknown };
  professional:     { id: string; name: string; [k: string]: unknown };
  appointment:      { id: string; [k: string]: unknown } | null;
  items:            PrescriptionItemDto[];
}

@Injectable({ providedIn: 'root' })
export class PrescriptionsApi {
  private readonly http    = inject(HttpClient);
  private readonly baseUrl = inject(API_URL);

  getAll(): Observable<PrescriptionDto[]> {
    return this.http.get<PrescriptionDto[]>(`${this.baseUrl}/prescriptions`);
  }

  getById(id: string): Observable<PrescriptionDto> {
    return this.http.get<PrescriptionDto>(`${this.baseUrl}/prescriptions/${id}`);
  }

  getByPatient(patientId: string): Observable<PrescriptionDto[]> {
    return this.http.get<PrescriptionDto[]>(`${this.baseUrl}/prescriptions/patient/${patientId}`);
  }

  create(payload: CreatePrescriptionPayload): Observable<PrescriptionDto> {
    return this.http.post<PrescriptionDto>(`${this.baseUrl}/prescriptions`, payload);
  }

  signDoctor(id: string, signature: string): Observable<PrescriptionDto> {
    return this.http.patch<PrescriptionDto>(`${this.baseUrl}/prescriptions/${id}/sign-doctor`, { signature });
  }

  signPatient(id: string, signature: string, fingerprint: string): Observable<PrescriptionDto> {
    return this.http.patch<PrescriptionDto>(`${this.baseUrl}/prescriptions/${id}/sign-patient`, { signature, fingerprint });
  }

  finalize(id: string): Observable<PrescriptionDto> {
    return this.http.patch<PrescriptionDto>(`${this.baseUrl}/prescriptions/${id}/finalize`, {});
  }
}
