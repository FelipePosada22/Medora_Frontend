import { Injectable, inject, signal, computed } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Subject, switchMap, startWith, tap, catchError, EMPTY, Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppointmentTypesService } from '../services/appointment-types.service';
import { AppointmentType } from '../models/appointment-type.model';
import { ToastService } from '../../../core/toast/toast.service';

@Injectable()
export class AppointmentTypesViewModel {
  private readonly service = inject(AppointmentTypesService);
  private readonly fb      = inject(FormBuilder);
  private readonly toast   = inject(ToastService);

  readonly types = signal<AppointmentType[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly searchTerm = signal('');

  // Form state
  readonly showForm = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly formError = signal<string | null>(null);
  readonly isSaving = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    durationMinutes: [30, [Validators.required, Validators.min(5)]],
    price: [0, [Validators.required, Validators.min(0)]],
  });

  readonly filtered = computed(() => {
    const q = this.searchTerm().toLowerCase();
    if (!q) return this.types();
    return this.types().filter((t) => t.name.toLowerCase().includes(q));
  });

  readonly stats = computed(() => {
    const all = this.types();
    if (!all.length) return { total: 0, avgDuration: 0, avgPrice: '0.00' };
    const avgDuration = Math.round(all.reduce((s, t) => s + t.durationMinutes, 0) / all.length);
    const avgPrice = (all.reduce((s, t) => s + t.price, 0) / all.length).toFixed(2);
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
            tap((list) => {
              this.types.set(list);
              this.isLoading.set(false);
            }),
            catchError((err) => {
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

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ name: '', durationMinutes: 30, price: 0 });
    this.showForm.set(true);
    this.formError.set(null);
  }

  openEdit(item: AppointmentType): void {
    this.editingId.set(item.id);
    this.form.patchValue({
      name: item.name,
      durationMinutes: item.durationMinutes,
      price: item.price,
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
    const { durationMinutes, name, price } = this.form.getRawValue();
    const payload = {
      durationMinutes: durationMinutes,
      name: name,
      price: Number(price),
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
        this.toast.success(isEditing ? 'Tipo de cita actualizado.' : 'Tipo de cita creado correctamente.');
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Error al guardar.';
        this.formError.set(msg);
        this.toast.error(msg);
        this.isSaving.set(false);
      },
    });
  }

  remove(id: string): void {
    this.service.remove(id).subscribe({
      next: () => { this.reload(); this.toast.success('Tipo de cita eliminado.'); },
      error: (err) => {
        const msg = err?.error?.message ?? 'Error al eliminar.';
        this.errorMessage.set(msg);
        this.toast.error(msg);
      },
    });
  }
}
