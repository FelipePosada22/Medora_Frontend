import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { BadgeComponent, BadgeVariant } from '../../../../shared/components/badge/badge.component';
import { AvatarComponent } from '../../../../shared/components/avatar/avatar.component';

type AttentionTab = 'consultation' | 'prescriptions' | 'exams';

interface Vital { label: string; value: string; unit: string; }
interface Prescription { drug: string; dose: string; frequency: string; days: number; }
interface ExamOrder    { exam: string; priority: 'routine' | 'urgent'; notes: string; }

/**
 * Patient attention page.
 * Tabs: consultation notes + CIE-10 diagnosis, prescriptions, exam orders.
 * Sidebar shows vitals and patient summary.
 */
@Component({
  selector: 'app-attention-page',
  templateUrl: './attention-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CardComponent, ButtonComponent, BadgeComponent, AvatarComponent],
  styles: [`
    .attention-layout {
      display: grid;
      grid-template-columns: 1fr 300px;
      gap: var(--space-4);
      align-items: start;
    }
    @media (max-width: 1024px) { .attention-layout { grid-template-columns: 1fr; } }

    .attention-tabs {
      display: flex;
      gap: var(--space-1);
      border-bottom: 1px solid var(--color-border);
      margin-bottom: var(--space-4);
    }
    .attention-tab {
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
    .attention-tab--active { color: var(--color-primary-600); border-bottom-color: var(--color-primary-600); }

    .form-field { display: flex; flex-direction: column; gap: var(--space-1); margin-bottom: var(--space-4); }
    .form-label { font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); color: var(--color-text-secondary); }
    .form-textarea, .form-input {
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      background: var(--color-surface);
      font-family: inherit;
      outline: none;
      &:focus { border-color: var(--color-border-focus); box-shadow: 0 0 0 3px var(--color-primary-100); }
    }
    .form-textarea { resize: vertical; min-height: 100px; }

    .vitals-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }
    .vital-item {
      background: var(--color-neutral-50);
      border-radius: var(--radius-md);
      padding: var(--space-3);
      text-align: center;
    }
    .vital-value { font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); color: var(--color-text-primary); }
    .vital-unit  { font-size: var(--font-size-xs); color: var(--color-text-muted); }
    .vital-label { font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: 2px; }

    .allergy-chip {
      display: inline-flex;
      align-items: center;
      padding: 2px var(--space-2);
      background: var(--color-error-50);
      color: var(--color-error-700);
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      margin: 2px;
    }

    .rx-item {
      padding: var(--space-3);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      margin-bottom: var(--space-2);
    }
    .rx-drug { font-weight: var(--font-weight-semibold); font-size: var(--font-size-sm); }
    .rx-details { font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: 2px; }
  `],
})
export class AttentionPageComponent {
  private readonly fb = new FormBuilder();

  protected readonly activeTab = signal<AttentionTab>('consultation');

  protected readonly tabs: { label: string; value: AttentionTab }[] = [
    { label: '📋 Consulta',        value: 'consultation'  },
    { label: '💊 Recetas',         value: 'prescriptions' },
    { label: '🔬 Exámenes',        value: 'exams'         },
  ];

  protected readonly consultationForm = this.fb.group({
    chiefComplaint: [''],
    currentIllness: [''],
    physicalExam:   [''],
    diagnosis:      [''],
    cie10Code:      [''],
    treatment:      [''],
    notes:          [''],
  });

  protected readonly vitals: Vital[] = [
    { label: 'Presión',    value: '120/80', unit: 'mmHg' },
    { label: 'Pulso',      value: '72',     unit: 'bpm'  },
    { label: 'Temperatura',value: '36.5',   unit: '°C'   },
    { label: 'Peso',       value: '68',     unit: 'kg'   },
    { label: 'Talla',      value: '165',    unit: 'cm'   },
    { label: 'SpO₂',       value: '98',     unit: '%'    },
  ];

  protected readonly prescriptions: Prescription[] = [
    { drug: 'Ibuprofeno 400mg',   dose: '1 comprimido', frequency: 'Cada 8h',  days: 5  },
    { drug: 'Amoxicilina 500mg',  dose: '1 cápsula',    frequency: 'Cada 12h', days: 7  },
    { drug: 'Omeprazol 20mg',     dose: '1 cápsula',    frequency: 'Cada 24h', days: 30 },
  ];

  protected readonly examOrders: ExamOrder[] = [
    { exam: 'Hemograma completo',     priority: 'routine', notes: ''                         },
    { exam: 'Radiografía panorámica', priority: 'urgent',  notes: 'Evaluar terceros molares' },
  ];

  protected readonly allergies = ['Penicilina', 'Látex'];
  protected readonly isSaving  = signal(false);

  protected priorityVariant(p: ExamOrder['priority']): BadgeVariant {
    return p === 'urgent' ? 'error' : 'default';
  }

  protected setTab(t: AttentionTab): void { this.activeTab.set(t); }

  protected save(): void {
    this.isSaving.set(true);
    setTimeout(() => this.isSaving.set(false), 1200);
  }
}
