import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { BadgeComponent, BadgeVariant } from '../../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'cancelled';
type StatusFilter  = 'all' | InvoiceStatus;

interface Invoice {
  id: string;
  patient: string;
  service: string;
  date: Date;
  amount: number;
  status: InvoiceStatus;
}

/**
 * Billing / Facturación page.
 * Shows revenue stats and an invoice list with status filters.
 */
@Component({
  selector: 'app-billing-page',
  templateUrl: './billing-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, CurrencyPipe, CardComponent, BadgeComponent, ButtonComponent],
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--space-4);
    }
    .stat-card { padding: var(--space-5); }
    .stat-card__label { font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: var(--space-1); }
    .stat-card__value { font-size: var(--font-size-3xl); font-weight: var(--font-weight-bold); color: var(--color-text-primary); }
    .stat-card__value--green  { color: var(--color-success-600); }
    .stat-card__value--amber  { color: var(--color-warning-700); }
    .stat-card__value--red    { color: var(--color-error-600); }

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
  `],
})
export class BillingPageComponent {
  protected readonly activeFilter = signal<StatusFilter>('all');
  protected readonly searchTerm   = signal('');

  protected readonly tabs: { label: string; value: StatusFilter }[] = [
    { label: 'Todas',     value: 'all'       },
    { label: 'Pagadas',   value: 'paid'      },
    { label: 'Pendientes',value: 'pending'   },
    { label: 'Vencidas',  value: 'overdue'   },
    { label: 'Canceladas',value: 'cancelled' },
  ];

  private readonly allInvoices: Invoice[] = [
    { id: 'INV-001', patient: 'Ana García',      service: 'Consulta General', date: new Date('2026-03-11'), amount: 50.00,  status: 'paid'      },
    { id: 'INV-002', patient: 'Carlos Mendoza',  service: 'Limpieza Dental',  date: new Date('2026-03-11'), amount: 75.00,  status: 'pending'   },
    { id: 'INV-003', patient: 'María Rodríguez', service: 'Ortodoncia',       date: new Date('2026-03-10'), amount: 120.00, status: 'paid'      },
    { id: 'INV-004', patient: 'Luis Torres',     service: 'Radiografía',      date: new Date('2026-03-10'), amount: 40.00,  status: 'paid'      },
    { id: 'INV-005', patient: 'Sofia Vargas',    service: 'Extracción',       date: new Date('2026-03-09'), amount: 90.00,  status: 'overdue'   },
    { id: 'INV-006', patient: 'Pedro Jiménez',   service: 'Blanqueamiento',   date: new Date('2026-03-08'), amount: 200.00, status: 'cancelled' },
    { id: 'INV-007', patient: 'Laura Castillo',  service: 'Endodoncia',       date: new Date('2026-03-07'), amount: 180.00, status: 'paid'      },
    { id: 'INV-008', patient: 'Roberto Díaz',    service: 'Consulta General', date: new Date('2026-03-06'), amount: 50.00,  status: 'overdue'   },
    { id: 'INV-009', patient: 'Ana García',      service: 'Ortodoncia',       date: new Date('2026-03-05'), amount: 120.00, status: 'pending'   },
    { id: 'INV-010', patient: 'Carlos Mendoza',  service: 'Sellador',         date: new Date('2026-03-04'), amount: 35.00,  status: 'paid'      },
  ];

  protected readonly invoices = computed(() => {
    const filter = this.activeFilter();
    const q      = this.searchTerm().toLowerCase();
    return this.allInvoices
      .filter(i => filter === 'all' || i.status === filter)
      .filter(i => !q || i.patient.toLowerCase().includes(q));
  });

  protected readonly stats = computed(() => {
    const paid    = this.allInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
    const pending = this.allInvoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0);
    const overdue = this.allInvoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0);
    const total   = this.allInvoices.reduce((s, i) => s + i.amount, 0);
    return { total, paid, pending, overdue };
  });

  protected statusVariant(status: InvoiceStatus): BadgeVariant {
    const map: Record<InvoiceStatus, BadgeVariant> = {
      paid: 'success', pending: 'warning', overdue: 'error', cancelled: 'default',
    };
    return map[status];
  }

  protected statusLabel(status: InvoiceStatus): string {
    const map: Record<InvoiceStatus, string> = {
      paid: 'Pagada', pending: 'Pendiente', overdue: 'Vencida', cancelled: 'Cancelada',
    };
    return map[status];
  }

  protected setFilter(f: StatusFilter): void { this.activeFilter.set(f); }
  protected onSearch(e: Event): void { this.searchTerm.set((e.target as HTMLInputElement).value); }
}
