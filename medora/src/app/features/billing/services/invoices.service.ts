import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { InvoicesApi, CreateInvoiceBody, AddPaymentBody, InvoicePaymentDto } from '../api/invoices.api';
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
}
