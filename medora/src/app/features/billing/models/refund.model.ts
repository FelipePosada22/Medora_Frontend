import { PaymentMethod } from './invoice.model';

export interface Refund {
  id:        string;
  paymentId: string;
  invoiceId: string;
  amount:    number;
  reason:    string;
  method:    PaymentMethod;
  status:    'COMPLETED';
  createdAt: string;
}

export interface CreateRefundPayload {
  paymentId: string;
  amount:    number;
  method:    string;
  reason:    string;
}
