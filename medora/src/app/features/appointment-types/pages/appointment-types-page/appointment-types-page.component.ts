import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

interface AppointmentType {
  id: string;
  name: string;
  duration: number;
  price: number;
  color: string;
  active: boolean;
}

/**
 * Appointment types management page.
 * Lists all service types with duration, price, and status.
 */
@Component({
  selector: 'app-appointment-types-page',
  templateUrl: './appointment-types-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, BadgeComponent, ButtonComponent],
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-4);
    }
    .stat-card { text-align: center; padding: var(--space-5); }
    .stat-card__value {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-primary-600);
    }
    .stat-card__label {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin-top: var(--space-1);
    }
    .color-dot {
      display: inline-block;
      width: 12px; height: 12px;
      border-radius: 50%;
      margin-right: var(--space-2);
      vertical-align: middle;
    }
  `],
})
export class AppointmentTypesPageComponent {
  protected readonly searchTerm = signal('');

  private readonly allTypes: AppointmentType[] = [
    { id: 'AT-001', name: 'Consulta General',   duration: 30, price: 50.00,  color: '#3b82f6', active: true  },
    { id: 'AT-002', name: 'Limpieza Dental',     duration: 45, price: 75.00,  color: '#059669', active: true  },
    { id: 'AT-003', name: 'Ortodoncia',          duration: 60, price: 120.00, color: '#6324eb', active: true  },
    { id: 'AT-004', name: 'Extracción',          duration: 40, price: 90.00,  color: '#dc2626', active: true  },
    { id: 'AT-005', name: 'Radiografía',         duration: 20, price: 40.00,  color: '#f59e0b', active: true  },
    { id: 'AT-006', name: 'Blanqueamiento',      duration: 90, price: 200.00, color: '#0ea5e9', active: true  },
    { id: 'AT-007', name: 'Endodoncia',          duration: 75, price: 180.00, color: '#8b5cf6', active: false },
    { id: 'AT-008', name: 'Sellador de Fisuras', duration: 25, price: 35.00,  color: '#14b8a6', active: true  },
  ];

  protected readonly types = computed(() => {
    const q = this.searchTerm().toLowerCase();
    if (!q) return this.allTypes;
    return this.allTypes.filter(t => t.name.toLowerCase().includes(q));
  });

  protected readonly stats = computed(() => {
    const active = this.allTypes.filter(t => t.active);
    const avgDuration = Math.round(active.reduce((s, t) => s + t.duration, 0) / active.length);
    const avgPrice    = active.reduce((s, t) => s + t.price, 0) / active.length;
    return { total: active.length, avgDuration, avgPrice: avgPrice.toFixed(2) };
  });

  protected onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }
}
