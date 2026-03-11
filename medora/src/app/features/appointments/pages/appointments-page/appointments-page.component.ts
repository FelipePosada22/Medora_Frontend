import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { AvatarComponent } from '../../../../shared/components/avatar/avatar.component';

interface Appointment {
  id: string;
  patient: string;
  doctor: string;
  type: string;
  date: Date;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
}

type StatusFilter = 'all' | Appointment['status'];

/**
 * Appointments list page.
 * Full CRUD list with status filter tabs and search.
 */
@Component({
  selector: 'app-appointments-page',
  templateUrl: './appointments-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CardComponent, BadgeComponent, ButtonComponent, AvatarComponent, DatePipe],
  styles: [`
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
    .status-tab--active {
      color: var(--color-primary-600);
      border-bottom-color: var(--color-primary-600);
    }
  `],
})
export class AppointmentsPageComponent {
  protected readonly searchTerm    = signal('');
  protected readonly activeFilter  = signal<StatusFilter>('all');

  protected readonly tabs: { label: string; value: StatusFilter }[] = [
    { label: 'Todas',      value: 'all'       },
    { label: 'Programadas',value: 'scheduled' },
    { label: 'Confirmadas',value: 'confirmed' },
    { label: 'Completadas',value: 'completed' },
    { label: 'Canceladas', value: 'cancelled' },
  ];

  private readonly allAppointments: Appointment[] = [
    { id: 'C-001', patient: 'Ana García',      doctor: 'Dr. Julian Smith',  type: 'Consulta General', date: new Date('2026-03-11T09:00'), status: 'confirmed'  },
    { id: 'C-002', patient: 'Carlos Mendoza',  doctor: 'Dra. Elena Lopez',  type: 'Limpieza Dental',  date: new Date('2026-03-11T10:30'), status: 'scheduled'  },
    { id: 'C-003', patient: 'María Rodríguez', doctor: 'Dr. Marc Rivera',   type: 'Ortodoncia',       date: new Date('2026-03-11T11:00'), status: 'confirmed'  },
    { id: 'C-004', patient: 'Luis Torres',     doctor: 'Dr. Julian Smith',  type: 'Radiografía',      date: new Date('2026-03-11T12:00'), status: 'scheduled'  },
    { id: 'C-005', patient: 'Sofia Vargas',    doctor: 'Dra. Elena Lopez',  type: 'Extracción',       date: new Date('2026-03-10T14:30'), status: 'completed'  },
    { id: 'C-006', patient: 'Pedro Jiménez',   doctor: 'Dr. Julian Smith',  type: 'Blanqueamiento',   date: new Date('2026-03-10T16:00'), status: 'cancelled'  },
    { id: 'C-007', patient: 'Laura Castillo',  doctor: 'Dra. Sara Núñez',   type: 'Endodoncia',       date: new Date('2026-03-09T09:30'), status: 'completed'  },
    { id: 'C-008', patient: 'Roberto Díaz',    doctor: 'Dr. Pablo Herrera', type: 'Consulta General', date: new Date('2026-03-09T11:00'), status: 'no-show'    },
  ];

  protected readonly appointments = computed(() => {
    const q      = this.searchTerm().toLowerCase();
    const filter = this.activeFilter();
    return this.allAppointments
      .filter(a => filter === 'all' || a.status === filter)
      .filter(a => !q || a.patient.toLowerCase().includes(q) || a.doctor.toLowerCase().includes(q));
  });

  protected onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  protected setFilter(f: StatusFilter): void {
    this.activeFilter.set(f);
  }
}
