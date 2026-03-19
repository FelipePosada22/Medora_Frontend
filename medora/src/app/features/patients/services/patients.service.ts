import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { PatientsApi, PatientAppointmentDto, PatientInvoiceDto } from '../api/patients.api';
import { PatientMapper } from '../mappers/patient.mapper';
import { Patient, PatientPayload, PatientAppointment, PatientInvoice } from '../models/patient.model';

/**
 * Patients domain service.
 * Orchestrates API calls and applies data mapping.
 * Does not hold state — state is managed in the ViewModels.
 */
@Injectable({ providedIn: 'root' })
export class PatientsService {
  private readonly api = inject(PatientsApi);

  getAll(): Observable<Patient[]> {
    return this.api.getAll().pipe(map(PatientMapper.toDomainList));
  }

  getById(id: string): Observable<Patient> {
    return this.api.getById(id).pipe(map(PatientMapper.toDomain));
  }

  create(payload: PatientPayload): Observable<Patient> {
    return this.api.create(payload).pipe(map(PatientMapper.toDomain));
  }

  update(id: string, payload: Partial<PatientPayload>): Observable<void> {
    return this.api.update(id, payload);
  }

  remove(id: string): Observable<void> {
    return this.api.remove(id);
  }

  getPatientAppointments(id: string): Observable<PatientAppointment[]> {
    return this.api.getAppointments(id).pipe(
      map(dtos => dtos.map((dto: PatientAppointmentDto): PatientAppointment => ({
        id:                    dto.id,
        startTime:             dto.startTime,
        endTime:               dto.endTime,
        status:                dto.status,
        notes:                 dto.notes,
        professionalName:      dto.professional.name,
        professionalSpecialty: dto.professional.specialty,
        appointmentTypeName:   dto.appointmentType.name,
        durationMinutes:       dto.appointmentType.durationMinutes,
        price:                 dto.appointmentType.price,
      }))),
    );
  }

  getPatientInvoices(id: string): Observable<PatientInvoice[]> {
    return this.api.getInvoices(id).pipe(
      map(dtos => dtos.map((dto: PatientInvoiceDto): PatientInvoice => {
        const total = dto.items.reduce((s, i) => s + i.total, 0);
        const paid  = dto.payments.reduce((s, p) => s + p.amount, 0);
        return {
          id:                   dto.id,
          status:               dto.status,
          issuedAt:             dto.issuedAt,
          dueDate:              dto.dueDate,
          notes:                dto.notes,
          total,
          paid,
          balance:              total - paid,
          items:                dto.items,
          payments:             dto.payments,
          appointmentTypeName:  dto.appointment?.appointmentType.name ?? null,
          appointmentStartTime: dto.appointment?.startTime ?? null,
        };
      })),
    );
  }
}
