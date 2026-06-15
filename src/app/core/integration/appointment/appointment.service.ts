import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { CreateAppointmentRequest, UpdateAppointmentRequest, AppointmentResponse, TimeSlotResponse } from './appointment.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = `${environment.apiUrl}/appointments`;
  
  private appointmentCreatedSource = new Subject<void>();
  appointmentCreated$ = this.appointmentCreatedSource.asObservable();

  notifyAppointmentCreated() {
    this.appointmentCreatedSource.next();
  }

  constructor(private http: HttpClient) { }

  getAvailableSlots(date: string, serviceId: string): Observable<TimeSlotResponse[]> {
    let params = new HttpParams().set('date', date).set('serviceId', serviceId);
    return this.http.get<TimeSlotResponse[]>(`${this.apiUrl}/slots`, { params });
  }

  createAppointment(request: CreateAppointmentRequest): Observable<AppointmentResponse> {
    return this.http.post<AppointmentResponse>(this.apiUrl, request);
  }

  getUserAppointments(userId: string): Observable<AppointmentResponse[]> {
    return this.http.get<AppointmentResponse[]>(`${this.apiUrl}/user/${userId}`);
  }

  cancelAppointment(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/cancel`, {});
  }

  findById(id: string): Observable<AppointmentResponse> {
    return this.http.get<AppointmentResponse>(`${this.apiUrl}/${id}`);
  }

  findAll(): Observable<AppointmentResponse[]> {
    return this.http.get<AppointmentResponse[]>(this.apiUrl);
  }

  updateAppointment(id: string, request: UpdateAppointmentRequest): Observable<AppointmentResponse> {
    return this.http.put<AppointmentResponse>(`${this.apiUrl}/${id}`, request);
  }

  confirmAppointment(id: string): Observable<AppointmentResponse> {
    return this.http.patch<AppointmentResponse>(`${this.apiUrl}/${id}/confirm`, {});
  }

  completeAppointment(id: string): Observable<AppointmentResponse> {
    return this.http.patch<AppointmentResponse>(`${this.apiUrl}/${id}/complete`, {});
  }
}
