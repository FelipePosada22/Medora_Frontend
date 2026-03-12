import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CalendarViewModel } from '../../view-models/calendar.viewmodel';

type CalendarView = 'day' | 'week' | 'month';

/**
 * Medical calendar/agenda page.
 * Displays a weekly grid (08:00–20:00) with color-coded appointment chips
 * loaded from the real API.
 */
@Component({
  selector: 'app-calendar-page',
  templateUrl: './calendar-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CalendarViewModel],
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
    .appt-chip--no_show    { background: var(--color-status-no-show); }

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
  protected readonly vm         = inject(CalendarViewModel);
  protected readonly activeView = signal<CalendarView>('week');

  protected setView(v: CalendarView): void { this.activeView.set(v); }
}
