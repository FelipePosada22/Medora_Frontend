import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../../core/config/api.config';

// ── DTO shapes ──────────────────────────────────────────────────────────────

export interface InvoiceItemDto {
  description: string;
  quantity:    number;
  unitPrice:   number;
  total:       number;
}

export interface InvoicePaymentDto {
  id:        string;
  amount:    number;
  method:    string;
  reference: string | null;
  paidAt:    string;
}

export interface InvoiceDto {
  id:          string;
  status:      string;
  dueDate:     string | null;
  notes:       string | null;
  createdAt:   string;
  issuedAt:    string | null;
  patient:     { id: string; name: string; [k: string]: unknown };
  appointment: { id: string; [k: string]: unknown } | null;
  items:       InvoiceItemDto[];
  payments:    InvoicePaymentDto[];
}

// ── Request bodies ──────────────────────────────────────────────────────────

export interface CreateInvoiceBody {
  patientId:      string;
  appointmentId?: string;
  dueDate?:       string;
  notes?:         string;
  items:          { description: string; quantity: number; unitPrice: number }[];
}

export interface AddPaymentBody {
  amount:     number;
  method:     string;
  reference?: string;
}

// ── API service ─────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class InvoicesApi {
  private readonly http    = inject(HttpClient);
  private readonly baseUrl = inject(API_URL);

  getAll(): Observable<InvoiceDto[]> {
    return this.http.get<InvoiceDto[]>(`${this.baseUrl}/invoices`);
  }

  getById(id: string): Observable<InvoiceDto> {
    return this.http.get<InvoiceDto>(`${this.baseUrl}/invoices/${id}`);
  }

  create(body: CreateInvoiceBody): Observable<InvoiceDto> {
    return this.http.post<InvoiceDto>(`${this.baseUrl}/invoices`, body);
  }

  updateStatus(id: string, status: string): Observable<InvoiceDto> {
    return this.http.patch<InvoiceDto>(`${this.baseUrl}/invoices/${id}/status`, { status });
  }

  addPayment(id: string, body: AddPaymentBody): Observable<InvoicePaymentDto> {
    return this.http.post<InvoicePaymentDto>(`${this.baseUrl}/invoices/${id}/payments`, body);
  }
}
