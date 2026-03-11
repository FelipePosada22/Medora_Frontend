import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

type CalendarView = 'day' | 'week' | 'month';

interface TimeSlot {
  time: string;
  hour: number;
}

interface CalendarAppointment {
  id: string;
  patient: string;
  type: string;
  doctor: string;
  dayIndex: number;
  startHour: number;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
}

/**
 * Medical calendar/agenda page.
 * Displays a weekly grid (08:00–20:00) with color-coded appointment chips.
 */
@Component({
  selector: 'app-calendar-page',
  templateUrl: './calendar-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CardComponent, ButtonComponent],
  styles: [`
    .calendar-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3);
      flex-wrap: wrap;
    }
    .view-toggle {
      display: flex;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      overflow: hidden;
    }
    .view-btn {
      padding: var(--space-2) var(--space-3);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-secondary);
      background: var(--color-surface);
      border: none;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .view-btn--active { background: var(--color-primary-600); color: white; }

    .week-nav {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
    .nav-btn {
      width: 32px; height: 32px;
      display: flex; align-items: center; justify-content: center;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
      cursor: pointer;
      &:hover { background: var(--color-neutral-100); }
    }
    .week-label {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      min-width: 200px;
      text-align: center;
    }

    .calendar-grid {
      display: grid;
      grid-template-columns: 56px repeat(7, 1fr);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      font-size: var(--font-size-xs);
    }
    .cal-corner { background: var(--color-neutral-50); border-bottom: 1px solid var(--color-border); border-right: 1px solid var(--color-border); }
    .cal-day-header {
      padding: var(--space-3) var(--space-2);
      text-align: center;
      background: var(--color-neutral-50);
      border-bottom: 1px solid var(--color-border);
      border-right: 1px solid var(--color-border);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-secondary);
    }
    .cal-day-header--today {
      background: var(--color-primary-50);
      color: var(--color-primary-600);
      font-weight: var(--font-weight-bold);
    }
    .cal-time {
      padding: var(--space-1) var(--space-2);
      text-align: right;
      color: var(--color-text-tertiary);
      border-right: 1px solid var(--color-border);
      border-bottom: 1px solid var(--color-border);
      background: var(--color-neutral-50);
      height: 52px;
      display: flex;
      align-items: flex-start;
      justify-content: flex-end;
      padding-top: var(--space-1);
    }
    .cal-cell {
      border-right: 1px solid var(--color-border);
      border-bottom: 1px solid var(--color-border);
      height: 52px;
      position: relative;
      padding: 2px;
    }
    .appt-chip {
      display: block;
      border-radius: var(--radius-sm);
      padding: 2px 4px;
      font-size: 10px;
      font-weight: var(--font-weight-medium);
      color: white;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      cursor: pointer;
      height: 100%;
    }
    .appt-chip--scheduled { background: var(--color-status-scheduled); }
    .appt-chip--confirmed  { background: var(--color-status-confirmed); }
    .appt-chip--completed  { background: var(--color-status-completed); }
    .appt-chip--cancelled  { background: var(--color-status-cancelled); opacity: 0.6; }
    .appt-chip--no-show    { background: var(--color-status-no-show); }

    .legend {
      display: flex;
      gap: var(--space-4);
      flex-wrap: wrap;
    }
    .legend-item {
      display: flex; align-items: center; gap: var(--space-2);
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
    }
    .legend-dot {
      width: 10px; height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }
  `],
})
export class CalendarPageComponent {
  protected readonly activeView = signal<CalendarView>('week');
  protected readonly weekOffset = signal(0);

  protected readonly weekDays = computed(() => {
    const today  = new Date(2026, 2, 11);
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1 + this.weekOffset() * 7);
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

  protected readonly weekLabel = computed(() => {
    const days = this.weekDays();
    return `${days[0].label} – ${days[6].label}`;
  });

  protected readonly timeSlots: TimeSlot[] = Array.from({ length: 13 }, (_, i) => ({
    hour: 8 + i,
    time: `${String(8 + i).padStart(2, '0')}:00`,
  }));

  private readonly allAppointments: CalendarAppointment[] = [
    { id: 'C-001', patient: 'Ana García',      type: 'Consulta',   doctor: 'Dr. Smith',  dayIndex: 1, startHour: 9,  status: 'confirmed' },
    { id: 'C-002', patient: 'Carlos Mendoza',  type: 'Limpieza',   doctor: 'Dra. Lopez', dayIndex: 1, startHour: 10, status: 'scheduled' },
    { id: 'C-003', patient: 'María Rodríguez', type: 'Ortodoncia', doctor: 'Dr. Rivera', dayIndex: 2, startHour: 11, status: 'confirmed' },
    { id: 'C-004', patient: 'Luis Torres',     type: 'Radiografía',doctor: 'Dr. Smith',  dayIndex: 3, startHour: 9,  status: 'scheduled' },
    { id: 'C-005', patient: 'Sofia Vargas',    type: 'Extracción', doctor: 'Dra. Lopez', dayIndex: 4, startHour: 14, status: 'scheduled' },
    { id: 'C-006', patient: 'Pedro Jiménez',   type: 'Blanqueo',   doctor: 'Dr. Smith',  dayIndex: 0, startHour: 10, status: 'completed' },
  ];

  protected getSlotAppointments(dayIndex: number, hour: number): CalendarAppointment[] {
    return this.allAppointments.filter(a => a.dayIndex === dayIndex && a.startHour === hour);
  }

  protected setView(v: CalendarView): void { this.activeView.set(v); }
  protected prevWeek(): void { this.weekOffset.update(n => n - 1); }
  protected nextWeek(): void { this.weekOffset.update(n => n + 1); }
  protected goToday():   void { this.weekOffset.set(0); }
}
