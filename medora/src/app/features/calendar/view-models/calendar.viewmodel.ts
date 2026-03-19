import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { switchMap, tap, catchError, EMPTY } from 'rxjs';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { AppointmentsService } from '../../appointments/services/appointments.service';
import { ProfessionalsService } from '../../professionals/services/professionals.service';
import { AppointmentTypesService } from '../../appointment-types/services/appointment-types.service';
import { Appointment, AppointmentStatus } from '../../appointments/models/appointment.model';
import { Professional } from '../../professionals/models/professional.model';
import { AppointmentType } from '../../appointment-types/models/appointment-type.model';
import { ToastService } from '../../../core/toast/toast.service';

export type CalendarView = 'day' | 'week' | 'month';

export interface CalendarDay {
  date:   Date;
  label:  string;
  isToday: boolean;
  index:  number;
}

export interface MonthDay {
  date:           Date;
  label:          string;
  isCurrentMonth: boolean;
  isToday:        boolean;
}

export interface TimeSlot {
  hour: number;
  time: string;
}

interface CalendarQuery {
  startDate:        string;
  endDate:          string;
  professionalId?:  string;
}

@Injectable()
export class CalendarViewModel {
  private readonly appointmentsService     = inject(AppointmentsService);
  private readonly professionalsService    = inject(ProfessionalsService);
  private readonly appointmentTypesService = inject(AppointmentTypesService);
  private readonly toast                   = inject(ToastService);
  private readonly router                  = inject(Router);

  readonly activeView    = signal<CalendarView>('week');
  readonly referenceDate = signal<Date>(this.startOfDay(new Date()));

  readonly appointments        = signal<Appointment[]>([]);
  readonly professionals       = signal<Professional[]>([]);
  readonly appointmentTypes    = signal<AppointmentType[]>([]);
  readonly selectedAppointment = signal<Appointment | null>(null);
  readonly isLoading           = signal(false);
  readonly errorMessage        = signal<string | null>(null);

  // Filter signals
  readonly filterProfessionalId    = signal<string>('');
  readonly filterAppointmentTypeId = signal<string>('');

  // ── Period boundaries ────────────────────────────────────────────────────────

  readonly periodStart = computed<Date>(() => {
    const ref  = this.referenceDate();
    const view = this.activeView();
    if (view === 'week') {
      const d = new Date(ref);
      d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
      d.setHours(0, 0, 0, 0);
      return d;
    }
    if (view === 'month') return new Date(ref.getFullYear(), ref.getMonth(), 1);
    return new Date(ref); // day
  });

  readonly periodEnd = computed<Date>(() => {
    const start = this.periodStart();
    const view  = this.activeView();
    if (view === 'day') return new Date(start);
    if (view === 'week') {
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return end;
    }
    // month — last day
    const ref = this.referenceDate();
    return new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
  });

  readonly periodLabel = computed<string>(() => {
    const view = this.activeView();
    const ref  = this.referenceDate();
    if (view === 'day') {
      return ref.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }
    if (view === 'month') {
      const label = ref.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      return label.charAt(0).toUpperCase() + label.slice(1);
    }
    // week
    const start = this.periodStart();
    const end   = this.periodEnd();
    return `${start.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })} – ${end.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}`;
  });

  // ── Grid data ─────────────────────────────────────────────────────────────────

