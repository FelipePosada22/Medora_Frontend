import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthStateService } from '../../../../core/auth/services/auth-state.service';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { SearchSelectComponent } from '../../../../shared/components/search-select/search-select.component';
import { BillingViewModel } from '../../view-models/billing.viewmodel';
import { Invoice, InvoiceStatus, INVOICE_STATUS_LABELS } from '../../models/invoice.model';
import { InvoicePdfService } from '../../services/invoice-pdf.service';
import { PatientsService } from '../../../patients/services/patients.service';
import type { BadgeVariant } from '../../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-billing-page',
  templateUrl: './billing-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [BillingViewModel],
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule, CardComponent, BadgeComponent, ButtonComponent, SearchSelectComponent],
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--space-4);
    }
    .stat-card { padding: var(--space-5); }
    .stat-card__label { font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: var(--space-1); }
    .stat-card__value { font-size: var(--font-size-3xl); font-weight: var(--font-weight-bold); color: var(--color-text-primary); }
    .stat-card__value--green { color: var(--color-success-600); }
    .stat-card__value--amber { color: var(--color-warning-700); }
    .stat-card__value--red   { color: var(--color-error-600); }

    .status-tabs {
      display: flex;
      gap: var(--space-1);
      border-bottom: 1px solid var(--color-border);
      margin-bottom: var(--space-4);
    }
    .status-tab {
      padding: var(--space-2) var(--space-4);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-secondary);
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
      cursor: pointer;
      background: none;
      border-top: none; border-left: none; border-right: none;
      transition: all var(--transition-fast);
    }
    .status-tab--active { color: var(--color-primary-600); border-bottom-color: var(--color-primary-600); }

    /* Panels */
    .panel-backdrop {
      position: fixed; inset: 0;
      background: rgba(0,0,0,.35);
      z-index: 100;
    }
    .panel {
      position: fixed;
      top: 0; right: 0;
      width: 500px; max-width: 95vw;
      height: 100vh;
      background: var(--color-surface);
      box-shadow: -4px 0 24px rgba(0,0,0,.12);
      z-index: 101;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .panel-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: var(--space-5);
      border-bottom: 1px solid var(--color-border);
      flex-shrink: 0;
    }
    .panel-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
    }
    .panel-close {
      background: none; border: none; cursor: pointer;
      font-size: var(--font-size-xl); color: var(--color-text-muted); line-height: 1;
      &:hover { color: var(--color-text-primary); }
    }
    .panel-body {
      flex: 1; overflow-y: auto;
      padding: var(--space-5);
      display: flex; flex-direction: column; gap: var(--space-4);
    }
    .panel-footer {
      padding: var(--space-4) var(--space-5);
      border-top: 1px solid var(--color-border);
      display: flex; gap: var(--space-3); justify-content: flex-end;
      flex-shrink: 0;
    }

    /* Form */
    .form-group { display: flex; flex-direction: column; gap: var(--space-1); }
    .form-label {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-secondary);
    }
    .form-label--required::after { content: ' *'; color: var(--color-error-500); }
    .form-input, .form-select, .form-textarea {
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      background: var(--color-surface);
      outline: none;
      width: 100%;
      box-sizing: border-box;
      &:focus { border-color: var(--color-primary-400); }
    }
    .form-textarea { min-height: 72px; resize: vertical; }
    .form-error { font-size: var(--font-size-xs); color: var(--color-error-600); }

    /* Items */
    .items-header {
      display: flex; align-items: center; justify-content: space-between;
    }
    .items-section-label {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
    }
    .item-row {
      display: grid;
      grid-template-columns: 1fr 64px 88px 28px;
      gap: var(--space-2);
      align-items: end;
      margin-bottom: var(--space-2);
    }
    .item-col-label {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      margin-bottom: 2px;
    }
    .item-remove {
      background: none; border: none; cursor: pointer;
      color: var(--color-error-500); font-size: 18px;
      line-height: 1; padding: 6px 0;
      &:hover { color: var(--color-error-700); }
      &:disabled { opacity: 0.3; cursor: default; }
    }
    .items-total {
      text-align: right;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      padding-top: var(--space-2);
      border-top: 1px solid var(--color-border);
    }

    /* Detail */
    .detail-row { display: flex; flex-direction: column; gap: var(--space-1); }
    .detail-label {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-muted);
      text-transform: uppercase; letter-spacing: .04em;
    }
    .detail-value { font-size: var(--font-size-sm); color: var(--color-text-primary); }
    .detail-divider { border: none; border-top: 1px solid var(--color-border); }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }

    .mini-table { width: 100%; border-collapse: collapse; font-size: var(--font-size-sm); }
    .mini-table th {
      text-align: left; padding: var(--space-2);
      font-size: var(--font-size-xs); font-weight: var(--font-weight-medium);
      color: var(--color-text-muted); border-bottom: 1px solid var(--color-border);
    }
    .mini-table td { padding: var(--space-2); border-bottom: 1px solid var(--color-border); }
    .mini-table tfoot td {
      font-weight: var(--font-weight-semibold);
      border-top: 2px solid var(--color-border); border-bottom: none;
    }
    .text-right { text-align: right; }

    .balance-box {
      display: flex; justify-content: space-between; align-items: center;
      padding: var(--space-3) var(--space-4);
      background: var(--color-primary-50);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
    }
    .balance-amount {
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-xl);
      color: var(--color-primary-700);
    }

    .payment-section {
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: var(--space-4);
    }
    .payment-section-title {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      margin-bottom: var(--space-3);
    }
    .payment-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }

    .status-actions { display: flex; gap: var(--space-2); flex-wrap: wrap; }

    .payment-block {
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      overflow: hidden;
      margin-bottom: var(--space-2);
    }
    .payment-block__row {
      display: flex; align-items: center; justify-content: space-between;
      padding: var(--space-2) var(--space-3);
      background: var(--color-neutral-50);
    }
    .payment-block__info {
      display: flex; align-items: center; gap: var(--space-3);
      font-size: var(--font-size-sm);
    }
    .payment-block__date { color: var(--color-text-secondary); }
    .payment-block__method { font-weight: var(--font-weight-medium); }
    .payment-block__ref { color: var(--color-text-muted); font-size: var(--font-size-xs); }
    .payment-block__right {
      display: flex; align-items: center; gap: var(--space-3);
      font-size: var(--font-size-sm);
    }

    .refund-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: var(--space-1) var(--space-3);
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      border-top: 1px dashed var(--color-border);
      background: var(--color-surface);
    }
    .refund-row__amount { color: var(--color-error-600); font-weight: var(--font-weight-medium); }

    .refund-form {
      padding: var(--space-3);
      border-top: 1px solid var(--color-border);
      background: var(--color-error-50);
    }

    /* PDF buttons */
    .panel-header-actions {
      display: flex; align-items: center; gap: var(--space-2);
    }
    .pdf-btn {
      padding: 4px 10px; border-radius: var(--radius-md);
      font-size: var(--font-size-xs); font-weight: var(--font-weight-medium);
      cursor: pointer; border: 1px solid transparent; line-height: 1.5;
      &:disabled { opacity: 0.5; cursor: default; }
    }
    .pdf-btn--secondary {
      background: var(--color-surface); border-color: var(--color-border);
      color: var(--color-text-secondary);
      &:hover:not(:disabled) { background: var(--color-border); }
    }
    .pdf-btn--whatsapp {
      background: #25d366; color: #fff;
      &:hover:not(:disabled) { background: #1da851; }
    }

    /* Draft editing */
    .items-section-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: var(--space-2);
    }
    .item-actions-cell {
      white-space: nowrap; text-align: right;
    }
    .item-inline-btn {
      background: none; border: none; cursor: pointer;
      color: var(--color-text-muted); font-size: var(--font-size-sm);
      padding: 2px 4px; line-height: 1;
      &:hover { color: var(--color-primary-600); }
      &:disabled { opacity: 0.3; cursor: default; }
    }
    .item-inline-btn--danger { &:hover { color: var(--color-error-600); } }

    .inline-edit-form {
      padding: var(--space-3);
      background: var(--color-primary-50);
      border-top: 1px solid var(--color-border);
      display: flex; flex-direction: column; gap: var(--space-2);
    }
    .inline-edit-row { display: flex; gap: var(--space-2); align-items: flex-end; }
    .inline-edit-actions {
      display: flex; gap: var(--space-2); justify-content: flex-end;
      margin-top: var(--space-1);
    }

    .add-item-form {
      margin-top: var(--space-3);
      border: 1px dashed var(--color-primary-300);
      border-radius: var(--radius-md);
      padding: var(--space-3);
      background: var(--color-primary-50);
      display: flex; flex-direction: column; gap: var(--space-2);
    }
    .add-item-form__title {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      color: var(--color-primary-700);
    }

    .draft-edit-section {
      border: 1px solid var(--color-primary-200);
      border-radius: var(--radius-md);
      padding: var(--space-4);
      background: var(--color-primary-50);
      display: flex; flex-direction: column; gap: var(--space-3);
    }
    .draft-edit-section__title {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--color-primary-700);
    }
  `],
})
export class BillingPageComponent {
  protected readonly vm            = inject(BillingViewModel);
  protected readonly InvoiceStatus = InvoiceStatus;

  private readonly authState      = inject(AuthStateService);
  private readonly pdfService     = inject(InvoicePdfService);
  private readonly patientsService = inject(PatientsService);

  protected readonly isDoctor    = computed(() => this.authState.user()?.role === 'DOCTOR');
  protected readonly isSendingPdf = signal(false);

  private _patientPhoneCache = new Map<string, string | null>();

  constructor() {
    const route              = inject(ActivatedRoute);
    const params             = route.snapshot.queryParamMap;
    const patientId          = params.get('patientId');
    const appointmentId      = params.get('appointmentId') ?? undefined;
    const serviceDescription = params.get('serviceDescription') ?? undefined;
    const servicePrice       = params.get('servicePrice') ? Number(params.get('servicePrice')) : undefined;
    if (patientId) this.vm.openCreatePanel({ patientId, appointmentId, serviceDescription, servicePrice });
  }

  protected statusBadge(status: InvoiceStatus): BadgeVariant {
    const map: Record<InvoiceStatus, BadgeVariant> = {
      [InvoiceStatus.DRAFT]:     'default',
      [InvoiceStatus.ISSUED]:    'info',
      [InvoiceStatus.PAID]:      'success',
      [InvoiceStatus.CANCELLED]: 'error',
      [InvoiceStatus.OVERDUE]:   'warning',
    };
    return map[status] ?? 'default';
  }

  protected statusLabel(status: InvoiceStatus): string {
    return INVOICE_STATUS_LABELS[status] ?? status;
  }

  protected confirmRemoveItem(itemId: string): void {
    if (confirm('¿Eliminar este ítem de la factura?')) {
      this.vm.removeInvoiceItem(itemId);
    }
  }

  protected downloadPdf(inv: Invoice): void {
    this.pdfService.download(inv);
  }

  protected sendWhatsApp(inv: Invoice): void {
    this._withPhone(inv.patientId, phone => {
      this.isSendingPdf.set(true);
      this.pdfService.shareWhatsApp(inv, phone).finally(() => this.isSendingPdf.set(false));
    });
  }

  private _withPhone(patientId: string, cb: (phone: string | null) => void): void {
    if (this._patientPhoneCache.has(patientId)) {
      cb(this._patientPhoneCache.get(patientId) ?? null);
      return;
    }
    this.patientsService.getById(patientId).subscribe({
      next: p => {
        this._patientPhoneCache.set(patientId, p.phone ?? null);
        cb(p.phone ?? null);
      },
      error: () => cb(null),
    });
  }
}
