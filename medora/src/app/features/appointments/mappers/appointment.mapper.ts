import { AppointmentDto } from '../api/appointments.api';
import { Appointment, AppointmentStatus } from '../models/appointment.model';

export class AppointmentMapper {
  static toDomain(dto: AppointmentDto): Appointment {
    return {
      id:                  dto.id,
      patientId:           dto.patientId,
      patientName:         dto.patient.name,
      professionalId:      dto.professionalId,
      professionalName:    dto.professional.name,
      appointmentTypeId:   dto.appointmentTypeId,
      appointmentTypeName: dto.appointmentType.name,
      startTime:           dto.startTime,
      endTime:             dto.endTime,
      status:          dto.status as AppointmentStatus,
      notes:           dto.notes,
      durationMinutes: dto.appointmentType.durationMinutes,
      createdAt:       dto.createdAt,
    };
  }

  static toDomainList(dtos: AppointmentDto[]): Appointment[] {
    return dtos.map(AppointmentMapper.toDomain);
  }
}