  /** Columns for day/week grid (1 or 7 items). */
  readonly viewDays = computed<CalendarDay[]>(() => {
    const view  = this.activeView();
    const start = this.periodStart();
    const today = new Date();
    const count = view === 'day' ? 1 : 7;
    return Array.from({ length: count }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return {
        date:    d,
        label:   view === 'day'
          ? d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
          : d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }),
        isToday: d.toDateString() === today.toDateString(),
        index:   i,
      };
    });
  });

  /** Day cells for the month grid (35 or 42 cells including padding). */
  readonly monthDays = computed<MonthDay[]>(() => {
    const ref        = this.referenceDate();
    const today      = new Date();
    const firstDay   = new Date(ref.getFullYear(), ref.getMonth(), 1);
    const startOffset = (firstDay.getDay() + 6) % 7; // Mon = 0
    const daysInMonth = new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate();
    const totalCells  = Math.ceil((startOffset + daysInMonth) / 7) * 7;

    return Array.from({ length: totalCells }, (_, i) => {
      const d = new Date(firstDay);
      d.setDate(firstDay.getDate() - startOffset + i);
      return {
        date:           d,
        label:          String(d.getDate()),
        isCurrentMonth: d.getMonth() === ref.getMonth(),
        isToday:        d.toDateString() === today.toDateString(),
      };
    });
  });

  readonly timeSlots: TimeSlot[] = Array.from({ length: 13 }, (_, i) => ({
    hour: 8 + i,
    time: `${String(8 + i).padStart(2, '0')}:00`,
  }));

  // ── Filtering ─────────────────────────────────────────────────────────────────

  readonly filteredAppointments = computed<Appointment[]>(() => {
    const typeId = this.filterAppointmentTypeId();
    const list   = this.appointments();
    return typeId ? list.filter(a => a.appointmentTypeId === typeId) : list;
  });

  // ── API query (reactive to view + filters) ────────────────────────────────────

  private readonly calendarQuery = computed<CalendarQuery>(() => {
    const profId = this.filterProfessionalId();
    const start  = this.periodStart();
    const end    = this.periodEnd();
    return {
      startDate: this.formatDate(start),
      endDate:   this.formatDate(end),
      ...(profId ? { professionalId: profId } : {}),
    };
  });

  constructor() {
    this.professionalsService.getAll().pipe(takeUntilDestroyed()).subscribe({
      next: list => this.professionals.set(list),
    });
    this.appointmentTypesService.getAll().pipe(takeUntilDestroyed()).subscribe({
      next: list => this.appointmentTypes.set(list),
    });

    toObservable(this.calendarQuery)
      .pipe(
        switchMap(query => {
          this.isLoading.set(true);
          this.errorMessage.set(null);
          return this.appointmentsService.getCalendar(query).pipe(
            tap(list => {
              this.appointments.set(list);
              this.isLoading.set(false);
            }),
            catchError(err => {
              this.errorMessage.set(err?.error?.message ?? 'Error al cargar la agenda.');
              this.isLoading.set(false);
              return EMPTY;
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  // ── Slot helpers ──────────────────────────────────────────────────────────────

  /** Appointments for a given column (dayIndex) + hour in day/week view. */
  getSlotAppointments(dayIndex: number, hour: number): Appointment[] {
    const start = this.periodStart();
    return this.filteredAppointments().filter(a => {
      const d        = new Date(a.startTime);
      const apptDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const diffDays = Math.round((apptDate.getTime() - start.getTime()) / 86_400_000);
      return diffDays === dayIndex && d.getUTCHours() === hour;
    });
  }

  /** All appointments on a given date (for month view cells). */
  getDayAppointments(date: Date): Appointment[] {
    const y = date.getFullYear(), mo = date.getMonth(), d = date.getDate();
    return this.filteredAppointments().filter(a => {
      const ad = new Date(a.startTime);
      return ad.getFullYear() === y && ad.getMonth() === mo && ad.getDate() === d;
    });
  }

  // ── Actions ───────────────────────────────────────────────────────────────────

  chipClass(status: AppointmentStatus): string {
    return `appt-chip appt-chip--${status.toLowerCase()}`;
  }

  chipTitle(appt: Appointment): string {
    return `${appt.patientName} · ${appt.appointmentTypeName} · ${appt.professionalName}`;
  }

  selectAppointment(appt: Appointment): void {
    this.selectedAppointment.set(appt);
  }

  closeDetail(): void {
    this.selectedAppointment.set(null);
  }

  changeStatus(status: AppointmentStatus): void {
    const appt = this.selectedAppointment();
    if (!appt) return;
    this.appointmentsService.update(appt.id, { status }).subscribe({
      next: () => {
        const updated = { ...appt, status };
        this.appointments.update(list => list.map(a => a.id === appt.id ? updated : a));
        this.selectedAppointment.set(updated);
        this.toast.success('Estado de cita actualizado.');
      },
      error: err => {
        const msg = err?.error?.message ?? 'Error al actualizar estado.';
        this.errorMessage.set(msg);
        this.toast.error(msg);
      },
    });
  }

  /** Mark as COMPLETED and navigate to the patient detail page. */
  attendAppointment(): void {
    const appt = this.selectedAppointment();
    if (!appt) return;
    this.appointmentsService.update(appt.id, { status: AppointmentStatus.COMPLETED }).subscribe({
      next: () => {
        const updated = { ...appt, status: AppointmentStatus.COMPLETED };
        this.appointments.update(list => list.map(a => a.id === appt.id ? updated : a));
        this.selectedAppointment.set(null);
        this.toast.success('Cita completada.');
        this.router.navigate(['/patients', appt.patientId]);
      },
      error: err => {
        const msg = err?.error?.message ?? 'Error al actualizar estado.';
        this.errorMessage.set(msg);
        this.toast.error(msg);
      },
    });
  }

  setView(view: CalendarView): void {
    this.activeView.set(view);
  }

  prevPeriod(): void {
    const view = this.activeView();
    const ref  = new Date(this.referenceDate());
    if (view === 'day')   ref.setDate(ref.getDate() - 1);
    if (view === 'week')  ref.setDate(ref.getDate() - 7);
    if (view === 'month') ref.setMonth(ref.getMonth() - 1);
    this.referenceDate.set(this.startOfDay(ref));
  }

  nextPeriod(): void {
    const view = this.activeView();
    const ref  = new Date(this.referenceDate());
    if (view === 'day')   ref.setDate(ref.getDate() + 1);
    if (view === 'week')  ref.setDate(ref.getDate() + 7);
    if (view === 'month') ref.setMonth(ref.getMonth() + 1);
    this.referenceDate.set(this.startOfDay(ref));
  }

  goToday(): void {
    this.referenceDate.set(this.startOfDay(new Date()));
  }

  // ── Private helpers ───────────────────────────────────────────────────────────

  private startOfDay(d: Date): Date {
    const r = new Date(d);
    r.setHours(0, 0, 0, 0);
    return r;
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
