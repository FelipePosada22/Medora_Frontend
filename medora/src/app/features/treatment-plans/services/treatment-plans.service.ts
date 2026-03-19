import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TreatmentPlansApi, UpdateItemBody } from '../api/treatment-plans.api';
import { TreatmentPlanMapper } from '../mappers/treatment-plan.mapper';
import { TreatmentPlan, TreatmentItemStatus, CreateTreatmentPlanPayload } from '../models/treatment-plan.model';

@Injectable({ providedIn: 'root' })
export class TreatmentPlansService {
  private readonly api = inject(TreatmentPlansApi);

  getAll(): Observable<TreatmentPlan[]> {
    return this.api.getAll().pipe(map(TreatmentPlanMapper.toDomainList));
  }

  getById(id: string): Observable<TreatmentPlan> {
    return this.api.getById(id).pipe(map(TreatmentPlanMapper.toDomain));
  }

  getByPatient(patientId: string): Observable<TreatmentPlan[]> {
    return this.api.getByPatient(patientId).pipe(map(TreatmentPlanMapper.toDomainList));
  }

  create(payload: CreateTreatmentPlanPayload): Observable<TreatmentPlan> {
    return this.api.create(payload).pipe(map(TreatmentPlanMapper.toDomain));
  }

  updateItemStatus(itemId: string, status: TreatmentItemStatus): Observable<TreatmentPlan> {
    return this.api.updateItemStatus(itemId, status).pipe(map(TreatmentPlanMapper.toDomain));
  }

  updateItem(itemId: string, body: UpdateItemBody): Observable<TreatmentPlan> {
    return this.api.updateItem(itemId, body).pipe(map(TreatmentPlanMapper.toDomain));
  }

  deleteItem(itemId: string): Observable<TreatmentPlan> {
    return this.api.deleteItem(itemId).pipe(map(TreatmentPlanMapper.toDomain));
  }

  deletePlan(planId: string): Observable<void> {
    return this.api.deletePlan(planId);
  }
}
