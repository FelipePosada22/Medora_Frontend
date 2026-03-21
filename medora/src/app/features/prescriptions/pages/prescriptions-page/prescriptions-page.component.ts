import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { SearchSelectComponent } from '../../../../shared/components/search-select/search-select.component';
import { SignaturePadComponent } from '../../../../shared/components/signature-pad/signature-pad.component';
import { PrescriptionsViewModel } from '../../view-models/prescriptions.viewmodel';
import { PrescriptionPdfService } from '../../services/prescription-pdf.service';
import { PatientsService } from '../../../patients/services/patients.service';
import { PrescriptionStatus, Prescription } from '../../models/prescription.model';
import type { BadgeVariant } from '../../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-prescriptions-page',
  templateUrl: './prescriptions-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PrescriptionsViewModel],
  imports: [DatePipe, ReactiveFormsModule, CardComponent, BadgeComponent, ButtonComponent, SearchSelectComponent, SignaturePadComponent],
  styles: [`
    .status-tabs {
      display: flex; gap: var(--space-1);
      border-bottom: 1px solid var(--color-border);
      margin-bottom: var(--space-4);
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      &::-webkit-scrollbar { display: none; }
    }
    .status-tab {
      padding: var(--space-2) var(--space-4);
      font-size: var(--font-size-sm); font-weight: var(--font-weight-medium);
      color: var(--color-text-secondary);
      border-bottom: 2px solid transparent; margin-bottom: -1px;
      cursor: pointer; background: none;
      white-space: nowrap; flex-shrink: 0;
      border-top: none; border-left: none; border-right: none;
      transition: all var(--transition-fast);
    }
    .status-tab--active { color: var(--color-primary-600); border-bottom-color: var(--color-primary-600); }

    /* Panels */
    .panel-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.35); z-index: 100; }
    .panel {
      position: fixed; top: 0; right: 0;
      width: 540px; max-width: 95vw; height: 100vh;
      background: var(--color-surface);
      box-shadow: -4px 0 24px rgba(0,0,0,.12);
      z-index: 101; display: flex; flex-direction: column; overflow: hidden;
    }
    .panel--wide { width: 600px; }
    .panel-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: var(--space-5); border-bottom: 1px solid var(--color-border); flex-shrink: 0;
    }
    .panel-title { font-size: var(--font-size-lg); font-weight: var(--font-weight-semibold); color: var(--color-text-primary); }
    .panel-close {
      background: none; border: none; cursor: pointer;
      font-size: var(--font-size-xl); color: var(--color-text-muted); line-height: 1;
      &:hover { color: var(--color-text-primary); }
    }
    .panel-body { flex: 1; overflow-y: auto; padding: var(--space-5); display: flex; flex-direction: column; gap: var(--space-4); }
    .panel-footer {
      padding: var(--space-4) var(--space-5); border-top: 1px solid var(--color-border);
      display: flex; gap: var(--space-3); justify-content: flex-end; flex-shrink: 0;
    }

    /* Form */
    .form-group { display: flex; flex-direction: column; gap: var(--space-1); }
    .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }
    .form-label { font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); color: var(--color-text-secondary); }
    .form-label--required::after { content: ' *'; color: var(--color-error-500); }
    .form-input, .form-textarea {
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--color-border); border-radius: var(--radius-md);
      font-size: var(--font-size-sm); background: var(--color-surface);
      outline: none; width: 100%; box-sizing: border-box;
      &:focus { border-color: var(--color-primary-400); }
    }
    .form-textarea { min-height: 72px; resize: vertical; }
    .form-error { font-size: var(--font-size-xs); color: var(--color-error-600); }

    /* Medication blocks */
    .items-header { display: flex; align-items: center; justify-content: space-between; }
    .items-section-label { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-text-primary); }
    .med-block {
      border: 1px solid var(--color-border); border-radius: var(--radius-md);
      padding: var(--space-3); margin-top: var(--space-2);
      display: flex; flex-direction: column; gap: var(--space-2);
    }
    .med-block__header { display: flex; justify-content: space-between; align-items: center; }
    .med-block__num { font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); color: var(--color-text-muted); text-transform: uppercase; }
    .item-remove {
      background: none; border: none; cursor: pointer;
      color: var(--color-error-500); font-size: 18px; line-height: 1; padding: 4px;
      &:hover { color: var(--color-error-700); }
      &:disabled { opacity: 0.3; cursor: default; }
    }

    /* Detail */
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }
    .detail-row { display: flex; flex-direction: column; gap: var(--space-1); }
    .detail-label {
      font-size: var(--font-size-xs); font-weight: var(--font-weight-medium);
      color: var(--color-text-muted); text-transform: uppercase; letter-spacing: .04em;
    }
    .detail-value { font-size: var(--font-size-sm); color: var(--color-text-primary); }
    .detail-divider { border: none; border-top: 1px solid var(--color-border); }

    /* Medication list */
    .med-list { display: flex; flex-direction: column; gap: var(--space-3); }
    .med-card {
      border: 1px solid var(--color-border); border-radius: var(--radius-md);
      padding: var(--space-3); background: var(--color-neutral-50);
    }
    .med-card__name { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); margin-bottom: var(--space-2); }
    .med-card__details {
      display: flex; flex-wrap: wrap; gap: var(--space-3);
      font-size: var(--font-size-xs); color: var(--color-text-secondary);
    }
    .med-card__note { font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: var(--space-1); }

    /* Signing */
    .flow-actions { display: flex; gap: var(--space-2); flex-wrap: wrap; }

    .sign-section {
      border: 1px solid var(--color-primary-200);
      border-radius: var(--radius-md);
      padding: var(--space-4);
      background: var(--color-primary-50);
      display: flex; flex-direction: column; gap: var(--space-3);
    }
    .sign-section__title {
      font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-primary-700);
    }
    .sign-section__actions { display: flex; justify-content: flex-end; gap: var(--space-2); }

    /* Signature images */
    .signatures-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: var(--space-3);
    }
    .sig-box {
      border: 1px solid var(--color-border); border-radius: var(--radius-md);
      overflow: hidden; background: var(--color-neutral-50);
    }
    .sig-box__label {
      padding: var(--space-2) var(--space-3);
      font-size: var(--font-size-xs); font-weight: var(--font-weight-medium);
      color: var(--color-text-muted);
      border-bottom: 1px solid var(--color-border);
    }
    .sig-box__img {
      display: block; width: 100%; height: 90px;
      object-fit: contain; padding: var(--space-2);
    }
    .sig-box__img--fingerprint { height: 110px; }

    .finalized-stamp {
      padding: var(--space-3) var(--space-4);
      background: var(--color-success-50);
      border: 1px solid var(--color-success-200);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      color: var(--color-success-700);
      font-weight: var(--font-weight-medium);
    }

    /* PDF / WhatsApp action buttons */
    .pdf-btn {
      display: inline-flex; align-items: center; gap: var(--space-1);
      padding: var(--space-1) var(--space-3);
      font-size: var(--font-size-xs); font-weight: var(--font-weight-medium);
      border-radius: var(--radius-md); border: 1px solid transparent;
      cursor: pointer; white-space: nowrap;
      transition: all var(--transition-fast);
      &:disabled { opacity: .55; cursor: not-allowed; }
    }
    .pdf-btn--secondary {
      background: var(--color-neutral-100); color: var(--color-text-primary);
      border-color: var(--color-border);
      &:hover:not(:disabled) { background: var(--color-neutral-200); }
    }
    .pdf-btn--whatsapp {
      background: #25d366; color: #fff; border-color: #25d366;
      &:hover:not(:disabled) { background: #1da851; border-color: #1da851; }
    }
  `],
})
export class PrescriptionsPageComponent {
  protected readonly vm          = inject(PrescriptionsViewModel);
  private  readonly pdfService   = inject(PrescriptionPdfService);
  private  readonly patientsService = inject(PatientsService);

