/** Patient domain model. */
export interface Patient {
  id: string;
  name: string;
  phone: string;
  email: string;
  birthdate: string | null;
  notes: string | null;
  createdAt: string;
}

/** Payload to create or update a patient. */
export interface PatientPayload {
  name: string;
  phone: string;
  email: string;
  birthdate?: string | null;
  notes?: string | null;
}

/** Appointment history item inside patient detail. */
export interface PatientAppointment {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
  professionalName: string;
  professionalSpecialty: string;
  appointmentTypeName: string;
  durationMinutes: number;
  price: number;
}

/** Invoice history item inside patient detail. */
export interface PatientInvoice {
  id: string;
  status: string;
  issuedAt: string | null;
  dueDate: string | null;
  notes: string | null;
  total: number;
  paid: number;
  balance: number;
  items: { description: string; quantity: number; unitPrice: number; total: number }[];
  payments: { amount: number; method: string; reference: string | null; paidAt: string }[];
  appointmentTypeName: string | null;
  appointmentStartTime: string | null;
}
