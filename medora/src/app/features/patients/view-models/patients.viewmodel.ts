import { Injectable, inject, signal, computed } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, switchMap, startWith, tap, catchError, EMPTY, Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PatientsService } from '../services/patients.service';
import { Patient } from '../models/patient.model';
import { ToastService } from '../../../core/toast/toast.service';

@Injectable()
export class PatientsViewModel {
  private readonly service = inject(PatientsService);
  private readonly fb      = inject(FormBuilder);
  private readonly toast   = inject(ToastService);

  readonly patients     = signal<Patient[]>([]);
  readonly isLoading    = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly searchTerm   = signal('');

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

  // Form state
  readonly showForm  = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly formError = signal<string | null>(null);
  readonly isSaving  = signal(false);

  readonly form = this.fb.nonNullable.group({
    name:      ['', Validators.required],
    phone:     ['', Validators.required],
    email:     ['', [Validators.required, Validators.email]],
    birthdate: [''],
    notes:     [''],
  });

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

  search(term: string): void {
    this.searchTerm.set(term);
    this.search$.next(term);
  }

  reload(): void {
    this.search$.next(this.searchTerm());
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset();
    this.formError.set(null);
    this.showForm.set(true);
  }

  openEdit(patient: Patient): void {
    this.editingId.set(patient.id);
    this.form.patchValue({
      name:      patient.name,
      phone:     patient.phone,
      email:     patient.email,
      birthdate: patient.birthdate ? patient.birthdate.slice(0, 10) : '',
      notes:     patient.notes     ?? '',
    });
    this.formError.set(null);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.formError.set(null);
  }

  save(): void {
    if (this.form.invalid) return;
    this.isSaving.set(true);
    const raw = this.form.getRawValue();
    const payload = {
      name:      raw.name,
      phone:     raw.phone,
      email:     raw.email,
      birthdate: raw.birthdate ? new Date(raw.birthdate).toISOString() : null,
      notes:     raw.notes     || null,
    };
    const op$: Observable<unknown> = this.editingId()
      ? this.service.update(this.editingId()!, payload)
      : this.service.create(payload);
    const isEditing = !!this.editingId();
    op$.subscribe({
      next: () => {
        this.closeForm();
        this.reload();
        this.isSaving.set(false);
        this.toast.success(isEditing ? 'Paciente actualizado correctamente.' : 'Paciente creado correctamente.');
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
      next: () => { this.reload(); this.toast.success('Paciente eliminado.'); },
      error: err => {
        const msg = err?.error?.message ?? 'Error al eliminar.';
        this.errorMessage.set(msg);
        this.toast.error(msg);
      },
    });
  }
}
