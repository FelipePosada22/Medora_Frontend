import { PrescriptionDto } from '../api/prescriptions.api';
import { Prescription, PrescriptionStatus } from '../models/prescription.model';

export class PrescriptionMapper {
  static toDomain(dto: PrescriptionDto): Prescription {
    return {
      id:               dto.id,
      patientId:        dto.patient?.id        ?? '',
      patientName:      (dto.patient?.name      as string) ?? '',
      professionalId:   dto.professional?.id   ?? '',
      professionalName: (dto.professional?.name as string) ?? '',
      appointmentId:    dto.appointment?.id    ?? null,
      diagnosis:        dto.diagnosis,
      notes:            dto.notes,
      status:           dto.status as PrescriptionStatus,
      items:            (dto.items ?? []).map(i => ({ ...i })),
      doctorSignature:  dto.doctorSignature,
      patientSignature: dto.patientSignature,
      fingerprint:      dto.fingerprint,
      createdAt:        dto.createdAt,
      finalizedAt:      dto.finalizedAt,
    };
  }

  static toDomainList(dtos: PrescriptionDto[]): Prescription[] {
    return (dtos ?? []).filter(Boolean).map(PrescriptionMapper.toDomain);
  }
}
