import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../../core/config/api.config';
import { PatientPayload } from '../models/patient.model';

/** Raw patient shape from the API (camelCase, as returned by the backend). */
export interface PatientDto {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  email: string;
  birthdate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PatientAppointmentDto {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
  professional: { id: string; name: string; specialty: string };
  appointmentType: { id: string; name: string; durationMinutes: number; price: number };
}

export interface PatientInvoiceItemDto {
  description: string; quantity: number; unitPrice: number; total: number;
}

export interface PatientInvoicePaymentDto {
  amount: number; method: string; reference: string | null; paidAt: string;
}

export interface PatientInvoiceDto {
  id: string;
  status: string;
  issuedAt: string | null;
  dueDate: string | null;
  notes: string | null;
  items: PatientInvoiceItemDto[];
  payments: PatientInvoicePaymentDto[];
  appointment: {
    id: string;
    startTime: string;
    appointmentType: { name: string };
  } | null;
}

/**
 * Patients HTTP API service.
 * Handles all REST communication with the /patients endpoints.
 */
@Injectable({ providedIn: 'root' })
export class PatientsApi {
  private readonly http    = inject(HttpClient);
  private readonly apiUrl  = inject(API_URL);
  private readonly baseUrl = `${this.apiUrl}/patients`;

  getAll(): Observable<PatientDto[]> {
    return this.http.get<PatientDto[]>(this.baseUrl);
  }

  getById(id: string): Observable<PatientDto> {
    return this.http.get<PatientDto>(`${this.baseUrl}/${id}`);
  }

  create(payload: PatientPayload): Observable<PatientDto> {
    return this.http.post<PatientDto>(this.baseUrl, payload);
  }

  update(id: string, payload: Partial<PatientPayload>): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, payload);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getAppointments(id: string): Observable<PatientAppointmentDto[]> {
    return this.http.get<PatientAppointmentDto[]>(`${this.baseUrl}/${id}/appointments`);
  }

  getInvoices(id: string): Observable<PatientInvoiceDto[]> {
    return this.http.get<PatientInvoiceDto[]>(`${this.baseUrl}/${id}/invoices`);
  }
}
