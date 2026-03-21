import { Injectable, inject, signal, computed } from '@angular/core';
import { FormBuilder, Validators, FormArray, FormGroup } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InvoicesService } from '../services/invoices.service';
import { PatientsService } from '../../patients/services/patients.service';
import { RefundsApi } from '../api/refunds.api';
import { Invoice, InvoiceStatus, InvoiceItem, InvoicePayment, PaymentMethod, INVOICE_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '../models/invoice.model';
import { Refund, CreateRefundPayload } from '../models/refund.model';
import type { SearchSelectOption } from '../../../shared/components/search-select/search-select.component';
import { CreateInvoiceBody, UpdateInvoiceHeaderBody, InvoiceItemBody, UpdateInvoiceItemBody } from '../api/invoices.api';
import { ToastService } from '../../../core/toast/toast.service';

export type StatusFilter = 'all' | InvoiceStatus;

@Injectable()
export class BillingViewModel {
  private readonly service         = inject(InvoicesService);
  private readonly patientsService = inject(PatientsService);
  private readonly refundsApi      = inject(RefundsApi);
  private readonly fb              = inject(FormBuilder);
  private readonly toast           = inject(ToastService);

  // ── State ──────────────────────────────────────────────────────────────────

  readonly invoices        = signal<Invoice[]>([]);
  readonly patientsList    = signal<SearchSelectOption[]>([]);
  readonly isLoading       = signal(false);
  readonly errorMessage    = signal<string | null>(null);

  readonly selectedInvoice  = signal<Invoice | null>(null);
  readonly invoiceRefunds   = signal<Refund[]>([]);
  readonly showCreatePanel  = signal(false);
  readonly isSaving         = signal(false);
  private  _appointmentId   = signal<string | null>(null);
  readonly isAddingPayment  = signal(false);

  // Refund state
  readonly refundPaymentId  = signal<string | null>(null);
  readonly isAddingRefund   = signal(false);
  private  _maxRefundable   = signal(0);

  // Draft edit state
  readonly isEditingHeader = signal(false);
  readonly editingItemId   = signal<string | null>(null);
  readonly isAddingItem    = signal(false);
  readonly isSavingEdit    = signal(false);

  readonly activeFilter = signal<StatusFilter>('all');
  readonly searchTerm   = signal('');

  // ── Tabs ───────────────────────────────────────────────────────────────────

  readonly tabs: { label: string; value: StatusFilter }[] = [
    { label: 'Todas',      value: 'all'                  },
    { label: 'Borradores', value: InvoiceStatus.DRAFT    },
    { label: 'Emitidas',   value: InvoiceStatus.ISSUED   },
    { label: 'Pagadas',    value: InvoiceStatus.PAID     },
    { label: 'Vencidas',   value: InvoiceStatus.OVERDUE  },
    { label: 'Canceladas', value: InvoiceStatus.CANCELLED},
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

  /** Net balance of selected invoice accounting for refunds. */
  readonly netBalance = computed(() => {
    const inv = this.selectedInvoice();
    if (!inv) return 0;
    const totalRefunded = this.invoiceRefunds().reduce((s, r) => s + r.amount, 0);
    return inv.balance + totalRefunded;
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
  removeItem(i: number): void { if (this.itemsArray.length > 1) this.itemsArray.removeAt(i); }

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

  // ── Refund form ────────────────────────────────────────────────────────────

  readonly refundForm = this.fb.nonNullable.group({
    amount: [0,    [Validators.required, Validators.min(0.01)]],
    method: [PaymentMethod.CASH, Validators.required],
    reason: ['',   Validators.required],
  });

  // ── Draft edit forms ───────────────────────────────────────────────────────

  readonly editHeaderForm = this.fb.nonNullable.group({
    dueDate: [''],
    notes:   [''],
  });

  readonly editItemForm = this.fb.nonNullable.group({
    description: ['', Validators.required],
    quantity:    [1,  [Validators.required, Validators.min(1)]],
    unitPrice:   [0,  [Validators.required, Validators.min(0.01)]],
  });

  readonly addItemForm = this.fb.nonNullable.group({
    description: ['', Validators.required],
    quantity:    [1,  [Validators.required, Validators.min(1)]],
    unitPrice:   [0,  [Validators.required, Validators.min(0.01)]],
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

  reloadList(): void {
    this.service.getAll().subscribe({
      next: list => this.invoices.set(list),
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
    const v      = this.createForm.getRawValue();
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
        this._applyPaymentMaxValidator(full.balance);
        this.refundPaymentId.set(null);
        this._loadRefunds(full.id);
      },
      error: () => {
        this.selectedInvoice.set(invoice);
        this._applyPaymentMaxValidator(invoice.balance);
        this._loadRefunds(invoice.id);
      },
    });
  }

  closeDetail(): void {
    this.selectedInvoice.set(null);
    this.invoiceRefunds.set([]);
    this.refundPaymentId.set(null);
  }

  changeStatus(status: InvoiceStatus): void {
    const inv = this.selectedInvoice();
    if (!inv) return;
    this.service.updateStatus(inv.id, status).subscribe({
      next: () => {
        this._reloadDetail(inv.id);
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
    if (!inv || this.paymentForm.invalid) { this.paymentForm.markAllAsTouched(); return; }
    this.isAddingPayment.set(true);
    const v = this.paymentForm.getRawValue();
    this.service.addPayment(inv.id, {
      amount: v.amount, method: v.method,
      ...(v.reference ? { reference: v.reference } : {}),
    }).subscribe({
      next: () => {
        this._reloadDetail(inv.id);
        this.paymentForm.reset({ amount: 0, method: PaymentMethod.CASH, reference: '' });
        this.isAddingPayment.set(false);
        this.toast.success('Pago registrado correctamente.');
      },
      error: err => {
        const msg = err?.error?.message ?? 'Error al registrar pago.';
        this.errorMessage.set(msg);
        this.toast.error(msg);
        this.isAddingPayment.set(false);
      },
    });
  }

  // ── Draft edit commands ────────────────────────────────────────────────────

  openEditHeader(): void {
    const inv = this.selectedInvoice();
    if (!inv) return;
    this.editHeaderForm.reset({ dueDate: inv.dueDate ?? '', notes: inv.notes ?? '' });
    this.isEditingHeader.set(true);
  }

  closeEditHeader(): void { this.isEditingHeader.set(false); }

  submitEditHeader(): void {
    const inv = this.selectedInvoice();
    if (!inv) return;
    this.isSavingEdit.set(true);
    const v = this.editHeaderForm.getRawValue();
    this.service.updateHeader(inv.id, {
      dueDate: v.dueDate || null,
      notes:   v.notes   || null,
    }).subscribe({
      next: () => {
        this._reloadDetail(inv.id);
        this.isEditingHeader.set(false);
        this.isSavingEdit.set(false);
        this.toast.success('Factura actualizada.');
      },
      error: err => {
        this.toast.error(err?.error?.message ?? 'Error al actualizar factura.');
        this.isSavingEdit.set(false);
      },
    });
  }

  openEditItem(item: InvoiceItem): void {
    this.editItemForm.reset({ description: item.description, quantity: item.quantity, unitPrice: item.unitPrice });
    this.editingItemId.set(item.id);
  }

  closeEditItem(): void { this.editingItemId.set(null); }

  submitEditItem(): void {
    const inv    = this.selectedInvoice();
    const itemId = this.editingItemId();
    if (!inv || !itemId || this.editItemForm.invalid) { this.editItemForm.markAllAsTouched(); return; }
    this.isSavingEdit.set(true);
    const v = this.editItemForm.getRawValue();
    this.service.updateItem(inv.id, itemId, { description: v.description, quantity: v.quantity, unitPrice: v.unitPrice }).subscribe({
      next: () => {
        this._reloadDetail(inv.id);
        this.editingItemId.set(null);
        this.isSavingEdit.set(false);
        this.toast.success('Ítem actualizado.');
      },
      error: err => {
        this.toast.error(err?.error?.message ?? 'Error al actualizar ítem.');
        this.isSavingEdit.set(false);
      },
    });
  }

  openAddItem(): void {
    this.addItemForm.reset({ description: '', quantity: 1, unitPrice: 0 });
    this.isAddingItem.set(true);
  }

  closeAddItem(): void { this.isAddingItem.set(false); }

  submitAddItem(): void {
    const inv = this.selectedInvoice();
    if (!inv || this.addItemForm.invalid) { this.addItemForm.markAllAsTouched(); return; }
    this.isSavingEdit.set(true);
    const v = this.addItemForm.getRawValue();
    this.service.addItem(inv.id, { description: v.description, quantity: v.quantity, unitPrice: v.unitPrice }).subscribe({
      next: () => {
        this._reloadDetail(inv.id);
        this.isAddingItem.set(false);
        this.isSavingEdit.set(false);
        this.toast.success('Ítem agregado.');
      },
      error: err => {
        this.toast.error(err?.error?.message ?? 'Error al agregar ítem.');
        this.isSavingEdit.set(false);
      },
    });
  }

  removeInvoiceItem(itemId: string): void {
    const inv = this.selectedInvoice();
    if (!inv) return;
    this.isSavingEdit.set(true);
    this.service.removeItem(inv.id, itemId).subscribe({
      next: () => {
        this._reloadDetail(inv.id);
        this.isSavingEdit.set(false);
        this.toast.success('Ítem eliminado.');
      },
      error: err => {
        this.toast.error(err?.error?.message ?? 'Error al eliminar ítem.');
        this.isSavingEdit.set(false);
      },
    });
  }

  // ── Refund commands ────────────────────────────────────────────────────────

  openRefundForm(payment: InvoicePayment): void {
    const alreadyRefunded = this.paymentRefunds(payment.id)
      .reduce((s, r) => s + r.amount, 0);
    const max = payment.amount - alreadyRefunded;
    this._maxRefundable.set(max);
    this.refundForm.reset({ amount: max, method: PaymentMethod.CASH, reason: '' });
    this.refundForm.get('amount')?.setValidators([
      Validators.required, Validators.min(0.01), Validators.max(max),
    ]);
    this.refundForm.get('amount')?.updateValueAndValidity();
    this.refundPaymentId.set(payment.id);
  }

  closeRefundForm(): void { this.refundPaymentId.set(null); }

  submitRefund(): void {
    const inv       = this.selectedInvoice();
    const paymentId = this.refundPaymentId();
    if (!inv || !paymentId || this.refundForm.invalid) {
      this.refundForm.markAllAsTouched();
      return;
    }
    this.isAddingRefund.set(true);
    const v = this.refundForm.getRawValue();
    const payload: CreateRefundPayload = {
      paymentId, amount: v.amount, method: v.method, reason: v.reason,
    };
    this.refundsApi.create(payload).subscribe({
      next: dto => {
        const refund: Refund = {
          id:        dto.id,
          paymentId: dto.paymentId,
          invoiceId: dto.invoiceId,
          amount:    dto.amount,
          reason:    dto.reason,
          method:    dto.method as Refund['method'],
          status:    'COMPLETED',
          createdAt: dto.createdAt,
        };
        this.invoiceRefunds.update(list => [...list, refund]);
        this._reloadDetail(inv.id);
        this.refundPaymentId.set(null);
        this.isAddingRefund.set(false);
        this.toast.success('Devolución registrada correctamente.');
      },
      error: err => {
        const msg = err?.error?.message ?? 'Error al registrar devolución.';
        this.toast.error(msg);
        this.isAddingRefund.set(false);
      },
    });
  }

  paymentRefunds(paymentId: string): Refund[] {
    return this.invoiceRefunds().filter(r => r.paymentId === paymentId);
  }

  maxRefundable(payment: InvoicePayment): number {
    const refunded = this.paymentRefunds(payment.id).reduce((s, r) => s + r.amount, 0);
    return payment.amount - refunded;
  }

  get maxRefundableAmount(): number { return this._maxRefundable(); }

  // ── Helpers ────────────────────────────────────────────────────────────────

  statusLabel(value: string): string {
    return (INVOICE_STATUS_LABELS as Record<string, string>)[value]
        ?? (PAYMENT_METHOD_LABELS as Record<string, string>)[value]
        ?? value;
  }

  private _reloadDetail(id: string): void {
    this.service.getById(id).subscribe({
      next: updated => {
        this.selectedInvoice.set(updated);
        this.invoices.update(list => list.map(i => i.id === updated.id ? updated : i));
        this._applyPaymentMaxValidator(updated.balance);
      },
    });
  }

  private _applyPaymentMaxValidator(balance: number): void {
    this.paymentForm.get('amount')?.setValidators([
      Validators.required, Validators.min(0.01), Validators.max(balance),
    ]);
    this.paymentForm.get('amount')?.updateValueAndValidity();
  }

  private _loadRefunds(invoiceId: string): void {
    this.refundsApi.getByInvoice(invoiceId).subscribe({
      next: dtos => this.invoiceRefunds.set(
        dtos.map(dto => ({
          id: dto.id, paymentId: dto.paymentId, invoiceId: dto.invoiceId,
          amount: dto.amount, reason: dto.reason,
          method: dto.method as Refund['method'],
          status: 'COMPLETED' as const,
          createdAt: dto.createdAt,
        }))
      ),
    });
  }
}
