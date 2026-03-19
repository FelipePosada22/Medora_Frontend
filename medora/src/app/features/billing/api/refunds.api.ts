import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../../core/config/api.config';
import type { CreateRefundPayload } from '../models/refund.model';

export interface RefundDto {
  id:        string;
  paymentId: string;
  invoiceId: string;
  amount:    number;
  reason:    string;
  method:    string;
  status:    string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class RefundsApi {
  private readonly http    = inject(HttpClient);
  private readonly baseUrl = inject(API_URL);

  create(body: CreateRefundPayload): Observable<RefundDto> {
    return this.http.post<RefundDto>(`${this.baseUrl}/refunds`, body);
  }

  getByInvoice(invoiceId: string): Observable<RefundDto[]> {
    return this.http.get<RefundDto[]>(`${this.baseUrl}/refunds/invoice/${invoiceId}`);
  }
}
