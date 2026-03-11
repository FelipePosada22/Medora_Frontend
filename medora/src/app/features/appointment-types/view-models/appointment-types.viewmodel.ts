import { Injectable, inject, signal, computed } from '@angular/core';
import { Subject, switchMap, startWith, tap, catchError, EMPTY } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppointmentTypesService } from '../services/appointment-types.service';
import { AppointmentType } from '../models/appointment-type.model';

@Injectable()
export class AppointmentTypesViewModel {
  private readonly service = inject(AppointmentTypesService);

  readonly types        = signal<AppointmentType[]>([]);
  readonly isLoading    = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly searchTerm   = signal('');

  readonly filtered = computed(() => {
    const q = this.searchTerm().toLowerCase();
    if (!q) return this.types();
    return this.types().filter(t => t.name.toLowerCase().includes(q));
  });

  readonly stats = computed(() => {
    const all = this.types();
    if (!all.length) return { total: 0, avgDuration: 0, avgPrice: '0.00' };
    const avgDuration = Math.round(all.reduce((s, t) => s + t.durationMinutes, 0) / all.length);
    const avgPrice    = (all.reduce((s, t) => s + t.price, 0) / all.length).toFixed(2);
    return { total: all.length, avgDuration, avgPrice };
  });

  readonly isEmpty = computed(() => !this.isLoading() && this.types().length === 0);

  private readonly load$ = new Subject<void>();

  constructor() {
    this.load$
      .pipe(
        startWith(undefined),
        switchMap(() => {
          this.isLoading.set(true);
          this.errorMessage.set(null);
          return this.service.getAll().pipe(
            tap(list => {
              this.types.set(list);
              this.isLoading.set(false);
            }),
            catchError(err => {
              this.errorMessage.set(err?.error?.message ?? 'Error al cargar tipos de cita.');
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

  reload(): void {
    this.load$.next();
  }
}
