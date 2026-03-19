import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../../core/config/api.config';

export interface DashboardAppointmentDto {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
  patient: { id: string; name: string };
  professional: { id: string; name: string };
  appointmentType: { id: string; name: string };
}

export interface DashboardPendingInvoiceDto {
  id: string;
  status: string;
  patient: { id: string; name: string };
  total: number;
}

export interface DashboardDto {
  period: { startDate: string; endDate: string };
  patients: {
    total: number;
    newThisMonth: number;
    attendedInPeriod: number;
  };
  appointments: {
    today: {
      total: number;
      completed: number;
      scheduled: number;
      confirmed: number;
      cancelled: number;
      noShow: number;
      list: DashboardAppointmentDto[];
    };
    inPeriod: {
      total: number;
      byStatus: Partial<Record<string, number>>;
      byDay: { date: string; count: number }[];
    };
  };
  revenue: {
    today: number;
    inPeriod: number;
    pendingInvoicesCount: number;
    pendingAmount: number;
    pendingInvoices: DashboardPendingInvoiceDto[];
  };
  topProfessionals: {
    professional: { id: string; name: string; specialty: string };
    appointmentsCompleted: number;
  }[];
}

@Injectable({ providedIn: 'root' })
export class DashboardApi {
  private readonly http   = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  get(startDate?: string, endDate?: string): Observable<DashboardDto> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate)   params = params.set('endDate',   endDate);
    return this.http.get<DashboardDto>(`${this.apiUrl}/dashboard`, { params });
  }
}
