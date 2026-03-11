/** Appointment type domain model (e.g. "Limpieza dental — 60 min — $50"). */
export interface AppointmentType {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
}

export interface AppointmentTypePayload {
  name: string;
  durationMinutes: number;
  price: number;
}
