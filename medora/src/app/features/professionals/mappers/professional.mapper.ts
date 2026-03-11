import { ProfessionalDto } from '../api/professionals.api';
import { Professional } from '../models/professional.model';

export class ProfessionalMapper {
  static toDomain(dto: ProfessionalDto): Professional {
    return {
      id:        dto.id,
      name:      dto.name,
      specialty: dto.specialty,
      email:     dto.email,
      phone:     dto.phone,
    };
  }

  static toDomainList(dtos: ProfessionalDto[]): Professional[] {
    return dtos.map(ProfessionalMapper.toDomain);
  }
}
