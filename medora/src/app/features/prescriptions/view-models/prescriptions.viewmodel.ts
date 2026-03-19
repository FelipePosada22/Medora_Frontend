import { Injectable, inject, signal, computed } from '@angular/core';
import { FormBuilder, Validators, FormArray, FormGroup } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PrescriptionsService } from '../services/prescriptions.service';
import { PatientsService } from '../../patients/services/patients.service';
import { ProfessionalsService } from '../../professionals/services/professionals.service';
import { Prescription, PrescriptionStatus, PRESCRIPTION_STATUS_LABELS } from '../models/prescription.model';
import type { SearchSelectOption } from '../../../shared/components/search-select/search-select.component';
import { ToastService } from '../../../core/toast/toast.service';

export type PrescriptionFilter = 'all' | PrescriptionStatus;

/** Signing step shown inline in the detail panel. */
export type SigningStep = 'doctor' | 'patient' | null;

@Injectable()
export class PrescriptionsViewModel {
  private readonly service              = inject(PrescriptionsService);
  private readonly patientsService      = inject(PatientsService);
  private readonly professionalsService = inject(ProfessionalsService);
  private readonly fb                   = inject(FormBuilder);
  private readonly toast                = inject(ToastService);

  // ── State ──────────────────────────────────────────────────────────────────

  readonly prescriptions   = signal<Prescription[]>([]);
  readonly patientsList    = signal<SearchSelectOption[]>([]);
  readonly professionalsList = signal<SearchSelectOption[]>([]);
  readonly isLoading       = signal(false);
  readonly errorMessage    = signal<string | null>(null);

  readonly selectedPrescription = signal<Prescription | null>(null);
  readonly showCreatePanel      = signal(false);
  readonly isSaving             = signal(false);
  readonly isSigning            = signal(false);
  readonly signingStep          = signal<SigningStep>(null);

  // Capture pending signatures before sending
  private _pendingDoctorSig  = signal<string | null>(null);
  private _pendingPatientSig = signal<string | null>(null);
  private _pendingFingerprint = signal<string | null>(null);

  readonly activeFilter = signal<PrescriptionFilter>('all');
  readonly searchTerm   = signal('');

  // ── Tabs ───────────────────────────────────────────────────────────────────

  readonly statusTabs: { label: string; value: PrescriptionFilter }[] = [
    { label: 'Todas',             value: 'all'            },
    { label: 'Borradores',        value: 'DRAFT'          },
    { label: 'Firma médico',      value: 'DOCTOR_SIGNED'  },
    { label: 'Firma paciente',    value: 'PATIENT_SIGNED' },
    { label: 'Finalizadas',       value: 'FINALIZED'      },
  ];

  // ── Computed ───────────────────────────────────────────────────────────────

  readonly filteredPrescriptions = computed<Prescription[]>(() => {
    const filter = this.activeFilter();
    const q      = this.searchTerm().toLowerCase();
    return this.prescriptions()
      .filter(p => filter === 'all' || p.status === filter)
      .filter(p => !q || p.patientName.toLowerCase().includes(q) || p.diagnosis.toLowerCase().includes(q));
  });

  /** Whether doctor signature step has enough signatures to submit. */
  readonly canSubmitDoctorSign  = computed(() => this._pendingDoctorSig() !== null);
  /** Whether patient signing step is complete (both signature + fingerprint). */
  readonly canSubmitPatientSign = computed(() =>
    this._pendingPatientSig() !== null && this._pendingFingerprint() !== null,
  );

  // ── Create form ────────────────────────────────────────────────────────────

  readonly createForm = this.fb.nonNullable.group({
    patientId:      ['', Validators.required],
    professionalId: ['', Validators.required],
    appointmentId:  [''],
    diagnosis:      ['', Validators.required],
    notes:          [''],
  });

  readonly itemsArray: FormArray<FormGroup> = this.fb.array<FormGroup>([this.buildItemGroup()]);

  buildItemGroup(): FormGroup {
    return this.fb.nonNullable.group({
      medication:   ['', Validators.required],
      dosage:       ['', Validators.required],
      frequency:    ['', Validators.required],
      duration:     ['', Validators.required],
      instructions: [''],
    });
  }

  get itemControls() { return this.itemsArray.controls; }
  addItem(): void { this.itemsArray.push(this.buildItemGroup()); }
  removeItem(i: number): void { if (this.itemsArray.length > 1) this.itemsArray.removeAt(i); }

  // ── Constructor ────────────────────────────────────────────────────────────

  constructor() {
    this.isLoading.set(true);
    this.service.getAll().pipe(takeUntilDestroyed()).subscribe({
      next:  list => { this.prescriptions.set(list); this.isLoading.set(false); },
      error: err  => { this.errorMessage.set(err?.error?.message ?? 'Error al cargar recetas.'); this.isLoading.set(false); },
    });

    this.patientsService.getAll().pipe(takeUntilDestroyed()).subscribe({
      next: list => this.patientsList.set(list.map(p => ({ value: p.id, label: p.name }))),
    });

    this.professionalsService.getAll().pipe(takeUntilDestroyed()).subscribe({
      next: list => this.professionalsList.set(list.map(p => ({ value: p.id, label: p.name }))),
    });
  }

  // ── Commands ───────────────────────────────────────────────────────────────

