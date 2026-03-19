export enum InvoiceStatus {
  DRAFT     = 'DRAFT',
  ISSUED    = 'ISSUED',
  PAID      = 'PAID',
  CANCELLED = 'CANCELLED',
  OVERDUE   = 'OVERDUE',
}

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  [InvoiceStatus.DRAFT]:     'Borrador',
  [InvoiceStatus.ISSUED]:    'Emitida',
  [InvoiceStatus.PAID]:      'Pagada',
  [InvoiceStatus.CANCELLED]: 'Cancelada',
  [InvoiceStatus.OVERDUE]:   'Vencida',
};

export enum PaymentMethod {
  CASH     = 'CASH',
  CARD     = 'CARD',
  TRANSFER = 'TRANSFER',
  OTHER    = 'OTHER',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]:     'Efectivo',
  [PaymentMethod.CARD]:     'Tarjeta',
  [PaymentMethod.TRANSFER]: 'Transferencia',
  [PaymentMethod.OTHER]:    'Otro',
};

export interface InvoiceItem {
  description: string;
  quantity:    number;
  unitPrice:   number;
  total:       number;
}

export interface InvoicePayment {
  id:        string;
  amount:    number;
  method:    PaymentMethod;
  reference: string | null;
  paidAt:    string;
}

export interface Invoice {
  id:            string;
  status:        InvoiceStatus;
  patientId:     string;
  patientName:   string;
  appointmentId: string | null;
  dueDate:       string | null;
  notes:         string | null;
  items:         InvoiceItem[];
  payments:      InvoicePayment[];
  total:         number;
  paid:          number;
  balance:       number;
  createdAt:     string;
  issuedAt:      string | null;
}
