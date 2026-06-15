import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedUsersResponse, UserResponse } from './user.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) { }

  getUsers(page: number = 0, size: number = 10, searchTerm?: string): Observable<PaginatedUsersResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (searchTerm && searchTerm.trim()) {
      params = params.set('name', searchTerm.trim());
    }

    return this.http.get<PaginatedUsersResponse>(this.apiUrl, { params });
  }

  setUserActive(id: string, isActive: boolean): Observable<UserResponse> {
    let params = new HttpParams().set('isActive', isActive.toString());
    return this.http.patch<UserResponse>(`${this.apiUrl}/${id}/active`, {}, { params });
  }

  updateUser(id: string, userData: any): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/${id}`, userData);
  }
}
