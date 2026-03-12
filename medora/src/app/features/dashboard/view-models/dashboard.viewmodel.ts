import { Injectable, inject, signal, computed } from '@angular/core';
import { Subject, switchMap, startWith, tap, catchError, EMPTY, forkJoin } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppointmentsService } from '../../appointments/services/appointments.service';
import { Appointment, AppointmentStatus } from '../../appointments/models/appointment.model';
import { ProfessionalsService } from '../../professionals/services/professionals.service';
import { Professional } from '../../professionals/models/professional.model';

export enum StaffStatus {
  IN_SESSION = 'En Cita',
  ACTIVE     = 'Activo',
  FREE       = 'Libre',
}

export interface StaffMember extends Professional {
  status: StaffStatus;
}

@Injectable()
export class DashboardViewModel {
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly professionalsService = inject(ProfessionalsService);

  readonly appointments  = signal<Appointment[]>([]);
  readonly professionals = signal<Professional[]>([]);
  readonly isLoading     = signal(false);
  readonly errorMessage  = signal<string | null>(null);

  readonly upcoming = computed(() =>
    this.appointments()
      .filter(a => a.status === AppointmentStatus.SCHEDULED || a.status === AppointmentStatus.CONFIRMED)
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
  );

  readonly staff = computed<StaffMember[]>(() => {
    const now      = new Date();
    const todayStr = this.formatDate(now);
    const appts    = this.appointments();

    return this.professionals().map(p => {
      const profAppts = appts.filter(a => a.professionalId === p.id);

      const inSession = profAppts.some(a =>
        a.status === AppointmentStatus.CONFIRMED &&
        new Date(a.startTime) <= now &&
        new Date(a.endTime)   >= now,
      );

      const hasToday = profAppts.some(a =>
        (a.status === AppointmentStatus.SCHEDULED || a.status === AppointmentStatus.CONFIRMED) &&
        a.startTime.startsWith(todayStr),
      );

      const status: StaffStatus = inSession ? StaffStatus.IN_SESSION : hasToday ? StaffStatus.ACTIVE : StaffStatus.FREE;
      return { ...p, status };
    });
  });

  private readonly load$ = new Subject<void>();

  constructor() {
    this.load$
      .pipe(
        startWith(undefined),
        switchMap(() => {
          this.isLoading.set(true);
          this.errorMessage.set(null);
          const today      = new Date();
          const startDate  = this.formatDate(today);
          const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          const endDate    = this.formatDate(endOfMonth);
          return forkJoin([
            this.appointmentsService.getCalendar({ startDate, endDate }),
            this.professionalsService.getAll(),
          ]).pipe(
            tap(([appts, profs]) => {
              this.appointments.set(appts);
              this.professionals.set(profs);
              this.isLoading.set(false);
            }),
            catchError(err => {
              this.errorMessage.set(err?.error?.message ?? 'Error al cargar datos.');
              this.isLoading.set(false);
              return EMPTY;
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  reload(): void {
    this.load$.next();
  }

  attend(id: string): void {
    this.appointmentsService.update(id, { status: AppointmentStatus.COMPLETED }).subscribe({
      next: () => this.reload(),
      error: err => this.errorMessage.set(err?.error?.message ?? 'Error al actualizar cita.'),
    });
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
