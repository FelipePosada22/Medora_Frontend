import { Injectable, inject, signal, computed } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, switchMap, startWith, tap, catchError, EMPTY, Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProfessionalsService } from '../services/professionals.service';
import { Professional } from '../models/professional.model';
import { ToastService } from '../../../core/toast/toast.service';

@Injectable()
export class ProfessionalsViewModel {
  private readonly service = inject(ProfessionalsService);
  private readonly fb      = inject(FormBuilder);
  private readonly toast   = inject(ToastService);

  readonly professionals    = signal<Professional[]>([]);
  readonly isLoading        = signal(false);
  readonly errorMessage     = signal<string | null>(null);
  readonly searchTerm       = signal('');
  readonly selectedSpecialty = signal('Todos');

  // Form state
  readonly showForm  = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly formError = signal<string | null>(null);
  readonly isSaving  = signal(false);

  readonly form = this.fb.nonNullable.group({
    name:      ['', Validators.required],
    specialty: ['', Validators.required],
    email:     ['', [Validators.required, Validators.email]],
    phone:     ['', Validators.required],
  });

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

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset();
    this.showForm.set(true);
    this.formError.set(null);
  }

  openEdit(item: Professional): void {
    this.editingId.set(item.id);
    this.form.patchValue({
      name:      item.name,
      specialty: item.specialty,
      email:     item.email,
      phone:     item.phone,
    });
    this.showForm.set(true);
    this.formError.set(null);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.formError.set(null);
  }

  save(): void {
    if (this.form.invalid) return;
    this.isSaving.set(true);
    const payload = this.form.getRawValue();
    const op$: Observable<unknown> = this.editingId()
      ? this.service.update(this.editingId()!, payload)
      : this.service.create(payload);
    const isEditing = !!this.editingId();
    op$.subscribe({
      next: () => {
        this.closeForm();
        this.reload();
        this.isSaving.set(false);
        this.toast.success(isEditing ? 'Profesional actualizado correctamente.' : 'Profesional creado correctamente.');
      },
      error: err => {
        const msg = err?.error?.message ?? 'Error al guardar.';
        this.formError.set(msg);
        this.toast.error(msg);
        this.isSaving.set(false);
      },
    });
  }

  remove(id: string): void {
    this.service.remove(id).subscribe({
      next: () => { this.reload(); this.toast.success('Profesional eliminado.'); },
      error: err => {
        const msg = err?.error?.message ?? 'Error al eliminar.';
        this.errorMessage.set(msg);
        this.toast.error(msg);
      },
    });
  }
}
