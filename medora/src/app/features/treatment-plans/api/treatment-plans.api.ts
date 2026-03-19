import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../../core/config/api.config';
import type { CreateTreatmentPlanPayload, TreatmentItemStatus } from '../models/treatment-plan.model';

export interface UpdateItemBody {
  description?: string;
  price?:       number;
  notes?:       string | null;
}

export interface TreatmentPlanItemDto {
  id:          string;
  description: string;
  price:       number;
  notes:       string | null;
  status:      string;
}

export interface TreatmentPlanInvoiceItemDto {
  id:                   string;
  description:          string;
  quantity:             number;
  unitPrice:            number;
  total:                number;
  treatmentPlanItemId?: string | null;
}

export interface TreatmentPlanInvoicePaymentDto {
  id:        string;
  amount:    number;
  method:    string;
  reference: string | null;
  paidAt:    string;
}

export interface TreatmentPlanInvoiceDto {
  id:             string;
  status:         string;
  issuedAt:       string | null;
  dueDate:        string | null;
  notes:          string | null;
  createdAt:      string;
  items:          TreatmentPlanInvoiceItemDto[];
  payments:       TreatmentPlanInvoicePaymentDto[];
}

export interface TreatmentPlanDto {
  id:        string;
  title:     string;
  notes:     string | null;
  status:    string;
  createdAt: string;
  patient:   { id: string; name: string; [k: string]: unknown };
  items:     TreatmentPlanItemDto[];
  invoices:  TreatmentPlanInvoiceDto[];
}

@Injectable({ providedIn: 'root' })
export class TreatmentPlansApi {
  private readonly http    = inject(HttpClient);
  private readonly baseUrl = inject(API_URL);

  getAll(): Observable<TreatmentPlanDto[]> {
    return this.http.get<TreatmentPlanDto[]>(`${this.baseUrl}/treatment-plans`);
  }

  getById(id: string): Observable<TreatmentPlanDto> {
    return this.http.get<TreatmentPlanDto>(`${this.baseUrl}/treatment-plans/${id}`);
  }

  getByPatient(patientId: string): Observable<TreatmentPlanDto[]> {
    return this.http.get<TreatmentPlanDto[]>(`${this.baseUrl}/treatment-plans/patient/${patientId}`);
  }

  create(payload: CreateTreatmentPlanPayload): Observable<TreatmentPlanDto> {
    return this.http.post<TreatmentPlanDto>(`${this.baseUrl}/treatment-plans`, payload);
  }

  updateItemStatus(itemId: string, status: TreatmentItemStatus): Observable<TreatmentPlanDto> {
    return this.http.patch<TreatmentPlanDto>(
      `${this.baseUrl}/treatment-plans/items/${itemId}/status`, { status },
    );
  }

  updateItem(itemId: string, body: UpdateItemBody): Observable<TreatmentPlanDto> {
    return this.http.patch<TreatmentPlanDto>(
      `${this.baseUrl}/treatment-plans/items/${itemId}`, body,
    );
  }

  deleteItem(itemId: string): Observable<TreatmentPlanDto> {
    return this.http.delete<TreatmentPlanDto>(
      `${this.baseUrl}/treatment-plans/items/${itemId}`,
    );
  }

  deletePlan(planId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/treatment-plans/${planId}`);
  }
}
