import { Injectable, inject, signal, computed } from '@angular/core';
import { FormBuilder, Validators, FormArray, FormGroup } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TreatmentPlansService } from '../services/treatment-plans.service';
import { PatientsService } from '../../patients/services/patients.service';
import { InvoicesService } from '../../billing/services/invoices.service';
import {
  TreatmentPlan, TreatmentPlanStatus, TreatmentItemStatus,
  TREATMENT_PLAN_STATUS_LABELS, TREATMENT_ITEM_STATUS_LABELS,
} from '../models/treatment-plan.model';
import type { SearchSelectOption } from '../../../shared/components/search-select/search-select.component';
import { ToastService } from '../../../core/toast/toast.service';

export type PlanFilter = 'all' | TreatmentPlanStatus;

@Injectable()
export class TreatmentPlansViewModel {
  private readonly service         = inject(TreatmentPlansService);
  private readonly patientsService = inject(PatientsService);
  private readonly invoicesService = inject(InvoicesService);
  private readonly fb              = inject(FormBuilder);
  private readonly toast           = inject(ToastService);

  // ── State ──────────────────────────────────────────────────────────────────

  readonly plans           = signal<TreatmentPlan[]>([]);
  readonly patientsList    = signal<SearchSelectOption[]>([]);
  readonly isLoading       = signal(false);
  readonly errorMessage    = signal<string | null>(null);

  readonly selectedPlan    = signal<TreatmentPlan | null>(null);
  readonly showCreatePanel = signal(false);
  readonly isSaving        = signal(false);
  readonly isUpdatingItem  = signal<string | null>(null); // itemId being updated/deleted
  readonly isDeletingPlan       = signal(false);
  readonly editingItemId        = signal<string | null>(null);
  readonly showInvoiceForm      = signal(false);
  readonly isGeneratingInvoice  = signal(false);
  readonly invoiceItemIds       = signal<Set<string>>(new Set());

  readonly activeFilter = signal<PlanFilter>('all');
  readonly searchTerm   = signal('');

  // ── Static data ────────────────────────────────────────────────────────────

  readonly statusTabs: { label: string; value: PlanFilter }[] = [
    { label: 'Todos',      value: 'all'       },
    { label: 'Activos',    value: 'ACTIVE'    },
    { label: 'Parciales',  value: 'PARTIAL'   },
    { label: 'Completados',value: 'COMPLETED' },
    { label: 'Cancelados', value: 'CANCELLED' },
  ];

  readonly itemNextStates: Record<TreatmentItemStatus, { status: TreatmentItemStatus; label: string }[]> = {
    PENDING:     [{ status: 'IN_PROGRESS', label: 'Iniciar' }, { status: 'CANCELLED', label: 'Cancelar' }],
    IN_PROGRESS: [{ status: 'COMPLETED',  label: 'Completar' }, { status: 'CANCELLED', label: 'Cancelar' }],
    COMPLETED:   [],
    CANCELLED:   [],
  };

  // ── Computed ───────────────────────────────────────────────────────────────

  readonly filteredPlans = computed<TreatmentPlan[]>(() => {
    const filter = this.activeFilter();
    const q      = this.searchTerm().toLowerCase();
    return this.plans()
      .filter(p => filter === 'all' || p.status === filter)
      .filter(p => !q || p.patientName.toLowerCase().includes(q) || p.title.toLowerCase().includes(q));
  });

  readonly stats = computed(() => {
    const all = this.plans();
    return {
      total:     all.length,
      active:    all.filter(p => p.status === 'ACTIVE').length,
      partial:   all.filter(p => p.status === 'PARTIAL').length,
      completed: all.filter(p => p.status === 'COMPLETED').length,
      cancelled: all.filter(p => p.status === 'CANCELLED').length,
    };
  });

  // ── Create form ────────────────────────────────────────────────────────────

  readonly createForm = this.fb.nonNullable.group({
    patientId: ['', Validators.required],
    title:     ['', Validators.required],
    notes:     [''],
  });

  readonly itemsArray: FormArray<FormGroup> = this.fb.array<FormGroup>([this.buildItemGroup()]);

  buildItemGroup(): FormGroup {
    return this.fb.nonNullable.group({
      description: ['', Validators.required],
      price:       [0,  [Validators.required, Validators.min(0.01)]],
      notes:       [''],
    });
  }

  get itemControls() { return this.itemsArray.controls; }
  addItem(): void { this.itemsArray.push(this.buildItemGroup()); }
  removeItem(i: number): void { if (this.itemsArray.length > 1) this.itemsArray.removeAt(i); }

