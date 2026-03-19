import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { SearchSelectComponent } from '../../../../shared/components/search-select/search-select.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { TreatmentPlansViewModel } from '../../view-models/treatment-plans.viewmodel';
import { TreatmentPlanStatus, TreatmentItemStatus } from '../../models/treatment-plan.model';
import type { BadgeVariant } from '../../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-treatment-plans-page',
  templateUrl: './treatment-plans-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TreatmentPlansViewModel],
  imports: [RouterLink, CurrencyPipe, DatePipe, ReactiveFormsModule, CardComponent, BadgeComponent, ButtonComponent, SearchSelectComponent, InputComponent],
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: var(--space-4);
    }
    .stat-card { padding: var(--space-5); }
    .stat-card__label { font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: var(--space-1); }
    .stat-card__value { font-size: var(--font-size-3xl); font-weight: var(--font-weight-bold); color: var(--color-text-primary); }
    .stat-card__value--blue  { color: var(--color-primary-600); }
    .stat-card__value--amber { color: var(--color-warning-700); }
    .stat-card__value--green { color: var(--color-success-600); }

    .status-tabs {
      display: flex; gap: var(--space-1);
      border-bottom: 1px solid var(--color-border);
      margin-bottom: var(--space-4);
    }
    .status-tab {
      padding: var(--space-2) var(--space-4);
      font-size: var(--font-size-sm); font-weight: var(--font-weight-medium);
      color: var(--color-text-secondary);
      border-bottom: 2px solid transparent; margin-bottom: -1px;
      cursor: pointer; background: none;
      border-top: none; border-left: none; border-right: none;
      transition: all var(--transition-fast);
    }
    .status-tab--active { color: var(--color-primary-600); border-bottom-color: var(--color-primary-600); }

    .items-summary { display: flex; gap: 3px; align-items: center; }
    .item-dot {
      width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
    }
    .item-dot--pending     { background: var(--color-neutral-400); }
    .item-dot--in_progress { background: var(--color-primary-500); }
    .item-dot--completed   { background: var(--color-success-500); }
    .item-dot--cancelled   { background: var(--color-error-400); }

    /* Panels */
    .panel-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.35); z-index: 100; }
    .panel {
      position: fixed; top: 0; right: 0;
      width: 520px; max-width: 95vw; height: 100vh;
      background: var(--color-surface);
      box-shadow: -4px 0 24px rgba(0,0,0,.12);
      z-index: 101; display: flex; flex-direction: column; overflow: hidden;
    }
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
    .form-label { font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); color: var(--color-text-secondary); }
    .form-label--required::after { content: ' *'; color: var(--color-error-500); }
    .form-input, .form-select, .form-textarea {
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--color-border); border-radius: var(--radius-md);
      font-size: var(--font-size-sm); background: var(--color-surface);
      outline: none; width: 100%; box-sizing: border-box;
      &:focus { border-color: var(--color-primary-400); }
    }
    .form-textarea { min-height: 72px; resize: vertical; }
    .form-error { font-size: var(--font-size-xs); color: var(--color-error-600); }

    /* Items form */
    .items-header { display: flex; align-items: center; justify-content: space-between; }
    .items-section-label { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-text-primary); }
    .item-block {
      border: 1px solid var(--color-border); border-radius: var(--radius-md);
      padding: var(--space-3); margin-top: var(--space-2);
      display: flex; flex-direction: column; gap: var(--space-2);
    }
    .item-block__row { display: flex; gap: var(--space-2); align-items: flex-end; }
    .item-remove {
      background: none; border: none; cursor: pointer;
      color: var(--color-error-500); font-size: 18px; line-height: 1; padding: 6px 0;
      flex-shrink: 0;
      &:hover { color: var(--color-error-700); }
      &:disabled { opacity: 0.3; cursor: default; }
    }
    .items-total {
      text-align: right; font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);
      padding-top: var(--space-2); border-top: 1px solid var(--color-border);
      margin-top: var(--space-2);
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

    /* Treatment items detail */
    .treatment-items { display: flex; flex-direction: column; gap: var(--space-3); }
    .treatment-item {
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      overflow: hidden;
    }
    .treatment-item__header {
      display: flex; justify-content: space-between; align-items: flex-start;
      padding: var(--space-3);
      background: var(--color-neutral-50);
    }
    .treatment-item__desc { font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); }
    .treatment-item__notes { font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: 2px; }
    .treatment-item__right {
      display: flex; flex-direction: column; align-items: flex-end; gap: var(--space-1);
      font-size: var(--font-size-sm); font-weight: var(--font-weight-medium);
      flex-shrink: 0; margin-left: var(--space-3);
    }
    .treatment-item__actions {
      display: flex; gap: var(--space-2); padding: var(--space-2) var(--space-3);
      border-top: 1px solid var(--color-border);
      flex-wrap: wrap;
    }
    .treatment-item__edit {
      padding: var(--space-3);
      display: flex; flex-direction: column; gap: var(--space-2);
      background: var(--color-primary-50);
    }
    .item-edit-row { display: flex; gap: var(--space-2); }

    /* Generate invoice section */
    .invoice-gen-form {
      display: flex; flex-direction: column; gap: var(--space-3);
      padding: var(--space-4);
      background: var(--color-neutral-50);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
    }
    .invoice-gen-form__title {
      font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
    }
    .invoice-gen-form__actions { display: flex; gap: var(--space-2); justify-content: flex-end; }
    .form-row { display: flex; flex-direction: column; gap: var(--space-1); }
    .invoice-gen-empty {
      font-size: var(--font-size-xs); color: var(--color-text-muted); font-style: italic;
      padding: var(--space-2) 0;
    }
    .invoice-item-list { display: flex; flex-direction: column; gap: var(--space-1); }
    .invoice-item-list__header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: var(--space-1);
    }
    .invoice-item-list__count { font-size: var(--font-size-xs); color: var(--color-text-muted); }
    .invoice-item-check {
      display: flex; align-items: center; gap: var(--space-2);
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--color-border); border-radius: var(--radius-md);
      cursor: pointer; font-size: var(--font-size-sm);
      transition: all var(--transition-fast);
      &:hover { border-color: var(--color-primary-400); background: var(--color-primary-50); }
    }
    .invoice-item-check--selected {
      border-color: var(--color-primary-400); background: var(--color-primary-50);
    }
    .invoice-item-check input[type="checkbox"] { flex-shrink: 0; accent-color: var(--color-primary-600); }
    .invoice-item-check__desc { flex: 1; color: var(--color-text-primary); }
    .invoice-item-check__price { font-weight: var(--font-weight-semibold); color: var(--color-text-primary); flex-shrink: 0; }
    .invoice-item-list__total {
      display: flex; justify-content: space-between; align-items: center;
      padding: var(--space-2) var(--space-3);
      border-top: 1px solid var(--color-border);
      margin-top: var(--space-1);
      font-size: var(--font-size-sm); color: var(--color-text-secondary);
    }

    /* Plan invoices section */
    .plan-invoices { display: flex; flex-direction: column; gap: var(--space-2); }
    .plan-invoices__header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: var(--space-1);
    }
    .plan-invoices__summary { font-size: var(--font-size-xs); color: var(--color-text-secondary); }
    .plan-invoice-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--color-border); border-radius: var(--radius-md);
      background: var(--color-neutral-50);
      gap: var(--space-2);
    }
    .plan-invoice-row__left { display: flex; flex-direction: column; gap: 2px; }
    .plan-invoice-row__id { font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); color: var(--color-text-primary); font-family: monospace; }
    .plan-invoice-row__date { font-size: var(--font-size-xs); color: var(--color-text-muted); }
    .plan-invoice-row__right { display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap; justify-content: flex-end; }
    .plan-invoice-row__total { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); }
    .plan-invoice-row__balance { font-size: var(--font-size-xs); color: var(--color-warning-700); }
    .plan-invoice-link {
      font-size: var(--font-size-xs); color: var(--color-primary-600);
      text-decoration: none; font-weight: var(--font-weight-medium);
      &:hover { text-decoration: underline; }
    }
  `],
})
export class TreatmentPlansPageComponent {
  protected readonly vm = inject(TreatmentPlansViewModel);

  constructor() {
    const params = inject(ActivatedRoute).snapshot.queryParamMap;
    const patientId = params.get('patientId');
    const planId    = params.get('planId');
    if (planId) {
      this.vm.selectPlanById(planId);
    } else if (patientId) {
      // Wait for plans to load then open create panel with patient pre-filled
      this.vm.openCreatePanel(patientId);
    }
  }

  protected planBadge(status: TreatmentPlanStatus): BadgeVariant {
    const map: Record<TreatmentPlanStatus, BadgeVariant> = {
      ACTIVE:    'info',
      COMPLETED: 'success',
      CANCELLED: 'error',
      PARTIAL:   'warning',
    };
    return map[status] ?? 'default';
  }

  protected confirmDeletePlan(title: string): void {
    if (confirm(`¿Eliminar el plan "${title}"? Esta acción no se puede deshacer.`)) {
      this.vm.deletePlan();
    }
  }

  protected confirmDeleteItem(description: string, itemId: string): void {
    if (confirm(`¿Eliminar el tratamiento "${description}"?`)) {
      this.vm.deleteItem(itemId);
    }
  }

  protected itemBadge(status: TreatmentItemStatus): BadgeVariant {
    const map: Record<TreatmentItemStatus, BadgeVariant> = {
      PENDING:     'default',
      IN_PROGRESS: 'info',
      COMPLETED:   'success',
      CANCELLED:   'error',
    };
    return map[status] ?? 'default';
  }

  protected invoiceSelectedTotal(): number {
    const selected = this.vm.invoiceItemIds();
    return this.vm.billableItems()
      .filter(i => selected.has(i.id))
      .reduce((s, i) => s + i.price, 0);
  }

  protected invoiceBadge(status: string): BadgeVariant {
    const map: Record<string, BadgeVariant> = {
      DRAFT: 'default', ISSUED: 'info', PAID: 'success', CANCELLED: 'error', OVERDUE: 'warning',
    };
    return map[status] ?? 'default';
  }

  protected invoiceLabel(status: string): string {
    const map: Record<string, string> = {
      DRAFT: 'Borrador', ISSUED: 'Emitida', PAID: 'Pagada', CANCELLED: 'Cancelada', OVERDUE: 'Vencida',
    };
    return map[status] ?? status;
  }
}
