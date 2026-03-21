import { Injectable, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { UsersApi } from '../api/users.api';
import { StaffUser, USER_ROLES, UserRole } from '../models/user.model';
import { ProfessionalsApi, ProfessionalDto } from '../../professionals/api/professionals.api';
import { ToastService } from '../../../core/toast/toast.service';

@Injectable()
export class UsersViewModel {
  private readonly api              = inject(UsersApi);
  private readonly professionalsApi = inject(ProfessionalsApi);
  private readonly fb               = inject(FormBuilder);
  private readonly toast            = inject(ToastService);

  readonly users         = signal<StaffUser[]>([]);
  readonly professionals = signal<ProfessionalDto[]>([]);
  readonly isLoading     = signal(false);
  readonly errorMessage  = signal<string | null>(null);
  readonly showForm      = signal(false);
  readonly editingId     = signal<string | null>(null);
  readonly isSaving      = signal(false);

  readonly roles = USER_ROLES;

  readonly form = this.fb.nonNullable.group({
    name:           ['', Validators.required],
    email:          ['', [Validators.required, Validators.email]],
    role:           ['DOCTOR' as UserRole, Validators.required],
    password:       [''],
    professionalId: [''],
  });

  /** Reactive signal tracking the currently selected role in the form. */
  readonly selectedRole = toSignal(
    this.form.get('role')!.valueChanges,
    { initialValue: 'DOCTOR' as UserRole },
  );

  constructor() {
    this.load();
    this.professionalsApi.getAll().pipe(takeUntilDestroyed()).subscribe({
      next: list => this.professionals.set(list),
    });
  }

  load(): void {
    this.isLoading.set(true);
    this.api.getAll().pipe(takeUntilDestroyed()).subscribe({
      next: list => { this.users.set(list); this.isLoading.set(false); },
      error: err  => {
        this.errorMessage.set(err?.error?.message ?? 'Error al cargar usuarios.');
        this.isLoading.set(false);
      },
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ name: '', email: '', role: 'DOCTOR', password: '', professionalId: '' });
    this.form.get('password')!.setValidators([Validators.required, Validators.minLength(6)]);
    this.form.get('password')!.updateValueAndValidity();
    this.showForm.set(true);
  }

  openEdit(user: StaffUser): void {
    this.editingId.set(user.id);
    this.form.reset({
      name:           user.name,
      email:          user.email,
      role:           user.role,
      password:       '',
      professionalId: user.professionalId ?? '',
    });
    this.form.get('password')!.clearValidators();
    this.form.get('password')!.updateValueAndValidity();
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);
    const { name, email, role, password, professionalId } = this.form.getRawValue();
    const id        = this.editingId();
    const isEditing = !!id;

    const profId = role === 'DOCTOR' ? (professionalId || null) : undefined;

    const op$: Observable<unknown> = isEditing
      ? this.api.update(id!, {
          name, email, role: role as UserRole,
          ...(password ? { password } : {}),
          ...(role === 'DOCTOR' ? { professionalId: profId } : {}),
        })
      : this.api.create({ name, email, role: role as UserRole, password });

    op$.subscribe({
      next: () => {
        this.toast.success(isEditing ? 'Usuario actualizado correctamente.' : 'Usuario creado correctamente.');
        this.closeForm();
        this.isSaving.set(false);
        this.reload();
      },
      error: err => {
        const msg = err?.error?.message ?? 'Error al guardar usuario.';
        this.toast.error(msg);
        this.isSaving.set(false);
      },
    });
  }

  remove(user: StaffUser): void {
    this.api.remove(user.id).subscribe({
      next: () => {
        this.users.update(list => list.filter(u => u.id !== user.id));
        this.toast.success(`Usuario "${user.name}" eliminado.`);
      },
      error: err => {
        const msg = err?.error?.message ?? 'Error al eliminar usuario.';
        this.toast.error(msg);
      },
    });
  }

  private reload(): void {
    this.api.getAll().subscribe({
      next: list => this.users.set(list),
    });
  }
}
