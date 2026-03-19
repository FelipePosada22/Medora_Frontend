import { TreatmentPlanDto } from '../api/treatment-plans.api';
import { TreatmentPlan, TreatmentItemStatus, TreatmentPlanStatus, PlanInvoice } from '../models/treatment-plan.model';

export class TreatmentPlanMapper {
  static toDomain(dto: TreatmentPlanDto): TreatmentPlan {
    const items = (dto.items ?? []).map(i => ({
      id:          i.id,
      description: i.description,
      price:       i.price,
      notes:       i.notes,
      status:      i.status as TreatmentItemStatus,
    }));

    const invoices: PlanInvoice[] = (dto.invoices ?? []).map(inv => {
      const paid    = (inv.payments ?? []).reduce((s, p) => s + p.amount, 0);
      const total   = (inv.items    ?? []).reduce((s, i) => s + i.total,  0);
      return {
        id:       inv.id,
        status:   inv.status,
        issuedAt: inv.issuedAt,
        dueDate:  inv.dueDate,
        notes:    inv.notes,
        createdAt: inv.createdAt,
        items:    (inv.items    ?? []).map(i => ({ ...i })),
        payments: (inv.payments ?? []).map(p => ({ ...p })),
        total,
        paid,
        balance:  total - paid,
      };
    });

    return {
      id:          dto.id,
      patientId:   dto.patient?.id   ?? '',
      patientName: (dto.patient?.name as string) ?? '',
      title:       dto.title,
      notes:       dto.notes,
      status:      dto.status as TreatmentPlanStatus,
      items,
      invoices,
      total:       items.reduce((s, i) => s + i.price, 0),
      totalPaid:   invoices.reduce((s, inv) => s + inv.paid, 0),
      createdAt:   dto.createdAt,
    };
  }

  static toDomainList(dtos: TreatmentPlanDto[]): TreatmentPlan[] {
    return (dtos ?? []).filter(Boolean).map(TreatmentPlanMapper.toDomain);
  }
}
