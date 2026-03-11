import { Injectable, inject, signal, computed } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Subject, switchMap, startWith, tap, catchError, EMPTY, forkJoin, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SchedulesService } from '../services/schedules.service';
import { ProfessionalsService } from '../../professionals/services/professionals.service';
import { Professional } from '../../professionals/models/professional.model';
import { Schedule, DayOfWeek } from '../models/schedule.model';

export interface DaySlot {
  scheduleId: string | null; // null if day is not enabled
  dayOfWeek: DayOfWeek;
  label: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export interface ProfessionalWithSchedule {
  professional: Professional;
  days: DaySlot[];
}

const DAY_LABELS: Record<number, string> = {
  0: 'Dom', 1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sáb',
};

const ORDERED_DAYS: DayOfWeek[] = [1, 2, 3, 4, 5, 6, 0];

function buildDays(schedules: Schedule[]): DaySlot[] {
  return ORDERED_DAYS.map(dow => {
    const slot = schedules.find(s => s.dayOfWeek === dow);
    return {
      scheduleId: slot?.id ?? null,
      dayOfWeek:  dow,
      label:      DAY_LABELS[dow],
      enabled:    !!slot,
      startTime:  slot?.startTime ?? '08:00',
      endTime:    slot?.endTime   ?? '17:00',
    };
  });
}

@Injectable()
export class SchedulesViewModel {
  private readonly schedulesSvc     = inject(SchedulesService);
  private readonly professionalsSvc = inject(ProfessionalsService);
  private readonly fb               = inject(FormBuilder);

  readonly items        = signal<ProfessionalWithSchedule[]>([]);
  readonly isLoading    = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly selectedId   = signal<string | null>(null);

  // Add schedule form state
  readonly showAddForm            = signal(false);
  readonly isSaving               = signal(false);
  readonly formError              = signal<string | null>(null);
  readonly selectedProfessionalId = signal<string | null>(null);

  readonly addScheduleForm = this.fb.nonNullable.group({
    professionalId: ['', Validators.required],
    dayOfWeek:      [1 as DayOfWeek, Validators.required],
    startTime:      ['08:00', Validators.required],
    endTime:        ['17:00', Validators.required],
  });

  readonly isEmpty = computed(() => !this.isLoading() && this.items().length === 0);

  private readonly load$ = new Subject<void>();

  constructor() {
    this.load$
      .pipe(
        startWith(undefined),
        switchMap(() => {
          this.isLoading.set(true);
          this.errorMessage.set(null);
          return this.professionalsSvc.getAll().pipe(
            switchMap(professionals => {
              if (!professionals.length) return of([] as ProfessionalWithSchedule[]);
              return forkJoin(
                professionals.map(p =>
                  this.schedulesSvc.getByProfessional(p.id).pipe(
                    catchError(() => of([] as Schedule[])),
                  ),
                ),
              ).pipe(
                tap(scheduleLists => {
                  this.items.set(
                    professionals.map((p, i) => ({
                      professional: p,
                      days: buildDays(scheduleLists[i]),
                    })),
                  );
                  this.isLoading.set(false);
                }),
              );
            }),
            catchError(err => {
              this.errorMessage.set(err?.error?.message ?? 'Error al cargar horarios.');
              this.isLoading.set(false);
              return EMPTY;
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  selectProfessional(id: string | null): void {
    this.selectedId.set(id);
  }

  reload(): void {
    this.load$.next();
  }

  openAddSchedule(professionalId: string): void {
    this.selectedProfessionalId.set(professionalId);
    this.addScheduleForm.reset({
      professionalId,
      dayOfWeek: 1,
      startTime: '08:00',
      endTime:   '17:00',
    });
    this.showAddForm.set(true);
    this.formError.set(null);
  }

  closeAddForm(): void {
    this.showAddForm.set(false);
    this.formError.set(null);
    this.selectedProfessionalId.set(null);
  }

  saveSchedule(): void {
    if (this.addScheduleForm.invalid) return;
    this.isSaving.set(true);
    const raw = this.addScheduleForm.getRawValue();
    this.schedulesSvc
      .create({
        professionalId: raw.professionalId,
        dayOfWeek:      raw.dayOfWeek as DayOfWeek,
        startTime:      raw.startTime,
        endTime:        raw.endTime,
      })
      .subscribe({
        next: () => { this.closeAddForm(); this.reload(); this.isSaving.set(false); },
        error: err => { this.formError.set(err?.error?.message ?? 'Error al guardar.'); this.isSaving.set(false); },
      });
  }

  removeScheduleEntry(scheduleId: string): void {
    this.schedulesSvc.remove(scheduleId).subscribe({
      next: () => this.reload(),
      error: err => this.errorMessage.set(err?.error?.message ?? 'Error al eliminar.'),
    });
  }
}
