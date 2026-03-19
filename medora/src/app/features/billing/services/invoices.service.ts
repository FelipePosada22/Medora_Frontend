import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { InvoicesApi, CreateInvoiceBody, AddPaymentBody, InvoicePaymentDto, CreateFromTreatmentPlanBody, InvoiceSummaryDto, UpdateInvoiceHeaderBody, InvoiceItemBody, UpdateInvoiceItemBody } from '../api/invoices.api';
import { InvoiceMapper } from '../mappers/invoice.mapper';
import { Invoice, InvoiceStatus } from '../models/invoice.model';

@Injectable({ providedIn: 'root' })
export class InvoicesService {
  private readonly api = inject(InvoicesApi);

  getAll(): Observable<Invoice[]> {
    return this.api.getAll().pipe(map(InvoiceMapper.toDomainList));
  }

  getById(id: string): Observable<Invoice> {
    return this.api.getById(id).pipe(map(InvoiceMapper.toDomain));
  }

  create(body: CreateInvoiceBody): Observable<Invoice> {
    return this.api.create(body).pipe(map(InvoiceMapper.toDomain));
  }

  updateStatus(id: string, status: InvoiceStatus): Observable<Invoice> {
    return this.api.updateStatus(id, status).pipe(map(InvoiceMapper.toDomain));
  }

  addPayment(id: string, body: AddPaymentBody): Observable<InvoicePaymentDto> {
    return this.api.addPayment(id, body);
  }

  createFromTreatmentPlan(planId: string, body: CreateFromTreatmentPlanBody): Observable<Invoice> {
    return this.api.createFromTreatmentPlan(planId, body).pipe(map(InvoiceMapper.toDomain));
  }

  getSummary(id: string): Observable<InvoiceSummaryDto> {
    return this.api.getSummary(id);
  }

  updateHeader(id: string, body: UpdateInvoiceHeaderBody): Observable<Invoice> {
    return this.api.updateHeader(id, body).pipe(map(InvoiceMapper.toDomain));
  }

  addItem(id: string, body: InvoiceItemBody): Observable<Invoice> {
    return this.api.addItem(id, body).pipe(map(InvoiceMapper.toDomain));
  }

  updateItem(id: string, itemId: string, body: UpdateInvoiceItemBody): Observable<Invoice> {
    return this.api.updateItem(id, itemId, body).pipe(map(InvoiceMapper.toDomain));
  }

  removeItem(id: string, itemId: string): Observable<void> {
    return this.api.removeItem(id, itemId);
  }
}