  openCreatePanel(prefilledPatientId?: string): void {
    this.createForm.reset({ patientId: prefilledPatientId ?? '', professionalId: '', appointmentId: '', diagnosis: '', notes: '' });
    while (this.itemsArray.length > 1) this.itemsArray.removeAt(1);
    this.itemsArray.at(0).reset({ medication: '', dosage: '', frequency: '', duration: '', instructions: '' });
    this.showCreatePanel.set(true);
  }

  closeCreatePanel(): void { this.showCreatePanel.set(false); }

  submitCreate(): void {
    if (this.createForm.invalid || this.itemsArray.invalid) {
      this.createForm.markAllAsTouched();
      this.itemsArray.controls.forEach(g => g.markAllAsTouched());
      return;
    }
    this.isSaving.set(true);
    const v = this.createForm.getRawValue();
    this.service.create({
      patientId:      v.patientId,
      professionalId: v.professionalId,
      ...(v.appointmentId ? { appointmentId: v.appointmentId } : {}),
      diagnosis: v.diagnosis,
      ...(v.notes ? { notes: v.notes } : {}),
      items: this.itemsArray.getRawValue().map(i => ({
        medication:   i['medication'] as string,
        dosage:       i['dosage']     as string,
        frequency:    i['frequency']  as string,
        duration:     i['duration']   as string,
        ...(i['instructions'] ? { instructions: i['instructions'] as string } : {}),
      })),
    }).subscribe({
      next: rx => {
        this.prescriptions.update(list => [rx, ...list]);
        this.closeCreatePanel();
        this.isSaving.set(false);
        this.toast.success('Receta creada correctamente.');
      },
      error: err => {
        const msg = err?.error?.message ?? 'Error al crear receta.';
        this.toast.error(msg);
        this.isSaving.set(false);
      },
    });
  }

  selectPrescription(rx: Prescription): void {
    this.service.getById(rx.id).subscribe({
      next:  full => { this.selectedPrescription.set(full); this.signingStep.set(null); },
      error: ()   => { this.selectedPrescription.set(rx);   this.signingStep.set(null); },
    });
  }

  selectPrescriptionById(rxId: string): void {
    this.service.getById(rxId).subscribe({
      next: full => { this.selectedPrescription.set(full); this.signingStep.set(null); },
    });
  }

  closeDetail(): void {
    this.selectedPrescription.set(null);
    this.signingStep.set(null);
    this._pendingDoctorSig.set(null);
    this._pendingPatientSig.set(null);
    this._pendingFingerprint.set(null);
  }

  // ── Signing flow ───────────────────────────────────────────────────────────

  openDoctorSign():  void { this.signingStep.set('doctor');  this._pendingDoctorSig.set(null); }
  openPatientSign(): void { this.signingStep.set('patient'); this._pendingPatientSig.set(null); this._pendingFingerprint.set(null); }
  cancelSigning():   void { this.signingStep.set(null); }

  onDoctorSignatureCaptured(dataUrl: string):    void { this._pendingDoctorSig.set(dataUrl); }
  onPatientSignatureCaptured(dataUrl: string):   void { this._pendingPatientSig.set(dataUrl); }
  onFingerprintCaptured(dataUrl: string):        void { this._pendingFingerprint.set(dataUrl); }

  submitDoctorSign(): void {
    const rx  = this.selectedPrescription();
    const sig = this._pendingDoctorSig();
    if (!rx || !sig) return;
    this.isSigning.set(true);
    this.service.signDoctor(rx.id, sig).subscribe({
      next: updated => this._updateSelected(updated, 'Firma del médico registrada.'),
      error: err    => { this.toast.error(err?.error?.message ?? 'Error al firmar.'); this.isSigning.set(false); },
    });
  }

  submitPatientSign(): void {
    const rx          = this.selectedPrescription();
    const patientSig  = this._pendingPatientSig();
    const fingerprint = this._pendingFingerprint();
    if (!rx || !patientSig || !fingerprint) return;
    this.isSigning.set(true);
    this.service.signPatient(rx.id, patientSig, fingerprint).subscribe({
      next: updated => this._updateSelected(updated, 'Firma del paciente registrada.'),
      error: err    => { this.toast.error(err?.error?.message ?? 'Error al firmar.'); this.isSigning.set(false); },
    });
  }

  submitFinalize(): void {
    const rx = this.selectedPrescription();
    if (!rx) return;
    this.isSigning.set(true);
    this.service.finalize(rx.id).subscribe({
      next: updated => this._updateSelected(updated, 'Receta finalizada.'),
      error: err    => { this.toast.error(err?.error?.message ?? 'Error al finalizar.'); this.isSigning.set(false); },
    });
  }

  // ── Labels ─────────────────────────────────────────────────────────────────

  statusLabel(s: PrescriptionStatus): string {
    return PRESCRIPTION_STATUS_LABELS[s] ?? s;
  }

  // ── Private ────────────────────────────────────────────────────────────────

  private _updateSelected(updated: Prescription, msg: string): void {
    this.selectedPrescription.set(updated);
    this.prescriptions.update(list => list.map(p => p.id === updated.id ? updated : p));
    this.signingStep.set(null);
    this.isSigning.set(false);
    this.toast.success(msg);
  }
}
