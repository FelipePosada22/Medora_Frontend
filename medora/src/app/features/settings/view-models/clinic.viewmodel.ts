import { Injectable, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ClinicApi } from '../api/clinic.api';
import { ToastService } from '../../../core/toast/toast.service';

@Injectable()
export class ClinicViewModel {
  private readonly api   = inject(ClinicApi);
  private readonly fb    = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  readonly isLoading = signal(true);
  readonly isSaving  = signal(false);
  readonly slug      = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name:     ['', Validators.required],
    phone:    [''],
    email:    ['', Validators.email],
    address:  [''],
    timezone: [''],
    currency: [''],
  });

  constructor() {
    this.api.get().pipe(takeUntilDestroyed()).subscribe({
      next: clinic => {
        this.slug.set(clinic.slug);
        this.form.patchValue({
          name:     clinic.name          ?? '',
          phone:    clinic.phone         ?? '',
          email:    clinic.email         ?? '',
          address:  clinic.address       ?? '',
          timezone: clinic.timezone      ?? '',
          currency: clinic.currency      ?? '',
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);
    const v = this.form.getRawValue();
    const payload = {
      name:     v.name     || undefined,
      phone:    v.phone    || undefined,
      email:    v.email    || undefined,
      address:  v.address  || undefined,
      timezone: v.timezone || undefined,
      currency: v.currency || undefined,
    };
    this.api.update(payload).subscribe({
      next: clinic => {
        this.slug.set(clinic.slug);
        this.isSaving.set(false);
        this.toast.success('Información de la clínica actualizada.');
      },
      error: err => {
        const msg = err?.error?.message ?? 'Error al guardar.';
        this.toast.error(msg);
        this.isSaving.set(false);
      },
    });
  }
}
