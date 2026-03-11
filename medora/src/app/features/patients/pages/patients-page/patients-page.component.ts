import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { PatientsViewModel } from '../../view-models/patients.viewmodel';

import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';

/**
 * Patients list page — container component.
 *
 * Provides and injects PatientsViewModel.
 * Binds signals to the template; no logic lives here.
 */
@Component({
  selector: 'app-patients-page',
  templateUrl: './patients-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PatientsViewModel],
  imports: [RouterLink, DatePipe, ButtonComponent, CardComponent],
})
export class PatientsPageComponent {
  protected readonly vm = inject(PatientsViewModel);
}
