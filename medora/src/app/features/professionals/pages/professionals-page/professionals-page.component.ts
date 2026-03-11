import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { AvatarComponent } from '../../../../shared/components/avatar/avatar.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

interface Professional {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  appointmentsToday: number;
}

/**
 * Professionals list page.
 * Displays medical staff with specialty filters and status badges.
 */
@Component({
  selector: 'app-professionals-page',
  templateUrl: './professionals-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, BadgeComponent, AvatarComponent, ButtonComponent],
  styles: [`
    .specialty-filters {
      display: flex;
      gap: var(--space-2);
      flex-wrap: wrap;
    }
    .filter-chip {
      padding: var(--space-1-5, 6px) var(--space-3);
      border-radius: var(--radius-full);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      border: 1px solid var(--color-border);
      background: var(--color-surface);
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .filter-chip--active {
      background: var(--color-primary-600);
      color: white;
      border-color: var(--color-primary-600);
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-4);
    }
    .stat-card {
      text-align: center;
      padding: var(--space-5);
    }
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
  `],
})
export class ProfessionalsPageComponent {
  protected readonly specialties = ['Todos', 'Odontología General', 'Ortodoncia', 'Radiología', 'Endodoncia'];
  protected readonly selectedSpecialty = signal('Todos');

  private readonly allProfessionals: Professional[] = [
    { id: 'P-001', name: 'Dr. Julian Smith',  specialty: 'Odontología General', phone: '+1 555-0101', email: 'j.smith@medora.com',  status: 'active',   appointmentsToday: 6 },
    { id: 'P-002', name: 'Dra. Elena Lopez',  specialty: 'Ortodoncia',          phone: '+1 555-0102', email: 'e.lopez@medora.com',  status: 'active',   appointmentsToday: 4 },
    { id: 'P-003', name: 'Dr. Marc Rivera',   specialty: 'Radiología',           phone: '+1 555-0103', email: 'm.rivera@medora.com', status: 'inactive', appointmentsToday: 0 },
    { id: 'P-004', name: 'Dra. Sara Núñez',   specialty: 'Endodoncia',           phone: '+1 555-0104', email: 's.nunez@medora.com',  status: 'active',   appointmentsToday: 3 },
    { id: 'P-005', name: 'Dr. Pablo Herrera', specialty: 'Odontología General',  phone: '+1 555-0105', email: 'p.herrera@medora.com',status: 'active',   appointmentsToday: 5 },
  ];

  protected readonly professionals = computed(() => {
    const filter = this.selectedSpecialty();
    if (filter === 'Todos') return this.allProfessionals;
    return this.allProfessionals.filter(p => p.specialty === filter);
  });

  protected readonly stats = computed(() => ({
    total:  this.allProfessionals.length,
    active: this.allProfessionals.filter(p => p.status === 'active').length,
    appts:  this.allProfessionals.reduce((sum, p) => sum + p.appointmentsToday, 0),
  }));

  protected selectSpecialty(s: string): void {
    this.selectedSpecialty.set(s);
  }
}
