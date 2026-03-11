import { Injectable, inject, signal, computed } from '@angular/core';
import { debounceTime, distinctUntilChanged, Subject, switchMap, startWith, tap, catchError, EMPTY } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PatientsService } from '../services/patients.service';
import { Patient } from '../models/patient.model';

/**
 * ViewModel for the Patients list page.
 *
 * Responsibilities:
 * - Exposes reactive signals for the template (patients, loading, error, pagination).
 * - Manages search input with debounce.
 * - Handles pagination state.
 * - Delegates data operations to PatientsService.
 *
 * Scoped to PatientsPageComponent via `providers: [PatientsViewModel]`.
 */
@Injectable()
export class PatientsViewModel {
  private readonly service = inject(PatientsService);

  // ---------------------------------------------------------------------------
  // State signals
  // ---------------------------------------------------------------------------
  readonly patients     = signal<Patient[]>([]);
  readonly isLoading    = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly searchTerm   = signal('');

  // ---------------------------------------------------------------------------
  // Derived signals
  // ---------------------------------------------------------------------------
  readonly isEmpty = computed(() => !this.isLoading() && this.patients().length === 0);

  readonly filtered = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.patients();
    return this.patients().filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.email?.toLowerCase().includes(term) ||
      p.phone?.includes(term),
    );
  });

  // ---------------------------------------------------------------------------
  // Load pipeline
  // ---------------------------------------------------------------------------
  private readonly search$ = new Subject<string>();

  constructor() {
    this.search$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        startWith(''),
        switchMap(() => {
          this.isLoading.set(true);
          this.errorMessage.set(null);

          return this.service.getAll().pipe(
            tap(patients => {
              this.patients.set(patients);
              this.isLoading.set(false);
            }),
            catchError(err => {
              this.errorMessage.set(err?.error?.message ?? 'Error al cargar pacientes.');
              this.isLoading.set(false);
              return EMPTY;
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  // ---------------------------------------------------------------------------
  // Public commands
  // ---------------------------------------------------------------------------

  /** Triggers a debounced client-side filter. */
  search(term: string): void {
    this.searchTerm.set(term);
    this.search$.next(term);
  }

  /** Reloads the list after a mutation. */
  reload(): void {
    this.search$.next(this.searchTerm());
  }

  /** Removes a patient and refreshes the list. */
  remove(id: string): void {
    this.service.remove(id).subscribe({
      next: () => this.reload(),
      error: err => this.errorMessage.set(err?.error?.message ?? 'Error al eliminar.'),
    });
  }
}
