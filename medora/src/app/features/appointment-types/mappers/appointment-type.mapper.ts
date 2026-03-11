import { AppointmentTypeDto } from '../api/appointment-types.api';
import { AppointmentType } from '../models/appointment-type.model';

export class AppointmentTypeMapper {
  static toDomain(dto: AppointmentTypeDto): AppointmentType {
    return {
      id:              dto.id,
      name:            dto.name,
      durationMinutes: dto.durationMinutes,
      price:           dto.price,
    };
  }

  static toDomainList(dtos: AppointmentTypeDto[]): AppointmentType[] {
    return dtos.map(AppointmentTypeMapper.toDomain);
  }
}
