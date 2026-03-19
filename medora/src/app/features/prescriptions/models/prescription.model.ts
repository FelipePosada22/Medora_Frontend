export type PrescriptionStatus = 'DRAFT' | 'DOCTOR_SIGNED' | 'PATIENT_SIGNED' | 'FINALIZED';

export const PRESCRIPTION_STATUS_LABELS: Record<PrescriptionStatus, string> = {
  DRAFT:          'Borrador',
  DOCTOR_SIGNED:  'Firmada por médico',
  PATIENT_SIGNED: 'Firmada por paciente',
  FINALIZED:      'Finalizada',
};

export interface PrescriptionItem {
  id:           string;
  medication:   string;
  dosage:       string;
  frequency:    string;
  duration:     string;
  instructions: string | null;
}

export interface Prescription {
  id:                 string;
  patientId:          string;
  patientName:        string;
  professionalId:     string;
  professionalName:   string;
  appointmentId:      string | null;
  diagnosis:          string;
  notes:              string | null;
  status:             PrescriptionStatus;
  items:              PrescriptionItem[];
  doctorSignature:    string | null;
  patientSignature:   string | null;
  fingerprint:        string | null;
  createdAt:          string;
  finalizedAt:        string | null;
}

export interface CreatePrescriptionPayload {
  patientId:      string;
  professionalId: string;
  appointmentId?: string;
  diagnosis:      string;
  notes?:         string;
  items: {
    medication:    string;
    dosage:        string;
    frequency:     string;
    duration:      string;
    instructions?: string;
  }[];
}
