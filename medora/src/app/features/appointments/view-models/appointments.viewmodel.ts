import { Injectable, inject, signal, computed } from '@angular/core';
import { Subject, switchMap, startWith, tap, catchError, EMPTY, debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppointmentsService } from '../services/appointments.service';
import { Appointment, AppointmentStatus } from '../models/appointment.model';

export type StatusFilter = 'all' | AppointmentStatus;

@Injectable()
export class AppointmentsViewModel {
  private readonly service = inject(AppointmentsService);

  readonly appointments  = signal<Appointment[]>([]);
  readonly isLoading     = signal(false);
  readonly errorMessage  = signal<string | null>(null);
  readonly searchTerm    = signal('');
  readonly activeFilter  = signal<StatusFilter>('all');

  readonly filtered = computed(() => {
    const q      = this.searchTerm().toLowerCase();
    const filter = this.activeFilter();
    return this.appointments()
      .filter(a => filter === 'all' || a.status === filter)
      .filter(a => !q ||
        a.patientName.toLowerCase().includes(q) ||
        a.professionalName.toLowerCase().includes(q),
      );
  });

  readonly isEmpty = computed(() => !this.isLoading() && this.appointments().length === 0);

  private readonly search$ = new Subject<string>();
  private readonly load$   = new Subject<void>();

  constructor() {
    this.load$
      .pipe(
        startWith(undefined),
        switchMap(() => {
          this.isLoading.set(true);
          this.errorMessage.set(null);
          return this.service.getAll().pipe(
            tap(list => {
              this.appointments.set(list);
              this.isLoading.set(false);
            }),
            catchError(err => {
              this.errorMessage.set(err?.error?.message ?? 'Error al cargar citas.');
              this.isLoading.set(false);
              return EMPTY;
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  search(term: string): void {
    this.searchTerm.set(term);
  }

  setFilter(filter: StatusFilter): void {
    this.activeFilter.set(filter);
  }

  reload(): void {
    this.load$.next();
  }

  changeStatus(id: string, status: AppointmentStatus): void {
    this.service.update(id, { status }).subscribe({
      next: () => this.reload(),
      error: err => this.errorMessage.set(err?.error?.message ?? 'Error al actualizar estado.'),
    });
  }

  remove(id: string): void {
    this.service.remove(id).subscribe({
      next: () => this.reload(),
      error: err => this.errorMessage.set(err?.error?.message ?? 'Error al eliminar cita.'),
    });
  }
}
