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
