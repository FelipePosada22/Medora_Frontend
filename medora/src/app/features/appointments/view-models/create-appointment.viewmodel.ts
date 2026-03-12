import { Injectable, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AppointmentsService } from '../services/appointments.service';
import { ProfessionalsService } from '../../professionals/services/professionals.service';
import { AppointmentTypesService } from '../../appointment-types/services/appointment-types.service';
import { PatientsService } from '../../patients/services/patients.service';
import { Professional } from '../../professionals/models/professional.model';
import { AppointmentType } from '../../appointment-types/models/appointment-type.model';
import { Patient } from '../../patients/models/patient.model';
import { AppointmentStatus } from '../models/appointment.model';

@Injectable()
export class CreateAppointmentViewModel {
  private readonly appointmentsSvc    = inject(AppointmentsService);
  private readonly professionalsSvc   = inject(ProfessionalsService);
  private readonly appointmentTypesSvc = inject(AppointmentTypesService);
  private readonly patientsSvc        = inject(PatientsService);
  private readonly fb                 = inject(FormBuilder);
  private readonly router             = inject(Router);

  readonly professionals    = signal<Professional[]>([]);
  readonly appointmentTypes = signal<AppointmentType[]>([]);
  readonly patients         = signal<Patient[]>([]);
  readonly isLoading        = signal(false);
  readonly isSubmitting     = signal(false);
  readonly errorMessage     = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    patientId:         ['', Validators.required],
    professionalId:    ['', Validators.required],
    appointmentTypeId: ['', Validators.required],
    date:              ['', Validators.required],
    startTime:         ['', Validators.required],
    endTime:           ['', Validators.required],
    notes:             [''],
  });

  constructor() {
    this.isLoading.set(true);
    forkJoin({
      professionals:    this.professionalsSvc.getAll(),
      appointmentTypes: this.appointmentTypesSvc.getAll(),
      patients:         this.patientsSvc.getAll(),
    })
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: ({ professionals, appointmentTypes, patients }) => {
          this.professionals.set(professionals);
          this.appointmentTypes.set(appointmentTypes);
          this.patients.set(patients);
          this.isLoading.set(false);
        },
        error: err => {
          this.errorMessage.set(err?.error?.message ?? 'Error al cargar datos.');
          this.isLoading.set(false);
        },
      });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const { patientId, professionalId, appointmentTypeId, date, startTime, endTime, notes } =
      this.form.getRawValue();

    const startIso = `${date}T${startTime}:00z`;
    const endIso   = `${date}T${endTime}:00z`;
    this.appointmentsSvc
      .create({
        patientId,
        professionalId,
        appointmentTypeId,
        startTime: startIso,
        endTime:   endIso,
        notes:     notes || null,
        status: AppointmentStatus.SCHEDULED
      })
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/appointments']);
        },
        error: err => {
          this.errorMessage.set(err?.error?.message ?? 'Error al crear la cita.');
          this.isSubmitting.set(false);
        },
      });
  }
}
