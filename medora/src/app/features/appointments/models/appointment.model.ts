export type AppointmentStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'NO_SHOW';

/** Appointment domain model. */
export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  professionalId: string;
  professionalName: string;
  appointmentTypeId: string;
  appointmentTypeName: string;
  startTime: string;  // ISO datetime
  endTime: string;    // ISO datetime
  status: AppointmentStatus;
  notes: string | null;
}

export interface AppointmentPayload {
  patientId: string;
  professionalId: string;
  appointmentTypeId: string;
  startTime: string;
  endTime: string;
  status?: AppointmentStatus;
  notes?: string | null;
}

/** Slot returned by GET /appointments/availability */
export interface AvailabilitySlot {
  startTime: string;
  endTime: string;
}