  getCreateTotal(): number {
    return this.itemsArray.getRawValue().reduce((s, i) => s + (Number(i['price']) || 0), 0);
  }

  // ── Constructor ────────────────────────────────────────────────────────────

  constructor() {
    this.isLoading.set(true);
    this.service.getAll().pipe(takeUntilDestroyed()).subscribe({
      next:  list => { this.plans.set(list); this.isLoading.set(false); },
      error: err  => { this.errorMessage.set(err?.error?.message ?? 'Error al cargar planes.'); this.isLoading.set(false); },
    });

    this.patientsService.getAll().pipe(takeUntilDestroyed()).subscribe({
      next: list => this.patientsList.set(list.map(p => ({ value: p.id, label: p.name }))),
    });
  }

  // ── Commands ───────────────────────────────────────────────────────────────

  openCreatePanel(prefilledPatientId?: string): void {
    this.createForm.reset({ patientId: prefilledPatientId ?? '', title: '', notes: '' });
    while (this.itemsArray.length > 1) this.itemsArray.removeAt(1);
    this.itemsArray.at(0).reset({ description: '', price: 0, notes: '' });
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
      patientId: v.patientId,
      title:     v.title,
      ...(v.notes ? { notes: v.notes } : {}),
      items: this.itemsArray.getRawValue().map(i => ({
        description: i['description'] as string,
        price:       Number(i['price']),
        ...(i['notes'] ? { notes: i['notes'] as string } : {}),
      })),
    }).subscribe({
      next: plan => {
        this.plans.update(list => [plan, ...list]);
        this.closeCreatePanel();
        this.isSaving.set(false);
        this.toast.success('Plan de tratamiento creado.');
      },
      error: err => {
        const msg = err?.error?.message ?? 'Error al crear plan.';
        this.toast.error(msg);
        this.isSaving.set(false);
      },
    });
  }

  selectPlan(plan: TreatmentPlan): void {
    this.service.getById(plan.id).subscribe({
      next:  full  => this.selectedPlan.set(full),
      error: ()    => this.selectedPlan.set(plan),
    });
  }

  selectPlanById(planId: string): void {
    this.service.getById(planId).subscribe({
      next: full => this.selectedPlan.set(full),
    });
  }

  closeDetail(): void { this.selectedPlan.set(null); }

  updateItemStatus(itemId: string, status: TreatmentItemStatus): void {
    this.isUpdatingItem.set(itemId);
    this.service.updateItemStatus(itemId, status).subscribe({
      next: updatedPlan => {
        this.selectedPlan.set(updatedPlan);
        this.plans.update(list => list.map(p => p.id === updatedPlan.id ? updatedPlan : p));
        this.isUpdatingItem.set(null);
        this.toast.success('Estado actualizado.');
      },
      error: err => {
        this.toast.error(err?.error?.message ?? 'Error al actualizar estado.');
        this.isUpdatingItem.set(null);
      },
    });
  }

  // ── Edit item ──────────────────────────────────────────────────────────────

  readonly editItemForm = this.fb.nonNullable.group({
    description: ['', Validators.required],
    price:       [0,  [Validators.required, Validators.min(0.01)]],
    notes:       [''],
  });

  openEditItem(item: TreatmentPlan['items'][number]): void {
    this.editItemForm.reset({
      description: item.description,
      price:       item.price,
      notes:       item.notes ?? '',
    });
    this.editingItemId.set(item.id);
  }

  closeEditItem(): void { this.editingItemId.set(null); }

  submitEditItem(): void {
    const itemId = this.editingItemId();
    if (!itemId || this.editItemForm.invalid) {
      this.editItemForm.markAllAsTouched();
      return;
    }
    this.isUpdatingItem.set(itemId);
    const v = this.editItemForm.getRawValue();
    this.service.updateItem(itemId, {
      description: v.description,
      price:       v.price,
      notes:       v.notes || null,
    }).subscribe({
      next: updatedPlan => {
        this.selectedPlan.set(updatedPlan);
        this.plans.update(list => list.map(p => p.id === updatedPlan.id ? updatedPlan : p));
        this.isUpdatingItem.set(null);
        this.editingItemId.set(null);
        this.toast.success('Tratamiento actualizado.');
      },
      error: err => {
        this.toast.error(err?.error?.message ?? 'Error al actualizar tratamiento.');
        this.isUpdatingItem.set(null);
      },
    });
  }

  // ── Delete item ────────────────────────────────────────────────────────────

  deleteItem(itemId: string): void {
    this.isUpdatingItem.set(itemId);
    this.service.deleteItem(itemId).subscribe({
      next: updatedPlan => {
        this.selectedPlan.set(updatedPlan);
        this.plans.update(list => list.map(p => p.id === updatedPlan.id ? updatedPlan : p));
        this.isUpdatingItem.set(null);
        this.toast.success('Tratamiento eliminado.');
      },
      error: err => {
        this.toast.error(err?.error?.message ?? 'Error al eliminar tratamiento.');
        this.isUpdatingItem.set(null);
      },
    });
  }

  // ── Generate invoice ──────────────────────────────────────────────────────

  readonly invoiceForm = this.fb.nonNullable.group({
    dueDate: [''],
    notes:   [''],
  });

  /** IDs of plan items already billed (across all invoices of this plan). */
  readonly alreadyBilledItemIds = computed<Set<string>>(() => {
    const plan = this.selectedPlan();
    if (!plan) return new Set();
    const ids = plan.invoices
      .flatMap(inv => inv.items)
      .map(i => i.treatmentPlanItemId)
      .filter((id): id is string => !!id);
    return new Set(ids);
  });

  /** Plan items that can still be billed (not cancelled, not already invoiced). */
  readonly billableItems = computed(() => {
    const plan = this.selectedPlan();
    if (!plan) return [];
    const billed = this.alreadyBilledItemIds();
    return plan.items.filter(i => i.status !== 'CANCELLED' && !billed.has(i.id));
  });

  openInvoiceForm(): void {
    this.invoiceForm.reset();
    // Pre-select all billable items
    this.invoiceItemIds.set(new Set(this.billableItems().map(i => i.id)));
    this.showInvoiceForm.set(true);
  }

  closeInvoiceForm(): void { this.showInvoiceForm.set(false); }

  toggleInvoiceItem(itemId: string): void {
    this.invoiceItemIds.update(set => {
      const next = new Set(set);
      next.has(itemId) ? next.delete(itemId) : next.add(itemId);
      return next;
    });
  }

  isInvoiceItemSelected(itemId: string): boolean {
    return this.invoiceItemIds().has(itemId);
  }

  generateInvoice(): void {
    const plan = this.selectedPlan();
    if (!plan) return;
    const selectedIds = [...this.invoiceItemIds()];
    if (selectedIds.length === 0) {
      this.toast.error('Selecciona al menos un procedimiento para facturar.');
      return;
    }
    this.isGeneratingInvoice.set(true);
    const v = this.invoiceForm.getRawValue();
    this.invoicesService.createFromTreatmentPlan(plan.id, {
      itemIds: selectedIds,
      ...(v.dueDate ? { dueDate: v.dueDate } : {}),
      ...(v.notes   ? { notes:   v.notes   } : {}),
    }).subscribe({
      next: () => {
        this.isGeneratingInvoice.set(false);
        this.showInvoiceForm.set(false);
        // Reload plan to refresh invoices[] list
        this.service.getById(plan.id).subscribe(updated => {
          this.selectedPlan.set(updated);
          this.plans.update(list => list.map(p => p.id === updated.id ? updated : p));
        });
        this.toast.success('Factura generada. Puedes verla en Facturación.');
      },
      error: err => {
        const msg = err?.error?.message ?? 'Error al generar factura.';
        this.toast.error(msg);
        this.isGeneratingInvoice.set(false);
      },
    });
  }

  // ── Delete plan ────────────────────────────────────────────────────────────

  deletePlan(): void {
    const plan = this.selectedPlan();
    if (!plan) return;
    this.isDeletingPlan.set(true);
    this.service.deletePlan(plan.id).subscribe({
      next: () => {
        this.plans.update(list => list.filter(p => p.id !== plan.id));
        this.selectedPlan.set(null);
        this.isDeletingPlan.set(false);
        this.toast.success('Plan de tratamiento eliminado.');
      },
      error: err => {
        this.toast.error(err?.error?.message ?? 'Error al eliminar plan.');
        this.isDeletingPlan.set(false);
      },
    });
  }

  // ── Labels ─────────────────────────────────────────────────────────────────

  planStatusLabel(s: TreatmentPlanStatus): string {
    return TREATMENT_PLAN_STATUS_LABELS[s] ?? s;
  }

  itemStatusLabel(s: TreatmentItemStatus): string {
    return TREATMENT_ITEM_STATUS_LABELS[s] ?? s;
  }
}
