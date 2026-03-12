import { Injectable, inject, signal, computed } from '@angular/core';
import { switchMap, tap, catchError, EMPTY } from 'rxjs';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { AppointmentsService } from '../../appointments/services/appointments.service';
import { Appointment, AppointmentStatus } from '../../appointments/models/appointment.model';

export interface CalendarDay {
  label:   string;
  isToday: boolean;
  index:   number; // 0 = Monday … 6 = Sunday
}

export interface TimeSlot {
  hour: number;
  time: string;
}

@Injectable()
export class CalendarViewModel {
  private readonly appointmentsService = inject(AppointmentsService);

  readonly weekOffset   = signal(0);
  readonly appointments = signal<Appointment[]>([]);
  readonly isLoading    = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly weekStart = computed<Date>(() => {
    const today  = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7) + this.weekOffset() * 7);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  readonly weekDays = computed<CalendarDay[]>(() => {
    const monday = this.weekStart();
    const today  = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return {
        label:   d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }),
        isToday: d.toDateString() === today.toDateString(),
        index:   i,
      };
    });
  });

  readonly weekLabel = computed(() => {
    const days = this.weekDays();
    return `${days[0].label} – ${days[6].label}`;
  });

  readonly timeSlots: TimeSlot[] = Array.from({ length: 13 }, (_, i) => ({
    hour: 8 + i,
    time: `${String(8 + i).padStart(2, '0')}:00`,
  }));

  constructor() {
    toObservable(this.weekStart)
      .pipe(
        switchMap(monday => {
          const end = new Date(monday);
          end.setDate(monday.getDate() + 6);
          this.isLoading.set(true);
          this.errorMessage.set(null);
          return this.appointmentsService.getCalendar({
            startDate: this.formatDate(monday),
            endDate:   this.formatDate(end),
          }).pipe(
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

  getSlotAppointments(dayIndex: number, hour: number): Appointment[] {
    const monday = this.weekStart();
    return this.appointments().filter(a => {
      const d        = new Date(a.startTime);
      const apptDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const diffDays = Math.round((apptDate.getTime() - monday.getTime()) / 86_400_000);
      return diffDays === dayIndex && d.getHours() === hour;
    });
  }

  chipClass(status: AppointmentStatus): string {
    return `appt-chip appt-chip--${status.toLowerCase()}`;
  }

  chipTitle(appt: Appointment): string {
    return `${appt.patientName} · ${appt.appointmentTypeName} · ${appt.professionalName}`;
  }

  prevWeek(): void { this.weekOffset.update(n => n - 1); }
  nextWeek(): void { this.weekOffset.update(n => n + 1); }
  goToday():  void { this.weekOffset.set(0); }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
