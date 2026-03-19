import { Injectable, inject, signal, computed } from '@angular/core';
import { forkJoin } from 'rxjs';
import { PatientsService } from '../services/patients.service';
import { Patient, PatientAppointment, PatientInvoice } from '../models/patient.model';
import { ToastService } from '../../../core/toast/toast.service';

export type PatientDetailTab = 'info' | 'appointments' | 'invoices';

@Injectable()
export class PatientDetailViewModel {
  private readonly service = inject(PatientsService);
  private readonly toast   = inject(ToastService);

  readonly patient      = signal<Patient | null>(null);
  readonly appointments = signal<PatientAppointment[]>([]);
  readonly invoices     = signal<PatientInvoice[]>([]);
  readonly isLoading    = signal(false);
  readonly error        = signal<string | null>(null);
  readonly activeTab    = signal<PatientDetailTab>('info');

  // ── Quick stats ─────────────────────────────────────────────────────────────

  readonly totalAppointments = computed(() => this.appointments().length);

  readonly completedAppointments = computed(() =>
    this.appointments().filter(a => a.status === 'COMPLETED').length,
  );

  readonly pendingAppointments = computed(() =>
    this.appointments().filter(a => a.status === 'SCHEDULED' || a.status === 'CONFIRMED').length,
  );

  readonly totalSpent = computed(() =>
    this.invoices()
      .filter(i => i.status === 'PAID')
      .reduce((s, i) => s + i.total, 0),
  );

  readonly pendingBalance = computed(() =>
    this.invoices().reduce((s, i) => s + i.balance, 0),
  );

  // ── Load ─────────────────────────────────────────────────────────────────────

  load(patientId: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    forkJoin({
      patient:      this.service.getById(patientId),
      appointments: this.service.getPatientAppointments(patientId),
      invoices:     this.service.getPatientInvoices(patientId),
    }).subscribe({
      next: ({ patient, appointments, invoices }) => {
        this.patient.set(patient);
        this.appointments.set(appointments);
        this.invoices.set(invoices);
        this.isLoading.set(false);
      },
      error: err => {
        const msg = err?.error?.message ?? 'Error al cargar el detalle del paciente.';
        this.error.set(msg);
        this.toast.error(msg);
        this.isLoading.set(false);
      },
    });
  }
}
