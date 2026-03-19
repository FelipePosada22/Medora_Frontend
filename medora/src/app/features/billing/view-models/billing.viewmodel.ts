import { Injectable, inject, signal, computed } from '@angular/core';
import { FormBuilder, Validators, FormArray, FormGroup } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InvoicesService } from '../services/invoices.service';
import { PatientsService } from '../../patients/services/patients.service';
import { Invoice, InvoiceStatus, PaymentMethod, INVOICE_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '../models/invoice.model';
import type { SearchSelectOption } from '../../../shared/components/search-select/search-select.component';
import { CreateInvoiceBody } from '../api/invoices.api';
import { ToastService } from '../../../core/toast/toast.service';

export type StatusFilter = 'all' | InvoiceStatus;

@Injectable()
export class BillingViewModel {
  private readonly service         = inject(InvoicesService);
  private readonly patientsService = inject(PatientsService);
  private readonly fb              = inject(FormBuilder);
  private readonly toast           = inject(ToastService);

  // ── State ──────────────────────────────────────────────────────────────────

  readonly invoices        = signal<Invoice[]>([]);
  readonly patientsList    = signal<SearchSelectOption[]>([]);
  readonly isLoading       = signal(false);
  readonly errorMessage    = signal<string | null>(null);

  readonly selectedInvoice  = signal<Invoice | null>(null);
  readonly showCreatePanel  = signal(false);
  readonly isSaving         = signal(false);
  private  _appointmentId   = signal<string | null>(null);
  readonly isAddingPayment  = signal(false);

  readonly activeFilter = signal<StatusFilter>('all');
  readonly searchTerm   = signal('');

  // ── Tabs ───────────────────────────────────────────────────────────────────

  readonly tabs: { label: string; value: StatusFilter }[] = [
    { label: 'Todas',     value: 'all'                  },
    { label: 'Borradores',value: InvoiceStatus.DRAFT    },
    { label: 'Emitidas',  value: InvoiceStatus.ISSUED   },
    { label: 'Pagadas',   value: InvoiceStatus.PAID     },
    { label: 'Vencidas',  value: InvoiceStatus.OVERDUE  },
    { label: 'Canceladas',value: InvoiceStatus.CANCELLED},
  ];

  readonly paymentMethods = Object.entries(PAYMENT_METHOD_LABELS).map(
    ([value, label]) => ({ value: value as PaymentMethod, label }),
  );

  // ── Computed ───────────────────────────────────────────────────────────────

  readonly filteredInvoices = computed<Invoice[]>(() => {
    const filter = this.activeFilter();
    const q      = this.searchTerm().toLowerCase();
    return this.invoices()
      .filter(i => filter === 'all' || i.status === filter)
      .filter(i => !q || i.patientName.toLowerCase().includes(q));
  });

  readonly stats = computed(() => {
    const all = this.invoices();
    const sum = (status: InvoiceStatus) =>
      all.filter(i => i.status === status).reduce((s, i) => s + i.total, 0);
    return {
      total:   all.reduce((s, i) => s + i.total, 0),
      paid:    sum(InvoiceStatus.PAID),
      pending: sum(InvoiceStatus.ISSUED) + sum(InvoiceStatus.DRAFT),
      overdue: sum(InvoiceStatus.OVERDUE),
    };
  });

  // ── Create form ────────────────────────────────────────────────────────────

  readonly createForm = this.fb.nonNullable.group({
    patientId: ['', Validators.required],
    dueDate:   [''],
    notes:     [''],
  });

  readonly itemsArray: FormArray<FormGroup> = this.fb.array<FormGroup>([this.buildItemGroup()]);

  buildItemGroup(): FormGroup {
    return this.fb.nonNullable.group({
      description: ['', Validators.required],
      quantity:    [1,  [Validators.required, Validators.min(1)]],
      unitPrice:   [0,  [Validators.required, Validators.min(0.01)]],
    });
  }

  get itemControls() { return this.itemsArray.controls; }

  addItem(): void { this.itemsArray.push(this.buildItemGroup()); }

  removeItem(i: number): void {
    if (this.itemsArray.length > 1) this.itemsArray.removeAt(i);
  }

  readonly createTotal = computed(() => {
    // recompute whenever isSaving changes as a proxy to force reevaluation
    // actual total is read from itemsArray imperatively
    return 0; // see getCreateTotal() for live calculation
  });

  getCreateTotal(): number {
    return this.itemsArray.getRawValue().reduce(
      (s, i) => s + (Number(i['quantity']) || 0) * (Number(i['unitPrice']) || 0),
      0,
    );
  }

  // ── Payment form ───────────────────────────────────────────────────────────

  readonly paymentForm = this.fb.nonNullable.group({
    amount:    [0,                  [Validators.required, Validators.min(0.01)]],
    method:    [PaymentMethod.CASH,  Validators.required],
    reference: [''],
  });

  // ── Constructor ────────────────────────────────────────────────────────────

  constructor() {
    this.isLoading.set(true);
    this.service.getAll().pipe(takeUntilDestroyed()).subscribe({
      next: list => { this.invoices.set(list); this.isLoading.set(false); },
      error: err  => { this.errorMessage.set(err?.error?.message ?? 'Error al cargar facturas.'); this.isLoading.set(false); },
    });

    this.patientsService.getAll().pipe(takeUntilDestroyed()).subscribe({
      next: list => this.patientsList.set(list.map(p => ({ value: p.id, label: p.name }))),
    });
  }

  // ── Commands ───────────────────────────────────────────────────────────────

  openCreatePanel(opts?: { patientId?: string; appointmentId?: string; serviceDescription?: string; servicePrice?: number }): void {
    this.createForm.reset({ patientId: opts?.patientId ?? '', dueDate: '', notes: '' });
    while (this.itemsArray.length > 1) this.itemsArray.removeAt(1);
    this.itemsArray.at(0).reset({
      description: opts?.serviceDescription ?? '',
      quantity:    1,
      unitPrice:   opts?.servicePrice ?? 0,
    });
    this._appointmentId.set(opts?.appointmentId ?? null);
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
    const apptId = this._appointmentId();
    const body: CreateInvoiceBody = {
      patientId: v.patientId,
      ...(apptId    ? { appointmentId: apptId }  : {}),
      ...(v.dueDate ? { dueDate: v.dueDate }     : {}),
      ...(v.notes   ? { notes:   v.notes   }     : {}),
      items: this.itemsArray.getRawValue().map(i => ({
        description: i['description'] as string,
        quantity:    Number(i['quantity']),
        unitPrice:   Number(i['unitPrice']),
      })),
    };
    this.service.create(body).subscribe({
      next: invoice => {
        this.invoices.update(list => [invoice, ...list]);
        this.closeCreatePanel();
        this.isSaving.set(false);
        this.errorMessage.set(null);
        this.toast.success('Factura creada correctamente.');
      },
      error: err => {
        const msg = err?.error?.message ?? 'Error al crear factura.';
        this.errorMessage.set(msg);
        this.toast.error(msg);
        this.isSaving.set(false);
      },
    });
  }

  openDetail(invoice: Invoice): void {
    this.service.getById(invoice.id).subscribe({
      next: full => {
        this.selectedInvoice.set(full);
        this.paymentForm.reset({ amount: 0, method: PaymentMethod.CASH, reference: '' });
      },
      error: () => this.selectedInvoice.set(invoice),
    });
  }

  closeDetail(): void { this.selectedInvoice.set(null); }

  changeStatus(status: InvoiceStatus): void {
    const inv = this.selectedInvoice();
    if (!inv) return;
    this.service.updateStatus(inv.id, status).subscribe({
      next: updated => {
        this.selectedInvoice.set(updated);
        this.invoices.update(list => list.map(i => i.id === updated.id ? updated : i));
        this.toast.success('Estado de factura actualizado.');
      },
      error: err => {
        const msg = err?.error?.message ?? 'Error al cambiar estado.';
        this.errorMessage.set(msg);
        this.toast.error(msg);
      },
    });
  }

  submitPayment(): void {
    const inv = this.selectedInvoice();
    if (!inv || this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }
    this.isAddingPayment.set(true);
    const v = this.paymentForm.getRawValue();
    this.service.addPayment(inv.id, {
      amount:    v.amount,
      method:    v.method,
      ...(v.reference ? { reference: v.reference } : {}),
    }).subscribe({
      next: () => {
        this.service.getById(inv.id).subscribe({
          next: updated => {
            this.selectedInvoice.set(updated);
            this.invoices.update(list => list.map(i => i.id === updated.id ? updated : i));
            this.paymentForm.reset({ amount: 0, method: PaymentMethod.CASH, reference: '' });
            this.isAddingPayment.set(false);
            this.toast.success('Pago registrado correctamente.');
          },
        });
      },
      error: err => {
        const msg = err?.error?.message ?? 'Error al registrar pago.';
        this.errorMessage.set(msg);
        this.toast.error(msg);
        this.isAddingPayment.set(false);
      },
    });
  }

  statusLabel(value: string): string {
    return (INVOICE_STATUS_LABELS as Record<string, string>)[value]
        ?? (PAYMENT_METHOD_LABELS as Record<string, string>)[value]
        ?? value;
  }
}