  protected readonly isSendingPdf = signal(false);
  /** Cache patient phone to include in PDF */
  private patientPhone: string | null = null;

  constructor() {
    const params    = inject(ActivatedRoute).snapshot.queryParamMap;
    const patientId = params.get('patientId');
    const rxId      = params.get('rxId');
    if (rxId) {
      this.vm.selectPrescriptionById(rxId);
    } else if (patientId) {
      this.vm.openCreatePanel(patientId);
    }
  }

  protected rxBadge(status: PrescriptionStatus): BadgeVariant {
    const map: Record<PrescriptionStatus, BadgeVariant> = {
      DRAFT:          'default',
      DOCTOR_SIGNED:  'info',
      PATIENT_SIGNED: 'warning',
      FINALIZED:      'success',
    };
    return map[status] ?? 'default';
  }

  protected downloadPdf(rx: Prescription): void {
    this._loadPhoneThen(rx, phone => {
      this.pdfService.download(rx, phone);
    });
  }

  protected async sendWhatsApp(rx: Prescription): Promise<void> {
    this.isSendingPdf.set(true);
    try {
      this._loadPhoneThen(rx, async phone => {
        await this.pdfService.shareWhatsApp(rx, phone);
        this.isSendingPdf.set(false);
      });
    } catch {
      this.isSendingPdf.set(false);
    }
  }

  private _loadPhoneThen(rx: Prescription, cb: (phone: string | null) => void): void {
    if (this.patientPhone !== null || !rx.patientId) {
      cb(this.patientPhone);
      return;
    }
    this.patientsService.getById(rx.patientId).subscribe({
      next:  p  => { this.patientPhone = p.phone; cb(p.phone); },
      error: () => cb(null),
    });
  }
}
