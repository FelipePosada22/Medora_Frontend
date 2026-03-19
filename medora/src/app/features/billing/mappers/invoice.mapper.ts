import { Invoice, InvoiceStatus, InvoicePayment, PaymentMethod } from '../models/invoice.model';
import { InvoiceDto } from '../api/invoices.api';

export class InvoiceMapper {
  static toDomain(dto: InvoiceDto): Invoice {
    const items    = dto.items.map(i => ({ ...i }));
    const payments: InvoicePayment[] = dto.payments.map(p => ({
      id:        p.id,
      amount:    p.amount,
      method:    p.method as PaymentMethod,
      reference: p.reference,
      paidAt:    p.paidAt,
    }));
    const total   = items.reduce((s, i) => s + i.total, 0);
    const paid    = payments.reduce((s, p) => s + p.amount, 0);

    return {
      id:                 dto.id,
      status:             dto.status as InvoiceStatus,
      patientId:          dto.patient.id,
      patientName:        dto.patient.name,
      appointmentId:      dto.appointment?.id ?? null,
      treatmentPlanId:    dto.treatmentPlan?.id ?? null,
      treatmentPlanTitle: (dto.treatmentPlan?.title as string) ?? null,
      dueDate:            dto.dueDate,
      notes:              dto.notes,
      items,
      payments,
      total,
      paid,
      balance:            total - paid,
      createdAt:          dto.createdAt,
      issuedAt:           dto.issuedAt,
    };
  }

  static toDomainList(dtos: InvoiceDto[]): Invoice[] {
    return dtos.map(InvoiceMapper.toDomain);
  }
}
