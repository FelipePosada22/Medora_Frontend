import { Component, ChangeDetectionStrategy, inject, input, effect, signal } from '@angular/core';
import { CurrencyService } from '../../../../core/currency/currency.service';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { PatientDetailViewModel } from '../../view-models/patient-detail.viewmodel';
import type { BadgeVariant } from '../../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-patient-detail-page',
  templateUrl: './patient-detail-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PatientDetailViewModel],
  imports: [RouterLink, CurrencyPipe, DatePipe, CardComponent, BadgeComponent],
  styles: [`
    .back-link {
      display: inline-flex; align-items: center; gap: var(--space-1);
      font-size: var(--font-size-sm); color: var(--color-text-secondary);
      text-decoration: none;
      &:hover { color: var(--color-primary-600); }
    }
    .btn-primary-link {
      display: inline-flex; align-items: center;
      padding: var(--space-1) var(--space-3);
      font-size: var(--font-size-sm); font-weight: var(--font-weight-medium);
      color: var(--color-neutral-0);
      background: var(--color-primary-600);
      border-radius: var(--radius-md);
      text-decoration: none; white-space: nowrap;
      &:hover { background: var(--color-primary-700); }
    }

    .patient-hero {
      display: flex; align-items: center; gap: var(--space-4); flex-wrap: wrap;
      padding: var(--space-5);
    }
    .patient-avatar {
      width: 64px; height: 64px;
      border-radius: 50%;
      background: var(--color-primary-100);
      color: var(--color-primary-700);
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .patient-hero__name {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-primary);
    }
    .patient-hero__sub {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin-top: 2px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: var(--space-4);
    }
    .stat-card { padding: var(--space-4); }
    .stat-card__label { font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-bottom: var(--space-1); text-transform: uppercase; letter-spacing: .04em; }
    .stat-card__value { font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); color: var(--color-text-primary); }
    .stat-card__value--green { color: var(--color-success-600); }
    .stat-card__value--amber { color: var(--color-warning-700); }
    .stat-card__value--red   { color: var(--color-error-600); }

    .tabs-bar {
      display: flex;
      border-bottom: 2px solid var(--color-border);
    }
    .tab-btn {
      padding: var(--space-3) var(--space-5);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-secondary);
      background: none; border: none; cursor: pointer;
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      transition: all var(--transition-fast);
      &:hover { color: var(--color-text-primary); }
    }
    .tab-btn--active {
      color: var(--color-primary-600);
      border-bottom-color: var(--color-primary-600);
    }

    /* Info tab */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-5);
    }
    .info-field { display: flex; flex-direction: column; gap: var(--space-1); }
    .info-label {
      font-size: var(--font-size-xs); font-weight: var(--font-weight-medium);
      color: var(--color-text-muted); text-transform: uppercase; letter-spacing: .04em;
    }
    .info-value { font-size: var(--font-size-sm); color: var(--color-text-primary); }
    .info-value--muted { color: var(--color-text-muted); font-style: italic; }
    .info-divider { border: none; border-top: 1px solid var(--color-border); }

    /* Appointment list */
    .appt-list { display: flex; flex-direction: column; gap: var(--space-3); }
    .appt-card {
      display: grid;
      grid-template-columns: 80px 1fr auto;
      gap: var(--space-4);
      align-items: start;
      padding: var(--space-4);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      transition: box-shadow var(--transition-fast);
      &:hover { box-shadow: 0 2px 8px rgba(0,0,0,.06); }
    }
    .appt-date {
      text-align: center;
      padding: var(--space-2);
      background: var(--color-primary-50);
      border-radius: var(--radius-md);
    }
    .appt-date__day { font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); color: var(--color-primary-700); line-height: 1; }
    .appt-date__month { font-size: var(--font-size-xs); color: var(--color-primary-600); text-transform: uppercase; }
    .appt-date__year { font-size: var(--font-size-xs); color: var(--color-text-muted); }
    .appt-info__type { font-weight: var(--font-weight-semibold); color: var(--color-text-primary); }
    .appt-info__pro  { font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-top: 2px; }
    .appt-info__time { font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: var(--space-1); }
    .appt-info__notes { font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: var(--space-1); font-style: italic; }

    /* Expandable invoice row */
    .inv-toggle-btn {
      background: none; border: none; cursor: pointer; padding: 0;
      font-size: var(--font-size-sm); color: var(--color-primary-600);
      display: inline-flex; align-items: center; gap: var(--space-1);
      &:hover { text-decoration: underline; }
    }
    .inv-detail-row td { padding: 0 !important; background: var(--color-neutral-50); }
    .inv-detail-inner {
      padding: var(--space-4) var(--space-5);
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-5);
    }
    .inv-detail-section__title {
      font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold);
      text-transform: uppercase; letter-spacing: .04em;
      color: var(--color-text-muted); margin-bottom: var(--space-2);
    }
    .inv-detail-table { width: 100%; border-collapse: collapse; font-size: var(--font-size-xs); }
    .inv-detail-table th {
      text-align: left; padding: var(--space-1) var(--space-2);
      color: var(--color-text-muted); font-weight: var(--font-weight-medium);
      border-bottom: 1px solid var(--color-border);
    }
    .inv-detail-table td { padding: var(--space-1) var(--space-2); color: var(--color-text-primary); }
    .inv-detail-table tr:not(:last-child) td { border-bottom: 1px solid var(--color-border); }
    .inv-notes { font-size: var(--font-size-xs); color: var(--color-text-secondary); font-style: italic; margin-top: var(--space-2); }

    /* Hero action buttons */
    .hero-actions { display: flex; gap: var(--space-2); flex-wrap: wrap; }
    .hero-action-btn {
      display: inline-flex; align-items: center; gap: var(--space-1);
      padding: var(--space-2) var(--space-3);
      font-size: var(--font-size-sm); font-weight: var(--font-weight-medium);
      border-radius: var(--radius-md); text-decoration: none; white-space: nowrap;
      border: 1px solid var(--color-border);
      color: var(--color-text-primary); background: var(--color-surface);
      transition: all var(--transition-fast);
      &:hover { background: var(--color-neutral-100); border-color: var(--color-text-secondary); }
    }
    .hero-action-btn--primary {
      background: var(--color-primary-600); color: white; border-color: var(--color-primary-600);
      &:hover { background: var(--color-primary-700); border-color: var(--color-primary-700); }
    }

    /* Treatment plans tab */
    .plan-list { display: flex; flex-direction: column; gap: var(--space-3); }
    .plan-card {
      border: 1px solid var(--color-border); border-radius: var(--radius-lg);
      overflow: hidden;
    }
    .plan-card__header {
      display: flex; justify-content: space-between; align-items: center;
      padding: var(--space-3) var(--space-4);
      background: var(--color-neutral-50);
    }
    .plan-card__title { font-weight: var(--font-weight-semibold); color: var(--color-text-primary); }
    .plan-card__meta { font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: 2px; }
    .plan-card__body { padding: var(--space-3) var(--space-4); display: flex; flex-direction: column; gap: var(--space-2); }
    .plan-item-row {
      display: flex; justify-content: space-between; align-items: center;
      font-size: var(--font-size-sm); color: var(--color-text-secondary);
      padding: var(--space-1) 0;
      border-bottom: 1px solid var(--color-border);
      &:last-child { border-bottom: none; }
    }
    .plan-card__footer {
      display: flex; justify-content: space-between; align-items: center;
      padding: var(--space-2) var(--space-4);
      background: var(--color-neutral-50);
      border-top: 1px solid var(--color-border);
      font-size: var(--font-size-sm);
    }
    .plan-link {
      font-size: var(--font-size-xs); color: var(--color-primary-600);
      text-decoration: none; font-weight: var(--font-weight-medium);
      &:hover { text-decoration: underline; }
    }

    /* Prescriptions tab */
    .rx-list { display: flex; flex-direction: column; gap: var(--space-3); }
    .rx-card {
      border: 1px solid var(--color-border); border-radius: var(--radius-lg);
      overflow: hidden;
    }
    .rx-card__header {
      display: flex; justify-content: space-between; align-items: center;
      padding: var(--space-3) var(--space-4);
      background: var(--color-neutral-50);
    }
    .rx-card__diagnosis { font-weight: var(--font-weight-semibold); color: var(--color-text-primary); }
    .rx-card__meta { font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: 2px; }
    .rx-card__body { padding: var(--space-3) var(--space-4); }
    .rx-item-row {
      display: flex; flex-direction: column; gap: 2px;
      padding: var(--space-2) 0;
      border-bottom: 1px solid var(--color-border);
      &:last-child { border-bottom: none; }
    }
    .rx-item-row__med { font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); color: var(--color-text-primary); }
    .rx-item-row__detail { font-size: var(--font-size-xs); color: var(--color-text-muted); }

    .state-placeholder { font-size: var(--font-size-sm); color: var(--color-text-muted); text-align: center; padding: var(--space-8) 0; font-style: italic; }
  `],
})
export class PatientDetailPageComponent {
  readonly id = input.required<string>();
  protected readonly vm           = inject(PatientDetailViewModel);
  protected readonly currencyCode = inject(CurrencyService).currencyCode;

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) this.vm.load(id);
    });
  }

  protected initials(name: string): string {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  protected apptBadge(status: string): BadgeVariant {
    const map: Record<string, BadgeVariant> = {
      SCHEDULED: 'scheduled', CONFIRMED: 'confirmed',
      COMPLETED: 'completed', CANCELLED: 'cancelled', NO_SHOW: 'no-show',
    };
    return map[status] ?? 'default';
  }

  protected apptLabel(status: string): string {
    const map: Record<string, string> = {
      SCHEDULED: 'Programada', CONFIRMED: 'Confirmada',
      COMPLETED: 'Completada', CANCELLED: 'Cancelada', NO_SHOW: 'No asistió',
    };
    return map[status] ?? status;
  }

  protected invoiceBadge(status: string): BadgeVariant {
    const map: Record<string, BadgeVariant> = {
      DRAFT: 'default', ISSUED: 'info', PAID: 'success',
      CANCELLED: 'error', OVERDUE: 'warning',
    };
    return map[status] ?? 'default';
  }

  protected invoiceLabel(status: string): string {
    const map: Record<string, string> = {
      DRAFT: 'Borrador', ISSUED: 'Emitida', PAID: 'Pagada',
      CANCELLED: 'Cancelada', OVERDUE: 'Vencida',
    };
    return map[status] ?? status;
  }

  protected readonly expandedInvoiceId = signal<string | null>(null);

  protected toggleInvoice(id: string): void {
    this.expandedInvoiceId.update(current => current === id ? null : id);
  }

  protected paymentMethodLabel(method: string): string {
    const map: Record<string, string> = {
      CASH: 'Efectivo', CARD: 'Tarjeta', TRANSFER: 'Transferencia', OTHER: 'Otro',
    };
    return map[method] ?? method;
  }

  protected planBadge(status: string): BadgeVariant {
    const map: Record<string, BadgeVariant> = {
      ACTIVE: 'info', COMPLETED: 'success', CANCELLED: 'error', PARTIAL: 'warning',
    };
    return map[status] ?? 'default';
  }

  protected rxBadge(status: string): BadgeVariant {
    const map: Record<string, BadgeVariant> = {
      DRAFT: 'default', DOCTOR_SIGNED: 'info', PATIENT_SIGNED: 'warning', FINALIZED: 'success',
    };
    return map[status] ?? 'default';
  }
}
