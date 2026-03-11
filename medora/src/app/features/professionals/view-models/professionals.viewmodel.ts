import { Injectable, inject, signal, computed } from '@angular/core';
import { debounceTime, distinctUntilChanged, Subject, switchMap, startWith, tap, catchError, EMPTY } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProfessionalsService } from '../services/professionals.service';
import { Professional } from '../models/professional.model';

@Injectable()
export class ProfessionalsViewModel {
  private readonly service = inject(ProfessionalsService);

  readonly professionals    = signal<Professional[]>([]);
  readonly isLoading        = signal(false);
  readonly errorMessage     = signal<string | null>(null);
  readonly searchTerm       = signal('');
  readonly selectedSpecialty = signal('Todos');

  readonly specialties = computed(() => {
    const all = this.professionals().map(p => p.specialty);
    return ['Todos', ...new Set(all)];
  });

  readonly filtered = computed(() => {
    const term      = this.searchTerm().toLowerCase();
    const specialty = this.selectedSpecialty();
    return this.professionals()
      .filter(p => specialty === 'Todos' || p.specialty === specialty)
      .filter(p => !term || p.name.toLowerCase().includes(term) || p.email.toLowerCase().includes(term));
  });

  readonly stats = computed(() => ({
    total: this.professionals().length,
  }));

  readonly isEmpty = computed(() => !this.isLoading() && this.professionals().length === 0);

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
              this.professionals.set(list);
              this.isLoading.set(false);
            }),
            catchError(err => {
              this.errorMessage.set(err?.error?.message ?? 'Error al cargar profesionales.');
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

  selectSpecialty(s: string): void {
    this.selectedSpecialty.set(s);
  }

  reload(): void {
    this.load$.next();
  }

  remove(id: string): void {
    this.service.remove(id).subscribe({
      next: () => this.reload(),
      error: err => this.errorMessage.set(err?.error?.message ?? 'Error al eliminar.'),
    });
  }
}
