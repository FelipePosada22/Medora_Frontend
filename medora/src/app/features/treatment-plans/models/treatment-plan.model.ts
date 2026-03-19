export type TreatmentItemStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type TreatmentPlanStatus  = 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'PARTIAL';

export const TREATMENT_ITEM_STATUS_LABELS: Record<TreatmentItemStatus, string> = {
  PENDING:     'Pendiente',
  IN_PROGRESS: 'En progreso',
  COMPLETED:   'Completado',
  CANCELLED:   'Cancelado',
};

export const TREATMENT_PLAN_STATUS_LABELS: Record<TreatmentPlanStatus, string> = {
  ACTIVE:    'Activo',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
  PARTIAL:   'Parcial',
};

export interface TreatmentPlanItem {
  id:          string;
  description: string;
  price:       number;
  notes:       string | null;
  status:      TreatmentItemStatus;
}

export interface PlanInvoiceItem {
  id:                   string;
  description:          string;
  quantity:             number;
  unitPrice:            number;
  total:                number;
  treatmentPlanItemId?: string | null;
}

export interface PlanInvoicePayment {
  id:        string;
  amount:    number;
  method:    string;
  reference: string | null;
  paidAt:    string;
}

export interface PlanInvoice {
  id:        string;
  status:    string;
  issuedAt:  string | null;
  dueDate:   string | null;
  notes:     string | null;
  createdAt: string;
  items:     PlanInvoiceItem[];
  payments:  PlanInvoicePayment[];
  /** Computed: sum of all items.total */
  total:     number;
  /** Computed: sum of payments[].amount */
  paid:      number;
  /** Computed: total - paid */
  balance:   number;
}

export interface TreatmentPlan {
  id:          string;
  patientId:   string;
  patientName: string;
  title:       string;
  notes:       string | null;
  status:      TreatmentPlanStatus;
  items:       TreatmentPlanItem[];
  invoices:    PlanInvoice[];
  total:       number;
  totalPaid:   number;
  createdAt:   string;
}

export interface CreateTreatmentPlanPayload {
  patientId: string;
  title:     string;
  notes?:    string;
  items:     { description: string; price: number; notes?: string }[];
}
