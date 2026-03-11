import { PatientDto } from '../api/patients.api';
import { Patient } from '../models/patient.model';

/**
 * Patient mapper.
 * Converts API DTOs to domain models.
 */
export class PatientMapper {
  static toDomain(dto: PatientDto): Patient {
    return {
      id:        dto.id,
      name:      dto.name,
      phone:     dto.phone,
      email:     dto.email,
      birthdate: dto.birthdate,
      notes:     dto.notes,
      createdAt: dto.createdAt,
    };
  }

  static toDomainList(dtos: PatientDto[]): Patient[] {
    return dtos.map(PatientMapper.toDomain);
  }
}
