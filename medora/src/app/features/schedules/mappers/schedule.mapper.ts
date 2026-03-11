import { ScheduleDto } from '../api/schedules.api';
import { Schedule, DayOfWeek } from '../models/schedule.model';

export class ScheduleMapper {
  static toDomain(dto: ScheduleDto): Schedule {
    return {
      id:             dto.id,
      professionalId: dto.professionalId,
      dayOfWeek:      dto.dayOfWeek as DayOfWeek,
      startTime:      dto.startTime,
      endTime:        dto.endTime,
    };
  }

  static toDomainList(dtos: ScheduleDto[]): Schedule[] {
    return dtos.map(ScheduleMapper.toDomain);
  }
}
