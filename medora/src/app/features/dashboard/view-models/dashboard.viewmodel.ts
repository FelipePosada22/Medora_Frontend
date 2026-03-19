import { Injectable, inject, signal, computed } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { switchMap, tap, catchError, EMPTY } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DashboardApi, DashboardDto } from '../api/dashboard.api';
import { AppointmentsService } from '../../appointments/services/appointments.service';
import { AppointmentStatus } from '../../appointments/models/appointment.model';
import { ToastService } from '../../../core/toast/toast.service';

export type PeriodKey = 'today' | 'week' | 'month' | 'prev-month';

export interface PeriodOption {
  key: PeriodKey;
  label: string;
}

export const PERIOD_OPTIONS: PeriodOption[] = [
  { key: 'today',      label: 'Hoy'           },
  { key: 'week',       label: 'Esta semana'   },
  { key: 'month',      label: 'Este mes'      },
  { key: 'prev-month', label: 'Mes anterior'  },
];

@Injectable()
export class DashboardViewModel {
  private readonly api                 = inject(DashboardApi);
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly toast               = inject(ToastService);

  readonly isLoading    = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly data         = signal<DashboardDto | null>(null);

  readonly selectedPeriod = signal<PeriodKey>('month');
  readonly periodOptions  = PERIOD_OPTIONS;

  // ── Period date range ──────────────────────────────────────────────────────

  readonly periodDates = computed(() => {
    const today = new Date();
    const key   = this.selectedPeriod();

    if (key === 'today') {
      const d = this.fmt(today);
      return { startDate: d, endDate: d };
    }
    if (key === 'week') {
      const mon = new Date(today);
      mon.setDate(today.getDate() - ((today.getDay() + 6) % 7));
      const sun = new Date(mon);
      sun.setDate(mon.getDate() + 6);
      return { startDate: this.fmt(mon), endDate: this.fmt(sun) };
    }
    if (key === 'prev-month') {
      const first = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const last  = new Date(today.getFullYear(), today.getMonth(), 0);
      return { startDate: this.fmt(first), endDate: this.fmt(last) };
    }
    // 'month' — no params, backend uses current month
    return { startDate: undefined, endDate: undefined };
  });

  // ── Derived signals ────────────────────────────────────────────────────────

  readonly todayAppts = computed(() => this.data()?.appointments.today ?? null);
  readonly todayList  = computed(() => this.todayAppts()?.list ?? []);

  readonly periodLabel = computed(() => {
    const d = this.data()?.period;
    if (!d) return '';
    if (d.startDate === d.endDate) return d.startDate;
    return `${d.startDate} → ${d.endDate}`;
  });

  readonly byDay = computed(() => {
    const days = this.data()?.appointments.inPeriod.byDay ?? [];
    const max  = Math.max(...days.map(d => d.count), 1);
    return days.map(d => ({ ...d, pct: Math.round((d.count / max) * 100) }));
  });

  // ── Constructor ────────────────────────────────────────────────────────────

  constructor() {
    toObservable(this.periodDates)
      .pipe(
        switchMap(({ startDate, endDate }) => {
          this.isLoading.set(true);
          this.errorMessage.set(null);
          return this.api.get(startDate, endDate).pipe(
            tap(dto => {
              this.data.set(dto);
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

  // ── Commands ───────────────────────────────────────────────────────────────

  setPeriod(key: PeriodKey): void {
    this.selectedPeriod.set(key);
  }

  attend(id: string): void {
    this.appointmentsService.update(id, { status: AppointmentStatus.COMPLETED }).subscribe({
      next: () => {
        this.toast.success('Cita marcada como completada.');
        // Refresh dashboard to reflect new status
        const current = this.selectedPeriod();
        this.selectedPeriod.set(current === 'today' ? 'month' : 'today');
        this.selectedPeriod.set(current);
      },
      error: err => {
        const msg = err?.error?.message ?? 'Error al actualizar cita.';
        this.errorMessage.set(msg);
        this.toast.error(msg);
      },
    });
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private fmt(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
