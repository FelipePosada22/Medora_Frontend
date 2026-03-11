/** Professional (doctor/therapist) domain model. */
export interface Professional {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
}

export interface ProfessionalPayload {
  name: string;
  specialty: string;
  email: string;
  phone: string;
}
