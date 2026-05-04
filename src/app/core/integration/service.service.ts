import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/services`;

  getServices(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createService(service: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, service);
  }

  deleteService(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
