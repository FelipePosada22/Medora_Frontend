export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW   = 'NO_SHOW',
}

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  [AppointmentStatus.SCHEDULED]: 'Programada',
  [AppointmentStatus.CONFIRMED]: 'Confirmada',
  [AppointmentStatus.CANCELLED]: 'Cancelada',
  [AppointmentStatus.COMPLETED]: 'Completada',
  [AppointmentStatus.NO_SHOW]:   'No asistió',
};

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
  durationMinutes: number;
  createdAt: string;
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
