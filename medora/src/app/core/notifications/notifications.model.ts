export type NotificationType =
  | 'APPOINTMENT_CREATED'
  | 'APPOINTMENT_CANCELLED'
  | 'APPOINTMENT_RESCHEDULED'
  | 'INVOICE_ISSUED'
  | 'PAYMENT_RECEIVED'
  | 'INVOICE_PAID'
  | 'TREATMENT_PLAN_CREATED';

export interface NotificationMetadata {
  appointmentId?: string;
  patientId?: string;
  invoiceId?: string;
  treatmentPlanId?: string;
}

export interface AppNotification {
  id: string;
  tenantId: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  metadata: NotificationMetadata;
  createdAt: string;
}
